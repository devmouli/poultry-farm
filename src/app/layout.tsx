import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import NavLinks from './NavLinks';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Siva Rajesh Poultry Farm',
  description: 'Official B2B trading platform for Siva Rajesh Poultry Farm.',
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
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Siva Rajesh Poultry Farm</span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="flex-1 bg-gray-50/50">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-gray-500 border-t bg-white">
          Designed and Created by <strong>Chandramouli</strong>
        </footer>
      </body>
    </html>
  );
}
