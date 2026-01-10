import { syncUser } from '@/lib/users';

export default async function LoggedInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await syncUser();
    return <>{children}</>;
}
