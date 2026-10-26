import React from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  CheckCircle2, 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  Award 
} from 'lucide-react';

export default function ConsultationBanner({ openChatModal }) {
  return (
    <section className="consultation-section">
      <div className="med-container">
        <div className="consultation-card">
          {/* Pharmacist Clinical Portrait */}
          <div className="consult-img-wrap">
            <img 
              src="/images/pharmacist.jpg" 
              alt="Dr. Sarah Jenkins - Lead Dispensing Pharmacist" 
              className="consult-img"
            />
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              backdropFilter: 'blur(4px)'
            }}>
              <strong>Dr. Sarah Jenkins</strong>, PharmD (Chief Dispenser)
            </div>
          </div>

          {/* Consultation Information & Actions */}
          <div className="consult-content">
            <div className="consult-badge">
              <Stethoscope size={14} />
              <span>Free Clinical Consultation</span>
            </div>

            <h2 className="consult-title">
              Have Questions About Dosage or Drug Interactions?
            </h2>

            <p className="consult-desc">
              Every prescription fulfilled at MEDIMINUS Pharmacy undergoes a 3-point clinical check. 
              Our registered pharmacists are available right now to assist you with dosage schedules, 
              food interactions, and affordable bio-equivalent alternatives.
            </p>

            <div className="consult-bullets">
              <div className="bullet-item">
                <CheckCircle2 size={16} />
                <span>Zero Consultation Charges</span>
              </div>
              <div className="bullet-item">
                <CheckCircle2 size={16} />
                <span>Under 2-Minute Response Time</span>
              </div>
              <div className="bullet-item">
                <CheckCircle2 size={16} />
                <span>Generic Alternative Savings</span>
              </div>
              <div className="bullet-item">
                <CheckCircle2 size={16} />
                <span>Strict Patient Privacy Protocol</span>
              </div>
            </div>

            <div className="consult-actions">
              <button className="btn-chat-pharmacist" onClick={openChatModal}>
                <MessageSquare size={18} />
                <span>Chat with On-Duty Pharmacist</span>
              </button>

              <div className="consult-helpline">
                <div className="helpline-icon">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <div className="helpline-label">Toll-Free Helpline</div>
                  <div className="helpline-phone">1800-419-6334</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
