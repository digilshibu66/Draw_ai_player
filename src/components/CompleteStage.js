import React from 'react';

const LOGIC_PUZZLE_CODE = "SIGMA-01";

export default function CompleteStage() {
  return (
    <>
      <p className="text-center text-muted mb-3">🏆 Quest Complete!</p>
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-lg border-success" style={{ background: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' }}>
            <div className="card-body text-center p-5">
              <div style={{ fontSize: '5rem' }}>🏆</div>
              <h1 className="mb-3">Master Collaborator Badge Unlocked!</h1>
              <img src="/logo192.png" alt="badge" width={120} height={120} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', marginBottom: '20px' }} />
              <div className="text-dark mb-3">
                You have conquered all trials: solved the drawings, deciphered the riddle, 
                mastered the logic circuit, and decrypted the ancient code. You are a true master!
              </div>
              <div className="fw-bold" style={{ fontSize: '1.5rem' }}>Final Code: {LOGIC_PUZZLE_CODE}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
