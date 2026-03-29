'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLinks() {
    const pathname = usePathname();

    // Hide login/signup links on the dashboards
    if (pathname === '/trader' || pathname === '/farm') {
        return null;
    }

    return (
        <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm">
                Sign up
            </Link>
        </nav>
    );
}
