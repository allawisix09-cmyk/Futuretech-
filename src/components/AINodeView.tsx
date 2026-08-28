import React, { useState } from 'react';
import { NodeTelemetry } from '../types';
import { api } from '../services/api';
import {
  Bot,
  Send,
  Terminal,
  Activity,
  Cpu,
  Zap,
  Globe2,
  ShieldCheck,
  Sparkles,
  Server
} from 'lucide-react';

interface AINodeViewProps {
  telemetry: NodeTelemetry | null;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AINodeView: React.FC<AINodeViewProps> = ({ telemetry }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Greetings. I am the FUTURE TECH Quantum Core Assistant. How can I assist you with computing node optimization, machine yields, or special referral links today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.askAi(userMsg.text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'The quantum network is experiencing high density. Please try asking again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-node-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-white pb-24">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#09152e] via-[#091a3b] to-[#071124] border border-cyan-500/40 glow-border-cyan flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Autonomous Node Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-orbitron font-black text-white">
            AI Node Intelligence & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1">
            Real-time server metrics coupled with dedicated algorithmic advisory.
          </p>
        </div>
      </div>

      {/* Live Cluster Telemetry Widget */}
      {telemetry && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="p-4 rounded-2xl bg-[#091224] border border-cyan-500/30">
            <span className="text-[10px] text-slate-400 uppercase">Active Cluster Nodes</span>
            <div className="text-xl sm:text-2xl font-orbitron font-bold text-cyan-300 mt-1">
              {telemetry.onlineNodes}
            </div>
            <span className="text-[10px] text-emerald-400">99.98% Available</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#091224] border border-blue-500/30">
            <span className="text-[10px] text-slate-400 uppercase">Network Hashrate</span>
            <div className="text-xl sm:text-2xl font-orbitron font-bold text-blue-300 mt-1">
              {telemetry.networkHashrate}
            </div>
            <span className="text-[10px] text-slate-400">Global Cluster Power</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#091224] border border-purple-500/30">
            <span className="text-[10px] text-slate-400 uppercase">Average Latency</span>
            <div className="text-xl sm:text-2xl font-orbitron font-bold text-purple-300 mt-1">
              {telemetry.networkLatencyMs} ms
            </div>
            <span className="text-[10px] text-emerald-400">Ultra-low latency</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#091224] border border-amber-500/30">
            <span className="text-[10px] text-slate-400 uppercase">Cluster Temperature</span>
            <div className="text-xl sm:text-2xl font-orbitron font-bold text-amber-300 mt-1">
              {telemetry.temperatureC}°C
            </div>
            <span className="text-[10px] text-cyan-400">Liquid Cryo-cooling</span>
          </div>
        </div>
      )}

      {/* Terminal / Chat Interface */}
      <div className="p-6 rounded-3xl bg-[#081224] border border-cyan-500/40 glow-border-cyan flex flex-col h-[520px]">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="font-orbitron font-bold text-sm text-white">Quantum Core Terminal</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            AI Node Online
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed font-mono ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#040813] border border-cyan-500/30 text-slate-200 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[9px] text-slate-400 mt-1 block text-right font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Analyzing algorithmic parameters...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-cyan-900/40 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about CPU rental yields, referral strategies, or payment channels..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#040813] border border-slate-700 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-5 py-3 rounded-2xl font-orbitron font-bold text-xs uppercase tracking-wider text-white glow-btn-primary flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dispatch</span>
          </button>
        </form>
      </div>

    </div>
  );
};
