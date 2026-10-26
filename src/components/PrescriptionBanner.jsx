import React from 'react';
import { UploadCloud, CheckCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PrescriptionBanner({ openRxModal }) {
  return (
    <div className="med-container">
      <div className="rx-banner-strip">
        <div className="rx-banner-content">
          <div className="rx-banner-text">
            <h3>Quick Prescription Upload & Dispensing</h3>
            <p>
              Ordering prescription medicines has never been easier. Just snap or upload a clear picture 
              of your valid doctor's prescription. Our certified clinical pharmacists will review it in under 15 minutes.
            </p>

            <div className="rx-banner-steps">
              <div className="rx-step">
                <span className="rx-step-num">1</span>
                <span>Upload Doctor's Slip</span>
              </div>
              <div className="rx-step">
                <span className="rx-step-num">2</span>
                <span>Pharmacist Verification</span>
              </div>
              <div className="rx-step">
                <span className="rx-step-num">3</span>
                <span>Doorstep Delivery</span>
              </div>
            </div>
          </div>

          <button className="btn-rx-action" onClick={openRxModal}>
            <UploadCloud size={20} />
            <span>Upload Doctor's Prescription</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
