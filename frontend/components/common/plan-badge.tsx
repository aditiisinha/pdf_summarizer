import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { getPriceIdForActiveUser } from "@/lib/users";
import { plans } from "@/utils/constants";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function PlanBadge() {
    const user = await currentUser();

    if (!user?.id) {
        return null;
    }

    const priceId = await getPriceIdForActiveUser(user.id);

    let planName = 'Buy a plan';

    const plan = plans.find((plan) => plan.priceId === priceId);

    if (plan) {
        planName = plan.name;
    }

    if (!priceId) {
        return (
            <Link href="/pricing" className="ml-2 hidden lg:flex">
                <Badge
                    variant="outline"
                    className="bg-linear-to-r from-red-100 to-red-200 border-red-300 flex flex-row items-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <Crown className="w-3 h-3 mr-1 text-red-600" />
                    {planName}
                </Badge>
            </Link>
        )
    }

    return (
        <Badge
            variant="outline"
            className="ml-2 bg-linear-to-r from-amber-100 to-amber-200 border-amber-300 hidden lg:flex flex-row items-center"
        >
            <Crown className="w-3 h-3 mr-1 text-amber-600" />
            {planName}
        </Badge>
    );
}