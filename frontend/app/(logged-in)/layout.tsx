import { currentUser } from '@clerk/nextjs/server';
import { hasActivePlan, syncUser } from '@/lib/users';
import { redirect } from 'next/navigation';
import UpgradeRequired from '@/components/common/upgrade-required';

export default async function LoggedInLayout({
    children,
    params,
    searchParams,
}: {
    children: React.ReactNode;
    params: any;
    searchParams: any;
}) {
    const resolvedSearchParams = await searchParams || {};
    const session_id = resolvedSearchParams.session_id;
    const user = await currentUser();
    if (!user) {
        return redirect('/sign-in');
    }

    await syncUser(session_id);


    const hasActiveSubscription = await hasActivePlan(user.emailAddresses[0].emailAddress);

    if (!hasActiveSubscription) {
        return <UpgradeRequired />
    }

    return <>{children}</>;
}
