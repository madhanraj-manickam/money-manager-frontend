import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.NODE_ENV === 'production' 
  ? "https://money-manager-api-2sn4.onrender.com/api" 
  : "http://localhost:8080/api";

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("walletUser")));
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [data, setData] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General'
  });

  const load = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await axios.get(`${API}/transactions/user/${user.email}`);
      setData(res.data);
      setViewData(res.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  }, [user?.email]);

  useEffect(() => { 
    if (user) load(); 
  }, [user, load]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? "/signup" : "/login";
    try {
      const response = await axios.post(`${API}${endpoint}`, {
        username: loginData.email,
        password: loginData.password
      });
      const userData = { email: response.data.username };
      localStorage.setItem("walletUser", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      alert(error.response?.data || "Authentication failed. Use LOGIN if account exists.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("walletUser");
    setUser(null);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (form.type === 'TRANSFER') {
        // Double-entry logic handled by this specific endpoint
        await axios.post(`${API}/transactions/transfer/${user.email}`, payload);
      } else if (editingId) {
        await axios.put(`${API}/transactions/${editingId}`, payload);
      } else {
        await axios.post(`${API}/transactions/user/${user.email}`, payload);
      }
      setEditingId(null);
      setModal(false);
      setForm({ type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General' });
      load();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save. Check if Backend is live.");
    }
  };

  // Requirement: Editing restricted after 12 hours
  const startEdit = (t) => {
    const transactionTime = new Date(t.createdAt || Date.now()).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - transactionTime) / (1000 * 60 * 60);

    if (hoursElapsed > 12) {
      alert("Edit restricted: Transaction is older than 12 hours.");
      return;
    }
    setForm(t);
    setEditingId(t.id);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this record?")) {
      await axios.delete(`${API}/transactions/${id}`);
      load();
    }
  };

  const stats = {
    inc: data.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0),
    exp: data.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0),
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
          <h2 className="text-3xl font-black mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input required type="email" placeholder="Email Address" className="w-full p-5 bg-slate-50 rounded-2xl outline-none border focus:border-indigo-600" onChange={e => setLoginData({...loginData, email: e.target.value})} />
            <input required type="password" placeholder="Password" className="w-full p-5 bg-slate-50 rounded-2xl outline-none border focus:border-indigo-600" onChange={e => setLoginData({...loginData, password: e.target.value})} />
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg hover:bg-indigo-700 transition">
              {isSignUp ? "Sign Up" : "Login"}
            </button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-8 w-full text-indigo-600 font-bold text-sm">
            {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </button>
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
            <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition">+ Add</button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 font-medium mb-1">Available Balance</p>
            <h2 className="text-3xl font-black">₹{stats.inc - stats.exp}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl border-l-4 border-l-green-500 shadow-sm">
            <p className="text-green-600 font-medium mb-1">Total Income</p>
            <h2 className="text-3xl font-black">₹{stats.inc}</h2>
          </div>
          <div className="bg-white p-8 rounded-3xl border-l-4 border-l-red-500 shadow-sm">
            <p className="text-red-600 font-medium mb-1">Total Expenses</p>
            <h2 className="text-3xl font-black">₹{stats.exp}</h2>
          </div>
        </div>

        {/* Transaction History */}
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
                  <td className="p-6">
                    <div className="font-bold">{t.description}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{t.category}</div>
                  </td>
                  <td className="p-6 text-sm text-slate-500 font-medium">
                    {t.type === 'TRANSFER' ? (
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-black">
                            {t.division} → {t.toDivision}
                        </span>
                    ) : t.division}
                  </td>
                  <td className={`p-6 text-right font-black ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}₹{t.amount}
                  </td>
                  <td className="p-6 text-center space-x-4">
                    <button onClick={() => startEdit(t)} className="text-indigo-600 text-xs font-bold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit/Transfer */}
      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-black mb-6">{editingId ? 'Edit' : 'Add'} Transaction</h2>
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              {['INCOME', 'EXPENSE', 'TRANSFER'].map((m) => (
                <button key={m} type="button" onClick={() => setForm({ ...form, type: m })} 
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${form.type === m ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                  {m}
                </button>
              ))}
            </div>
            <form onSubmit={save} className="space-y-4">
              <input required type="number" placeholder="Amount (₹)" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <input required type="text" placeholder="Description (e.g., Lunch, Salary)" className="w-full p-5 bg-slate-50 rounded-2xl outline-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ml-2">CATEGORY</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="General">General</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Food">Food</option>
                    <option value="Movie">Movie</option>
                    <option value="Loan">Loan</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ml-2">{form.type === 'TRANSFER' ? 'FROM' : 'DIVISION'}</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none" value={form.division} onChange={e => setForm({...form, division: e.target.value})}>
                    <option value="Personal">Personal</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
              </div>

              {form.type === 'TRANSFER' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ml-2">TO DIVISION</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border-2 border-indigo-100" value={form.toDivision} onChange={e => setForm({...form, toDivision: e.target.value})}>
                    <option value="Office">Office</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg hover:bg-indigo-700 transition">Save Transaction</button>
                <button type="button" onClick={() => {setModal(false); setEditingId(null);}} className="px-8 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}