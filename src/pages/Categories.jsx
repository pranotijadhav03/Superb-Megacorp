import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '', status: 'active' });

  const categoriesRef = collection(db, 'categories');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(categoriesRef);
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({
        name: category.name || '', description: category.description || '', imageUrl: category.imageUrl || '', status: category.status || 'active'
      });
    } else {
      setCurrentCategory(null);
      setFormData({ name: '', description: '', imageUrl: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await updateDoc(doc(db, 'categories', currentCategory.id), { ...formData, updatedAt: serverTimestamp() });
        alert('Category updated');
      } else {
        await addDoc(categoriesRef, { ...formData, createdAt: serverTimestamp() });
        alert('Category added');
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert('Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete category?')) {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    }
  };

  const filtered = categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        </div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100"><input type="text" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b">
                <th className="px-6 py-4">Name</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr> : 
               filtered.length === 0 ? <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">No categories found.</td></tr> :
               filtered.map(c => (
                 <tr key={c.id}>
                   <td className="px-6 py-4 font-medium">{c.name}</td>
                   <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${c.status==='active'?'bg-green-100 text-green-700':'bg-gray-100'}`}>{c.status}</span></td>
                   <td className="px-6 py-4 text-right space-x-2">
                     <button onClick={() => openModal(c)} className="text-blue-500 hover:text-blue-700 p-2"><FiEdit2 /></button>
                     <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 /></button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between"><h3 className="font-bold">{currentCategory ? 'Edit' : 'Add'} Category</h3><button onClick={closeModal}>✕</button></div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div><label className="text-xs font-medium">Name</label><input required value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"/></div>
              <div><label className="text-xs font-medium">Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"></textarea></div>
              <div>
                <label className="text-xs font-medium">Status</label>
                <select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"><option value="active">Active</option><option value="inactive">Inactive</option></select>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
