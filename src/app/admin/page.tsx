'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, UserCheck, XCircle, Activity, Globe } from 'lucide-react';

export default function AdminDashboard() {
    const [farmers, setFarmers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
            window.location.href = '/login';
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (profile?.role !== 'ADMIN') {
            alert("Unauthorized. Strictly reserved for Platform Administrators.");
            window.location.href = '/';
            return;
        }

        loadData();
    };

    const loadData = async () => {
        setLoading(true);
        // Fetch all farmers
        const { data: fData } = await supabase.from('profiles').select('*').eq('role', 'FARMER').order('created_at', { ascending: false });
        if (fData) setFarmers(fData);

        // Fetch all orders
        const { data: oData } = await supabase.from('orders').select('*, profiles(full_name), batches(farms(farm_name))').order('created_at', { ascending: false }).limit(50);
        if (oData) setOrders(oData);
        setLoading(false);
    };

    const updateFarmerStatus = async (id: string, status: string) => {
        await supabase.from('profiles').update({ status }).eq('id', id);
        loadData();
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Booting Admin Surveillance...</div>;

    const pendingFarmers = farmers.filter(f => f.status === 'PENDING');
    const verifiedFarmers = farmers.filter(f => f.status === 'APPROVED');
    const totalPlatformVolume = orders.reduce((sum, o) => (o.status === 'ACCEPTED' || o.status === 'DELIVERED') ? sum + o.total_price : sum, 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Globe className="w-8 h-8 text-blue-600" /> Platform Control Center
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Manage farm onboardings and monitor global marketplace activity.</p>
                </div>
                <button className="text-sm bg-white border px-5 py-2.5 rounded-xl font-semibold text-red-600 border-red-200 hover:bg-red-50 transition" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}>Terminate Session</button>
            </div>

            <div className="grid lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pending Verifications</p>
                    <div className="text-3xl font-extrabold text-orange-600 mt-2">{pendingFarmers.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Approved Farms Network</p>
                    <div className="text-3xl font-extrabold text-green-600 mt-2">{verifiedFarmers.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Global Platform Orders</p>
                    <div className="text-3xl font-extrabold text-blue-600 mt-2">{orders.length}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50">
                    <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide flex items-center gap-1.5">Gross Traded Value (GTV)</p>
                    <div className="text-3xl font-extrabold text-indigo-900 mt-2">₹{totalPlatformVolume.toLocaleString()}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Farmer Approvals Column */}
                <div className="border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b bg-orange-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-orange-600" /> KYC Verification Queue</h2>
                    </div>
                    <div className="divide-y overflow-y-auto max-h-[600px]">
                        {pendingFarmers.map(f => (
                            <div key={f.id} className="p-5 hover:bg-gray-50 transition flex justify-between items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{f.full_name}</h3>
                                    <p className="text-sm text-gray-500">{f.phone}</p>
                                    <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded mt-1 inline-block">Awaiting Approval</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => updateFarmerStatus(f.id, 'APPROVED')} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="Approve Farm"><UserCheck className="w-5 h-5" /></button>
                                    <button onClick={() => updateFarmerStatus(f.id, 'REJECTED')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition" title="Reject Farm"><XCircle className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                        {pendingFarmers.length === 0 && <div className="p-8 text-center text-gray-500 font-medium">No pending farms in the queue.</div>}
                    </div>
                </div>

                {/* Global Surveillance Column */}
                <div className="border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b bg-blue-50/50">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" /> Live Order Surveillance</h2>
                    </div>
                    <div className="divide-y overflow-y-auto max-h-[600px]">
                        {orders.map(o => (
                            <div key={o.id} className="p-4 hover:bg-gray-50 transition text-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-gray-900">{o.batches?.farms?.farm_name || 'Unknown Farm'}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${o.status === 'ACCEPTED' || o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                            o.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                o.status === 'COUNTER_OFFER' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>{o.status}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 mt-2">
                                    <span>Buyer: <span className="font-medium text-gray-900">{o.profiles?.full_name}</span></span>
                                    <span>₹{o.total_price} ({o.quantity_birds} birds)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
