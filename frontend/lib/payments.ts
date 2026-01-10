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
 * Handle Stripe checkout.session.completed webhook
 */
export async function handleCheckoutSessionCompleted({
  session,
}: {
  session: Stripe.Checkout.Session;
}) {
  console.log("Checkout session completed:", session.id);

  // 1️⃣ Get DB connection
  const sql = await getDbConnection();

  // 2️⃣ Extract required values
  const customerId = session.customer as string | null;
  const priceId = session.line_items?.data[0]?.price?.id ?? null;

  console.log("DEBUG: Extracted values:", { customerId, priceId });

  if (!customerId || !priceId) {
    console.error("Missing customerId or priceId");
    return;
  }

  // 3️⃣ Fetch Stripe customer
  const customer = await stripe.customers.retrieve(customerId);
  console.log("DEBUG: Retrived customer from Stripe:", { id: customer.id, deleted: customer.deleted });

  if (customer.deleted) {
    console.error("Customer was deleted");
    return;
  }

  const email = customer.email;
  const fullName = customer.name ?? "";
  console.log("DEBUG: Customer details:", { email, fullName });

  if (!email) {
    console.error("DEBUG ERROR: Customer email missing");
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

  console.log("Webhook processing completed for session:", session.id);
}

/**
 * Create or update user
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
  const user =
    await sql`SELECT id FROM users WHERE email = ${email}`;

  console.log("DEBUG: User lookup result:", user);

  if (user.length === 0) {
    console.log("DEBUG: User not found, inserting new user");
    await sql`
      INSERT INTO users (
        email,
        full_name,
        customer_id,
        price_id,
        status
      )
      VALUES (
        ${email},
        ${fullName},
        ${customerId},
        ${priceId},
        ${status}
      )
    `;
  } else {
    console.log("DEBUG: User found, updating existing user");
    await sql`
      UPDATE users
      SET
        full_name = ${fullName},
        customer_id = ${customerId},
        price_id = ${priceId},
        status = ${status}
      WHERE email = ${email}
    `;
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
  const existing =
    await sql`
      SELECT id
      FROM payments
      WHERE stripe_payment_id = ${session.id}
    `;

  if (existing.length > 0) {
    console.log("Payment already exists, skipping:", session.id);
    return;
  }

  await sql`
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
  `;
}
