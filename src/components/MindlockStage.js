import React, { useState } from 'react';

export default function MindlockStage({ onComplete }) {
  const [dial1, setDial1] = useState("");
  const [dial2, setDial2] = useState("");
  const [dial3, setDial3] = useState("");
  const [dial4, setDial4] = useState("");
  const [mindlockSolved, setMindlockSolved] = useState(false);
  const [mindlockStatus, setMindlockStatus] = useState("");

  const submitMindlock = () => {
    const correctCode = "31063";
    const enteredCode = dial1 + dial2 + dial3 + dial4;
    
    if (enteredCode === correctCode) {
      setMindlockSolved(true);
      setMindlockStatus("✅ Correct! The Mindlock opens!");
      onComplete(`🔓 Mindlock Unlocked! Code: ${correctCode}. The Logic Circuit Puzzle awaits...`);
    } else {
      setMindlockStatus(`❌ Incorrect code: ${enteredCode}. Study the hints carefully.`);
    }
  };

  return (
    <>
      <p className="text-center text-muted mb-3">🔐 Mindlock Puzzle · Final Trial 2 of 4</p>
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white fw-semibold">🔐 Digital Mindlock</div>
            <div className="card-body">
              <div className="alert alert-dark mb-3">
                <strong>🧠 The Mindlock Challenge:</strong> A digital lock with 4 dials stands before you. 
                Each dial requires a number based on the hint. Solve all hints to unlock the code!
              </div>
              
              <div className="card mb-4" style={{ backgroundColor: '#1a1a1a', color: 'white', border: '2px solid #ffc107' }}>
                <div className="card-body text-center">
                  <div className="fw-semibold mb-3" style={{ fontSize: '1.2rem' }}>🔢 Enter the 5-Digit Code</div>
                  <div className="d-flex gap-3 justify-content-center align-items-center mb-3">
                    <div>
                      <div className="fw-bold mb-2" style={{ color: '#ffc107' }}>Dial 1</div>
                      <input 
                        type="text" 
                        maxLength="1" 
                        value={dial1} 
                        onChange={(e) => setDial1(e.target.value.replace(/[^0-9]/g, ''))} 
                        className="form-control text-center fw-bold" 
                        style={{ width: 60, height: 60, fontSize: '2rem', backgroundColor: '#2a2a2a', color: 'white', border: '2px solid #ffc107' }}
                      />
                    </div>
                    <div>
                      <div className="fw-bold mb-2" style={{ color: '#ffc107' }}>Dial 2</div>
                      <input 
                        type="text" 
                        maxLength="2" 
                        value={dial2} 
                        onChange={(e) => setDial2(e.target.value.replace(/[^0-9]/g, ''))} 
                        className="form-control text-center fw-bold" 
                        style={{ width: 80, height: 60, fontSize: '2rem', backgroundColor: '#2a2a2a', color: 'white', border: '2px solid #ffc107' }}
                      />
                    </div>
                    <div>
                      <div className="fw-bold mb-2" style={{ color: '#ffc107' }}>Dial 3</div>
                      <input 
                        type="text" 
                        maxLength="1" 
                        value={dial3} 
                        onChange={(e) => setDial3(e.target.value.replace(/[^0-9]/g, ''))} 
                        className="form-control text-center fw-bold" 
                        style={{ width: 60, height: 60, fontSize: '2rem', backgroundColor: '#2a2a2a', color: 'white', border: '2px solid #ffc107' }}
                      />
                    </div>
                    <div>
                      <div className="fw-bold mb-2" style={{ color: '#ffc107' }}>Dial 4</div>
                      <input 
                        type="text" 
                        maxLength="1" 
                        value={dial4} 
                        onChange={(e) => setDial4(e.target.value.replace(/[^0-9]/g, ''))} 
                        className="form-control text-center fw-bold" 
                        style={{ width: 60, height: 60, fontSize: '2rem', backgroundColor: '#2a2a2a', color: 'white', border: '2px solid #ffc107' }}
                      />
                    </div>
                  </div>
                  <button className="btn btn-warning btn-lg" onClick={submitMindlock} disabled={mindlockSolved}>
                    🔓 Unlock Mindlock
                  </button>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card" style={{ backgroundColor: '#e7f3ff', border: '2px solid #0d6efd' }}>
                    <div className="card-body">
                      <div className="fw-bold mb-2">🔢 Dial 1 Hint:</div>
                      <div className="text-muted">"Pi's first digit"</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card" style={{ backgroundColor: '#fff3cd', border: '2px solid #ffc107' }}>
                    <div className="card-body">
                      <div className="fw-bold mb-2">🔢 Dial 2 Hint:</div>
                      <div className="text-muted">"Binary representation of 2"</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card" style={{ backgroundColor: '#d4edda', border: '2px solid #28a745' }}>
                    <div className="card-body">
                      <div className="fw-bold mb-2">🔢 Dial 3 Hint:</div>
                      <div className="text-muted">"Number of sides in a hexagon"</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card" style={{ backgroundColor: '#f8d7da', border: '2px solid #dc3545' }}>
                    <div className="card-body">
                      <div className="fw-bold mb-2">🔢 Dial 4 Hint:</div>
                      <div className="text-muted">"Number of corners in a triangle"</div>
                    </div>
                  </div>
                </div>
              </div>

              {mindlockStatus && (
                <div className={`alert ${mindlockStatus.includes("✅") ? "alert-success" : "alert-danger"} mt-3`}>
                  {mindlockStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
