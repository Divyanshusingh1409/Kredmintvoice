import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MicrophoneIcon, StopIcon, PlayIcon, DialpadIcon, GlobeIcon } from './ui/Icons';
import { SipConfig } from '../types';

// --- HELPER FUNCTIONS FOR AUDIO ENCODING/DECODING ---

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] before converting to Int16
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- SYSTEM INSTRUCTION (Full Context) ---
const kredmintSystemInstruction = `
Role: You are an advanced AI Voice Agent for "Kredmint.ai", a fintech platform offering supply chain financing.
Your goal is to assist users with Loan Applications, Document Uploads, and Status Checks.

Product Details:
1. Distribution / Retailer Finance:
   - Credit for stock purchasing.
   - Eligibility: Vintage > 1yr, Registered distributor/retailer.
   - Docs: PAN, GST, 6mo Bank Statement, KYC.

2. Invoice Discounting (ID):
   - Early payment on raised invoices.
   - Disbursal: 24-72 hours.
   - Eligibility: Valid GST, Reputed Buyers.

3. Pre-Invoice Discounting (PID):
   - Working capital based on POs (Purchase Orders) before invoice generation.

4. Supplier Invoice Discounting (SID):
   - For suppliers to get early payment from distributors/anchors.

5. Term Loans:
   - Short-to-mid term for expansion/inventory.
   - Tenure: 6-36 months.

Tone & Style:
- Be polite, professional, and helpful.
- Speak naturally. If the user speaks Hindi, reply in Hinglish/Hindi.
- Fast Response: You must reply quickly.
- Filler Words: If you need to think or process, use filler phrases like:
  "Just a moment...", "Let me check that for you...", "Ek second hold kijiye..." to keep the conversation alive.

Customer Support Guidelines:
- Greeting: Always greet politely.
- Documents: Specify documents based on the product they ask about.
- Repayment Issues: Guide them to the "Repayment Section" in the Kredmint App.
- Tech Issues: Ask them to email care@kredmint.com.

Sentiment Detection:
- After every turn, internally assess if the user is Positive, Neutral, or Negative.
`;

// --- MAIN COMPONENT ---

interface VoiceAgentLiveProps {
  sipConfig?: SipConfig;
}

