import { plans } from "@/utils/constants";
import { getDbConnection } from "./db";
import { getUserUploadCount } from "./summaries";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        console.log('[syncUser] Starting sync for userId:', userId);

        if (!userId || !user) {
            console.log('[syncUser] No userId or user found, skipping sync');
            return;
        }

        const sql = await getDbConnection();

        // Check if user exists
        const existingUser = await sql`SELECT id FROM users WHERE id = ${userId}`;
        console.log('[syncUser] Existing user check:', existingUser.length > 0 ? 'User exists' : 'User not found');

        if (existingUser.length === 0) {
            const email = user.emailAddresses[0]?.emailAddress;
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

            console.log('[syncUser] Creating new user:', { userId, email, fullName });

            if (email) {
                const result = await sql`
            INSERT INTO users (id, email, full_name, status) 
            VALUES (${userId}, ${email}, ${fullName}, 'active')
            ON CONFLICT (id) DO NOTHING
            RETURNING id
          `;
                console.log('[syncUser] User insert result:', result.length > 0 ? 'Success' : 'Conflict/No insert');
            } else {
                console.error('[syncUser] No email found for user, cannot sync to DB');
            }
        }
    } catch (error) {
        console.error('[syncUser] Error syncing user to DB:', error);
        // Don't throw - we don't want to break the page if sync fails
    }
}

export async function getPriceIdForActiveUser(userId: string) {
    const sql = await getDbConnection();

    const query =
        await sql`SELECT price_id FROM users WHERE id = ${userId} AND status = 'active'`;

    return query?.[0]?.price_id || null;
}

export async function hasReachedUploadLimit(userId: string) {
    const uploadCount = await getUserUploadCount(userId);

    const priceId = await getPriceIdForActiveUser(userId);

    const isPro =
        plans.find((plan) => plan.priceId === priceId)?.id === 'pro';

    const uploadLimit = isPro ? 1000 : 5;

    return {
        hasReachedLimit: Number(uploadCount?.count ?? 0) >= uploadLimit,
        uploadLimit
    };
}