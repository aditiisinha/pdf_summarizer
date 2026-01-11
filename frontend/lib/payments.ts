import { plans } from "@/utils/constants";
import Stripe from "stripe";
import { getDbConnection } from "./db";

/**
 * Stripe instance (server-side only)
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export async function handleSubscriptionDeleted({
  subscriptionId,
  stripe,
}: {
  subscriptionId: string;
  stripe: Stripe;
}) {
  console.log("Subscription cancelled:", subscriptionId);

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const sql = await getDbConnection();

    await sql`UPDATE users SET status = 'cancelled' WHERE customer_id = ${subscription.customer}`;
    console.log("Subscription cancelled successfully:", subscriptionId);

  }
  catch (error) {
    console.log('Error handling subscription cancelled:', error);
    throw error;
  }
}

/**
 * Handle payment_intent.succeeded webhook (for Stripe Payment Links)
 */
export async function handlePaymentIntentSucceeded({
  paymentIntent,
  stripe,
}: {
  paymentIntent: Stripe.PaymentIntent;
  stripe: Stripe;
}) {
  console.log("[handlePaymentIntentSucceeded] Processing payment intent:", paymentIntent.id);

  try {
    const sql = await getDbConnection();

    // Get customer details
    const customerId = paymentIntent.customer as string;
    if (!customerId) {
      console.error("[handlePaymentIntentSucceeded] No customer ID found");
      return;
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error("[handlePaymentIntentSucceeded] Customer was deleted");
      return;
    }

    const email = customer.email;
    if (!email) {
      console.error("[handlePaymentIntentSucceeded] No email found for customer");
      return;
    }

    console.log("[handlePaymentIntentSucceeded] Customer email:", email);

    // Get subscription details if this is a subscription payment
    let priceId: string | null = null;

    // Check if invoice exists in metadata or expanded data
    const invoiceId = (paymentIntent as any).invoice;
    if (invoiceId) {
      const invoice = typeof invoiceId === 'string'
        ? await stripe.invoices.retrieve(invoiceId)
        : invoiceId;

      const subscriptionId = (invoice as any).subscription;
      if (subscriptionId) {
        const subscription = typeof subscriptionId === 'string'
          ? await stripe.subscriptions.retrieve(subscriptionId)
          : subscriptionId;

        priceId = subscription.items.data[0]?.price.id || null;
      }
    }

    console.log("[handlePaymentIntentSucceeded] Price ID:", priceId);

    // Update user if they exist
    if (priceId) {
      const user = await sql`SELECT id FROM users WHERE email = ${email}`;

      if (user.length > 0) {
        const planName = plans.find(p => p.priceId === priceId)?.name || 'Unknown';
        console.log("[handlePaymentIntentSucceeded] Updating user with subscription data. Plan:", planName);
        await sql`
          UPDATE users
          SET
            customer_id = ${customerId},
            price_id = ${priceId},
            plan_name = ${planName},
            status = 'active'
          WHERE email = ${email}
        `;
      } else {
        console.warn("[handlePaymentIntentSucceeded] User not found, skipping user update");
      }
    }

    // Create payment record
    const existingPayment = await sql`
      SELECT id FROM payments WHERE stripe_payment_id = ${paymentIntent.id}
    `;

    if (existingPayment.length === 0) {
      console.log("[handlePaymentIntentSucceeded] Creating payment record");
      await sql`
        INSERT INTO payments (
          amount,
          status,
          stripe_payment_id,
          price_id,
          user_email
        )
        VALUES (
          ${paymentIntent.amount},
          ${paymentIntent.status},
          ${paymentIntent.id},
          ${priceId},
          ${email}
        )
      `;
      console.log("[handlePaymentIntentSucceeded] Payment record created successfully");
    } else {
      console.log("[handlePaymentIntentSucceeded] Payment record already exists");
    }

  } catch (error) {
    console.error("[handlePaymentIntentSucceeded] Error:", error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded webhook (for subscription renewals)
 */
export async function handleInvoicePaymentSucceeded({
  invoice,
  stripe,
}: {
  invoice: Stripe.Invoice;
  stripe: Stripe;
}) {
  console.log("[handleInvoicePaymentSucceeded] Processing invoice:", invoice.id);

  try {
    const sql = await getDbConnection();

    const customerId = invoice.customer as string;
    if (!customerId) {
      console.error("[handleInvoicePaymentSucceeded] No customer ID found");
      return;
    }

    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      console.error("[handleInvoicePaymentSucceeded] Customer was deleted");
      return;
    }

    const email = customer.email;
    if (!email) {
      console.error("[handleInvoicePaymentSucceeded] No email found");
      return;
    }

    // Get price ID from subscription
    let priceId: string | null = null;
    const subscriptionId = (invoice as any).subscription;
    if (subscriptionId) {
      const subscription = typeof subscriptionId === 'string'
        ? await stripe.subscriptions.retrieve(subscriptionId)
        : subscriptionId;

      priceId = subscription.items.data[0]?.price.id || null;
    }

    console.log("[handleInvoicePaymentSucceeded] Customer:", email, "Price ID:", priceId);

    // Update user
    if (priceId) {
      const user = await sql`SELECT id FROM users WHERE email = ${email}`;

      if (user.length > 0) {
        const planName = plans.find(p => p.priceId === priceId)?.name || 'Unknown';
        await sql`
          UPDATE users
          SET
            customer_id = ${customerId},
            price_id = ${priceId},
            plan_name = ${planName},
            status = 'active'
          WHERE email = ${email}
        `;
        console.log("[handleInvoicePaymentSucceeded] User updated successfully");
      }
    }

    // Create payment record
    const existingPayment = await sql`
      SELECT id FROM payments WHERE stripe_payment_id = ${invoice.id}
    `;

    if (existingPayment.length === 0 && invoice.amount_paid) {
      await sql`
        INSERT INTO payments (
          amount,
          status,
          stripe_payment_id,
          price_id,
          user_email
        )
        VALUES (
          ${invoice.amount_paid},
          ${invoice.status},
          ${invoice.id},
          ${priceId},
          ${email}
        )
      `;
      console.log("[handleInvoicePaymentSucceeded] Payment record created");
    }

  } catch (error) {
    console.error("[handleInvoicePaymentSucceeded] Error:", error);
    throw error;
  }
}

/**
 * Handle Stripe checkout.session.completed webhook
 */
export async function handleCheckoutSessionCompleted({
  session,
}: {
  session: Stripe.Checkout.Session;
}) {
  console.log("[handleCheckoutSessionCompleted] Processing session:", session.id);

  try {
    // 1️⃣ Get DB connection
    const sql = await getDbConnection();

    // 2️⃣ Extract required values
    const customerId = session.customer as string | null;
    const priceId = session.line_items?.data[0]?.price?.id ?? null;

    console.log("[handleCheckoutSessionCompleted] Extracted values:", { customerId, priceId });

    if (!customerId || !priceId) {
      console.error("[handleCheckoutSessionCompleted] Missing customerId or priceId");
      return;
    }

    // 3️⃣ Fetch Stripe customer
    const customer = await stripe.customers.retrieve(customerId);
    console.log("[handleCheckoutSessionCompleted] Retrieved customer from Stripe:", {
      id: customer.id,
      deleted: customer.deleted
    });

    if (customer.deleted) {
      console.error("[handleCheckoutSessionCompleted] Customer was deleted");
      return;
    }

    const email = customer.email;
    const fullName = customer.name ?? "";
    console.log("[handleCheckoutSessionCompleted] Customer details:", { email, fullName });

    if (!email) {
      console.error("[handleCheckoutSessionCompleted] Customer email missing");
      return;
    }

    // 4️⃣ Create or update user
    await createOrUpdateUser({
      sql,
      email,
      fullName,
      customerId,
      priceId,
      status: "active",
    });

    // 5️⃣ Create payment (idempotent)
    await createPayment({
      sql,
      session,
      priceId,
      userEmail: email,
    });

    console.log("[handleCheckoutSessionCompleted] Webhook processing completed successfully for session:", session.id);
  } catch (error) {
    console.error("[handleCheckoutSessionCompleted] Error processing webhook:", error);
    throw error;
  }
}

/**
 * Create or update user - Only updates existing users with Stripe data
 */
async function createOrUpdateUser({
  sql,
  email,
  fullName,
  customerId,
  priceId,
  status,
}: {
  sql: any;
  email: string;
  fullName: string;
  customerId: string;
  priceId: string;
  status: string;
}) {
  try {
    const user = await sql`SELECT id FROM users WHERE email = ${email}`;

    console.log("[createOrUpdateUser] User lookup result:", user.length > 0 ? "User found" : "User not found");

    if (user.length === 0) {
      console.warn("[createOrUpdateUser] User not found in database. User must sign in via Clerk first. Email:", email);
      console.warn("[createOrUpdateUser] Skipping user creation. Stripe data will be linked when user signs in.");
      return;
    }

    // Map priceId to plan name
    const planName = plans.find(p => p.priceId === priceId)?.name || 'Unknown';

    console.log("[createOrUpdateUser] Updating existing user with Stripe data. Plan:", planName);
    const result = await sql`
      UPDATE users
      SET
        full_name = ${fullName},
        customer_id = ${customerId},
        price_id = ${priceId},
        plan_name = ${planName},
        status = ${status}
      WHERE email = ${email}
      RETURNING id
    `;
    console.log("[createOrUpdateUser] User updated successfully:", result.length > 0 ? "Success" : "No rows updated");
  } catch (error) {
    console.error("[createOrUpdateUser] Error updating user:", error);
    throw error;
  }
}

/**
 * Create payment record (safe for webhook retries)
 */
async function createPayment({
  sql,
  session,
  priceId,
  userEmail,
}: {
  sql: any;
  session: Stripe.Checkout.Session;
  priceId: string;
  userEmail: string;
}) {
  try {
    const existing = await sql`
      SELECT id
      FROM payments
      WHERE stripe_payment_id = ${session.id}
    `;

    if (existing.length > 0) {
      console.log("[createPayment] Payment already exists, skipping:", session.id);
      return;
    }

    console.log("[createPayment] Creating new payment record:", {
      amount: session.amount_total,
      status: session.status,
      stripe_payment_id: session.id,
      price_id: priceId,
      user_email: userEmail
    });

    const result = await sql`
      INSERT INTO payments (
        amount,
        status,
        stripe_payment_id,
        price_id,
        user_email
      )
      VALUES (
        ${session.amount_total},
        ${session.status},
        ${session.id},
        ${priceId},
        ${userEmail}
      )
      RETURNING id
    `;

    console.log("[createPayment] Payment record created successfully:", result.length > 0 ? "Success" : "Failed");
  } catch (error) {
    console.error("[createPayment] Error creating payment record:", error);
    throw error;
  }
}
