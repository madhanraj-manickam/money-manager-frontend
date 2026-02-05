import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://money-manager-api-2sn4.onrender.com/api/transactions";
// Ask for a name to separate the "databases"
const USER = localStorage.getItem("username") || prompt("Enter your name to start:");
localStorage.setItem("username", USER);

export default function App() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await axios.get(`${API}/user/${USER}`);
    setData(res.data);
  };

  const save = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`${API}/${editingId}`, { ...form, amount: parseFloat(form.amount) });
    } else {
      await axios.post(`${API}/user/${USER}`, { ...form, amount: parseFloat(form.amount) });
    }
    setEditingId(null);
    setModal(false);
    setForm({ type: 'EXPENSE', amount: '', description: '', division: 'Personal', toDivision: 'Office', category: 'General' });
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this transaction?")) {
      await axios.delete(`${API}/${id}`);
      load();
    }
  };

  const startEdit = (t) => {
    setForm(t);
    setEditingId(t.id);
    setModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black">Wallet ({USER})</h1>
          <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">+ Add</button>
        </header>

        <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-slate-100">
              {data.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-6">
                    <p className="font-bold">{t.description}</p>
                    <p className="text-xs text-slate-400">{t.category}</p>
                  </td>
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
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit' : 'Add'} Transaction</h2>
            <form onSubmit={save} className="space-y-5">
              <input required type="number" placeholder="Amount" className="w-full p-5 bg-slate-50 rounded-2xl" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <input required type="text" placeholder="Description" className="w-full p-5 bg-slate-50 rounded-2xl" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black">Save</button>
              <button type="button" onClick={() => {setModal(false); setEditingId(null);}} className="w-full text-slate-400 font-bold">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}