import React, { useState, useEffect } from 'react';
import { collection, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FiTrash2, FiSearch, FiEye, FiMessageSquare } from 'react-icons/fi';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const enquiriesRef = collection(db, 'enquiries');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(enquiriesRef, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter out franchise inquiries (they go to the Franchise tab)
      const data = allData.filter(e => 
        !e.subject || !e.subject.toLowerCase().includes('franchise')
      );
      
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEnquiries(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching realtime enquiries:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'enquiries', id), { status: newStatus });
    } catch (error) { alert('Error updating status'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete enquiry?')) {
      await deleteDoc(doc(db, 'enquiries', id));
    }
  };

  const filtered = enquiries.filter(e => 
    e.name?.toLowerCase().includes(search.toLowerCase()) || 
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <FiMessageSquare className="text-primary" />
            Customer Enquiries
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Messages and queries from your website's contact forms</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100"><input type="text" placeholder="Search by name, email or subject..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-80 px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b">
                <th className="px-6 py-4">Date</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Subject</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr> : 
               filtered.length === 0 ? <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No enquiries found.</td></tr> :
               filtered.map(e => (
                 <tr key={e.id}>
                   <td className="px-6 py-4 text-sm text-gray-500">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'N/A'}</td>
                   <td className="px-6 py-4 font-medium">{e.name}</td>
                   <td className="px-6 py-4 text-sm">
                     <div>{e.email}</div><div className="text-gray-500">{e.phone}</div>
                   </td>
                   <td className="px-6 py-4 text-sm font-medium text-gray-700">{e.subject}</td>
                   <td className="px-6 py-4">
                     <select value={e.status || 'new'} onChange={(ev) => handleStatusChange(e.id, ev.target.value)} className="bg-slate-50 border rounded text-xs px-2 py-1 outline-none">
                       <option value="new">New</option>
                       <option value="contacted">Contacted</option>
                       <option value="closed">Closed</option>
                     </select>
                   </td>
                   <td className="px-6 py-4 text-right space-x-2">
                     <button onClick={() => setSelectedEnquiry(e)} className="text-blue-500 hover:text-blue-700 p-2"><FiEye /></button>
                     <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 /></button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between"><h3 className="font-bold">Enquiry Details</h3><button onClick={() => setSelectedEnquiry(null)} className="text-gray-500 hover:text-red-500 font-bold">&times;</button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Name</p><p className="font-medium">{selectedEnquiry.name}</p></div>
                <div><p className="text-xs text-gray-500">Date</p><p className="font-medium">{selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString() : 'N/A'}</p></div>
                <div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{selectedEnquiry.email}</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium">{selectedEnquiry.phone}</p></div>
              </div>
              <div className="pt-2"><p className="text-xs text-gray-500">Subject</p><p className="font-medium text-gray-800">{selectedEnquiry.subject}</p></div>
              <div><p className="text-xs text-gray-500">Message</p><p className="text-sm bg-slate-50 p-3 rounded-lg border mt-1 whitespace-pre-wrap text-gray-700 leading-relaxed">{selectedEnquiry.message || 'No message provided.'}</p></div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setSelectedEnquiry(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
