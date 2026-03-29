'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Users, Clock, CheckCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

export default function FarmerDashboard() {
    const [user, setUser] = useState<any>(null);
    const [farm, setFarm] = useState<any>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [farmName, setFarmName] = useState('');
    const [district, setDistrict] = useState('');
    const [stateName, setStateName] = useState('');

    const [showBatchModal, setShowBatchModal] = useState(false);
    const [bBirds, setBbirds] = useState('');
    const [bWeight, setBweight] = useState('');
    const [bPrice, setBprice] = useState('');
    const [bDate, setBdate] = useState('');
    const [counterPrices, setCounterPrices] = useState<Record<string, string>>({});

    const applyCounterOffer = async (order: any) => {
        const newPrice = parseFloat(counterPrices[order.id]);
        if (isNaN(newPrice) || newPrice <= 0) return alert('Invalid counter offer price');

        const batch = batches.find((b: any) => b.id === order.batch_id);
        if (!batch) return;

        const newTotal = order.quantity_birds * newPrice * batch.average_weight_kg;

        const { error } = await supabase.from('orders').update({
            status: 'COUNTER_OFFER',
            agreed_price_per_kg: newPrice,
            total_price: newTotal
        }).eq('id', order.id);

        if (error) alert(error.message);
        else loadData(user.id);
    };

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
            window.location.href = '/login';
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('role, status').eq('id', data.user.id).single();
        if (profile?.role !== 'FARMER') {
            window.location.href = '/trader';
            return;
        }

        setUser({ ...data.user, profileStatus: profile.status });
        loadData(data.user.id);
    };

    const loadData = async (userId: string) => {
        setLoading(true);
        const { data: farmData } = await supabase.from('farms').select('*').eq('farmer_id', userId).single();
        if (farmData) {
            setFarm(farmData);

            const { data: batchData } = await supabase.from('batches').select('*').eq('farm_id', farmData.id).order('created_at', { ascending: false });
            if (batchData) {
                setBatches(batchData);

                const batchIds = batchData.map(b => b.id);
                if (batchIds.length > 0) {
                    const { data: orderData } = await supabase.from('orders').select('*, profiles(full_name, phone)').in('batch_id', batchIds).order('created_at', { ascending: false });
                    if (orderData) setOrders(orderData);
                }
            }
        }
        setLoading(false);
    };

    const createFarm = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('farms').insert({
            farmer_id: user.id,
            farm_name: farmName,
            location_district: district,
            location_state: stateName
        });
        if (!error) loadData(user.id);
    };

    const createBatch = async (e: React.FormEvent) => {
        e.preventDefault();

        const numBirds = parseInt(bBirds);
        const avgWeight = parseFloat(bWeight);
        const price = parseFloat(bPrice);

        if (numBirds <= 0 || avgWeight <= 0 || price <= 0) {
            return alert('All values must be greater than zero.');
        }

        const { error } = await supabase.from('batches').insert({
            farm_id: farm.id,
            number_of_birds: numBirds,
            available_birds: numBirds,
            average_weight_kg: avgWeight,
            price_per_kg: price,
            expected_ready_date: bDate,
            status: 'OPEN'
        });
        if (!error) {
            setShowBatchModal(false);
            loadData(user.id);
        } else alert(error.message);
    };

    const updateOrderStatus = async (orderId: string, status: string, batchId: string, qty: number) => {
        await supabase.from('orders').update({ status }).eq('id', orderId);
        if (status === 'ACCEPTED') {
            const batch = batches.find(b => b.id === batchId);
            if (batch) {
                const newAvailable = batch.available_birds - qty;
                const newStatus = newAvailable <= 0 ? 'CLOSED' : 'OPEN';
                await supabase.from('batches').update({ available_birds: newAvailable, status: newStatus }).eq('id', batchId);
            }
        }
        loadData(user.id);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your farm...</div>;

    if (user?.profileStatus === 'PENDING') {
        return (
            <div className="max-w-md mx-auto mt-32 bg-white p-10 rounded-2xl shadow-xl border border-yellow-200">
                <div className="flex justify-center mb-6"><Clock className="w-16 h-16 text-yellow-500 animate-pulse" /></div>
                <h1 className="text-2xl font-extrabold mb-3 text-center text-gray-900">Verification Pending</h1>
                <p className="text-gray-600 text-center font-medium leading-relaxed mb-8">
                    Your farm profile has been submitted and is currently under review by our platform administrators. You will be cleared to list marketplace batches once approved.
                </p>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}>
                    Sign Out Immediately
                </button>
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold mb-4 text-gray-900">Setup Your Farm Profile</h1>
                <p className="text-sm text-gray-500 mb-6">Since you are the owner, this is a one-time setup to register your central farm location.</p>
                <form onSubmit={createFarm} className="space-y-4">
                    <input required type="text" placeholder="Farm Name (e.g., Siva Rajesh Farms)" className="w-full px-4 py-2 border rounded-lg" value={farmName} onChange={e => setFarmName(e.target.value)} />
                    <input required type="text" placeholder="District" className="w-full px-4 py-2 border rounded-lg" value={district} onChange={e => setDistrict(e.target.value)} />
                    <input required type="text" placeholder="State" className="w-full px-4 py-2 border rounded-lg" value={stateName} onChange={e => setStateName(e.target.value)} />
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">Initialize Farm</button>
                </form>
            </div>
        );
    }

    const pendingOrders = orders.filter(o => o.status === 'PLACED');

    // Group all orders by Trader
    const tradersMap = orders.reduce((acc: any, order: any) => {
        const tId = order.trader_id;
        if (!acc[tId]) acc[tId] = { profile: order.profiles, history: [], totalApprovedSpent: 0, totalApprovedBirds: 0 };
        acc[tId].history.push(order);
        if (order.status === 'ACCEPTED' || order.status === 'DELIVERED') {
            acc[tId].totalApprovedSpent += order.total_price;
            acc[tId].totalApprovedBirds += order.quantity_birds;
        }
        return acc;
    }, {});
    const traderGroups = Object.values(tradersMap);

    // Compute Overall Farm Metrics
    const activeBatches = batches.filter(b => b.status === 'OPEN');
    const totalInventory = activeBatches.reduce((sum, b) => sum + b.available_birds, 0);
    const projectedRevenue = activeBatches.reduce((sum, b) => sum + (b.available_birds * b.average_weight_kg * b.price_per_kg), 0);
    const allTimeRevenue = orders.reduce((sum, o) => (o.status === 'ACCEPTED' || o.status === 'DELIVERED') ? sum + o.total_price : sum, 0);
    const needsReplenishment = totalInventory < 500; // Warning threshold

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{farm.farm_name}</h1>
                    <p className="text-gray-500 font-medium">{farm.location_district}, {farm.location_state}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowBatchModal(true)} className="bg-green-600 shadow-lg text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition flex items-center gap-2 transform hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" /> Add New Batch
                    </button>
                    <button className="text-sm bg-white border px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}>Sign Out</button>
                </div>
            </div>

            {/* Farm Metrics & Replenishment Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><Activity className="w-4 h-4" /> Total Live Stock</p>
                    <div className="mt-2">
                        <span className="text-3xl font-extrabold text-gray-900">{totalInventory.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 font-medium ml-1">birds</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-blue-500" /> Projected Value</p>
                    <div className="mt-2 text-2xl font-extrabold text-blue-600">
                        ₹{projectedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Lifetime Sales</p>
                    <div className="mt-2 text-2xl font-extrabold text-green-600">
                        ₹{allTimeRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
                <div className={`p-5 rounded-2xl border shadow-sm ${needsReplenishment ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${needsReplenishment ? 'text-red-700' : 'text-emerald-700'}`}>
                        {needsReplenishment ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} Inventory Health
                    </p>
                    <div className="mt-2 font-bold text-lg">
                        {needsReplenishment ? (
                            <span className="text-red-800">⚠️ Low Stock! Replenish</span>
                        ) : (
                            <span className="text-emerald-800">Optimal Stock</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
                {/* Column 1: Active Batches */}
                <div className="lg:col-span-1 border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b bg-gray-50/50 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><CheckCircle className="w-4 h-4" /></div>
                        <h2 className="font-bold text-gray-900">My Batches</h2>
                    </div>
                    <div className="divide-y flex-1 overflow-y-auto max-h-[500px]">
                        {batches.map(b => (
                            <div key={b.id} className="p-5 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-gray-900">{b.available_birds} birds left</span>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${b.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {b.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 grid gap-1">
                                    <span>Added: {new Date(b.created_at).toLocaleDateString()}</span>
                                    <span>Avg: <b>{b.average_weight_kg}kg</b> @ <b>₹{b.price_per_kg}/kg</b></span>
                                </div>
                            </div>
                        ))}
                        {batches.length === 0 && <div className="p-8 text-center text-gray-500">No active batches.</div>}
                    </div>
                </div>

                {/* Column 2: Pending Order Approvals */}
                <div className="lg:col-span-2 border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b bg-yellow-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700"><Clock className="w-4 h-4" /></div>
                            <h2 className="font-bold text-gray-900">Action Required: Pending Requests</h2>
                        </div>
                        <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full">{pendingOrders.length} New</span>
                    </div>
                    <div className="divide-y flex-1 overflow-y-auto max-h-[500px]">
                        {pendingOrders.map(o => (
                            <div key={o.id} className="p-5 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{o.profiles?.full_name}</h3>
                                        <p className="text-sm text-gray-500">{o.profiles?.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-extrabold text-blue-600 text-xl">₹{o.total_price}</div>
                                        <div className="text-sm text-gray-600 font-medium">For {o.quantity_birds} birds</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 mt-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => updateOrderStatus(o.id, 'ACCEPTED', o.batch_id, o.quantity_birds)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 shadow-sm transition">Accept Order</button>
                                        <button onClick={() => updateOrderStatus(o.id, 'REJECTED', o.batch_id, 0)} className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition">Reject</button>
                                    </div>
                                    <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Counter:</span>
                                        <input type="number" placeholder="New ₹/kg" className="w-24 px-3 py-1.5 text-sm border rounded-lg" value={counterPrices[o.id] || ''} onChange={e => setCounterPrices({ ...counterPrices, [o.id]: e.target.value })} />
                                        <button onClick={() => applyCounterOffer(o)} className="flex-1 bg-purple-100 text-purple-700 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-200 transition">Suggest Price</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && <div className="p-12 text-center text-gray-500 font-medium">All caught up! No pending requests.</div>}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Trader CRM / Network History */}
            <div className="border rounded-2xl bg-white shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700"><Users className="w-5 h-5" /></div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Trader Network & CRM</h2>
                            <p className="text-sm text-gray-500">Track lifetime volume and order history for every trader.</p>
                        </div>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1.5 rounded-lg">{traderGroups.length} Traders Networked</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 p-6 gap-6 bg-gray-50/30">
                    {traderGroups.map((t: any, idx: number) => (
                        <div key={idx} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                            <div className="p-5 border-b flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{t.profile?.full_name}</h3>
                                    <a href={`tel:${t.profile?.phone}`} className="text-blue-600 text-sm font-medium hover:underline">{t.profile?.phone}</a>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Lifetime Value</div>
                                    <div className="text-green-600 font-extrabold text-lg">₹{t.totalApprovedSpent}</div>
                                    <div className="text-xs font-bold text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded">{t.totalApprovedBirds} Birds</div>
                                </div>
                            </div>
                            <div className="p-0">
                                <details className="group">
                                    <summary className="cursor-pointer p-4 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition select-none">
                                        View Order History ({t.history.length})
                                        <span className="transition group-open:rotate-180">▼</span>
                                    </summary>
                                    <div className="px-4 py-2 divide-y border-t bg-white max-h-48 overflow-y-auto">
                                        {t.history.map((hOrder: any) => (
                                            <div key={hOrder.id} className="py-2 flex justify-between items-center text-sm">
                                                <div>
                                                    <div className="font-semibold">{hOrder.quantity_birds} birds</div>
                                                    <div className="text-xs text-gray-500">{new Date(hOrder.created_at).toLocaleDateString()}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-900">₹{hOrder.total_price}</div>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${hOrder.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                        hOrder.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            hOrder.status === 'PLACED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'} `}>
                                                        {hOrder.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        </div>
                    ))}
                    {traderGroups.length === 0 && <div className="col-span-full py-8 text-center text-gray-500">You haven't networked with any traders yet.</div>}
                </div>
            </div>

            {/* Batch Creation Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Create New Batch</h2>
                        <form onSubmit={createBatch} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Number of Birds</label>
                                <input required type="number" min="1" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white transition" value={bBirds} onChange={e => setBbirds(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Avg Weight (kg)</label>
                                <input required type="number" min="0.1" step="0.1" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white transition" value={bWeight} onChange={e => setBweight(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Price per kg (₹)</label>
                                <input required type="number" min="1" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white transition" value={bPrice} onChange={e => setBprice(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Expected Ready Date</label>
                                <input required type="date" className="w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white transition" value={bDate} onChange={e => setBdate(e.target.value)} />
                            </div>
                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowBatchModal(false)} className="flex-1 px-4 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md transition">Create Batch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
