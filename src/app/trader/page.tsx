'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Package, MapPin, Search, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function TraderDashboard() {
    const { t } = useLanguage();
    const [batches, setBatches] = useState<any[]>([]);
    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Filters
    const [districtFilter, setDistrictFilter] = useState('');
    const [minWeight, setMinWeight] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minBirds, setMinBirds] = useState('');

    const acceptCounter = async (order: any) => {
        const { error } = await supabase.from('orders').update({ status: 'ACCEPTED' }).eq('id', order.id);
        if (!error) {
            const batch = batches.find(b => b.id === order.batch_id);
            if (batch) {
                const newAvailable = batch.available_birds - order.quantity_birds;
                const newStatus = newAvailable <= 0 ? 'CLOSED' : 'OPEN';
                await supabase.from('batches').update({ available_birds: newAvailable, status: newStatus }).eq('id', batch.id);
            }
            fetchData(user.id);
        } else {
            alert(error.message);
        }
    };

    const declineOrder = async (orderId: string) => {
        await supabase.from('orders').update({ status: 'REJECTED' }).eq('id', orderId);
        fetchData(user?.id);
    };

    // Order modal
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [orderQuantity, setOrderQuantity] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);

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
        if (profile?.role !== 'TRADER') {
            window.location.href = '/farm';
            return;
        }

        setUser(data.user);
        fetchData(data.user.id);
    };

    const fetchData = async (userId: string) => {
        setLoading(true);
        let query = supabase
            .from('batches')
            .select('*, farms(farm_name, location_district)')
            .eq('status', 'OPEN')
            .gt('available_birds', 0);

        if (districtFilter) {
            query = query.ilike('farms.location_district', `%${districtFilter}%`);
        }
        if (minWeight) query = query.gte('average_weight_kg', parseFloat(minWeight));
        if (maxPrice) query = query.lte('price_per_kg', parseFloat(maxPrice));
        if (minBirds) query = query.gte('available_birds', parseInt(minBirds));

        const { data: bData } = await query;
        if (bData) setBatches(bData);

        const { data: oData } = await supabase
            .from('orders')
            .select('*, batches(farms(farm_name))')
            .eq('trader_id', userId)
            .order('created_at', { ascending: false });

        if (oData) setMyOrders(oData);
        setLoading(false);
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBatch || !user) return;
        setPlacingOrder(true);

        const qty = parseInt(orderQuantity);
        if (isNaN(qty) || qty <= 0) return alert('Quantity must be at least 1 bird.');
        if (qty > selectedBatch.available_birds) return alert('Not enough birds available.');
        const totalPrice = qty * selectedBatch.average_weight_kg * selectedBatch.price_per_kg;

        const { error } = await supabase.from('orders').insert({
            trader_id: user.id,
            batch_id: selectedBatch.id,
            quantity_birds: qty,
            agreed_price_per_kg: selectedBatch.price_per_kg,
            total_price: totalPrice,
            status: 'PLACED'
        });

        setPlacingOrder(false);
        if (!error) {
            setSelectedBatch(null);
            setOrderQuantity('');
            fetchData(user.id);
        } else {
            alert(error.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t("marketplace")}</h1>
                <button className="text-sm bg-white border px-4 py-2 rounded-lg" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}>{t("signout")}</button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column - Market Search */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r px-2 pb-2 md:pb-0">
                            <Search className="text-gray-400 w-4 h-4" />
                            <input type="text" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} onBlur={() => fetchData(user?.id)} placeholder={t("district_search")} className="w-full bg-transparent outline-none focus:ring-0 text-sm font-medium text-gray-700" />
                        </div>
                        <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r px-2 pb-2 md:pb-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">{t("min_wt")}:</span>
                            <input type="number" step="0.1" value={minWeight} onChange={(e) => setMinWeight(e.target.value)} onBlur={() => fetchData(user?.id)} placeholder="kg" className="w-full bg-transparent outline-none focus:ring-0 text-sm font-medium text-gray-700" />
                        </div>
                        <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r px-2 pb-2 md:pb-0">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">{t("max_price")}:</span>
                            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onBlur={() => fetchData(user?.id)} placeholder="₹/kg" className="w-full bg-transparent outline-none focus:ring-0 text-sm font-medium text-gray-700" />
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">{t("min_qty")}:</span>
                            <input type="number" value={minBirds} onChange={(e) => setMinBirds(e.target.value)} onBlur={() => fetchData(user?.id)} placeholder={t("birds")} className="w-full bg-transparent outline-none focus:ring-0 text-sm font-medium text-gray-700" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/50">
                            <h2 className="font-semibold text-gray-700">{t("avail_batches")}</h2>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading market...</div>
                        ) : batches.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No batches currently available.</div>
                        ) : (
                            <div className="divide-y">
                                {batches.map(batch => (
                                    <div key={batch.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                        <div>
                                            <h3 className="font-semibold text-lg">{batch.farms?.farm_name}</h3>
                                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <MapPin className="w-4 h-4" /> {batch.farms?.location_district}
                                            </div>
                                            <div className="flex gap-4 mt-3">
                                                <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                                                    {batch.available_birds} {t("birds")}
                                                </span>
                                                <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
                                                    ₹{batch.price_per_kg}/kg
                                                </span>
                                                <span className="text-sm bg-orange-50 text-orange-700 px-2 py-1 rounded-md font-medium">
                                                    Avg {batch.average_weight_kg}kg
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedBatch(batch)}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition shadow-sm"
                                        >
                                            {t("buy_now")}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - My Orders */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/50">
                            <h2 className="font-semibold text-gray-700">{t("my_orders")}</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {myOrders.map(order => (
                                <div key={order.id} className="border rounded-lg p-3 text-sm">
                                    <div className="flex justify-between font-medium mb-1">
                                        <span>{order.quantity_birds} {t("birds")}</span>
                                        <span>₹{order.total_price}</span>
                                    </div>
                                    <div className="text-gray-500 text-xs mb-2">{order.batches?.farms?.farm_name}</div>
                                    <div className="flex flex-col items-start gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'PLACED' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                                                order.status === 'COUNTER_OFFER' ? 'bg-purple-100 text-purple-800' :
                                                    order.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {order.status === 'COUNTER_OFFER' ? t("new_offer") : order.status}
                                        </span>
                                        {order.status === 'COUNTER_OFFER' && (
                                            <div className="flex gap-2 w-full mt-1">
                                                <button onClick={() => acceptCounter(order)} className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm">{t("accept_deal")}</button>
                                                <button onClick={() => declineOrder(order.id)} className="bg-red-50 text-red-700 border px-3 py-1.5 rounded text-xs font-bold hover:bg-red-100">{t("decline")}</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {myOrders.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No orders placed yet.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Modal */}
            {selectedBatch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">{t("place_order")}</h2>
                        <div className="mb-4 text-sm text-gray-600">
                            <p>Farm: {selectedBatch.farms?.farm_name}</p>
                            <p>{t("available")}: {selectedBatch.available_birds} {t("birds")}</p>
                            <p>Price: ₹{selectedBatch.price_per_kg}/kg</p>
                        </div>
                        <form onSubmit={handlePlaceOrder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Number of Birds)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedBatch.available_birds}
                                    required
                                    value={orderQuantity}
                                    onChange={(e) => setOrderQuantity(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border text-sm">
                                <span className="text-gray-600">Total Est. Price:</span>
                                <span className="font-bold text-lg">
                                    ₹{orderQuantity ? (parseInt(orderQuantity) * selectedBatch.average_weight_kg * selectedBatch.price_per_kg).toFixed(2) : '0.00'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setSelectedBatch(null)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 border-gray-300">{t("cancel")}</button>
                                <button type="submit" disabled={placingOrder} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                                    {placingOrder ? 'Confirming...' : t("confirm_order")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
