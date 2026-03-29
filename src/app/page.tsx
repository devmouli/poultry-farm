'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Factory, Truck, BarChart3, ShieldCheck, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center">
      <section className="w-full relative overflow-hidden bg-white border-b py-32 px-4 text-center">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\' fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'nonzero\'/%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold tracking-wide border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Official Partner Procurement Portal
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            {t("welcome").replace('Siva Rajesh Poultry Farm', '')} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
              {t("brand")}
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
              {t("create_account")} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition">
              {t("partner_login")}
            </Link>
          </div>

          <div className="pt-12 flex items-center justify-center gap-8 text-gray-400 text-sm font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Premium Quality</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Daily Market Rates</span>
            <span className="flex items-center gap-1.5"><Factory className="w-4 h-4" /> Direct Dispatch</span>
          </div>
        </div>
      </section>
    </div>
  );
}
