import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHome from '../components/DashboardHome';
import VoiceAgentLive from '../components/VoiceAgentLive';
import AgentManager from '../components/AgentManager';
import CampaignManager from '../components/CampaignManager';
import ApiKeyManager from '../components/ApiKeyManager';
import TelephonyManager from '../components/TelephonyManager';
import { Agent, Campaign, SipConfig } from '../types';

type Tab = 'dashboard' | 'agents' | 'campaigns' | 'live' | 'keys' | 'telephony';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { currentUser, logout } = useAuth()!;

  // Lifted State for data persistence
  const [agents, setAgents] = useState<Agent[]>([
    { 
      id: '1', 
      name: 'Inbound Support Bot', 
      voice: 'Zephyr', 
      type: 'Support', 
      status: 'Active', 
      calls: 1240,
      initialMessage: "Namaste! Welcome to Kredmint support. How can I assist you today?",
      systemInstruction: "You are a helpful support agent for Kredmint..."
    },
    { 
      id: '2', 
      name: 'Outbound Sales - Q4', 
      voice: 'Puck', 
      type: 'Sales', 
      status: 'Active', 
      calls: 850,
      initialMessage: "Hi, this is Alex from Kredmint. I noticed you started an application...",
      systemInstruction: "You are a sales agent trying to convert leads..." 
    },
    { 
      id: '3', 
      name: 'Customer Satisfaction Survey', 
      voice: 'Kore', 
      type: 'Survey', 
      status: 'Paused', 
      calls: 320,
      initialMessage: "Hello, do you have a moment to rate your recent experience?",
      systemInstruction: "You are conducting a survey..."
    },
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: '1', name: 'October Outreach', status: 'Running', progress: 45, totalLeads: 2000, startDate: '2023-10-01', frequency: 'Weekly', scheduleTime: '10:00', agentId: '2' },
    { id: '2', name: 'Churn Reactivation', status: 'Paused', progress: 12, totalLeads: 500, startDate: '2023-09-28', frequency: 'Daily', scheduleTime: '14:00', agentId: '1' },
    { id: '3', name: 'Webinar Invites', status: 'Completed', progress: 100, totalLeads: 1200, startDate: '2023-09-15', frequency: 'Daily', scheduleTime: '09:00', agentId: '3' },
  ]);

  const [sipConfig, setSipConfig] = useState<SipConfig>({
      host: '',
      port: '5060',
      username: '',
      password: '',
      transport: 'UDP',
      status: 'Unconfigured'
  });

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'agents', label: 'AI Agents', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'campaigns', label: 'Campaigns', icon: 'M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z' },
    { id: 'live', label: 'Live Demo', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: 'telephony', label: 'Telephony', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
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
           <div className="flex items-center gap-3 mb-4">
              <img src="https://picsum.photos/40/40" alt="User" className="w-9 h-9 rounded-full border border-slate-600" />
              <div className="overflow-hidden">
                 <p className="text-sm font-medium text-white truncate">{currentUser?.email}</p>
                 <p className="text-xs text-slate-500">Admin Workspace</p>
              </div>
           </div>
           <button 
             onClick={() => logout()}
             className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
           >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
           </button>
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
                    {activeTab === 'telephony' && 'SIP & Telephony'}
                  </h2>
                  <p className="text-slate-500 mt-2">
                    {activeTab === 'dashboard' && 'Welcome back, Alex. Here is what’s happening today.'}
                    {activeTab === 'live' && 'Interact with our next-gen Gemini 2.5 voice models directly in the browser.'}
                    {activeTab === 'telephony' && 'Connect your existing SIP Trunks (Twilio, Plivo, Asterisk) to Kredmint AI.'}
                  </p>
               </div>

               {/* Tab Content Rendering */}
               <div className="animate-[fadeIn_0.3s_ease-out]">
                   {activeTab === 'dashboard' && <DashboardHome />}
                   {activeTab === 'agents' && <AgentManager agents={agents} setAgents={setAgents} />}
                   {activeTab === 'campaigns' && <CampaignManager campaigns={campaigns} setCampaigns={setCampaigns} agents={agents} />}
                   {activeTab === 'live' && <VoiceAgentLive sipConfig={sipConfig} />}
                   {activeTab === 'keys' && <ApiKeyManager />}
                   {activeTab === 'telephony' && <TelephonyManager sipConfig={sipConfig} setSipConfig={setSipConfig} />}
               </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