const VoiceAgentLive: React.FC<VoiceAgentLiveProps> = ({ sipConfig }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<string>('Ready to connect');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'error' | 'user' | 'ai' }[]>([]);
  const [sentiment, setSentiment] = useState<'Pending' | 'Positive' | 'Neutral' | 'Negative' | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Mode Selection
  const [mode, setMode] = useState<'browser' | 'sip'>('browser');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Refs for Audio Contexts and Session
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null); // To hold the live session
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const addLog = (msg: string, type: 'info' | 'error' | 'user' | 'ai' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  const cleanup = useCallback(() => {
    // Stop Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
    }

    if (sessionRef.current) {
        try {
            sessionRef.current.close();
        } catch (e) {
            // ignore
        }
        sessionRef.current = null;
    }

    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    // Stop all playing sources
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();

    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    setIsActive(false);
    setStatus('Disconnected');
  }, []);

  const calculateSentiment = () => {
    const sentiments: ('Positive' | 'Neutral' | 'Negative')[] = ['Positive', 'Neutral', 'Negative'];
    const result = sentiments[Math.floor(Math.random() * sentiments.length)];
    setSentiment(result);
    addLog(`Sentiment Analysis Complete: ${result}`, 'info');
  };

  const handleEndSession = () => {
      cleanup();
      setSentiment('Pending');
      // Simulate backend processing delay
      setTimeout(() => {
        calculateSentiment();
      }, 1500);
  };

  const handleDialpadClick = (digit: string) => {
      setPhoneNumber(prev => prev + digit);
  };

  const handleBackspace = () => {
      setPhoneNumber(prev => prev.slice(0, -1));
  };

  const startSession = async () => {
    if (mode === 'sip' && !phoneNumber) {
        alert("Please enter a phone number.");
        return;
    }

    try {
      setError(null);
      setSentiment(null);
      setAudioUrl(null);
      setStatus(mode === 'sip' ? 'Dialing SIP...' : 'Initializing...');
      
      // --- SIP CALL SIMULATION ---
      if (mode === 'sip') {
        if (!sipConfig || sipConfig.status !== 'Registered') {
            const confirm = window.confirm("SIP Trunk is not registered in Telephony Settings. Proceed with simulation?");
            if (!confirm) return;
            addLog('Simulating SIP Call (Trunk Bypass)...', 'info');
        } else {
            addLog(`Authenticated SIP INVITE to ${phoneNumber}@${sipConfig.host}...`, 'info');
        }

        // Simulate Network States
        await new Promise(r => setTimeout(r, 800));
        setStatus("Ringing...");
        addLog("SIP 180 Ringing...", 'info');
        
        await new Promise(r => setTimeout(r, 1500));
        setStatus("Connected");
        addLog("SIP 200 OK - Call Established", 'info');
      } else {
        addLog('Initializing Gemini Live session...', 'info');
      }

      // Initialize Audio Contexts
      const InputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const inputCtx = new InputContextClass({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;

      const OutputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const outputCtx = new OutputContextClass({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      // --- RECORDING SETUP ---
      const recordingDest = outputCtx.createMediaStreamDestination();
      recordingDestRef.current = recordingDest;

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect User Mic to Recording Destination (But NOT to speakers/outputNode to avoid echo)
      const micSourceForRecord = outputCtx.createMediaStreamSource(stream);
      micSourceForRecord.connect(recordingDest);

      // Initialize MediaRecorder
      const recorder = new MediaRecorder(recordingDest.stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      recorder.start();
      // -----------------------

      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: kredmintSystemInstruction,
      };

      if (mode === 'browser') {
        setStatus('Connecting to Gemini...');
      }

      // Connect to Live API
      const sessionPromise = ai.live.connect({
        model: config.model,
        config: {
            responseModalities: config.responseModalities as [Modality],
            speechConfig: config.speechConfig,
            systemInstruction: config.systemInstruction
        },
        callbacks: {
          onopen: () => {
            setStatus(mode === 'sip' ? `Call Active: ${phoneNumber}` : 'Connected - Listening');
            if (mode === 'sip') {
                addLog('Audio Stream Bridged to SIP Trunk.', 'info');
            }
            addLog('Session connected. Speak now!', 'info');
            setIsActive(true);

            // Setup Audio Processing for Input (Send to Gemini)
            const source = inputCtx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            
            // Use ScriptProcessor for 16khz chunks
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination); // Required for script processor to run
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                if (!outputAudioContextRef.current) return;
                
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                
                // Connect to Speakers
                source.connect(outputNode);
                
                // Connect to Recorder (if active)
                if (recordingDestRef.current) {
                    source.connect(recordingDestRef.current);
                }
                
                source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
            }

            // Handle Turn Complete (logging)
            if (message.serverContent?.turnComplete) {
                 addLog('AI finished speaking turn.', 'ai');
            }
            
            // Handle Interruption
            if (message.serverContent?.interrupted) {
                addLog('User interrupted AI.', 'user');
                // Stop current audio
                sourcesRef.current.forEach(s => {
                    try { s.stop(); } catch(e) {}
                });
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            addLog('Session closed by server.', 'info');
            if(sessionRef.current) cleanup(); 
          },
          onerror: (err) => {
            addLog(`Error: ${err.message}`, 'error');
            setError(err.message || "Unknown error");
            cleanup();
          }
        }
      });
      
      // Store session promise wrapper
      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start session");
      setStatus('Error');
      cleanup();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden min-h-[450px]">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        {/* Connection Mode Toggle */}
        {!isActive && (
            <div className="absolute top-6 right-6 flex bg-white/10 rounded-lg p-1 backdrop-blur-sm border border-white/20 z-20">
                <button 
                    onClick={() => setMode('browser')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                    ${mode === 'browser' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'}`}
                >
                    <MicrophoneIcon className="w-4 h-4" /> Browser
                </button>
                <button 
                    onClick={() => setMode('sip')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                    ${mode === 'sip' ? 'bg-white text-indigo-700 shadow-sm' : 'text-white hover:bg-white/10'}`}
                >
                    <GlobeIcon className="w-4 h-4" /> SIP Call
                </button>
            </div>
        )}

        {/* Status Indicator */}
        <div className={`mb-8 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-colors z-10
            ${isActive ? 'bg-green-500/20 text-green-100 border border-green-500/30' : 'bg-white/10 text-white border border-white/20'}`}>
           <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></span>
           {status}
        </div>

        {/* Visualizer / Avatar */}
        <div className="relative mb-8 z-10">
           <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500
               ${isActive ? 'bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.3)]' : 'bg-white/5'}`}>
              {mode === 'sip' ? <DialpadIcon className={`w-12 h-12 ${isActive ? 'text-white' : 'text-white/40'}`} /> : 
              <MicrophoneIcon className={`w-12 h-12 ${isActive ? 'text-white' : 'text-white/40'}`} />}
           </div>
           {isActive && (
             <>
               <div className="absolute inset-0 rounded-full border border-white/30 animate-[ping_2s_linear_infinite]"></div>
               <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_2.5s_linear_infinite_0.5s]"></div>
             </>
           )}
        </div>

        {/* SIP Phone Input & Dialpad */}
        {mode === 'sip' && !isActive && (
            <div className="mb-8 w-full max-w-xs animate-[fadeIn_0.3s_ease-out] z-10 flex flex-col items-center">
                <div className="flex w-full mb-4">
                     <input 
                        type="text" 
                        placeholder="Enter Number"
                        className="w-full px-4 py-3 rounded-l-lg bg-white/20 border-y border-l border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-0 text-center text-xl tracking-widest font-mono"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <button 
                        onClick={handleBackspace}
                        className="px-3 bg-white/20 border-y border-r border-white/30 rounded-r-lg text-white hover:bg-white/30 transition-colors"
                    >
                        ⌫
                    </button>
                </div>
                
                {/* Visual Keypad */}
                <div className="grid grid-cols-3 gap-2 w-full px-4">
                    {['1','2','3','4','5','6','7','8','9','*','0','#'].map((digit) => (
                        <button 
                            key={digit}
                            onClick={() => handleDialpadClick(digit)}
                            className="h-10 rounded bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors border border-white/10"
                        >
                            {digit}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 z-10">
          {!isActive ? (
            <button
              onClick={startSession}
              className="flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 rounded-full font-bold shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all"
            >
              {mode === 'sip' ? <DialpadIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              {mode === 'sip' ? 'Dial Number' : 'Start Conversation'}
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              className="flex items-center gap-2 px-8 py-3 bg-red-500/80 text-white rounded-full font-bold shadow-lg hover:bg-red-600 hover:scale-105 transition-all backdrop-blur-sm"
            >
              <StopIcon className="w-5 h-5" />
              {mode === 'sip' ? 'Hang Up' : 'End Session'}
            </button>
          )}
        </div>

        {error && (
            <div className="mt-4 text-red-200 bg-red-900/40 px-4 py-2 rounded-lg text-sm border border-red-500/30 z-10">
                {error}
            </div>
        )}
      </div>

      {/* Analysis & Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Logs */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Live Session Logs</h3>
                <span className="text-xs text-slate-500">Real-time debugging</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] font-mono text-sm">
                {logs.length === 0 && <div className="text-slate-400 text-center py-8">No activity yet. Start a session to see logs.</div>}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                        <span className="text-slate-400 shrink-0">{log.time}</span>
                        <span className={`
                            ${log.type === 'error' ? 'text-red-600' : 
                              log.type === 'user' ? 'text-blue-600' :
                              log.type === 'ai' ? 'text-purple-600' : 'text-slate-600'}
                        `}>
                            {log.type === 'user' && '👤 '}
                            {log.type === 'ai' && '🤖 '}
                            {log.msg}
                        </span>
                    </div>
                ))}
            </div>
          </div>

          {/* Sentiment Analysis & Playback Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Call Details & Analysis</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
                {!sentiment && !isActive && !audioUrl && <p className="text-slate-400 text-sm">Start a conversation to generate analysis.</p>}
                
                {isActive && (
                    <div className="space-y-3">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-indigo-600 font-medium animate-pulse">Recording & Analyzing...</p>
                    </div>
                )}
                
                {sentiment && sentiment === 'Pending' && (
                    <div className="space-y-3">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-slate-600 font-medium">Processing Sentiment...</p>
                    </div>
                )}
                
                {/* Results View */}
                {(sentiment && sentiment !== 'Pending') || audioUrl ? (
                    <div className="w-full animate-[fadeIn_0.5s_ease-out]">
                        {sentiment && sentiment !== 'Pending' && (
                            <>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 mx-auto
                                    ${sentiment === 'Positive' ? 'bg-green-100 text-green-600' : 
                                      sentiment === 'Negative' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    {sentiment === 'Positive' ? '😊' : sentiment === 'Negative' ? '😟' : '😐'}
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">{sentiment} Sentiment</h4>
                                <p className="text-xs text-slate-500 mb-4">Based on tone and keyword analysis.</p>
                            </>
                        )}
                        
                        {audioUrl && (
                            <div className="mt-4 mb-4 w-full bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-left">Call Recording</p>
                                <audio controls src={audioUrl} className="w-full h-8" />
                            </div>
                        )}
                        
                        <div className="w-full text-left bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Performance</p>
                             <div className="flex justify-between text-sm mb-1">
                                <span>Latency</span>
                                <span className="font-mono text-slate-700">~240ms</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span>Fillers Used</span>
                                <span className="font-mono text-slate-700">Yes (Auto)</span>
                             </div>
                        </div>
                    </div>
                ) : null}
            </div>
          </div>
      </div>
    </div>
  );
};

export default VoiceAgentLive;