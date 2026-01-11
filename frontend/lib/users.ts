import { plans } from "@/utils/constants";
import { getDbConnection } from "./db";
import { getUserUploadCount } from "./summaries";
import { auth, currentUser, User } from "@clerk/nextjs/server";

let migrationRun = false;

export async function syncUser(sessionId?: string) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return;
        }

        const sql = await getDbConnection();
        const email = user.emailAddresses[0]?.emailAddress;

        if (!email) {
            return;
        }

        const stripe = (await import('stripe')).default;
        const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

        // If a sessionId is provided, try to fetch the subscription immediately
        if (sessionId) {
            try {
                const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
                    expand: ['subscription', 'customer']
                });

                const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
                const subscription = session.subscription as any;

                if (subscription && customerId) {
                    const priceId = subscription.items.data[0].price.id;
                    const planName = plans.find(p => p.priceId === priceId)?.name || 'Unknown';

                    await sql`
                        UPDATE users 
                        SET 
                            price_id = ${priceId}, 
                            status = 'active', 
                            plan_name = ${planName},
                            customer_id = ${customerId}
                        WHERE id = ${userId}
                    `;
                    console.log('[syncUser] Immediate activation from session successful');
                }
            } catch (err) {
                console.error('[syncUser] Error during immediate session sync:', err);
            }
        }

        // One-time migration to remove FK constraint if it exists
        if (!migrationRun) {
            try {
                await sql`ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_email_fkey`;
                // Also add plan_name column to users if it doesn't exist
                await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50)`;
                migrationRun = true;
                console.log('[syncUser] Migration: Database schema updated successfully');
            } catch (migrationError) {
                console.error('[syncUser] Migration failed:', migrationError);
                migrationRun = true;
            }
        }


        // 1. Check if user exists in our DB
        const existingUser = await sql`SELECT id, price_id, status FROM users WHERE id = ${userId}`;

        if (existingUser.length === 0) {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            console.log('[syncUser] Creating new user record for:', email);

            await sql`
                INSERT INTO users (id, email, full_name, status) 
                VALUES (${userId}, ${email}, ${fullName}, 'inactive')
                ON CONFLICT (id) DO NOTHING
            `;
        }

        // 2. Proactive Synchronization: If user is inactive or has no price_id, check for payments
        const userRecord = (await sql`SELECT price_id, status FROM users WHERE id = ${userId}`)?.[0];

        if (!userRecord?.price_id || userRecord?.status !== 'active') {
            console.log('[syncUser] User has no active plan, checking for existing payments for:', email);

            // Check internal payments table first
            const paymentRecord = await sql`
                SELECT price_id FROM payments 
                WHERE user_email = ${email} AND status = 'succeeded'
                ORDER BY created_at DESC LIMIT 1
            `;

            let detectedPriceId = null;
            let detectedCustomerId = null;

            if (paymentRecord.length > 0) {
                console.log('[syncUser] Found existing payment in DB');
                detectedPriceId = paymentRecord[0].price_id;
            } else {
                // Secondary fallback: Check Stripe directly (if webhooks are slow/failed)
                try {
                    const stripe = (await import('stripe')).default;
                    const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

                    const customers = await stripeClient.customers.list({ email, limit: 1 });
                    if (customers.data.length > 0) {
                        detectedCustomerId = customers.data[0].id;
                        const subscriptions = await stripeClient.subscriptions.list({
                            customer: detectedCustomerId,
                            status: 'active',
                            limit: 1
                        });

                        if (subscriptions.data.length > 0) {
                            detectedPriceId = subscriptions.data[0].items.data[0].price.id;
                            console.log('[syncUser] Found active subscription in Stripe');
                        }
                    }
                } catch (stripeError) {
                    console.error('[syncUser] Error checking Stripe backup:', stripeError);
                }
            }

            if (detectedPriceId) {
                const planName = plans.find(p => p.priceId === detectedPriceId)?.name || 'Unknown';
                console.log('[syncUser] Activating user with plan:', planName);

                await sql`
                    UPDATE users 
                    SET 
                        price_id = ${detectedPriceId}, 
                        status = 'active', 
                        plan_name = ${planName},
                        customer_id = COALESCE(customer_id, ${detectedCustomerId})
                    WHERE id = ${userId}
                `;
            }
        }
    } catch (error) {
        console.error('[syncUser] Error in syncUser:', error);
    }
}

export async function getPriceIdForActiveUser(userId: string) {
    const sql = await getDbConnection();

    const query =
        await sql`SELECT price_id FROM users WHERE id = ${userId} AND status = 'active'`;

    return query?.[0]?.price_id || null;
}

export async function hasActivePlan(email: string) {
    const sql = await getDbConnection();

    const query =
        await sql`SELECT price_id, status FROM users WHERE email = ${email} AND status = 'active'
        AND price_id IS NOT NULL`;

    return query && query.length > 0;
}

export async function hasReachedUploadLimit(userId: string) {
    const uploadCount = await getUserUploadCount(userId);

    const priceId = await getPriceIdForActiveUser(userId);

    const plan = plans.find((plan) => plan.priceId === priceId);
    const isPro = plan?.id.toLowerCase() === 'pro';
    const planName = plan?.name || 'Basic'; // Default to Basic if not found

    const uploadLimit = isPro ? 1000 : 5;

    return {
        hasReachedLimit: Number(uploadCount?.count ?? 0) >= uploadLimit,
        uploadLimit,
        planName
    };
}

export async function getSubscriptionStatus(user: User) {
    const hasSubscription = await hasActivePlan(user.emailAddresses[0].emailAddress);
    return hasSubscription;
}
