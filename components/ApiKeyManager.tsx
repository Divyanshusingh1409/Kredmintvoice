import React, { useState } from 'react';
import { ApiKey } from '../types';
import { KeyIcon } from './ui/Icons';

const ApiKeyManager: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Production Key', prefix: 'sk-prod-82...', created: '2023-10-15', lastUsed: '2 mins ago' },
    { id: '2', name: 'Dev Test', prefix: 'sk-dev-99...', created: '2023-11-02', lastUsed: '5 days ago' }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleDelete = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  const handleCreate = () => {
    if (!newKeyName) return;
    const newKey: ApiKey = {
        id: Math.random().toString(36).substr(2, 9),
        name: newKeyName,
        prefix: `sk-${Math.random().toString(36).substr(2, 4)}...`,
        created: new Date().toISOString().split('T')[0],
        lastUsed: 'Never'
    };
    setKeys([...keys, newKey]);
    setNewKeyName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">API Keys</h2>
            <p className="text-slate-500 mt-1">Manage API keys for accessing the Kredmint Agent API programmatically.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Create New Key
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Key Token</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Last Used</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {keys.map(key => (
              <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <KeyIcon className="w-4 h-4 text-slate-400" />
                    {key.name}
                </td>
                <td className="px-6 py-4 font-mono bg-slate-50 rounded w-fit px-2 py-1 text-slate-500 text-xs tracking-wider border border-slate-200">
                    {key.prefix}
                </td>
                <td className="px-6 py-4">{key.created}</td>
                <td className="px-6 py-4">{key.lastUsed}</td>
                <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => handleDelete(key.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                        Revoke
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {keys.length === 0 && (
            <div className="p-8 text-center text-slate-500">No API keys found. Create one to get started.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Create New API Key</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Key Name</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="e.g. Production Web App"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleCreate}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
