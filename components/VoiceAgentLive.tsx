import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MicrophoneIcon, StopIcon, PlayIcon } from './ui/Icons';

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

// --- MAIN COMPONENT ---

const VoiceAgentLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<string>('Ready to connect');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'error' | 'user' | 'ai' }[]>([]);
  
  // Refs for Audio Contexts and Session
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null); // To hold the live session
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const addLog = (msg: string, type: 'info' | 'error' | 'user' | 'ai' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 50));
  };

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
        // sessionRef.current.close() is not always available depending on implementation, 
        // but we can at least stop sending data.
        // Assuming session object has a close method or we just stop the stream.
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

  const startSession = async () => {
    try {
      setError(null);
      setStatus('Initializing...');
      addLog('Initializing Gemini Live session...', 'info');

      // Initialize Audio Contexts
      const InputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const inputCtx = new InputContextClass({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;

      const OutputContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const outputCtx = new OutputContextClass({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: "You are a helpful, professional AI voice assistant for Kredmint.ai. Keep responses concise and natural.",
      };

      setStatus('Connecting to Gemini...');

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
            setStatus('Connected - Listening');
            addLog('Session connected. Speak now!', 'info');
            setIsActive(true);

            // Setup Audio Processing for Input
            const source = inputCtx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            
            // Use ScriptProcessor for 16khz chunks (bufferSize 4096 is good for this)
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
                source.connect(outputNode);
                
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
            cleanup();
          },
          onerror: (err) => {
            addLog(`Error: ${err.message}`, 'error');
            setError(err.message || "Unknown error");
            cleanup();
          }
        }
      });
      
      // Store session promise wrapper if needed, but the session object is resolved inside.
      // We need to access the resolved session to close it later if 'session' object is returned by promise.
      // However, @google/genai live.connect returns a promise that resolves to the session.
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        {/* Status Indicator */}
        <div className={`mb-8 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 backdrop-blur-md transition-colors
            ${isActive ? 'bg-green-500/20 text-green-100 border border-green-500/30' : 'bg-white/10 text-white border border-white/20'}`}>
           <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></span>
           {status}
        </div>

        {/* Visualizer / Avatar */}
        <div className="relative mb-12">
           <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500
               ${isActive ? 'bg-white/10 shadow-[0_0_40px_rgba(255,255,255,0.3)]' : 'bg-white/5'}`}>
              <MicrophoneIcon className={`w-12 h-12 ${isActive ? 'text-white' : 'text-white/40'}`} />
           </div>
           {isActive && (
             <>
               <div className="absolute inset-0 rounded-full border border-white/30 animate-[ping_2s_linear_infinite]"></div>
               <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_2.5s_linear_infinite_0.5s]"></div>
             </>
           )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 z-10">
          {!isActive ? (
            <button
              onClick={startSession}
              className="flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 rounded-full font-bold shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all"
            >
              <PlayIcon className="w-5 h-5" />
              Start Conversation
            </button>
          ) : (
            <button
              onClick={cleanup}
              className="flex items-center gap-2 px-8 py-3 bg-red-500/80 text-white rounded-full font-bold shadow-lg hover:bg-red-600 hover:scale-105 transition-all backdrop-blur-sm"
            >
              <StopIcon className="w-5 h-5" />
              End Session
            </button>
          )}
        </div>

        {error && (
            <div className="mt-4 text-red-200 bg-red-900/40 px-4 py-2 rounded-lg text-sm border border-red-500/30">
                {error}
            </div>
        )}
      </div>

      {/* Logs Section */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
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
    </div>
  );
};

export default VoiceAgentLive;
