import React, { useState } from 'react';
import { Campaign, Agent } from '../types';

interface CampaignManagerProps {
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  agents: Agent[];
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ campaigns, setCampaigns, agents }) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'form' | 'summary'>('form');
  
  // Simulation State
  const [totalContactsCount, setTotalContactsCount] = useState(0);
  const [previewContacts, setPreviewContacts] = useState<{name: string, phone: string, custom?: string}[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'Daily',
    scheduleTime: '09:00',
    startDate: '',
    agentId: '',
    fileName: '',
    agentPromptOverride: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, fileName: file.name }));
      
      // Simulate file parsing delay and result
      setTotalContactsCount(0); // Reset
      setPreviewContacts([]); // Reset
      
      // Mock parsing logic
      setTimeout(() => {
          setTotalContactsCount(1542);
          setPreviewContacts([
              { name: "Rahul Sharma", phone: "+91 98765 43210", custom: "Retailer" },
              { name: "Priya Patel", phone: "+91 98765 12345", custom: "Distributor" },
              { name: "Amit Kumar", phone: "+91 99887 76655", custom: "Retailer" },
              { name: "Sneha Gupta", phone: "+91 91234 56789", custom: "Wholesaler" },
              { name: "Vikram Singh", phone: "+91 95544 33221", custom: "Retailer" }
          ]);
      }, 600);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.agentId) {
        alert("Please fill in all required fields.");
        return;
    }
    setStep('summary');
  };

  const handleEdit = () => {
    setStep('form');
  };

  const handleConfirm = () => {
    const newCampaign: Campaign = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        status: 'Scheduled',
        progress: 0,
        totalLeads: totalContactsCount || Math.floor(Math.random() * 1000) + 100,
        startDate: formData.startDate,
        frequency: formData.frequency as 'Daily' | 'Weekly',
        scheduleTime: formData.scheduleTime,
        agentId: formData.agentId,
        agentPromptOverride: formData.agentPromptOverride
    };

    setCampaigns([newCampaign, ...campaigns]);
    closeModal();
  };

  const closeModal = () => {
      setShowModal(false);
      setStep('form');
      setFormData({
        name: '',
        frequency: 'Daily',
        scheduleTime: '09:00',
        startDate: '',
        agentId: '',
        fileName: '',
        agentPromptOverride: ''
      });
      setPreviewContacts([]);
      setTotalContactsCount(0);
  };

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || 'Unknown Agent';

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Campaigns</h2>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
                + New Campaign
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-medium">
                  <tr>
                    <th className="px-6 py-4">Campaign Name</th>
                    <th className="px-6 py-4">Schedule</th>
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
                                <p className="text-slate-700">{camp.frequency}</p>
                                <p className="text-xs text-slate-400">@ {camp.scheduleTime}</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                                    ${camp.status === 'Running' ? 'bg-blue-100 text-blue-700' : 
                                      camp.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                      camp.status === 'Scheduled' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
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
             {campaigns.length === 0 && <div className="p-8 text-center text-slate-500">No campaigns found. Create one to get started.</div>}
        </div>

        {/* Create Campaign Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            {step === 'form' ? 'Create New Campaign' : 'Confirm Campaign Details'}
                        </h3>
                        <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {step === 'form' ? (
                        <form onSubmit={handleNext} className="space-y-6">
                            {/* Campaign Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="e.g. Winter Sales Outreach"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Schedule Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                    <select 
                                        name="frequency"
                                        value={formData.frequency}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                    >
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                    </select>
                                </div>

                                {/* Schedule Time */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Schedule Time</label>
                                    <input 
                                        type="time"
                                        name="scheduleTime"
                                        value={formData.scheduleTime}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        required
                                    />
                                </div>

                                {/* Agent Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Agent <span className="text-red-500">*</span></label>
                                    <select 
                                        name="agentId"
                                        value={formData.agentId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                        required
                                    >
                                        <option value="">Select an Agent</option>
                                        {agents.map(agent => (
                                            <option key={agent.id} value={agent.id}>{agent.name} ({agent.voice})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Campaign Prompt Override */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Agent Instructions (Override)</label>
                                <p className="text-xs text-slate-500 mb-2">
                                    If provided, this prompt will <strong className="text-slate-700">completely replace</strong> the selected agent's default system instructions for this campaign.
                                </p>
                                <textarea 
                                    name="agentPromptOverride"
                                    value={formData.agentPromptOverride}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                                    placeholder="Enter specific campaign instructions here. The agent will strictly follow this prompt."
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Contact List (CSV/Excel)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors bg-slate-50">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">CSV, XLSX up to 10MB</p>
                                        {formData.fileName && (
                                            <div className="mt-2 text-sm text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded inline-block">
                                                {formData.fileName}
                                            </div>
                                        )}
                                        {totalContactsCount > 0 && (
                                            <p className="text-xs font-semibold text-green-600 mt-1">
                                                ✓ Parsed {totalContactsCount} contacts
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button 
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Next: Review
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary View */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Campaign Name</p>
                                    <p className="font-semibold text-slate-900">{formData.name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Selected Agent</p>
                                    <p className="font-semibold text-slate-900">{getAgentName(formData.agentId)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Schedule</p>
                                    <p className="font-semibold text-slate-900">{formData.frequency} at {formData.scheduleTime}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Start Date</p>
                                    <p className="font-semibold text-slate-900">{formData.startDate}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Total Contacts</p>
                                    <p className="font-semibold text-indigo-600">{totalContactsCount || '0'} Uploaded</p>
                                </div>
                            </div>
                            
                            {/* Override Prompt Preview */}
                            <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-2">Agent Instructions (Override)</h4>
                                <div className={`bg-white p-3 border rounded-lg text-sm font-mono italic max-h-32 overflow-y-auto ${formData.agentPromptOverride ? 'border-amber-200 bg-amber-50' : 'border-slate-200'}`}>
                                    {formData.agentPromptOverride ? (
                                        <>
                                            <span className="text-amber-700 font-bold not-italic block mb-1 text-xs uppercase tracking-wider">Override Active</span>
                                            <span className="text-slate-700">"{formData.agentPromptOverride}"</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-400">No override prompt provided. Using agent's default instructions.</span>
                                    )}
                                </div>
                            </div>

                            {/* Contact Preview Table */}
                            <div>
                                <h4 className="text-sm font-medium text-slate-700 mb-2">Contact List Preview (First 5)</h4>
                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-2">Name</th>
                                                <th className="px-4 py-2">Phone</th>
                                                <th className="px-4 py-2">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {previewContacts.length > 0 ? (
                                                previewContacts.map((contact, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2 text-slate-900">{contact.name}</td>
                                                        <td className="px-4 py-2 text-slate-500 font-mono">{contact.phone}</td>
                                                        <td className="px-4 py-2 text-slate-500">{contact.custom}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-4 text-center text-slate-400">
                                                        No contacts to preview.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button 
                                    onClick={handleEdit}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Back to Edit
                                </button>
                                <button 
                                    onClick={handleConfirm}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Confirm & Start Campaign
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default CampaignManager;