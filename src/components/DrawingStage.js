import React, { useRef, useState, useEffect } from "react";

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
  "Draw a tree.",
  "Draw a house.",
  "Draw a car.",
  "Draw a sun.",
  "Draw a flower.",
  "Draw a boat.",
  "Draw a star.",
  "Draw a fish.",
  "Draw a bird.",
  "Draw a clock.",
];

const TOTAL_ROUNDS = 10;
const FINAL_QUESTION = "innovation";
const MAX_ATTEMPTS = 5;
const ROUND_TIME_SEC = 180;

function getKeywordsForPrompt(prompt) {
  const map = {
    "Draw a kite.": ["kite", "string"],
    "Draw a bicycle.": ["bicycle", "bike"],
    "Draw a coffee mug.": ["mug", "coffee"],
    "Draw a bridge.": ["bridge", "arch"],
    "Draw an airplane.": ["airplane", "plane"],
    "Draw a guitar.": ["guitar", "strings"],
    "Draw a lighthouse.": ["lighthouse", "beacon"],
    "Draw a camera.": ["camera", "lens"],
    "Draw a rocket.": ["rocket", "spaceship"],
    "Draw a mountain.": ["mountain", "peak"],
    "Draw a tree.": ["tree", "plant"],
    "Draw a house.": ["house", "building"],
    "Draw a car.": ["car", "vehicle"],
    "Draw a sun.": ["sun", "circle"],
    "Draw a flower.": ["flower", "plant"],
    "Draw a boat.": ["boat", "ship"],
    "Draw a star.": ["star", "shape"],
    "Draw a fish.": ["fish", "animal"],
    "Draw a bird.": ["bird", "animal"],
    "Draw a clock.": ["clock", "time"],
  };
  return map[prompt] || [prompt.toLowerCase().replace(/[^a-z]/g, "")];
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DrawingStage({ onComplete }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guess, setGuess] = useState("");
  const [roundIndex, setRoundIndex] = useState(0);
  const [promptOrder, setPromptOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [aiGuessedCorrect, setAiGuessedCorrect] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SEC);
  const [unlockedLetters, setUnlockedLetters] = useState(Array(TOTAL_ROUNDS).fill(null));
  const [achievements, setAchievements] = useState([]);

  const currentPromptIndex = promptOrder[roundIndex] ?? 0;
  const currentPrompt = PROMPTS[currentPromptIndex] ?? PROMPTS[0];

  useEffect(() => {
    const order = shuffleArray(Array.from({ length: PROMPTS.length }, (_, i) => i));
    setPromptOrder(order);
  }, []);

  useEffect(() => {
    setTimeLeft(ROUND_TIME_SEC);
  }, [roundIndex]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, roundIndex]);

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

  const submitDrawing = async () => {
    if (!canvasRef.current) return;
    setLoading(true);
    const dataURL = canvasRef.current.toDataURL("image/png");
    // Strip the "data:image/png;base64," prefix - backend only needs the base64 string
    const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, "");
    
    try {
      const response = await fetch("http://192.168.1.77:5000/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("API Error:", errorData);
        setGuess(`Error: ${errorData.error || errorData.message || "AI service error"}`);
        setAttempts((a) => a + 1);
        return;
      }
      
      const data = await response.json();
      
      // Check if there's an error in the response
      if (data.error) {
        console.error("AI Error:", data.error);
        setGuess(`AI Error: ${data.error}`);
        setAttempts((a) => a + 1);
        return;
      }
      
      const guessedLabel = data.guess?.toLowerCase() || "";
      setGuess(guessedLabel || "No guess returned");
      setAttempts((a) => a + 1);

      const acceptable = getKeywordsForPrompt(currentPrompt);
      const correct = acceptable.some((kw) => guessedLabel.includes(kw));
      setAiGuessedCorrect(correct);

      if (correct) {
        setScore((s) => s + 10);
        const letter = FINAL_QUESTION[roundIndex];
        setUnlockedLetters((prev) => {
          const updated = [...prev];
          updated[roundIndex] = letter;
          return updated;
        });
        setAchievements((prev) => [
          ...prev,
          { round: roundIndex + 1, prompt: currentPrompt, letter },
        ]);
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setGuess(`Error: ${err.message || "Cannot connect to AI server. Is it running on port 5000?"}`);
      setAttempts((a) => a + 1);
    } finally {
      setLoading(false);
    }
  };

  const nextRound = () => {
    if (roundIndex < TOTAL_ROUNDS - 1) {
      // Not the last round - just advance to next drawing round internally
      proceedToNextRound();
    } else {
      // Last round complete - move to next stage (Riddle)
      onComplete(`🌟 All Chapters Complete! You've collected all ${TOTAL_ROUNDS} sacred letters! The final trials await...`, true);
    }
  };

  const proceedToNextRound = () => {
    const nextR = roundIndex + 1;
    setRoundIndex(nextR);
    clearCanvas();
    setAttempts(0);
    setAiGuessedCorrect(null);
  };

  const canAdvance = aiGuessedCorrect === true || attempts >= MAX_ATTEMPTS || timeLeft === 0;
  const progressString = unlockedLetters.map((ch) => (ch ? ch : "_"));
  const isGameComplete = roundIndex === TOTAL_ROUNDS - 1 && canAdvance;

  return (
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
          {isGameComplete && (
            <div className="card shadow-sm mt-3">
              <div className="card-header bg-light fw-semibold">🚪 The Final Gate</div>
              <div className="card-body">
                <div className="alert alert-success mb-3">
                  <strong>⚡ All Chapters Complete!</strong> You have collected all the sacred letters. 
                  Click "Complete Drawings →" above to proceed to the Ancient Riddle!
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
  );
}
