import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback here
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
  const [form, setForm] = useState({
    type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General'
  });

  // Wrapped load in useCallback to satisfy Vercel's build rules
  const load = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get(`${API}/user/${user.email}`);
      setData(res.data);
      setViewData(res.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }, [user?.email]);

  useEffect(() => { 
    if (user) load(); 
  }, [user, load]); // load is now a stable dependency

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
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload);
      } else {
        await axios.post(`${API}/user/${user.email}`, payload);
      }
      setEditingId(null);
      setModal(false);
      setForm({ type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General' });
      load();
    } catch (err) {
      console.error("Error saving transaction:", err);
    }
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

  
const [isSignUp, setIsSignUp] = useState(false);


if (!user) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black mb-2 text-slate-900">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-slate-400 mb-8 font-medium text-sm">
          {isSignUp ? "Sign up to start managing your wallet" : "Login to manage your wallet"}
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="email" placeholder="Email Address" 
            className="w-full p-5 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-500" 
            onChange={e => setLoginData({...loginData, email: e.target.value})} />
          
          <input required type="password" placeholder="Password" 
            className="w-full p-5 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-indigo-500" 
            onChange={e => setLoginData({...loginData, password: e.target.value})} />
          
          <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg hover:bg-indigo-700 transition-all">
            {isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-indigo-600 font-bold text-sm hover:underline"
          >
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black">Wallet</h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-widest">{user.email}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleLogout} className="text-slate-400 font-bold text-sm hover:text-red-500">Logout</button>
            <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">+ Add</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl border border-slate-200">
            <p className="text-slate-400 font-medium mb-1">Total Balance</p>
            <h2 className="text-3xl font-black">₹{stats.inc - stats.exp}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 border-l-green-500 border-l-4">
            <p className="text-slate-400 font-medium mb-1 text-green-600">Income</p>
            <h2 className="text-3xl font-black">₹{stats.inc}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 border-l-red-500 border-l-4">
            <p className="text-slate-400 font-medium mb-1 text-red-600">Expenses</p>
            <h2 className="text-3xl font-black">₹{stats.exp}</h2>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
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
                  <td className="p-6 font-bold">{t.description}</td>
                  <td className="p-6 text-sm text-slate-500">{t.division}</td>
                  <td className="p-6 text-right font-black">₹{t.amount}</td>
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
      
      {/* ADD THIS SECTION BELOW: Type Selector */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
        {['INCOME', 'EXPENSE'].map((m) => (
          <button 
            key={m} 
            type="button"
            onClick={() => setForm({ ...form, type: m })} 
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
              form.type === m ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="space-y-4">
        <input required type="number" placeholder="Amount" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" 
          value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
        <input required type="text" placeholder="Description" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" 
          value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        
        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg">Save</button>
          <button type="button" onClick={() => {setModal(false); setEditingId(null);}} className="px-8 text-slate-400 font-bold">Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}