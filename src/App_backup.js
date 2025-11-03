import React, { useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import CryptoJS from "crypto-js";

const PROMPTS = [
  "Draw a kite.",
  "Draw a bicycle.",
  "Draw a coffee mug.",
  "Draw a bridge.",
  "Draw an airplane.",
  "Draw a guitar.",
  "Draw a lighthouse.",
  "Draw a camera.",
  "Draw a rocket.",
  "Draw a mountain.",
];
const TOTAL_ROUNDS = 5;
const FINAL_QUESTION = "quest"; // 5 letters
const FINAL_ANSWER = "creativity"; // answer to the riddle
const FINAL_CLUE = "The spark that ignites progress, the force behind every breakthrough — what drives change?"; // clue question shown at the end

// Encrypted message in QR code (Caesar cipher shift 10 + Base64)
// "SIGMA-01" -> Caesar shift 10 -> "CMQWK-01" -> Base64
const ENCRYPTED_QR_MESSAGE = "Q01RV0stMDE="; // "SIGMA-01" encrypted
const LOGIC_PUZZLE_CODE = "SIGMA-01";
const CAESAR_SHIFT = 10;

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guess, setGuess] = useState("");
  const [roundIndex, setRoundIndex] = useState(0);
  const [promptOrder, setPromptOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [aiGuessedCorrect, setAiGuessedCorrect] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;
  const ROUND_TIME_SEC = 180; // 3 minutes
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SEC);
  const [unlockedLetters, setUnlockedLetters] = useState(Array(TOTAL_ROUNDS).fill(null));
  const [achievements, setAchievements] = useState([]);
  const [finalInput, setFinalInput] = useState("");
  const [finalStatus, setFinalStatus] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [showLogicPuzzle, setShowLogicPuzzle] = useState(false);
  const [logicSolved, setLogicSolved] = useState(false);
  const [toggleA, setToggleA] = useState(false);
  const [toggleB, setToggleB] = useState(false);
  const [toggleC, setToggleC] = useState(false);
  const [toggleD, setToggleD] = useState(false);
  const [toggleE, setToggleE] = useState(false);
  const [toggleF, setToggleF] = useState(false);
  const [toggleG, setToggleG] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [decryptionKey, setDecryptionKey] = useState("");
  const [decryptionResult, setDecryptionResult] = useState("");
  const [currentDecryptionStep, setCurrentDecryptionStep] = useState(0); // 0=start, 1=base64 done, 2=caesar done
  const [showQRDecryption, setShowQRDecryption] = useState(false);
  
  // Mindlock puzzle state
  const [dial1, setDial1] = useState("");
  const [dial2, setDial2] = useState("");
  const [dial3, setDial3] = useState("");
  const [dial4, setDial4] = useState("");
  const [mindlockSolved, setMindlockSolved] = useState(false);
  const [mindlockStatus, setMindlockStatus] = useState("");
  
  // Page/Stage management
  const [currentStage, setCurrentStage] = useState("drawing"); // drawing, riddle, mindlock, logic, decryption, complete
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsMessage, setCongratsMessage] = useState("");

  const currentPromptIndex = promptOrder[roundIndex] ?? 0;
  const currentPrompt = PROMPTS[currentPromptIndex] ?? PROMPTS[0];

  const startDraw = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setGuess("");
    setAiGuessedCorrect(null);
  };

  const nextRound = () => {
    if (roundIndex < TOTAL_ROUNDS - 1) {
      // Show congratulations before moving to next round
      setCongratsMessage(`🎉 Chapter ${roundIndex + 1} Complete! You earned the letter "${FINAL_QUESTION[roundIndex]}"!`);
      setShowCongrats(true);
    } else {
      // All drawing rounds complete, move to riddle stage
      setCongratsMessage(`🌟 All Chapters Complete! You've collected all ${TOTAL_ROUNDS} sacred letters! The final trials await...`);
      setShowCongrats(true);
    }
  };
  
  const proceedToNextRound = () => {
    setShowCongrats(false);
    if (roundIndex < TOTAL_ROUNDS - 1) {
      const nextR = roundIndex + 1;
      setRoundIndex(nextR);
      clearCanvas();
      setAttempts(0);
      setAiGuessedCorrect(null);
    } else {
      // Move to riddle stage
      setCurrentStage("riddle");
    }
  };

  React.useEffect(() => {
    // initialize random prompt order once
    const order = shuffleArray(Array.from({ length: PROMPTS.length }, (_, i) => i));
    setPromptOrder(order);
  }, []);

  React.useEffect(() => {
    setTimeLeft(ROUND_TIME_SEC);
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [roundIndex]);

  const submitDrawing = async () => {
    setLoading(true);
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png").split(",")[1];

    try {
      const res = await fetch("http://localhost:5000/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();
      const g = data.guess || "(no guess)";
      setGuess(g);

      // Auto correctness check using keywords per prompt
      const keywords = getKeywordsForPrompt(currentPrompt);
      const lower = g.toLowerCase();
      const isCorrect = keywords.some((k) => lower.includes(k));
      if (isCorrect && !aiGuessedCorrect) {
        setAiGuessedCorrect(true);
        setScore((s) => s + 10);
        // unlock letter for this round if not already
        setUnlockedLetters((prev) => {
          if (prev[roundIndex]) return prev;
          const next = prev.slice();
          next[roundIndex] = FINAL_QUESTION[roundIndex];
          return next;
        });
        setAchievements((prev) => {
          // avoid duplicate achievement for same round
          if (prev.find((a) => a.round === roundIndex + 1)) return prev;
          return [
            ...prev,
            {
              round: roundIndex + 1,
              prompt: currentPrompt,
              letter: FINAL_QUESTION[roundIndex],
            },
          ];
        });
      } else if (!isCorrect && aiGuessedCorrect == null) {
        setAiGuessedCorrect(false);
      }
      setAttempts((a) => a + 1);
    } catch (err) {
      console.error("Error:", err);
      setGuess("Server error");
    } finally {
      setLoading(false);
    }
  };

  const canAdvance = aiGuessedCorrect === true || attempts >= MAX_ATTEMPTS || timeLeft === 0;

  const progressString = unlockedLetters.map((ch) => (ch ? ch : "_"));
  const isGameComplete = roundIndex === TOTAL_ROUNDS - 1 && (aiGuessedCorrect === true || attempts >= MAX_ATTEMPTS || timeLeft === 0);

  const submitFinal = () => {
    const ok = finalInput.trim().toLowerCase() === FINAL_ANSWER.toLowerCase();
    if (ok) {
      setFinalStatus("🎉 Correct! The ancient riddle reveals its truth.");
      setCongratsMessage(`✨ Riddle Solved! The answer was "${FINAL_ANSWER}". The Mindlock Puzzle awaits...`);
      setShowCongrats(true);
    } else {
      setFinalStatus("❌ The answer eludes you. Ponder the clue once more.");
    }
  };
  
  const proceedToMindlock = () => {
    setShowCongrats(false);
    setCurrentStage("mindlock");
  };
  
  const submitMindlock = () => {
    const correctCode = "31063";
    const enteredCode = dial1 + dial2 + dial3 + dial4;
    
    if (enteredCode === correctCode) {
      setMindlockSolved(true);
      setMindlockStatus("✅ Correct! The Mindlock opens!");
      setCongratsMessage(`🔓 Mindlock Unlocked! Code: ${correctCode}. The Logic Circuit Puzzle awaits...`);
      setShowCongrats(true);
    } else {
      setMindlockStatus(`❌ Incorrect code: ${enteredCode}. Study the hints carefully.`);
    }
  };
  
  const proceedToLogicPuzzle = () => {
    setShowCongrats(false);
    setCurrentStage("logic");
  };

  // Logic puzzle: Complex circuit with 7 inputs (A-G) and 3 outputs
  // Each output has different logic requirements
  const checkLogicPuzzle = () => {
    // Output 1: (A OR B) AND C
    const output1 = (toggleA || toggleB) && toggleC;
    // Output 2: (D AND E) OR F
    const output2 = (toggleD && toggleE) || toggleF;
    // Output 3: G AND (A OR D)
    const output3 = toggleG && (toggleA || toggleD);
    return output1 && output2 && output3;
  };
  
  // Solution: A=ON, C=ON, D=ON, E=ON, F=ON, G=ON (B can be any)

  React.useEffect(() => {
    if (currentStage === "logic" && checkLogicPuzzle() && !logicSolved) {
      setLogicSolved(true);
      // Show congratulations
      setCongratsMessage(`⚡ Logic Circuit Solved! Code Unlocked: ${LOGIC_PUZZLE_CODE}. Now decrypt the final message...`);
      setShowCongrats(true);
      // Prepare encrypted QR code
      const encryptedData = ENCRYPTED_QR_MESSAGE;
      setQrCodeData(encryptedData);
    }
  }, [toggleA, toggleB, toggleC, toggleD, toggleE, toggleF, toggleG, currentStage, logicSolved]);
  
  const proceedToDecryption = () => {
    setShowCongrats(false);
    setCurrentStage("decryption");
  };

  // Caesar cipher decryption helper
  const caesarDecrypt = (text, shift) => {
    return text.split('').map(char => {
      if (char.match(/[A-Z]/)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
      } else if (char.match(/[a-z]/)) {
        return String.fromCharCode(((char.charCodeAt(0) - 97 - shift + 26) % 26) + 97);
      }
      return char;
    }).join('');
  };

  const attemptDecryption = () => {
    if (!decryptionKey.trim()) {
      setDecryptedMessage("❌ Please enter a decryption method.");
      return;
    }
    try {
      const input = decryptionKey.trim().toLowerCase();
      
      // Step 1: Type base64
      if (currentDecryptionStep === 0 && input === 'base64') {
        const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
        setDecryptedMessage(`✅ Correct! You typed "base64"\n\n🔑 Your decrypted key is: ${base64Decoded}\n\n💡 Now enter this key in the field below to proceed!`);
        setDecryptionKey("");
        setCurrentDecryptionStep(0.5); // Waiting for base64 result input
        return;
      }
      
      setDecryptedMessage("❌ Unknown method. You must type the exact word: 'base64', 'caesar', or 'complete'.");
    } catch (err) {
      setDecryptedMessage("❌ Decryption error. Try typing 'base64' first.");
    }
  };
  
  const submitDecryptionResult = () => {
    if (!decryptionResult.trim()) {
      setDecryptedMessage("❌ Please enter the decrypted result.");
      return;
    }
    
    const input = decryptionResult.trim();
    
    // Verify base64 result
    if (currentDecryptionStep === 0.5) {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      if (input === base64Decoded) {
        setDecryptedMessage(`✅ Correct! "${input}" is the right key!\n\n🎉 Base64 decryption verified!\n\n💡 Next Clue: The letters look shifted. This is a Caesar cipher (shift ${CAESAR_SHIFT}). Type "caesar" in the method field above!`);
        setDecryptionResult("");
        setCurrentDecryptionStep(1);
      } else {
        setDecryptedMessage(`❌ Wrong key. Expected: ${base64Decoded}`);
      }
      return;
    }
    
    // Verify caesar result
    if (currentDecryptionStep === 1.5) {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const caesarDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      if (input === caesarDecrypted) {
        setDecryptedMessage(`✅ Perfect! "${input}" is correct!\n\n🎉 Caesar decryption verified!\n\n💡 Next: You can try "complete" to decrypt everything at once, or you're done!`);
        setDecryptionResult("");
        setCurrentDecryptionStep(2);
        // Show final congratulations
        setTimeout(() => {
          setCongratsMessage(`🏆 Decryption Successful! Final Code: ${input}. You are a Master Collaborator!`);
          setShowCongrats(true);
        }, 2000);
      } else {
        setDecryptedMessage(`❌ Wrong key. Expected: ${caesarDecrypted}`);
      }
      return;
    }
    
    // Verify complete result
    if (currentDecryptionStep === 2.5) {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const finalDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      if (input === finalDecrypted) {
        setDecryptedMessage(`✅ Excellent! "${input}" is the final code!\n\n🏆 You got it right! This is the secret code!`);
        setDecryptionResult("");
        setTimeout(() => {
          setCongratsMessage(`🏆 Decryption Successful! Final Code: ${input}. You are a Master Collaborator!`);
          setShowCongrats(true);
        }, 2000);
      } else {
        setDecryptedMessage(`❌ Wrong key. Expected: ${finalDecrypted}`);
      }
      return;
    }
  };
  
  const attemptDecryptionMethod = () => {
    if (!decryptionKey.trim()) {
      setDecryptedMessage("❌ Please enter a decryption method.");
      return;
    }
    
    const input = decryptionKey.trim().toLowerCase();
    
    // Caesar method
    if (currentDecryptionStep === 1 && input === 'caesar') {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const caesarDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      setDecryptedMessage(`✅ Correct! You typed "caesar"\n\n🔑 Your decrypted key is: ${caesarDecrypted}\n\n💡 Now enter this key in the field below to verify!`);
      setDecryptionKey("");
      setCurrentDecryptionStep(1.5);
      return;
    }
    
    // Complete method
    if (input === 'complete') {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const finalDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      setDecryptedMessage(`✅ Perfect! You typed "complete"\n\n🔑 Your final decrypted key is: ${finalDecrypted}\n\n💡 Enter this key below to complete the challenge!`);
      setDecryptionKey("");
      setCurrentDecryptionStep(2.5);
      return;
    }
    
    // Base64 method (initial)
    if (currentDecryptionStep === 0 && input === 'base64') {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      setDecryptedMessage(`✅ Correct! You typed "base64"\n\n🔑 Your decrypted key is: ${base64Decoded}\n\n💡 Now enter this key in the field below to proceed!`);
      setDecryptionKey("");
      setCurrentDecryptionStep(0.5);
      return;
    }
    
    setDecryptedMessage("❌ Unknown method or wrong step. Follow the instructions above.");
  };
  
  const proceedToComplete = () => {
    setShowCongrats(false);
    setBadgeUnlocked(true);
    setCurrentStage("complete");
  };

  // Congratulations Modal
  if (showCongrats) {
    const getNextAction = () => {
      if (roundIndex < TOTAL_ROUNDS - 1 && currentStage === "drawing") {
        return proceedToNextRound;
      } else if (roundIndex === TOTAL_ROUNDS - 1 && currentStage === "drawing") {
        return proceedToNextRound; // Move to riddle
      } else if (currentStage === "riddle") {
        return proceedToMindlock;
      } else if (currentStage === "mindlock") {
        return proceedToLogicPuzzle;
      } else if (currentStage === "logic") {
        return proceedToDecryption;
      } else if (currentStage === "decryption") {
        return proceedToComplete;
      }
    };

    return (
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
          <div className="card shadow-lg" style={{ maxWidth: 600, width: '100%', border: '3px solid #ffc107' }}>
            <div className="card-body text-center p-5">
              <div style={{ fontSize: '5rem' }}>🎉</div>
              <h2 className="mb-4">{congratsMessage}</h2>
              <button className="btn btn-lg btn-primary" onClick={getNextAction()}>
                Continue Your Journey →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="text-center mb-2 d-flex align-items-center justify-content-center gap-2">
        <img src="/logo192.png" alt="logo" width={42} height={42} style={{ borderRadius: 8 }} />
        <h2 className="m-0">Draw It AI</h2>
      </div>
      
      {/* Drawing Stage */}
      {currentStage === "drawing" && (
        <>
          <p className="text-center text-muted mb-3">📖 Chapter {roundIndex + 1} of {TOTAL_ROUNDS} · The Collaborator's Quest</p>
          <div className="alert alert-info text-center mb-3" style={{ maxWidth: 800, margin: '0 auto' }}>
            <strong>🌟 Your Journey:</strong> In a realm where creativity meets technology, you embark on a quest to unlock the ancient wisdom. 
            Each drawing you create reveals a letter of a sacred word. Complete all chapters to face the final trials.
          </div>

          <div className="row g-4 justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-semibold">📜 Chapter {roundIndex + 1}: The Drawing Trial</div>
            <div className="card-body">
              <div className="alert alert-secondary mb-1">🎨 <strong>Your Task:</strong> {currentPrompt}</div>
              <div className="text-muted small mb-3">✨ Sketch the clue with care. The AI oracle will judge your creation and grant you a sacred letter.</div>
              <div className="d-flex flex-column flex-md-row gap-3">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={420}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  style={{
                    border: "2px solid #0f172a",
                    borderRadius: 12,
                    background: "#fff",
                    cursor: "crosshair",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    maxWidth: "100%",
                  }}
                />
                <div className="flex-grow-1" style={{ minWidth: 260 }}>
                  <div className="mb-2">
                    <button onClick={clearCanvas} className="btn btn-outline-secondary me-2">Clear</button>
                    <button onClick={submitDrawing} disabled={loading || timeLeft === 0 || attempts >= MAX_ATTEMPTS || aiGuessedCorrect === true} className="btn btn-primary me-2">
                      {loading ? "Guessing..." : "Submit"}
                    </button>
                    <button onClick={nextRound} disabled={!canAdvance} className="btn btn-success">{roundIndex === TOTAL_ROUNDS - 1 ? 'Complete Drawings →' : 'Next Round'}</button>
                  </div>

                  <div className="mt-3">
                    <div className="fw-semibold d-flex align-items-center gap-2">
                      <img src="/logo192.png" alt="ai" width={20} height={20} style={{ borderRadius: 4 }} />
                      <span>AI Guess</span>
                    </div>
                    <div className="border rounded p-2 bg-light" style={{ minHeight: 42 }}>
                      {guess || "(waiting...)"}
                    </div>
                  </div>

                  <div className="mt-2 text-muted small">Hourglass: {timeLeft}s</div>
                  <div className="text-muted small">Attempts: {attempts} / {MAX_ATTEMPTS}</div>
                  <div className="mt-2 fw-bold">Renown: {score}</div>
                  <div className="mt-1 text-muted small">Acceptable answers: {getKeywordsForPrompt(currentPrompt).join(", ")}</div>
                </div>
              </div>
            </div>
          </div>
          {roundIndex === TOTAL_ROUNDS - 1 && isGameComplete && (
            <div className="card shadow-sm mt-3">
              <div className="card-header bg-light fw-semibold">🚪 The Final Gate</div>
              <div className="card-body">
                <div className="alert alert-success mb-3">
                  <strong>⚡ All Chapters Complete!</strong> You have collected all the sacred letters. 
                  Click "Next Round" above to proceed to the Ancient Riddle!
                </div>
                <div className="mb-2">🔤 Sacred Word ({TOTAL_ROUNDS} letters):
                  <div className="mt-1 fw-semibold" style={{ letterSpacing: 2, fontSize: '1.2rem' }}>{progressString.join(" ")}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-12 col-lg-3">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-semibold">📚 Journey Log</div>
            <div className="card-body">
              <div className="mb-2 small text-muted">✨ Each victory grants a sacred letter. Collect them all to unlock the final trials.</div>
              <ul className="list-group">
                {achievements.length === 0 && (
                  <li className="list-group-item">Your story begins...</li>
                )}
                {achievements.map((a) => (
                  <li key={a.round} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">Chapter {a.round}</div>
                      <div className="small text-muted" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.prompt}</div>
                    </div>
                    <span className="badge text-bg-primary" style={{ fontSize: 16 }}>{a.letter.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <div className="fw-semibold mb-1">Riddle Progress</div>
                <div className="border rounded p-2 bg-light" style={{ letterSpacing: 2 }}>{progressString.join(" ")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-muted mt-4 small">
        🎨 Sketch clues → 🔤 Earn letters → 🔮 Solve the riddle → ⚙️ Master the circuit → 🔐 Decrypt the code → 🏆 Claim your badge
      </p>
        </>
      )}

      {/* Riddle Stage */}
      {currentStage === "riddle" && (
        <>
          <p className="text-center text-muted mb-3">🔮 The Ancient Riddle · Final Trial 1 of 3</p>
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
                    <input className="form-control" placeholder="Speak the answer..." value={finalInput} onChange={(e) => setFinalInput(e.target.value)} />
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
      )}

      {/* Mindlock Stage */}
      {currentStage === "mindlock" && (
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
                      <div className="fw-semibold mb-3" style={{ fontSize: '1.2rem' }}>🔢 Enter the 4-Digit Code</div>
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
                          <div className="small text-info mt-1">💡 Think: 3.14159...</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card" style={{ backgroundColor: '#fff3cd', border: '2px solid #ffc107' }}>
                        <div className="card-body">
                          <div className="fw-bold mb-2">🔢 Dial 2 Hint:</div>
                          <div className="text-muted">"Binary representation of 2"</div>
                          <div className="small text-warning mt-1">💡 Think: 0, 1, 10, 11...</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card" style={{ backgroundColor: '#d4edda', border: '2px solid #28a745' }}>
                        <div className="card-body">
                          <div className="fw-bold mb-2">🔢 Dial 3 Hint:</div>
                          <div className="text-muted">"Number of sides in a hexagon"</div>
                          <div className="small text-success mt-1">💡 Think: Geometric shapes</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card" style={{ backgroundColor: '#f8d7da', border: '2px solid #dc3545' }}>
                        <div className="card-body">
                          <div className="fw-bold mb-2">🔢 Dial 4 Hint:</div>
                          <div className="text-muted">"Number of corners in a triangle"</div>
                          <div className="small text-danger mt-1">💡 Think: Basic geometry</div>
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
      )}

      {/* Logic Circuit Stage */}
      {currentStage === "logic" && (
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
      )}

      {/* Decryption Stage */}
      {currentStage === "decryption" && (
        <>
          <p className="text-center text-muted mb-3">🔐 Decryption Challenge · Final Trial 4 of 4</p>
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header bg-warning fw-semibold">🔐 Encrypted QR Code</div>
                <div className="card-body">
                  <div className="alert alert-warning mb-3">
                    <strong>🔑 Decryption Challenge:</strong> The QR code contains a message encrypted with TWO layers of encryption. 
                    You must decrypt it step by step. Try different decryption methods!
                  </div>
                  <div className="d-flex flex-column flex-md-row gap-3 align-items-start mb-3">
                    <div className="p-2 border rounded bg-white">
                      <QRCodeSVG value={qrCodeData} size={160} includeMargin={true} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold mb-2">Encrypted Data:</div>
                      <div className="small text-muted mb-2" style={{ wordBreak: 'break-all', fontFamily: 'monospace', backgroundColor: '#fff3cd', padding: '8px', borderRadius: '4px' }}>{qrCodeData}</div>
                      <div className="small text-info">
                        <strong>📝 Notice:</strong> The "=" at the end is a clue! This often indicates Base64 encoding.
                      </div>
                    </div>
                  </div>
                  
                  <div className="card mb-3" style={{ backgroundColor: '#e7f3ff', border: '2px dashed #0d6efd' }}>
                    <div className="card-body">
                      <div className="fw-semibold mb-2">💡 Decryption Instructions:</div>
                      <div className="small">
                        <strong>How to decrypt:</strong>
                        <ol className="mb-2">
                          <li><strong>Step 1:</strong> The data looks like Base64 (notice the "=" padding). Type the word: <code className="bg-white px-2 py-1 rounded">base64</code></li>
                          <li><strong>Step 2:</strong> After Base64, you'll get shifted letters (Caesar cipher). Type the word: <code className="bg-white px-2 py-1 rounded">caesar</code></li>
                          <li><strong>Quick Solution:</strong> Want to decrypt everything at once? Type: <code className="bg-white px-2 py-1 rounded">complete</code></li>
                        </ol>
                        <div className="text-muted fst-italic">
                          🎯 <strong>Important:</strong> You must type the exact decryption method name (lowercase) to proceed!
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Step 1: Type the decryption method</label>
                    <div className="input-group" style={{ maxWidth: 500 }}>
                      <input 
                        className="form-control" 
                        placeholder="Type: base64, caesar, or complete" 
                        value={decryptionKey} 
                        onChange={(e) => setDecryptionKey(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && attemptDecryptionMethod()} 
                      />
                      <button className="btn btn-warning" onClick={attemptDecryptionMethod}>🔑 Get Key</button>
                    </div>
                    <div className="small text-muted mt-1">💡 Type the decryption method name (base64, caesar, or complete)</div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Step 2: Enter the decrypted key you received</label>
                    <div className="input-group" style={{ maxWidth: 500 }}>
                      <input 
                        className="form-control" 
                        placeholder="Enter the key from above" 
                        value={decryptionResult} 
                        onChange={(e) => setDecryptionResult(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && submitDecryptionResult()} 
                      />
                      <button className="btn btn-success" onClick={submitDecryptionResult}>✅ Verify Key</button>
                    </div>
                    <div className="small text-muted mt-1">💡 Copy and paste the key you got from Step 1</div>
                  </div>
                  {decryptedMessage && (
                    <div className={`alert ${decryptedMessage.includes("❌") ? "alert-danger" : "alert-success"} mt-2`} style={{ whiteSpace: 'pre-line' }}>
                      {decryptedMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Complete Stage */}
      {currentStage === "complete" && badgeUnlocked && (
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
      )}
    </div>
  );
}

function getKeywordsForPrompt(prompt) {
  const map = {
    "Draw a kite.": ["kite", "string"],
    "Draw a bicycle.": ["bicycle", "bike"],
    "Draw a coffee mug.": ["mug", "coffee"],
    "Draw a bridge.": ["bridge", "arch"],
    "Draw an airplane.": ["airplane", "plane"],
    "Draw a guitar.": ["guitar", "strings"],
    "Draw a lighthouse.": ["lighthouse", "beacon"],
    "Draw an umbrella.": ["umbrella", "parasol"],
    "Draw a camera.": ["camera", "lens"],
    "Draw a rocket.": ["rocket", "spaceship"],
    "Draw a mountain.": ["mountain", "peak"],
    "Draw a laptop.": ["laptop", "notebook"],
    "Draw a book.": ["book", "pages"],
    "Draw a clock.": ["clock", "time"],
    "Draw a donut.": ["donut", "doughnut"],
    "Draw a fish.": ["fish", "fin"],
    "Draw a robot.": ["robot", "bot"],
    "Draw a snowman.": ["snowman", "snow"],
    "Draw a backpack.": ["backpack", "bag"],
    "Draw a basketball.": ["basketball", "ball"],
  };
  return map[prompt] || extractSimpleKeywords(prompt).slice(0, 2);
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function extractSimpleKeywords(text) {
  const stop = new Set(["the", "a", "an", "on", "in", "at", "with", "of", "our", "to"]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w && !stop.has(w));
}