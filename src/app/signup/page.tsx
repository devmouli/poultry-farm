'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function Signup() {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'FARMER' | 'TRADER'>('FARMER');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: authData.user.id,
                role,
                full_name: fullName,
                phone,
                status: 'PENDING'
            });

            if (profileError) {
                setError(profileError.message);
                setLoading(false);
                return;
            }

            if (role === 'FARMER') router.push('/farm');
            else router.push('/trader');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border">
                <h1 className="text-2xl font-bold text-center mb-6">{t("create_account_title")}</h1>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setRole('FARMER')}
                            className={`py-3 rounded-lg border text-sm font-medium transition ${role === 'FARMER' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            {t("role_farmer")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('TRADER')}
                            className={`py-3 rounded-lg border text-sm font-medium transition ${role === 'TRADER' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            {t("role_trader")}
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("full_name")}</label>
                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("phone")}</label>
                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="+1234567890" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
                        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 mt-4">
                        {loading ? t("creating") : t("signup")}
                    </button>
                </form>
            </div>
        </div>
    );
}
