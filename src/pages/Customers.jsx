import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FiUsers, FiMail, FiCalendar, FiCheckCircle, FiKey } from 'react-icons/fi';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const customersData = [];
      querySnapshot.forEach((doc) => {
        customersData.push({ id: doc.id, ...doc.data() });
      });
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Registered Customers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and view all registered users and their credentials.</p>
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
        <div className="flex items-center">
          <FiKey className="text-yellow-600 mr-3" size={20} />
          <p className="text-sm text-yellow-800">
            <strong>Security Notice:</strong> Customer passwords are shown here for testing/admin purposes as requested. 
            In a real production app, passwords should never be stored or viewed in plain text.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Password</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-medium text-slate-800">{customer.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                      <FiMail className="text-slate-400" />
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-mono text-sm bg-slate-50 border border-slate-100 rounded-md px-2 py-1 m-2 inline-block">
                      {customer.password || '******'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold capitalize">
                        {customer.role || 'customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                        <FiCheckCircle size={12} />
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                      <FiCalendar className="text-slate-400" />
                      {customer.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <FiUsers size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-medium">No registered customers found</p>
                    <p className="text-sm">When users register, they will appear here along with their passwords.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
