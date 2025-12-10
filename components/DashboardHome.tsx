import React, { useState } from 'react';
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
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  const recentLogs: CallLog[] = [
    { 
      id: '1', 
      agentName: 'Support Bot A', 
      customerNumber: '+1 (555) 0123', 
      status: 'Completed', 
      duration: '3m 12s', 
      timestamp: '2 mins ago', 
      sentiment: 'Positive',
      recordingUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_laser_gun_shot.ogg' // Mock URL
    },
    { 
      id: '2', 
      agentName: 'Sales Agent X', 
      customerNumber: '+1 (555) 0124', 
      status: 'Active', 
      duration: '1m 05s', 
      timestamp: 'Now', 
      sentiment: 'Neutral' 
    },
    { 
      id: '3', 
      agentName: 'Survey Bot', 
      customerNumber: '+1 (555) 0125', 
      status: 'Failed', 
      duration: '0m 10s', 
      timestamp: '15 mins ago', 
      sentiment: 'Negative' 
    },
    { 
      id: '4', 
      agentName: 'Support Bot A', 
      customerNumber: '+1 (555) 0126', 
      status: 'Completed', 
      duration: '5m 45s', 
      timestamp: '1 hour ago', 
      sentiment: 'Positive',
      recordingUrl: 'https://actions.google.com/sounds/v1/science_fiction/scifi_laser_gun_shot.ogg'
    },
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                <tr 
                    key={log.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCall(log)}
                >
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

      {/* Call Details Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Call Details</h3>
                    <button onClick={() => setSelectedCall(null)} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Agent</p>
                            <p className="font-semibold text-slate-900">{selectedCall.agentName}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Customer</p>
                            <p className="font-semibold text-slate-900 font-mono">{selectedCall.customerNumber}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                ${selectedCall.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                  selectedCall.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                                  selectedCall.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {selectedCall.status}
                            </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Duration</p>
                            <p className="font-semibold text-slate-900">{selectedCall.duration}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sentiment Analysis</p>
                        <div className="flex items-center gap-2">
                             <div className={`w-3 h-3 rounded-full 
                                ${selectedCall.sentiment === 'Positive' ? 'bg-green-500' : 
                                  selectedCall.sentiment === 'Negative' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                             <span className="font-medium text-slate-700">{selectedCall.sentiment}</span>
                        </div>
                    </div>

                    {selectedCall.recordingUrl ? (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Call Recording</p>
                            <audio controls src={selectedCall.recordingUrl} className="w-full h-8 mb-4 rounded" />
                            <a 
                                href={selectedCall.recordingUrl} 
                                download={`recording-${selectedCall.id}.mp3`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Recording
                            </a>
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-100 border-dashed text-slate-400 text-sm">
                            No recording available for this call.
                        </div>
                    )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                     <button 
                        onClick={() => setSelectedCall(null)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;