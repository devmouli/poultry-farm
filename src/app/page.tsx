import Link from 'next/link';
import { ArrowRight, CheckCircle2, Factory, Truck, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden bg-white border-b py-32 px-4 text-center">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\' fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'nonzero\'/%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold tracking-wide border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Official Partner Procurement Portal
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            Direct Wholesale from <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
              Siva Rajesh Poultry Farm
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Join our exclusive network of wholesale traders. View our live farm inventory,
            secure premium broiler batches instantly, and procure directly from the source with zero middlemen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
              Register as Trader <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition">
              Partner Login
            </Link>
          </div>

          <div className="pt-12 flex items-center justify-center gap-8 text-gray-400 text-sm font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Premium Quality Birds</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Daily Market Rates</span>
            <span className="flex items-center gap-1.5"><Factory className="w-4 h-4" /> Direct Dispatch</span>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="w-full py-24 px-4 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why procure directly from us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We've digitized our farm's operations to give our trusted trading partners direct access to our live inventory and guaranteed stock availability.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition duration-300 group">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Farm Inventory</h3>
              <p className="text-gray-600 leading-relaxed">No more calling to check what's available. Log into your dashboard to instantly see exactly how many birds are ready for lifting across all our active batches.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition duration-300 group">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Bulk Ordering</h3>
              <p className="text-gray-600 leading-relaxed">See a batch that meets your weight and price requirements? Click 'Buy Now' to instantly lock in the inventory before other traders claim the stock.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 transition duration-300 group">
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reliable Dispatch</h3>
              <p className="text-gray-600 leading-relaxed">Once your order is approved by our farm managers, your stock is guaranteed. Track your complete order history and lifetime volume directly through your profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-20 px-4 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to secure your supply pipeline?</h2>
          <p className="text-gray-600 mb-8">Register as a verified trading partner to access our live farm inventory today.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg">
            Create Partner Account
          </Link>
        </div>
      </section>
    </div>
  );
}
