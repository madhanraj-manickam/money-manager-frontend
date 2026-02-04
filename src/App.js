import React, { useState, useEffect } from 'react';
import axios from 'axios';


const API = process.env.NODE_ENV === 'production' 
  ? "https://money-manager-api-2sn4.onrender.com/api/transactions" 
  : "http://localhost:8080/api/transactions";

export default function App() {
  const [data, setData] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState('All');

  const [form, setForm] = useState({
    type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General'
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await axios.get(API);
    setData(res.data);
    setViewData(res.data);
  };

  const stats = {
    inc: data.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0),
    exp: data.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0),
  };

  const handleFilter = (p) => {
    setFilter(p);
    let filtered = [...data];
    const now = new Date();
    if (p === 'Weekly') filtered = data.filter(t => (now - new Date(t.createdAt)) / 36e5 < 168);
    if (p === 'Monthly') filtered = data.filter(t => (now - new Date(t.createdAt)) / 36e5 < 720);
    setViewData(filtered);
  };

  const save = async (e) => {
    e.preventDefault();
    await axios.post(API, { ...form, amount: parseFloat(form.amount) });
    setModal(false);
    setForm({ type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General' });
    load();
  };

  const canEdit = (time) => (new Date() - new Date(time)) / 36e5 < 12;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black tracking-tight">Wallet</h1>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm">
            {['All', 'Weekly', 'Monthly'].map(p => (
              <button key={p} onClick={() => handleFilter(p)} className={`px-4 py-2 rounded-lg text-sm font-bold ${filter === p ? 'bg-black text-white' : 'text-slate-400'}`}>{p}</button>
            ))}
          </div>
          <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg transition-all">+ Add</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-slate-400 font-medium mb-1">Total Balance</p>
            <h2 className="text-3xl font-black">₹{stats.inc - stats.exp}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 border-l-green-500 border-l-4">
            <p className="text-slate-400 font-medium mb-1">Income</p>
            <h2 className="text-3xl font-black text-green-600">₹{stats.inc}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 border-l-red-500 border-l-4">
            <p className="text-slate-400 font-medium mb-1">Expenses</p>
            <h2 className="text-3xl font-black text-red-600">₹{stats.exp}</h2>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-6 text-left">Details</th>
                <th className="p-6 text-left">Division</th>
                <th className="p-6 text-right">Amount</th>
                <th className="p-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {viewData.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="p-6">
                    <p className="font-bold">{t.description}</p>
                    <p className="text-xs text-slate-400">{t.category}</p>
                  </td>
                  <td className="p-6 text-sm text-slate-600">{t.division} {t.type === 'TRANSFER' && `→ ${t.toDivision}`}</td>
                  <td className={`p-6 text-right font-black ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>₹{t.amount}</td>
                  <td className="p-6 text-center">
                    {canEdit(t.createdAt) ? <span className="text-indigo-600 text-xs font-bold cursor-pointer underline">Edit</span> : <span className="text-slate-300 text-xs">Locked</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl">
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
              {['INCOME', 'EXPENSE', 'TRANSFER'].map(m => (
                <button key={m} onClick={() => setForm({...form, type: m})} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${form.type === m ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>{m}</button>
              ))}
            </div>
            <form onSubmit={save} className="space-y-5">
              <input required type="number" placeholder="Amount" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <input required type="text" placeholder="Description" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <div className="flex gap-4">
                <select className="flex-1 p-5 bg-slate-50 rounded-2xl" value={form.division} onChange={e => setForm({...form, division: e.target.value})}>
                  <option value="Personal">Personal</option><option value="Office">Office</option>
                </select>
                {form.type === 'TRANSFER' && (
                  <select className="flex-1 p-5 bg-slate-50 rounded-2xl" value={form.toDivision} onChange={e => setForm({...form, toDivision: e.target.value})}>
                    <option value="Office">Office</option><option value="Personal">Personal</option>
                  </select>
                )}
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg">Save Transaction</button>
                <button type="button" onClick={() => setModal(false)} className="px-8 bg-slate-100 text-slate-500 rounded-3xl font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}