import Link from 'next/link';
import { ArrowRight, Tractor, TrendingUp, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-white border-b py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            The Direct B2B Market for <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Live Poultry</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Connecting poultry farmers directly with traders. Fast deals, transparent pricing, and seamless order management to maximize your margins.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition shadow-sm">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
              <Tractor className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">For Farmers</h3>
            <p className="text-gray-600">List your upcoming batches, set your expected ready dates, and accept offers directly from trusted buyers.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">For Traders</h3>
            <p className="text-gray-600">Find exactly what you need. Filter batches by location, weight, and price. Place orders instantly.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Transparent</h3>
            <p className="text-gray-600">All orders are tracked end-to-end. Built-in status tracking from placement to delivery ensures no disputes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
