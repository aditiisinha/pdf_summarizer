import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleCheckoutSessionCompleted, handleSubscriptionDeleted, handlePaymentIntentSucceeded, handleInvoicePaymentSucceeded } from "@/lib/payments";

export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const POST = async (req: NextRequest) => {
    console.log("[WEBHOOK] ========== NEW WEBHOOK REQUEST ==========");
    console.log("[WEBHOOK] Request URL:", req.url);
    console.log("[WEBHOOK] Request method:", req.method);

    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    console.log("[WEBHOOK] Payload length:", payload.length);
    console.log("[WEBHOOK] Signature present:", !!sig);

    let event;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    console.log("[WEBHOOK] Webhook secret configured:", !!endpointSecret);

    try {
        event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret!);
        console.log("[WEBHOOK] Event constructed successfully:", event.type);
        console.log("[WEBHOOK] Event ID:", event.id);

        switch (event.type) {
            case 'checkout.session.completed':
                console.log("[WEBHOOK] Processing checkout.session.completed");

                const session = await stripe.checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id, {
                    expand: ['line_items'],
                });

                console.log("[WEBHOOK] Session retrieved:", session.id);
                console.log("[WEBHOOK] Calling handleCheckoutSessionCompleted...");

                await handleCheckoutSessionCompleted({ session });

                console.log("[WEBHOOK] handleCheckoutSessionCompleted completed successfully");
                break;

            case 'payment_intent.succeeded':
                console.log("[WEBHOOK] Processing payment_intent.succeeded");
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log("[WEBHOOK] Payment Intent ID:", paymentIntent.id);

                // Retrieve the payment intent with expanded data
                const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id, {
                    expand: ['invoice', 'invoice.subscription', 'customer'],
                });

                console.log("[WEBHOOK] Calling handlePaymentIntentSucceeded...");
                await handlePaymentIntentSucceeded({ paymentIntent: fullPaymentIntent, stripe });
                console.log("[WEBHOOK] handlePaymentIntentSucceeded completed successfully");
                break;

            case 'invoice.payment_succeeded':
                console.log("[WEBHOOK] Processing invoice.payment_succeeded");
                const invoice = event.data.object as Stripe.Invoice;
                console.log("[WEBHOOK] Invoice ID:", invoice.id);

                await handleInvoicePaymentSucceeded({ invoice, stripe });
                console.log("[WEBHOOK] handleInvoicePaymentSucceeded completed successfully");
                break;

            case 'customer.subscription.deleted':
                console.log("[WEBHOOK] Processing customer.subscription.deleted");
                const subscription = event.data.object as Stripe.Subscription;
                const subscriptionId = subscription.id;

                await handleSubscriptionDeleted({ subscriptionId, stripe })
                console.log("[WEBHOOK] Subscription deleted:", subscriptionId);
                break;

            default:
                console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
        }

        console.log("[WEBHOOK] ========== WEBHOOK PROCESSED SUCCESSFULLY ==========");
    } catch (err) {
        console.error("[WEBHOOK] ========== WEBHOOK ERROR ==========");
        console.error("[WEBHOOK] Error details:", err);
        console.error("[WEBHOOK] Error message:", err instanceof Error ? err.message : 'Unknown error');
        console.error("[WEBHOOK] ========================================");

        return NextResponse.json(
            { error: "Failed to trigger webhook", message: err instanceof Error ? err.message : 'Unknown error' },
            { status: 400 }
        );
    }

    return NextResponse.json({
        status: "success",
    });
};