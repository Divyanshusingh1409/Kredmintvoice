import React, { useState } from 'react';
import { Agent } from '../types';

interface AgentManagerProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const AgentManager: React.FC<AgentManagerProps> = ({ agents, setAgents }) => {
  const [showModal, setShowModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    voice: 'Zephyr',
    type: 'Support' as Agent['type'],
    initialMessage: '',
    systemInstruction: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteClick = (id: string) => {
    setAgentToDelete(id);
  };

  const confirmDelete = () => {
    if (agentToDelete) {
        setAgents(prev => prev.filter(agent => agent.id !== agentToDelete));
        setAgentToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.initialMessage || !formData.systemInstruction) {
        alert("Please fill in all required fields.");
        return;
    }

    const newAgent: Agent = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      voice: formData.voice,
      type: formData.type,
      status: 'Draft',
      calls: 0,
      initialMessage: formData.initialMessage,
      systemInstruction: formData.systemInstruction
    };

    setAgents([...agents, newAgent]);
    setShowModal(false);
    setFormData({
      name: '',
      voice: 'Zephyr',
      type: 'Support',
      initialMessage: '',
      systemInstruction: ''
    });
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">AI Agents</h2>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
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
                            ${agent.status === 'Active' ? 'bg-green-100 text-green-700' : 
                              agent.status === 'Draft' ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100 text-yellow-700'}`}>
                            {agent.status}
                        </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{agent.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{agent.type} • {agent.voice} Voice</p>
                    
                    {agent.initialMessage && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 italic line-clamp-2">
                            "{agent.initialMessage}"
                        </div>
                    )}

                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-sm">
                        <span className="text-slate-500">Calls Handled</span>
                        <span className="font-semibold text-slate-900">{agent.calls.toLocaleString()}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button type="button" className="flex-1 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Edit</button>
                        <button type="button" className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">Logs</button>
                        <button 
                            type="button"
                            onClick={() => handleDeleteClick(agent.id)}
                            className="px-3 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors flex items-center justify-center"
                            title="Delete Agent"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
            
            {/* New Agent Card */}
            <button 
                onClick={() => setShowModal(true)}
                className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all group"
            >
                <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center mb-3 transition-colors">
                    <span className="text-2xl">+</span>
                </div>
                <span className="font-medium">Create New Agent</span>
            </button>
        </div>

        {/* Create Agent Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Create New AI Agent</h3>
                        <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Agent Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Agent Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="e.g. Loans Onboarding Bot"
                                    required
                                />
                            </div>

                            {/* Voice Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Voice Profile</label>
                                <select 
                                    name="voice"
                                    value={formData.voice}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="Zephyr">Zephyr (Balanced)</option>
                                    <option value="Puck">Puck (Energetic)</option>
                                    <option value="Kore">Kore (Calm)</option>
                                    <option value="Fenrir">Fenrir (Deep)</option>
                                    <option value="Charon">Charon (Formal)</option>
                                </select>
                            </div>

                            {/* Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Agent Role</label>
                                <select 
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="Support">Support</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Survey">Survey</option>
                                </select>
                            </div>
                        </div>

                        {/* Initial Message */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Message <span className="text-red-500">*</span></label>
                            <p className="text-xs text-slate-500 mb-2">The very first thing the bot will say when the call connects.</p>
                            <textarea 
                                name="initialMessage"
                                value={formData.initialMessage}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="Namaste, main Kredmint se bol rahi hoon..."
                                required
                            />
                        </div>

                        {/* System Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Agent Instructions (System Prompt) <span className="text-red-500">*</span></label>
                            <p className="text-xs text-slate-500 mb-2">Detailed instructions on how the agent should behave, knowledge base, and personality.</p>
                            <textarea 
                                name="systemInstruction"
                                value={formData.systemInstruction}
                                onChange={handleInputChange}
                                rows={6}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                                placeholder="You are a helpful assistant for Kredmint..."
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                            >
                                Save Agent
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {agentToDelete && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-[fadeIn_0.2s_ease-out]">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto text-red-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">Delete Agent?</h3>
                    <p className="text-slate-500 mb-6 text-sm text-center">
                        Are you sure you want to delete this agent? This action cannot be undone and will remove all associated logs.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setAgentToDelete(null)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            onClick={confirmDelete}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AgentManager;