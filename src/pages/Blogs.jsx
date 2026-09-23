import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', content: '', author: '', imageUrl: '', status: 'published' });

  const blogsRef = collection(db, 'blogs');

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(blogsRef);
      setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (blog = null) => {
    if (blog) {
      setCurrentBlog(blog);
      setFormData({ title: blog.title || '', content: blog.content || '', author: blog.author || '', imageUrl: blog.imageUrl || '', status: blog.status || 'published' });
    } else {
      setCurrentBlog(null);
      setFormData({ title: '', content: '', author: '', imageUrl: '', status: 'published' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentBlog) {
        await updateDoc(doc(db, 'blogs', currentBlog.id), { ...formData, updatedAt: serverTimestamp() });
        alert('Blog updated');
      } else {
        await addDoc(blogsRef, { ...formData, createdAt: serverTimestamp() });
        alert('Blog added');
      }
      closeModal();
      fetchBlogs();
    } catch (error) {
      console.error(error);
      alert('Error saving blog');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete blog?')) {
      await deleteDoc(doc(db, 'blogs', id));
      fetchBlogs();
    }
  };

  const filtered = blogs.filter(b => b.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Blogs</h1></div>
        <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <FiPlus /> Add Blog
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100"><input type="text" placeholder="Search blogs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-primary" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b">
                <th className="px-6 py-4">Title</th><th className="px-6 py-4">Author</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr> : 
               filtered.length === 0 ? <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No blogs found.</td></tr> :
               filtered.map(b => (
                 <tr key={b.id}>
                   <td className="px-6 py-4 font-medium">{b.title}</td>
                   <td className="px-6 py-4 text-sm">{b.author}</td>
                   <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${b.status==='published'?'bg-green-100 text-green-700':'bg-gray-100'}`}>{b.status}</span></td>
                   <td className="px-6 py-4 text-right space-x-2">
                     <button onClick={() => openModal(b)} className="text-blue-500 hover:text-blue-700 p-2"><FiEdit2 /></button>
                     <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 /></button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between"><h3 className="font-bold">{currentBlog ? 'Edit' : 'Add'} Blog</h3><button onClick={closeModal}>✕</button></div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-medium">Title</label><input required value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"/></div>
                <div><label className="text-xs font-medium">Author</label><input required value={formData.author} onChange={e=>setFormData({...formData,author:e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"/></div>
              </div>
              <div><label className="text-xs font-medium">Content</label><textarea required rows="6" value={formData.content} onChange={e=>setFormData({...formData,content:e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"></textarea></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium">Status</label>
                  <select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"><option value="published">Published</option><option value="draft">Draft</option></select>
                </div>
                <div><label className="text-xs font-medium">Image URL</label><input value={formData.imageUrl} onChange={e=>setFormData({...formData,imageUrl:e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"/></div>
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
