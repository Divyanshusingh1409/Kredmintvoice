import React, { useState } from 'react';
import DashboardHome from './components/DashboardHome';
import VoiceAgentLive from './components/VoiceAgentLive';
import AgentManager from './components/AgentManager';
import CampaignManager from './components/CampaignManager';
import ApiKeyManager from './components/ApiKeyManager';

type Tab = 'dashboard' | 'agents' | 'campaigns' | 'live' | 'keys';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'agents', label: 'AI Agents', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'campaigns', label: 'Campaigns', icon: 'M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z' },
    { id: 'live', label: 'Live Demo', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: 'keys', label: 'API Keys', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
              K
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Kredmint.ai</h1>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all
                  ${activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                    : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
           <div className="flex items-center gap-3">
              <img src="https://picsum.photos/40/40" alt="User" className="w-9 h-9 rounded-full border border-slate-600" />
              <div>
                 <p className="text-sm font-medium text-white">Alex Morgan</p>
                 <p className="text-xs text-slate-500">Admin Workspace</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center text-sm text-slate-500">
            <span className="hover:text-slate-800 cursor-pointer">Dashboard</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-900 capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
             </button>
             <button className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full hover:bg-indigo-100 transition-colors">
                Upgrade Plan
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
               <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {activeTab === 'dashboard' && 'Dashboard Overview'}
                    {activeTab === 'agents' && 'Manage Agents'}
                    {activeTab === 'campaigns' && 'Campaign Center'}
                    {activeTab === 'live' && 'Real-time Voice Demo'}
                    {activeTab === 'keys' && 'API Access'}
                  </h2>
                  <p className="text-slate-500 mt-2">
                    {activeTab === 'dashboard' && 'Welcome back, Alex. Here is what’s happening today.'}
                    {activeTab === 'live' && 'Interact with our next-gen Gemini 2.5 voice models directly in the browser.'}
                  </p>
               </div>

               {/* Tab Content Rendering */}
               <div className="animate-[fadeIn_0.3s_ease-out]">
                   {activeTab === 'dashboard' && <DashboardHome />}
                   {activeTab === 'agents' && <AgentManager />}
                   {activeTab === 'campaigns' && <CampaignManager />}
                   {activeTab === 'live' && <VoiceAgentLive />}
                   {activeTab === 'keys' && <ApiKeyManager />}
               </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
