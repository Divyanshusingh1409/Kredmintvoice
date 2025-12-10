import React from 'react';
import { Agent } from '../types';

const AgentManager: React.FC = () => {
  const agents: Agent[] = [
    { id: '1', name: 'Inbound Support Bot', voice: 'Zephyr', type: 'Support', status: 'Active', calls: 1240 },
    { id: '2', name: 'Outbound Sales - Q4', voice: 'Puck', type: 'Sales', status: 'Active', calls: 850 },
    { id: '3', name: 'Customer Satisfaction Survey', voice: 'Kore', type: 'Survey', status: 'Paused', calls: 320 },
  ];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">AI Agents</h2>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                + Create Agent
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
                <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold
                            ${agent.type === 'Support' ? 'bg-blue-100 text-blue-600' : 
                              agent.type === 'Sales' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                            {agent.name.charAt(0)}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                            ${agent.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {agent.status}
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{agent.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{agent.type} • {agent.voice} Voice</p>
                    
                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm">
                        <span className="text-slate-500">Calls Handled</span>
                        <span className="font-semibold text-slate-900">{agent.calls.toLocaleString()}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button className="flex-1 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Edit</button>
                        <button className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">Logs</button>
                    </div>
                </div>
            ))}
            
            {/* New Agent Card */}
            <button className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all group">
                <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center mb-3 transition-colors">
                    <span className="text-2xl">+</span>
                </div>
                <span className="font-medium">Create New Agent</span>
            </button>
        </div>
    </div>
  );
};

export default AgentManager;
