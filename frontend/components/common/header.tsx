import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "../ui/button";
import NavLink from "./nav-link";
import { SignedIn, UserButton, SignedOut } from "@clerk/nextjs";
import PlanBadge from "./plan-badge";
type HeaderProps = {
    navClassName?: string;
};

export default function Header({ navClassName = "" }: HeaderProps) {
    return (
        <nav className={`container flex items-center justify-between py-4 lg:px-8 px-2 mx-auto gap-4 ${navClassName}`}>
            <div className="flex flex-1">
                <Link href="/" className="flex items-center gap-1 lg:gap-2 shrink-0">
                    <FileText className="w-8 h-8 text-gray-900 group-hover:rotate-12 transform transition duration-200 ease-in-out" />
                    <span className="font-extrabold text-xl text-gray-900">Summarium</span>
                </Link>
            </div>
            <div className="flex lg:justify-center gap-2 lg:gap-12 items-center">
                <NavLink href="/pricing">Pricing Plans</NavLink>
                <SignedIn>
                    <NavLink href="/dashboard">Your Summaries</NavLink>
                </SignedIn>
            </div>

            <div className="flex flex-1 justify-end items-center">
                <SignedIn>
                    <div className="flex gap-2 items-center">
                        <NavLink href="/upload">Upload a PDF</NavLink>
                        <PlanBadge />
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </SignedIn>
                <SignedOut>
                    <NavLink href="/sign-in">Sign In</NavLink>
                </SignedOut>
            </div>
        </nav>
    );
}