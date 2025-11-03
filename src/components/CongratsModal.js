import React from 'react';

export default function CongratsModal({ message, onContinue }) {
  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card shadow-lg" style={{ maxWidth: 600, width: '100%', border: '3px solid #ffc107' }}>
          <div className="card-body text-center p-5">
            <div style={{ fontSize: '5rem' }}>🎉</div>
            <h2 className="mb-4">{message}</h2>
            <button className="btn btn-lg btn-primary" onClick={onContinue}>
              Continue Your Journey →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
