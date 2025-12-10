import React, { useState } from 'react';
import { SipConfig } from '../types';

interface TelephonyManagerProps {
    sipConfig: SipConfig;
    setSipConfig: (config: SipConfig) => void;
}

const TelephonyManager: React.FC<TelephonyManagerProps> = ({ sipConfig, setSipConfig }) => {
    const [formData, setFormData] = useState<SipConfig>(sipConfig);
    const [isTesting, setIsTesting] = useState(false);
    const [testLog, setTestLog] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAndTest = () => {
        setIsTesting(true);
        setTestLog(['Initializing SIP Transport...']);

        // Simulate SIP Handshake
        setTimeout(() => {
            setTestLog(prev => [...prev, `Resolving host ${formData.host}...`]);
        }, 600);

        setTimeout(() => {
            setTestLog(prev => [...prev, `Connecting to ${formData.host}:${formData.port} via ${formData.transport}...`]);
        }, 1200);

        setTimeout(() => {
            if (formData.host && formData.username && formData.password) {
                setTestLog(prev => [...prev, 'Sending REGISTER...', '200 OK received.', 'Registration Successful!']);
                setSipConfig({ ...formData, status: 'Registered' });
                setFormData(prev => ({ ...prev, status: 'Registered' }));
            } else {
                setTestLog(prev => [...prev, 'Error: Missing required credentials.', 'Registration Failed.']);
                setSipConfig({ ...formData, status: 'Failed' });
                setFormData(prev => ({ ...prev, status: 'Failed' }));
            }
            setIsTesting(false);
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Telephony & SIP</h2>
                    <p className="text-slate-500 mt-1">Configure your SIP trunk to enable outbound dialing via the AI Agent.</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2
                    ${sipConfig.status === 'Registered' ? 'bg-green-100 text-green-700' : 
                      sipConfig.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${sipConfig.status === 'Registered' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    {sipConfig.status === 'Unconfigured' ? 'Not Configured' : sipConfig.status}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Trunk Configuration
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">SIP Domain / Proxy</label>
                            <input 
                                type="text"
                                name="host"
                                value={formData.host}
                                onChange={handleChange}
                                placeholder="sip.provider.com"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                                <input 
                                    type="text"
                                    name="port"
                                    value={formData.port}
                                    onChange={handleChange}
                                    placeholder="5060"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Transport</label>
                                <select 
                                    name="transport"
                                    value={formData.transport}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="UDP">UDP</option>
                                    <option value="TCP">TCP</option>
                                    <option value="TLS">TLS (Secure)</option>
                                    <option value="WSS">WSS (WebRTC)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username / Extension</label>
                            <input 
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="1001"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password / Secret</label>
                            <input 
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleSaveAndTest}
                                disabled={isTesting}
                                className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                                ${isTesting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                            >
                                {isTesting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Testing Connection...
                                    </>
                                ) : 'Save & Test Connection'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Connection Logs
                    </h3>
                    <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-y-auto max-h-[400px]">
                        {testLog.length === 0 ? (
                            <span className="text-slate-600">Waiting for connection test...</span>
                        ) : (
                            <ul className="space-y-2">
                                {testLog.map((log, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <span className="text-slate-600 select-none">{new Date().toLocaleTimeString()}</span>
                                        <span className={`${log.includes('Success') ? 'text-green-400' : log.includes('Error') || log.includes('Failed') ? 'text-red-400' : 'text-indigo-300'}`}>
                                            {log}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelephonyManager;