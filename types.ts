import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

export interface CallLog {
  id: string;
  agentName: string;
  customerNumber: string;
  status: 'Completed' | 'Failed' | 'Active' | 'Voicemail';
  duration: string;
  timestamp: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  recordingUrl?: string;
}

export interface Agent {
  id: string;
  name: string;
  voice: string;
  type: 'Sales' | 'Support' | 'Survey';
  status: 'Active' | 'Draft' | 'Paused';
  calls: number;
  initialMessage?: string;
  systemInstruction?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Scheduled' | 'Running' | 'Completed' | 'Paused';
  progress: number;
  totalLeads: number;
  startDate: string;
  // New fields
  frequency?: 'Daily' | 'Weekly';
  scheduleTime?: string;
  agentId?: string;
  agentPromptOverride?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
}

export interface SipConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  transport: 'UDP' | 'TCP' | 'TLS' | 'WSS';
  status: 'Unconfigured' | 'Registered' | 'Failed';
}

// Gemini Live Types
export interface AudioStreamConfig {
  sampleRate: number;
}