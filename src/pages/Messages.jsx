import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FiTrash2, FiSearch, FiEye } from 'react-icons/fi';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const messagesRef = collection(db, 'contactMessages');

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(messagesRef);
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'contactMessages', id), { status: newStatus });
      fetchMessages();
    } catch (error) { alert('Error updating status'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete message?')) {
      await deleteDoc(doc(db, 'contactMessages', id));
      fetchMessages();
    }
  };

  const filtered = messages.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contact Messages</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100"><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b">
                <th className="px-6 py-4">Sender</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr> : 
               filtered.length === 0 ? <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No messages found.</td></tr> :
               filtered.map(m => (
                 <tr key={m.id} className={m.status === 'unread' ? 'bg-blue-50' : ''}>
                   <td className="px-6 py-4 font-medium text-sm">
                     <div>{m.name}</div><div className="text-gray-500 text-xs">{m.email}</div>
                   </td>
                   <td className="px-6 py-4 text-sm truncate max-w-xs">{m.subject || 'No Subject'}</td>
                   <td className="px-6 py-4">
                     <select value={m.status || 'new'} onChange={(ev) => handleStatusChange(m.id, ev.target.value)} className="bg-slate-50 border rounded text-xs px-2 py-1 outline-none">
                       <option value="unread">Unread</option>
                       <option value="read">Read</option>
                     </select>
                   </td>
                   <td className="px-6 py-4 text-right space-x-2">
                     <button onClick={() => { setSelectedMessage(m); handleStatusChange(m.id, 'read'); }} className="text-blue-500 hover:text-blue-700 p-2"><FiEye /></button>
                     <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 /></button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between"><h3 className="font-bold">Message Details</h3><button onClick={() => setSelectedMessage(null)}>✕</button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Name</p><p className="font-medium">{selectedMessage.name}</p></div>
                <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{selectedMessage.email}</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{selectedMessage.phone}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Subject</p><p className="font-medium">{selectedMessage.subject || 'No Subject'}</p></div>
              </div>
              <div><p className="text-xs text-gray-500">Message</p><p className="text-sm bg-slate-50 p-3 rounded-lg border mt-1 whitespace-pre-wrap">{selectedMessage.message || 'No message provided.'}</p></div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
