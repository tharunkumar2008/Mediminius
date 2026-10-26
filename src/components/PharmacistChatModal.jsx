import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle, 
  CheckCheck,
  Sparkles
} from 'lucide-react';

export default function PharmacistChatModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'pharmacist',
      text: 'Hello! I am Dr. Sarah Jenkins, Lead Dispensing Pharmacist at MEDIMINUS. How can I assist you with your medications, dosage timings, or prescriptions today?',
      time: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'Can I take Amlodipine with breakfast?',
    'Is Restoral syrup safe for dry cough?',
    'How should I store temperature-sensitive medicines?',
    'Can I switch from brand to bio-equivalent generics?'
  ];

  const handleSend = (text) => {
    const query = text || inputVal;
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: query, time: 'Just now' }
    ]);
    setInputVal('');
    setIsTyping(true);

    // Simulate pharmacist clinical response
    setTimeout(() => {
      let reply = "Thank you for asking. Our pharmaceutical protocol advises taking this medication strictly according to the doctor's prescribed frequency with a glass of water.";

      const lower = query.toLowerCase();
      if (lower.includes('amlodipine') || lower.includes('breakfast')) {
        reply = "Amlodipine can be taken with or without food, but it is best to take it at the same exact time every day (e.g. 9:00 AM) to maintain steady therapeutic blood levels. Avoid grapefruits or grapefruit juice as they can increase drug absorption.";
      } else if (lower.includes('cough') || lower.includes('restoral')) {
        reply = "Restoral cough syrup combines Guaifenesin and Dextromethorphan. It is non-drowsy and specifically formulated to calm bronchial spasms and soothe dry coughs without making you lethargic during working hours.";
      } else if (lower.includes('store') || lower.includes('temperature') || lower.includes('cold')) {
        reply = "Medicines marked 2°C to 8°C (like Insulin or biologics) must be stored in the middle shelf of your refrigerator, never in the freezer compartment or refrigerator door pockets where temperature fluctuations occur.";
      } else if (lower.includes('generic') || lower.includes('substitute')) {
        reply = "Yes! Generic formulations contain the identical active pharmaceutical ingredient (API), purity and bioavailability as the branded counterparts, but usually offer 30% to 70% cost savings. Always confirm with our pharmacist before switching.";
      }

      setMessages(prev => [
        ...prev,
        { sender: 'pharmacist', text: reply, time: 'Just now' }
      ]);
      setIsTyping(false);
    }, 1100);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', height: '620px' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#f0fdfa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src="/images/pharmacist.jpg" 
                alt="Pharmacist Dr. Sarah" 
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0f766e' }}
              />
              <span style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '10px',
                height: '10px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '2px solid #ffffff'
              }}></span>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                Dr. Sarah Jenkins, PharmD
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> Registered Clinical Pharmacist • On Duty
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f8fafc' }}>
          {messages.map((m, i) => (
            <div 
              key={i}
              style={{
                display: 'flex',
                justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div 
                style={{
                  maxWidth: '82%',
                  padding: '0.8rem 1rem',
                  borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  backgroundColor: m.sender === 'user' ? '#0f766e' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  fontSize: '0.875rem',
                  lineHeight: 1.45,
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0'
                }}
              >
                {m.text}
                <div style={{
                  fontSize: '0.68rem',
                  marginTop: '0.35rem',
                  color: m.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                  textAlign: 'right'
                }}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d9488', fontSize: '0.78rem', fontStyle: 'italic' }}>
              <span>Dr. Sarah is reviewing clinical database...</span>
            </div>
          )}
        </div>

        {/* Quick Suggested Queries */}
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.4rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {suggestedQuestions.map((q, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.72rem',
                color: '#334155',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input 
              type="text" 
              placeholder="Ask about dosage, interactions, or generic salts..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '999px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              style={{
                backgroundColor: '#0f766e',
                color: '#ffffff',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
