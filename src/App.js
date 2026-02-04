import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Filter, Lock } from 'lucide-react';

const API = "http://localhost:8080/api/transactions";

export default function App() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [filterDiv, setFilterDiv] = useState('All');
  const [form, setForm] = useState({ type:'EXPENSE', amount:0, description:'', category:'Food', division:'Personal', transactionDate:'' });

  useEffect(() => { load(); }, []);
  const load = () => axios.get(API).then(r => setData(r.data));

  const save = (e) => {
    e.preventDefault();
    axios.post(API, form).then(() => { setModal(false); load(); });
  };

  const canEdit = (time) => (new Date() - new Date(time)) / 3600000 < 12;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-indigo-600">WALLET.IO</h1>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition">
            <PlusCircle size={20}/> Add New
          </button>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {['INCOME', 'EXPENSE', 'BALANCE'].map(t => {
            const val = data.reduce((a, c) => t === 'BALANCE' 
              ? (c.type === 'INCOME' ? a + c.amount : a - c.amount) 
              : (c.type === t ? a + c.amount : a), 0);
            return (
              <div key={t} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t}</p>
                <p className={`text-3xl font-black ${t === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-500'}`}>${val.toFixed(2)}</p>
              </div>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="flex gap-4 mb-6">
          <select onChange={e => setFilterDiv(e.target.value)} className="bg-white border p-2 rounded-lg text-sm font-semibold outline-none">
            <option value="All">All Divisions</option>
            <option value="Personal">Personal</option>
            <option value="Office">Office</option>
          </select>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-5">Details</th>
                <th className="p-5">Category</th>
                <th className="p-5 text-right">Amount</th>
                <th className="p-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.filter(i => filterDiv === 'All' || i.division === filterDiv).map(i => (
                <tr key={i.id} className="hover:bg-slate-50 transition border-b border-slate-50">
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{i.description}</p>
                    <p className="text-xs text-slate-400">{new Date(i.transactionDate).toLocaleString()}</p>
                  </td>
                  <td className="p-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase">{i.category} | {i.division}</span>
                  </td>
                  <td className={`p-5 text-right font-black ${i.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {i.type === 'INCOME' ? '+' : '-'}${i.amount}
                  </td>
                  <td className="p-5 text-center">
                    {!canEdit(i.createdAt) ? <Lock size={16} className="mx-auto text-slate-300" /> : <button className="text-indigo-500 text-xs font-bold">Edit</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black mb-6 text-slate-800">Add Transaction</h2>
            <form onSubmit={save} className="space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['INCOME', 'EXPENSE'].map(type => (
                  <button key={type} type="button" onClick={() => setForm({...form, type})} 
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${form.type === type ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                    {type}
                  </button>
                ))}
              </div>
              <input type="number" placeholder="0.00" className="w-full border-2 border-slate-100 p-3 rounded-xl focus:border-indigo-500 outline-none font-bold" 
                onChange={e => setForm({...form, amount: parseFloat(e.target.value)})}/>
              <input type="datetime-local" className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm" 
                onChange={e => setForm({...form, transactionDate: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <select className="border-2 border-slate-100 p-3 rounded-xl text-sm" onChange={e => setForm({...form, division: e.target.value})}>
                  <option>Personal</option><option>Office</option>
                </select>
                <select className="border-2 border-slate-100 p-3 rounded-xl text-sm" onChange={e => setForm({...form, category: e.target.value})}>
                  <option>Food</option><option>Fuel</option><option>Movie</option><option>Medical</option>
                </select>
              </div>
              <input type="text" placeholder="Description" className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm" 
                onChange={e => setForm({...form, description: e.target.value})}/>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-3 font-bold text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}