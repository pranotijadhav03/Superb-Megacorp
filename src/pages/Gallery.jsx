import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/firebaseConfig';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiImage } from 'react-icons/fi';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  const galleryRef = collection(db, 'gallery');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(galleryRef);
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, imageUrl: downloadURL }));
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert("Failed to upload image. Make sure Firebase Storage is enabled.");
    } finally {
      setUploadingImage(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({ title: item.title || '', description: item.description || '', imageUrl: item.imageUrl || '' });
    } else {
      setCurrentItem(null);
      setFormData({ title: '', description: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) {
        await updateDoc(doc(db, 'gallery', currentItem.id), formData);
      } else {
        await addDoc(galleryRef, { ...formData, createdAt: serverTimestamp() });
      }
      closeModal();
      fetchItems();
    } catch (error) { alert('Error saving item'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this image?')) {
      await deleteDoc(doc(db, 'gallery', id));
      fetchItems();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <FiImage className="text-primary" />
            Media Gallery
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage and upload photos for your website</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="relative z-10 bg-gradient-to-r from-primary to-orange-500 hover:from-primary-dark hover:to-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
        >
          <FiPlus className="text-lg" /> Add Image
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading gallery...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border text-gray-500">No gallery items found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group relative"
            >
              <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(item)} className="p-2 bg-white text-blue-600 rounded-lg shadow hover:bg-gray-50">
                  <FiEdit2 size={14} />
                </button>
                <button onClick={(e) => handleDelete(item.id, e)} className="p-2 bg-white text-red-600 rounded-lg shadow hover:bg-gray-50">
                  <FiTrash2 size={14} />
                </button>
              </div>

              <div className="h-48 bg-white relative p-2">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
              </div>
              <div className="p-4 border-t border-gray-50">
                <h3 className="font-semibold text-gray-800 truncate">{item.title || 'Untitled'}</h3>
                <p className="text-xs text-gray-500 truncate mt-1">{item.description || 'No description'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{currentItem ? 'Edit Image' : 'Add New Image'}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
                <div className="flex items-center gap-4">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      <FiImage size={24} />
                    </div>
                  )}
                  
                  <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2">
                    {uploadingImage ? (
                      <span className="text-sm text-gray-500">Uploading...</span>
                    ) : (
                      <>
                        <FiUpload />
                        <span>Choose File</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  placeholder="https://..." 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  placeholder="e.g. Shop Opening" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  placeholder="Details..."
                  rows="3"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={uploadingImage} className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50">
                  {currentItem ? 'Update Image' : 'Save Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
