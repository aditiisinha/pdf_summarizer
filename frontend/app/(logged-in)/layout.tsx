import { syncUser } from '@/lib/users';

export default async function LoggedInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This runs every time a user visits a /dashboard or /upload page
    await syncUser();
    return <>{children}</>;
}
