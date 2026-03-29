'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useLanguage();
    return (
        <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl focus:ring-green-500 focus:border-green-500 block px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 transition shadow-sm"
        >
            <option value="en">🇬🇧 EN</option>
            <option value="te">🇮🇳 TE</option>
            <option value="hi">🇮🇳 HI</option>
        </select>
    );
}
