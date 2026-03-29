'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';

export default function NavLinks() {
    const { t } = useLanguage();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
                if (profile) setRole(profile.role);
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    if (loading) return <div className="animate-pulse w-32 h-8 bg-gray-100 rounded-lg"></div>;

    if (role === 'TRADER') {
        return <Link href="/trader" className="text-gray-600 font-semibold hover:text-green-600 transition">{t("trader_panel")}</Link>;
    }

    if (role === 'ADMIN') {
        return (
            <div className="flex gap-4 items-center">
                <Link href="/farm" className="text-gray-600 font-semibold hover:text-green-600 transition">{t("farm_panel")}</Link>
                <Link href="/admin" className="text-gray-600 font-semibold hover:text-green-600 transition">Admin Panel</Link>
            </div>
        );
    }

    return (
        <div className="flex gap-4 items-center">
            <Link href="/login" className="text-gray-600 font-semibold hover:text-gray-900 transition">{t("login")}</Link>
            <Link href="/signup" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition shadow-sm">{t("signup")}</Link>
        </div>
    );
}
