import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { PhoneIcon, UsersIcon, BoltIcon, ChartBarIcon } from './ui/Icons';
import { StatCardProps, CallLog } from '../types';

const data = [
  { name: 'Mon', calls: 400, connected: 240 },
  { name: 'Tue', calls: 300, connected: 139 },
  { name: 'Wed', calls: 200, connected: 98 },
  { name: 'Thu', calls: 278, connected: 390 },
  { name: 'Fri', calls: 189, connected: 480 },
  { name: 'Sat', calls: 239, connected: 380 },
  { name: 'Sun', calls: 349, connected: 430 },
];

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      {change && (
        <p className={`text-xs font-medium mt-2 flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '↑' : '↓'} {change} <span className="text-slate-400 ml-1">vs last week</span>
        </p>
      )}
    </div>
    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
      {icon}
    </div>
  </div>
);

const DashboardHome: React.FC = () => {
  const recentLogs: CallLog[] = [
    { id: '1', agentName: 'Support Bot A', customerNumber: '+1 (555) 0123', status: 'Completed', duration: '3m 12s', timestamp: '2 mins ago', sentiment: 'Positive' },
    { id: '2', agentName: 'Sales Agent X', customerNumber: '+1 (555) 0124', status: 'Active', duration: '1m 05s', timestamp: 'Now', sentiment: 'Neutral' },
    { id: '3', agentName: 'Survey Bot', customerNumber: '+1 (555) 0125', status: 'Failed', duration: '0m 10s', timestamp: '15 mins ago', sentiment: 'Negative' },
    { id: '4', agentName: 'Support Bot A', customerNumber: '+1 (555) 0126', status: 'Completed', duration: '5m 45s', timestamp: '1 hour ago', sentiment: 'Positive' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Calls" value="12,453" change="12%" isPositive={true} icon={<PhoneIcon className="w-6 h-6" />} />
        <StatCard title="Connected" value="8,234" change="8%" isPositive={true} icon={<UsersIcon className="w-6 h-6" />} />
        <StatCard title="Active Now" value="45" icon={<BoltIcon className="w-6 h-6" />} />
        <StatCard title="Avg Duration" value="2m 45s" change="3%" isPositive={false} icon={<ChartBarIcon className="w-6 h-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Call Volume Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip />
                <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" dataKey="connected" stroke="#3b82f6" strokeWidth={2} fillOpacity={0} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Call Outcomes</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Success', value: 65, fill: '#4ade80' },
                { name: 'Voicemail', value: 25, fill: '#facc15' },
                { name: 'Failed', value: 10, fill: '#f87171' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Recent Live Logs</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-medium">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Agent</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Sentiment</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${log.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        log.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                        log.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {log.status === 'Active' && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1.5 animate-pulse"></span>}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{log.agentName}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{log.customerNumber}</td>
                  <td className="px-6 py-4">{log.duration}</td>
                  <td className="px-6 py-4">
                    <span className={`${log.sentiment === 'Positive' ? 'text-green-600' : log.sentiment === 'Negative' ? 'text-red-500' : 'text-slate-400'}`}>
                      {log.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
