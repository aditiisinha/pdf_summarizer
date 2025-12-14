'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavLink({ href, children, className }: { 
    href: string; 
    children: React.ReactNode; 
    className?: string; 
}) {
    const [isActive, setIsActive] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsActive(pathname === href || (href !== "/" && pathname.startsWith(href)));
    }, [pathname, href]);

    return (
        <Link
            href={href}
            className={cn(
                "transition-colors text-sm duration-200 ease-in-out text-gray-600 hover:text-rose-500",
                className,
                isActive ? "text-rose-500" : ""
            )}
        >
            {children}
        </Link>
    );
}