import { getDbConnection } from './db';
import { currentUser } from '@clerk/nextjs/server';

export async function syncUser() {
    const user = await currentUser();
    if (!user) return null;

    const userId = user.id;
    const email = user.emailAddresses[0]?.emailAddress;
    const fullName = `${user.firstName || ''} ${user.lastName || ''} `.trim();

    if (!email) {
        console.error("No email found for user, cannot sync to DB");
        return null;
    }

    try {
        const sql = await getDbConnection();

        // Check if user exists
        const existingUser = await sql`SELECT id FROM users WHERE id = ${userId}`;

        if (existingUser.length === 0) {
            console.log("User not found in DB, creating...");
            await sql`
        INSERT INTO users (id, email, full_name, status) 
        VALUES (${userId}, ${email}, ${fullName}, 'active')
        ON CONFLICT (id) DO NOTHING
      `;
            console.log("User inserted into DB");
        }

        return userId;
    } catch (error) {
        console.error('Error syncing user to DB:', error);
        return null;
    }
}
