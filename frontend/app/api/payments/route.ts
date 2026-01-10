import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleCheckoutSessionCompleted, handleSubscriptionDeleted } from "@/lib/payments";

export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const POST = async (req: NextRequest) => {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {

        event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret!);



        switch (event.type) {
            case 'checkout.session.completed':
                console.log("DEBUG: Processing checkout.session.completed");

                console.log("Checkout session completed");
                const session = await stripe.checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id, {
                    expand: ['line_items'],
                });

                await handleCheckoutSessionCompleted({ session });
                break;

            case 'customer.subscription.deleted':
                console.log("Customer subscription deleted");
                const subscription = event.data.object as Stripe.Subscription;
                const subscriptionId = subscription.id;

                await handleSubscriptionDeleted({ subscriptionId, stripe })
                console.log(subscription);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (err) {
        console.log(err);
        return NextResponse.json(
            { error: "Failed to trigger webhook ", err },
            { status: 400 }
        );
    }


    return NextResponse.json({
        status: "success",
    });
};