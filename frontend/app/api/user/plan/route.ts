import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await currentUser();
        const email = user?.emailAddresses[0]?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: "No email found" }, { status: 400 });
        }

        const sql = await getDbConnection();
        const result = await sql`SELECT plan_name FROM users WHERE email = ${email}`;

        if (result.length > 0) {
            return NextResponse.json({ plan: result[0].plan_name });
        }

        return NextResponse.json({ plan: "Basic" });
    } catch (error) {
        console.error("Error fetching user plan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
