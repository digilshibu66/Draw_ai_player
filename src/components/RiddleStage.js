import React, { useState } from 'react';

const TOTAL_ROUNDS = 5;
const FINAL_QUESTION = "quest";
const FINAL_ANSWER = "creativity";
const FINAL_CLUE = "The spark that ignites progress, the force behind every breakthrough — what drives change?";

export default function RiddleStage({ onComplete }) {
  const [finalInput, setFinalInput] = useState("");
  const [finalStatus, setFinalStatus] = useState("");

  const progressString = FINAL_QUESTION.split("");

  const submitFinal = () => {
    const ok = finalInput.trim().toLowerCase() === FINAL_ANSWER.toLowerCase();
    if (ok) {
      setFinalStatus("🎉 Correct! The ancient riddle reveals its truth.");
      onComplete(`✨ Riddle Solved! The answer was "${FINAL_ANSWER}". The Mindlock Puzzle awaits...`);
    } else {
      setFinalStatus("❌ The answer eludes you. Ponder the clue once more.");
    }
  };

  return (
    <>
      <p className="text-center text-muted mb-3">🔮 The Ancient Riddle · Final Trial 1 of 4</p>
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-semibold">🚪 The Final Gate</div>
            <div className="card-body">
              <div className="alert alert-warning mb-3">
                <strong>⚡ The Final Trial Awaits:</strong> You have collected all the sacred letters. 
                Now, decipher the ancient riddle to unlock the path forward.
              </div>
              <div className="mb-3">🔤 Sacred Word ({TOTAL_ROUNDS} letters):
                <div className="mt-1 fw-semibold" style={{ letterSpacing: 2, fontSize: '1.2rem' }}>{progressString.join(" ")}</div>
              </div>
              <div className="mb-3">
                <div className="fw-semibold">🔮 The Ancient Riddle</div>
                <div className="text-muted fst-italic">"{FINAL_CLUE}"</div>
              </div>
              <div className="input-group mb-2" style={{ maxWidth: 400 }}>
                <input className="form-control" placeholder="Speak the answer..." value={finalInput} onChange={(e) => setFinalInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && submitFinal()} />
                <button className="btn btn-dark" onClick={submitFinal}>🔓 Unlock</button>
              </div>
              {finalStatus && (
                <div className={`mt-2 ${finalStatus.includes("🎉") ? "text-success" : "text-danger"}`}>{finalStatus}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
