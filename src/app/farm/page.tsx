'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';

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

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
            window.location.href = '/login';
            return;
        }
        setUser(data.user);
        loadData(data.user.id);
    };

    const loadData = async (userId: string) => {
        setLoading(true);
        // Get farm
        const { data: farmData } = await supabase.from('farms').select('*').eq('farmer_id', userId).single();
        if (farmData) {
            setFarm(farmData);

            // Get batches
            const { data: batchData } = await supabase.from('batches').select('*').eq('farm_id', farmData.id).order('created_at', { ascending: false });
            if (batchData) {
                setBatches(batchData);

                // Get orders for these batches
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
        const { error } = await supabase.from('batches').insert({
            farm_id: farm.id,
            number_of_birds: parseInt(bBirds),
            available_birds: parseInt(bBirds),
            average_weight_kg: parseFloat(bWeight),
            price_per_kg: parseFloat(bPrice),
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

    if (loading) return <div className="p-8 text-center">Loading your farm...</div>;

    if (!farm) {
        return (
            <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-sm border">
                <h1 className="text-2xl font-bold mb-4">Setup Your Farm</h1>
                <form onSubmit={createFarm} className="space-y-4">
                    <input required type="text" placeholder="Farm Name" className="w-full px-4 py-2 border rounded-lg" value={farmName} onChange={e => setFarmName(e.target.value)} />
                    <input required type="text" placeholder="District (e.g., Pune)" className="w-full px-4 py-2 border rounded-lg" value={district} onChange={e => setDistrict(e.target.value)} />
                    <input required type="text" placeholder="State (e.g., Maharashtra)" className="w-full px-4 py-2 border rounded-lg" value={stateName} onChange={e => setStateName(e.target.value)} />
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg">Create Farm Profile</button>
                </form>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{farm.farm_name}</h1>
                    <p className="text-gray-500">{farm.location_district}, {farm.location_state}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowBatchModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Batch
                    </button>
                    <button className="text-sm bg-white border px-4 py-2 rounded-lg" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}>Sign Out</button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50">
                        <h2 className="font-semibold text-gray-700">My Batches</h2>
                    </div>
                    <div className="divide-y">
                        {batches.map(b => (
                            <div key={b.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{b.available_birds} / {b.number_of_birds} birds avail.</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${b.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {b.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">Ready: {b.expected_ready_date} • {b.average_weight_kg}kg avg • ₹{b.price_per_kg}/kg</div>
                                </div>
                            </div>
                        ))}
                        {batches.length === 0 && <div className="p-4 text-center text-gray-500">No batches created yet.</div>}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50/50">
                        <h2 className="font-semibold text-gray-700">Incoming Orders</h2>
                    </div>
                    <div className="divide-y">
                        {orders.map(o => (
                            <div key={o.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{o.profiles?.full_name} <span className="text-sm font-normal text-gray-500">({o.profiles?.phone})</span></h3>
                                        <p className="text-sm text-gray-600">Requested {o.quantity_birds} birds @ ₹{o.agreed_price_per_kg}/kg</p>
                                        <p className="font-semibold text-blue-600 mt-1">Total: ₹{o.total_price}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${o.status === 'PLACED' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                                        {o.status}
                                    </span>
                                </div>
                                {o.status === 'PLACED' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => updateOrderStatus(o.id, 'ACCEPTED', o.batch_id, o.quantity_birds)} className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-200">Accept Order</button>
                                        <button onClick={() => updateOrderStatus(o.id, 'REJECTED', o.batch_id, 0)} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-bold hover:bg-red-200">Reject</button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {orders.length === 0 && <div className="p-4 text-center text-gray-500">No incoming orders.</div>}
                    </div>
                </div>
            </div>

            {showBatchModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Batch</h2>
                        <form onSubmit={createBatch} className="space-y-4">
                            <input required type="number" placeholder="Number of Birds" className="w-full px-3 py-2 border rounded-lg" value={bBirds} onChange={e => setBbirds(e.target.value)} />
                            <input required type="number" step="0.1" placeholder="Average Weight (kg)" className="w-full px-3 py-2 border rounded-lg" value={bWeight} onChange={e => setBweight(e.target.value)} />
                            <input required type="number" placeholder="Price per kg (₹)" className="w-full px-3 py-2 border rounded-lg" value={bPrice} onChange={e => setBprice(e.target.value)} />
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Expected Ready Date</label>
                                <input required type="date" className="w-full px-3 py-2 border rounded-lg" value={bDate} onChange={e => setBdate(e.target.value)} />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => setShowBatchModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
