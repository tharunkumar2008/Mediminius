import React from 'react';
import { 
  ShieldCheck, 
  ThermometerSnowflake, 
  FileCheck2, 
  Truck 
} from 'lucide-react';

export default function SafetySection() {
  const pillars = [
    {
      icon: <ShieldCheck size={24} />,
      title: '100% Authentic Medicines',
      desc: 'All batches sourced directly from certified pharma manufacturing units with QR batch verification.'
    },
    {
      icon: <ThermometerSnowflake size={24} />,
      title: 'Cold-Chain Protected',
      desc: 'Insulated packaging maintains 2°C - 8°C throughout transit for biologics, insulin, and vaccines.'
    },
    {
      icon: <FileCheck2 size={24} />,
      title: 'Pharmacist Double Check',
      desc: 'Registered clinical pharmacists review every prescription for contraindications before dispatch.'
    },
    {
      icon: <Truck size={24} />,
      title: 'Express Doorstep Delivery',
      desc: 'Same-day delivery across metro hubs with tamper-proof medical seals and discrete packaging.'
    }
  ];

  return (
    <section className="safety-section">
      <div className="med-container">
        <div className="safety-grid">
          {pillars.map((pillar, i) => (
            <div key={i} className="safety-card">
              <div className="safety-icon-box">
                {pillar.icon}
              </div>
              <h4 className="safety-title">{pillar.title}</h4>
              <p className="safety-desc">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
