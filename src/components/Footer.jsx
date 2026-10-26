import React from 'react';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Award, 
  ThermometerSnowflake,
  Heart
} from 'lucide-react';

export default function Footer({ openRxModal, openChatModal, setSelectedCategory, openAdmin }) {
  return (
    <footer className="pharmacy-footer">
      <div className="med-container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <h3>
              <div style={{
                width: 32,
                height: 32,
                backgroundColor: '#0f766e',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" stroke="#ffffff" />
                  <circle cx="18" cy="6" r="3" fill="#34d399" stroke="none" />
                </svg>
              </div>
              <span>MEDI<span style={{ color: '#34d399' }}>MINUS</span> Pharmacy</span>
            </h3>

            <p>
              Certified retail & digital dispensing pharmacy. We deliver 100% genuine, 
              temperature-monitored pharmaceutical medicines and healthcare equipment directly 
              from verified manufacturers to patients.
            </p>

            <div className="footer-license-box">
              <strong>Drug License Numbers:</strong><br />
              Form 20B: MH-TZ4-88921 | Form 21B: MH-TZ4-88922<br />
              CDSCO Verified Online Pharmacy Registration: 2026/PHARM-5589
            </div>
          </div>

          {/* Quick Departments */}
          <div className="footer-column">
            <h5>Medical Categories</h5>
            <ul className="footer-links">
              <li><a href="#products-section" onClick={() => setSelectedCategory('tablets')}>Tablets & Capsules</a></li>
              <li><a href="#products-section" onClick={() => setSelectedCategory('syrups')}>Syrups & Suspensions</a></li>
              <li><a href="#products-section" onClick={() => setSelectedCategory('ointments')}>Ointments & Creams</a></li>
              <li><a href="#products-section" onClick={() => setSelectedCategory('firstaid')}>First Aid & Surgical</a></li>
              <li><a href="#products-section" onClick={() => setSelectedCategory('devices')}>Diagnostic Equipment</a></li>
              <li><a href="#products-section" onClick={() => setSelectedCategory('wellness')}>Vitamins & Immunity</a></li>
            </ul>
          </div>

          {/* Clinical Patient Services */}
          <div className="footer-column">
            <h5>Patient Services</h5>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); openRxModal(); }}>Upload Doctor's Prescription</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); openChatModal(); }}>Consult Licensed Pharmacist</a></li>
              <li><a href="#">Cold-Chain Tracking Protocol</a></li>
              <li><a href="#">Generic Drug Savings Calculator</a></li>
              <li><a href="#">Medicine Return & Disposal Policy</a></li>
              <li><a href="#">Drug Recall & Safety Bulletins</a></li>
              {openAdmin && (
                <li>
                  <a href="#admin" onClick={(e) => { e.preventDefault(); openAdmin(); }} style={{ color: '#34d399', fontWeight: '700' }}>
                    🔐 Pharmacist & Owner Admin Portal
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Pharmacy Registered Contact */}
          <div className="footer-column">
            <h5>Dispensing Facility</h5>
            <div className="footer-contact-info">
              <div className="contact-row">
                <MapPin size={18} />
                <span>
                  MEDIMINUS Central Pharmacy Hub, Level 2, Medical Tower, Bandra-Kurla Complex, Mumbai, MH 400051
                </span>
              </div>
              <div className="contact-row">
                <Phone size={18} />
                <span>
                  <strong>Emergency Dispensing:</strong> 1800-419-6334<br />
                  <strong>Pharmacist Desk:</strong> +91 (022) 6789 2200
                </span>
              </div>
              <div className="contact-row">
                <Mail size={18} />
                <span>dispense@mediminus.com</span>
              </div>
              <div className="contact-row">
                <Clock size={18} />
                <span>24 Hours Dispensing & Dispatch Everyday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} MEDIMINUS Pharmacy Limited. All rights reserved. Sample catalogue data for demo.
          </div>

          <div className="footer-certifications">
            <span className="cert-pill">✓ WHO-GMP Certified</span>
            <span className="cert-pill">✓ ISO 9001:2015</span>
            <span className="cert-pill">✓ CDSCO Compliant</span>
            <span className="cert-pill">✓ Cold-Chain 2°C - 8°C Monitored</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
