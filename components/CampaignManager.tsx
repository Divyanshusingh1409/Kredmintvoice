import React from 'react';
import { Campaign } from '../types';

const CampaignManager: React.FC = () => {
  const campaigns: Campaign[] = [
    { id: '1', name: 'October Outreach', status: 'Running', progress: 45, totalLeads: 2000, startDate: 'Oct 1, 2023' },
    { id: '2', name: 'Churn Reactivation', status: 'Paused', progress: 12, totalLeads: 500, startDate: 'Sep 28, 2023' },
    { id: '3', name: 'Webinar Invites', status: 'Completed', progress: 100, totalLeads: 1200, startDate: 'Sep 15, 2023' },
  ];

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Campaigns</h2>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                + New Campaign
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-medium">
                  <tr>
                    <th className="px-6 py-4">Campaign Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Start Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {campaigns.map(camp => (
                        <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-medium text-slate-900">{camp.name}</p>
                                <p className="text-xs text-slate-400">{camp.totalLeads.toLocaleString()} Leads</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                                    ${camp.status === 'Running' ? 'bg-blue-100 text-blue-700' : 
                                      camp.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {camp.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="w-full max-w-xs flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${camp.status === 'Completed' ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                            style={{ width: `${camp.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 w-8">{camp.progress}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">{camp.startDate}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-3">Report</button>
                                <button className="text-slate-400 hover:text-slate-600 font-medium">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    </div>
  );
};

export default CampaignManager;
