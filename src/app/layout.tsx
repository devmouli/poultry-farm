import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PoultryConnect - B2B Marketplace',
  description: 'Connect poultry farms directly with traders.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">PoultryConnect</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Link href="/signup" className="text-sm font-medium bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                Sign up
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 bg-gray-50/50">
          {children}
        </main>
      </body>
    </html>
  );
}
