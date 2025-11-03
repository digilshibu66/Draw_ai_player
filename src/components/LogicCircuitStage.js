import React, { useState, useEffect } from 'react';

const LOGIC_PUZZLE_CODE = "SIGMA-01";

export default function LogicCircuitStage({ onComplete }) {
  const [toggleA, setToggleA] = useState(false);
  const [toggleB, setToggleB] = useState(false);
  const [toggleC, setToggleC] = useState(false);
  const [toggleD, setToggleD] = useState(false);
  const [toggleE, setToggleE] = useState(false);
  const [toggleF, setToggleF] = useState(false);
  const [toggleG, setToggleG] = useState(false);
  const [logicSolved, setLogicSolved] = useState(false);

  const checkLogicPuzzle = () => {
    const output1 = (toggleA || toggleB) && toggleC;
    const output2 = (toggleD && toggleE) || toggleF;
    const output3 = toggleG && (toggleA || toggleD);
    return output1 && output2 && output3;
  };

  useEffect(() => {
    if (checkLogicPuzzle() && !logicSolved) {
      setLogicSolved(true);
      onComplete(`⚡ Logic Circuit Solved! Code Unlocked: ${LOGIC_PUZZLE_CODE}. Now decrypt the final message...`);
    }
  }, [toggleA, toggleB, toggleC, toggleD, toggleE, toggleF, toggleG, logicSolved, onComplete]);

  return (
    <>
      <p className="text-center text-muted mb-3">⚙️ Logic Circuit Puzzle · Final Trial 3 of 4</p>
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white fw-semibold">⚙️ Logic Circuit Puzzle</div>
            <div className="card-body">
              <div className="alert alert-info mb-3">
                <strong>🧩 The Circuit Challenge:</strong> You must activate ALL three outputs (turn them ALL green) by toggling the correct input switches. 
                When all outputs are green, the secret code will be revealed!
              </div>
              
              <div className="card mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body">
                  <div className="fw-semibold mb-2">📋 Circuit Logic Formulas:</div>
                  <div className="mb-2" style={{ fontSize: '0.95rem', fontFamily: 'monospace', backgroundColor: '#fff', padding: '8px', borderRadius: '6px', border: '2px solid #28a745' }}>
                    <strong>Output 1:</strong> (A OR B) AND C
                  </div>
                  <div className="mb-2" style={{ fontSize: '0.95rem', fontFamily: 'monospace', backgroundColor: '#fff', padding: '8px', borderRadius: '6px', border: '2px solid #ffc107' }}>
                    <strong>Output 2:</strong> (D AND E) OR F
                  </div>
                  <div className="mb-2" style={{ fontSize: '0.95rem', fontFamily: 'monospace', backgroundColor: '#fff', padding: '8px', borderRadius: '6px', border: '2px solid #dc3545' }}>
                    <strong>Output 3:</strong> G AND (A OR D)
                  </div>
                  <div className="small text-muted mt-2">
                    <strong>Logic Guide:</strong>
                    <ul className="mb-0">
                      <li><strong>AND</strong> = both must be ON</li>
                      <li><strong>OR</strong> = at least one must be ON</li>
                      <li>All 3 outputs must be ON (green) to unlock the code!</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="fw-semibold mb-2">🎛️ Control Panel - Toggle the Inputs (A to G):</div>
                <div className="d-flex flex-wrap gap-3 mb-3 justify-content-center" style={{ padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={toggleA} onChange={(e) => setToggleA(e.target.checked)} id="toggleA" style={{ width: 40, height: 20 }} />
                    <label className="form-check-label fw-bold" htmlFor="toggleA">A {toggleA ? '✅' : '⬜'}</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={toggleB} onChange={(e) => setToggleB(e.target.checked)} id="toggleB" style={{ width: 40, height: 20 }} />
                    <label className="form-check-label fw-bold" htmlFor="toggleB">B {toggleB ? '✅' : '⬜'}</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={toggleC} onChange={(e) => setToggleC(e.target.checked)} id="toggleC" style={{ width: 40, height: 20 }} />
                    <label className="form-check-label fw-bold" htmlFor="toggleC">C {toggleC ? '✅' : '⬜'}</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={toggleD} onChange={(e) => setToggleD(e.target.checked)} id="toggleD" style={{ width: 40, height: 20 }} />
                    <label className="form-check-label fw-bold" htmlFor="toggleD">D {toggleD ? '✅' : '⬜'}</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={toggleE} onChange={(e) => setToggleE(e.target.checked)} id="toggleE" style={{ width: 40, height: 20 }} />
                    <label className="form-check-label fw-bold" htmlFor="toggleE">E {toggleE ? '✅' : '⬜'}</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={toggleF} onChange={(e) => setToggleF(e.target.checked)} id="toggleF" style={{ width: 40, height: 20 }} />
                    <label className="form-check-label fw-bold" htmlFor="toggleF">F {toggleF ? '✅' : '⬜'}</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={toggleG} onChange={(e) => setToggleG(e.target.checked)} id="toggleG" style={{ width: 40, height: 20 }} />
                    <label className="form-check-label fw-bold" htmlFor="toggleG">G {toggleG ? '✅' : '⬜'}</label>
                  </div>
                </div>
                
                <div className="fw-semibold mb-2">💡 Circuit Outputs (Must ALL be GREEN):</div>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <div className="p-3 border rounded" style={{ backgroundColor: ((toggleA || toggleB) && toggleC) ? '#22c55e' : '#ef4444', color: 'white', minWidth: 100, textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', border: '3px solid #28a745' }}>
                    {((toggleA || toggleB) && toggleC) ? '✅ ON' : '❌ OFF'}<br/>Output 1
                  </div>
                  <div className="p-3 border rounded" style={{ backgroundColor: ((toggleD && toggleE) || toggleF) ? '#22c55e' : '#ef4444', color: 'white', minWidth: 100, textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', border: '3px solid #ffc107' }}>
                    {((toggleD && toggleE) || toggleF) ? '✅ ON' : '❌ OFF'}<br/>Output 2
                  </div>
                  <div className="p-3 border rounded" style={{ backgroundColor: (toggleG && (toggleA || toggleD)) ? '#22c55e' : '#ef4444', color: 'white', minWidth: 100, textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', border: '3px solid #dc3545' }}>
                    {(toggleG && (toggleA || toggleD)) ? '✅ ON' : '❌ OFF'}<br/>Output 3
                  </div>
                </div>
                
                <div className="mt-3 text-center small text-muted">
                  💡 <strong>Hint:</strong> Try different combinations. Think about what makes the formula true!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
