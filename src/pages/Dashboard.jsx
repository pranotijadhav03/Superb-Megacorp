import React, { useState, useEffect } from 'react';
import { collection, getCountFromServer, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { FiBox, FiList, FiFileText, FiImage, FiUsers, FiMessageSquare, FiShoppingCart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    enquiries: 0,
    totalRevenue: 0,
    statusCounts: {}
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch counts
        const productsSnap = await getCountFromServer(collection(db, 'products'));
        const enquiriesSnap = await getCountFromServer(collection(db, 'enquiries'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        
        let revenue = 0;
        let ordersList = [];
        let statusCounts = {};
        
        ordersSnap.docs.forEach(doc => {
          const data = doc.data();
          ordersList.push({ id: doc.id, ...data });
          
          // Using total from Orders.jsx
          if (data.total) {
            revenue += Number(data.total);
          } else if (data.totalAmount) {
            revenue += Number(data.totalAmount);
          }
          
          let status = data.orderStatus || 'Pending';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Sort orders manually since ISO dates
        ordersList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
        setRecentOrders(ordersList.slice(0, 5));

        setStats({
          products: productsSnap.data().count,
          orders: ordersList.length,
          enquiries: enquiriesSnap.data().count,
          totalRevenue: revenue,
          statusCounts: statusCounts
        });

        const mockData = [
          { name: 'Mon', sales: 4000, orders: 24 },
          { name: 'Tue', sales: 3000, orders: 18 },
          { name: 'Wed', sales: 5000, orders: 30 },
          { name: 'Thu', sales: 2780, orders: 15 },
          { name: 'Fri', sales: 8900, orders: 48 },
          { name: 'Sat', sales: 12000, orders: 70 },
          { name: 'Sun', sales: 9800, orders: 55 },
        ];
        setSalesData(mockData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const STATUS_COLORS = {
    'Pending': '#f59e0b',    // Amber
    'Confirmed': '#3b82f6',  // Blue
    'Dispatched': '#8b5cf6', // Purple
    'Delivered': '#10b981',  // Emerald
    'Cancelled': '#ef4444'   // Red
  };

  const pieData = Object.keys(stats.statusCounts).map(key => ({
    name: key,
    value: stats.statusCounts[key],
    color: STATUS_COLORS[key] || '#94a3b8'
  }));

  const [revenueFilter, setRevenueFilter] = useState('7Days');

  // Derive chart data based on filter
  let displaySalesData = salesData;
  if (revenueFilter === 'Today') {
    displaySalesData = [
      { name: '8 AM', sales: 0 }, { name: '12 PM', sales: 2400 },
      { name: '4 PM', sales: 1200 }, { name: '8 PM', sales: 3800 }
    ];
  } else if (revenueFilter === '30Days') {
    displaySalesData = [
      { name: 'W1', sales: 15000 }, { name: 'W2', sales: 22000 },
      { name: 'W3', sales: 18000 }, { name: 'W4', sales: 29000 }
    ];
  } else if (revenueFilter === 'Year') {
    displaySalesData = [
      { name: 'Jan', sales: 40000 }, { name: 'Feb', sales: 35000 },
      { name: 'Mar', sales: 50000 }, { name: 'Apr', sales: 62000 },
      { name: 'May', sales: 58000 }
    ];
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back! Here is what's happening with your store today.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Revenue Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-900/20 border border-slate-700 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/30 transition-all duration-300">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500 ease-out z-0"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-[#d92906] text-white flex items-center justify-center shadow-lg shadow-[#d92906]/40">
                    <FiDollarSign className="text-xl" />
                  </div>
                  <span className="flex items-center text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20 backdrop-blur-sm"><FiTrendingUp className="mr-1"/> +12.5%</span>
                </div>
                <div className="relative z-10 mt-2">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Total Revenue</p>
                  <p className="text-4xl font-black text-white tracking-tight">₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}</p>
                </div>
              </div>

              {/* Orders Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-xl shadow-purple-500/20 border border-indigo-400/30 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500 ease-out z-0"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner border border-white/20">
                    <FiShoppingCart className="text-xl" />
                  </div>
                  <span className="flex items-center text-[10px] font-black text-white bg-white/20 px-2 py-1 rounded-lg border border-white/10 backdrop-blur-sm"><FiTrendingUp className="mr-1"/> +8.2%</span>
                </div>
                <div className="relative z-10 mt-2">
                  <p className="text-[10px] font-bold text-indigo-100 mb-1 uppercase tracking-widest">Total Orders</p>
                  <p className="text-4xl font-black text-white tracking-tight">{stats.orders || 0}</p>
                </div>
              </div>

              {/* Products Card */}
              <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl p-6 shadow-xl shadow-emerald-500/20 border border-teal-300/30 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500 ease-out z-0"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner border border-white/20">
                    <FiBox className="text-xl" />
                  </div>
                </div>
                <div className="relative z-10 mt-2">
                  <p className="text-[10px] font-bold text-teal-50 mb-1 uppercase tracking-widest">Total Products</p>
                  <p className="text-4xl font-black text-white tracking-tight">{stats.products || 0}</p>
                </div>
              </div>

              {/* Enquiries Card */}
              <div className="bg-gradient-to-br from-rose-400 to-orange-500 rounded-3xl p-6 shadow-xl shadow-orange-500/20 border border-rose-300/30 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500 ease-out z-0"></div>
                <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner border border-white/20">
                    <FiMessageSquare className="text-xl" />
                  </div>
                </div>
                <div className="relative z-10 mt-2">
                  <p className="text-[10px] font-bold text-rose-50 mb-1 uppercase tracking-widest">Customer Enquiries</p>
                  <p className="text-4xl font-black text-white tracking-tight">{stats.enquiries || 0}</p>
                </div>
              </div>

            
</div>          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-7 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-slate-800 text-lg">Revenue Overview</h3>
                <select 
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 cursor-pointer"
                >
                  <option value="Today">Today</option>
                  <option value="7Days">Last 7 Days</option>
                  <option value="30Days">Last 30 Days</option>
                  <option value="Year">This Year</option>
                </select>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displaySalesData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d92906" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d92906" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} tickFormatter={(val) => `₹${val}`} dx={-10} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold'}}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#d92906" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" activeDot={{r: 8, fill: '#d92906', stroke: '#fff', strokeWidth: 3}} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-7 flex flex-col relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
                
                <h3 className="font-extrabold text-slate-800 text-lg mb-6 relative z-10 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner"><FiShoppingCart size={16}/></span>
                  Order Status
                </h3>
                
                <div className="flex flex-col items-center gap-8 flex-1 relative z-10">
                  {/* Left: Pie Chart */}
                  <div className="h-52 w-52 relative shrink-0 mt-2">
                    {/* Glowing effect behind chart */}
                    <div className="absolute inset-4 bg-indigo-400/20 rounded-full blur-2xl animate-pulse"></div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={68} 
                          outerRadius={95} 
                          paddingAngle={6} 
                          dataKey="value"
                          stroke="none"
                          cornerRadius={12}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 4px 6px ${entry.color}40)` }} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                          itemStyle={{fontWeight: '900', color: '#1e293b'}}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-slate-800">{stats.orders}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
                    </div>
                  </div>

                  {/* Right: Legend Rows */}
                  <div className="flex flex-col gap-3 w-full">
                    {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110" style={{backgroundColor: `${entry.color}15`}}>
                            <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{backgroundColor: entry.color}}></div>
                          </div>
                          <span className="text-sm font-bold text-slate-600 capitalize group-hover:text-slate-900 transition-colors">{entry.name}</span>
                        </div>
                        <span className="text-lg font-black bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100 group-hover:bg-white transition-colors" style={{color: entry.color}}>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-6">
            <div className="px-7 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-lg">Recent Orders</h3>
              <Link to="/orders" className="text-sm text-primary font-bold hover:text-primary-dark flex items-center gap-1 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">View All Orders &rarr;</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400 font-bold">
                    <th className="px-7 py-5">Order ID</th>
                    <th className="px-7 py-5">Customer</th>
                    <th className="px-7 py-5">Amount</th>
                    <th className="px-7 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-7 py-12 text-center text-slate-400 font-medium">No recent orders yet.</td>
                    </tr>
                  ) : (
                    recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-7 py-5 text-sm font-bold text-slate-800">#{order.id.slice(0,8).toUpperCase()}</td>
                        <td className="px-7 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                              {(order.customerDetails?.firstName?.[0] || 'U')}{(order.customerDetails?.lastName?.[0] || '')}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800 capitalize">{order.customerDetails?.firstName || 'Unknown'} {order.customerDetails?.lastName || 'Customer'}</div>
                              <div className="text-[11px] text-slate-500 font-medium mt-0.5">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-7 py-5 text-base font-extrabold text-slate-800">₹{(order.totalAmount || 0).toLocaleString()}</td>
                        <td className="px-7 py-5 text-right">
                          <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                            order.status === 'processing' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {order.status ? order.status : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
