import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.NODE_ENV === 'production' 
  ? "https://money-manager-api-2sn4.onrender.com/api/transactions" 
  : "http://localhost:8080/api/transactions";

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("walletUser")));
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [data, setData] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({
    type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General'
  });

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    // Fetching data specific to the logged-in user email [cite: 44, 45]
    const res = await axios.get(`${API}/user/${user.email}`);
    setData(res.data);
    setViewData(res.data);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const userData = { email: loginData.email };
    localStorage.setItem("walletUser", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("walletUser");
    setUser(null);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) };
    if (editingId) {
      await axios.put(`${API}/${editingId}`, payload);
    } else {
      await axios.post(`${API}/user/${user.email}`, payload);
    }
    setEditingId(null);
    setModal(false);
    setForm({ type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General' });
    load();
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this transaction?")) {
      await axios.delete(`${API}/${id}`);
      load();
    }
  };

  const startEdit = (t) => {
    setForm(t);
    setEditingId(t.id);
    setModal(true);
  };

  const stats = {
    inc: data.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0),
    exp: data.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0),
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
          <h2 className="text-3xl font-black mb-2 text-slate-900">Welcome Back</h2>
          <p className="text-slate-400 mb-8 font-medium">Login to manage your wallet</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input required type="email" placeholder="Email Address" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" 
              onChange={e => setLoginData({...loginData, email: e.target.value})} />
            <input required type="password" placeholder="Password" className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" 
              onChange={e => setLoginData({...loginData, password: e.target.value})} />
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg hover:bg-indigo-700 transition-all">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Wallet</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">{user.email.split('@')[0]}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-slate-400 font-bold text-sm hover:text-red-500">Logout</button>
            <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg transition-all">+ Add</button>
          </div>
        </header>

        {/* Original Stats Cards [cite: 54, 55] */}
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

        {/* Original Table UI [cite: 56, 57] */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-6">Details</th>
                <th className="p-6">Division</th>
                <th className="p-6 text-right">Amount</th>
                <th className="p-6 text-center">Actions</th>
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
                  <td className="p-6 text-center space-x-4">
                    <button onClick={() => startEdit(t)} className="text-indigo-600 text-xs font-bold underline">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 text-xs font-bold underline">Delete</button>
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
             <h2 className="text-2xl font-black mb-6 text-slate-900">{editingId ? 'Edit' : 'Add'} Transaction</h2>
             <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
              {['INCOME', 'EXPENSE', 'TRANSFER'].map(m => (
                <button key={m} onClick={() => setForm({...form, type: m})} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${form.type === m ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>{m}</button>
              ))}
            </div>
            <form onSubmit={save} className="space-y-5">
              <input required type="number" placeholder="Amount" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <input required type="text" placeholder="Description" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg">Save</button>
                <button type="button" onClick={() => {setModal(false); setEditingId(null);}} className="px-8 bg-slate-100 text-slate-500 rounded-3xl font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}