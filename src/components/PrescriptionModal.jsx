import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  FileText,
  Clock
} from 'lucide-react';

export default function PrescriptionModal({ onClose, onPrescriptionUploaded }) {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSampleUpload = () => {
    setSelectedFile({
      name: 'Dr_Sharma_Prescription_Oct2026.pdf',
      size: '1.4 MB',
      type: 'Official Medical Rx Slip'
    });
    setPatientName('Aarav Mehta');
    setPatientPhone('+91 98765 43210');
    setDoctorName('Dr. V. K. Sharma (Cardiologist, AIIMS)');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please upload or select a prescription file.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onPrescriptionUploaded) {
        onPrescriptionUploaded({
          patientName: patientName || 'Aarav Mehta',
          doctorName: doctorName || 'Dr. V. K. Sharma',
          fileName: selectedFile.name
        });
      }
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <h3>Upload Doctor's Prescription</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>CDSCO Verified Dispensing Process</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: 64,
                height: 64,
                backgroundColor: '#d1fae5',
                color: '#059669',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#064e3b', marginBottom: '0.5rem' }}>
                Prescription Uploaded Successfully!
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Our on-duty clinical pharmacist is actively reviewing your document. 
                We will match prescribed medicines and confirm dosage requirements shortly.
              </p>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1rem',
                textAlign: 'left',
                marginBottom: '1.5rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Patient Name:</span>
                  <strong>{patientName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#64748b' }}>Consulting Doctor:</span>
                  <strong>{doctorName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Est. Pharmacist Review:</span>
                  <strong style={{ color: '#0d9488' }}>&lt; 10 Minutes</strong>
                </div>
              </div>

              <button 
                onClick={onClose}
                style={{
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Guidelines Box */}
              <div style={{
                backgroundColor: '#f0fdfa',
                border: '1px solid #ccfbf1',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                color: '#115e59',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  Please ensure Doctor Name, Patient Name, Clinic Seal, Date and Medicine Names are clearly legible in the picture.
                </span>
              </div>

              {/* Upload Drop Zone */}
              <div 
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  marginBottom: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={handleSampleUpload}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}>
                  <UploadCloud size={24} />
                </div>
                <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                  {selectedFile ? selectedFile.name : 'Click to Upload Prescription (or select sample)'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  Supports JPEG, PNG, PDF up to 10MB
                </p>
                <button 
                  type="button"
                  onClick={handleSampleUpload}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #0d9488',
                    color: '#0d9488',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Click to autofill sample Rx (Demo)
                </button>
              </div>

              {/* Patient Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                    Patient Full Name *
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                    Contact Phone *
                  </label>
                  <input 
                    type="tel" 
                    required 
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem', color: '#334155' }}>
                  Doctor or Hospital Name (Optional)
                </label>
                <input 
                  type="text" 
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. V. K. Sharma (Cardiology)"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0f766e, #047857)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSubmitting ? 'Verifying File...' : 'Submit Prescription for Verification'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
