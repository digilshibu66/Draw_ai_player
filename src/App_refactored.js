import React, { useState } from "react";
import CongratsModal from "./components/CongratsModal";
import DrawingStage from "./components/DrawingStage";
import RiddleStage from "./components/RiddleStage";
import MindlockStage from "./components/MindlockStage";
import LogicCircuitStage from "./components/LogicCircuitStage";
import DecryptionStage from "./components/DecryptionStage";
import CompleteStage from "./components/CompleteStage";

const ENCRYPTED_QR_MESSAGE = "Q01RV0stMDE=";

export default function App() {
  const [currentStage, setCurrentStage] = useState("drawing");
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsMessage, setCongratsMessage] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);

  const handleDrawingComplete = (message, allComplete) => {
    setCongratsMessage(message);
    setShowCongrats(true);
    setIsDrawingComplete(allComplete);
  };

  const handleRiddleComplete = (message) => {
    setCongratsMessage(message);
    setShowCongrats(true);
  };

  const handleMindlockComplete = (message) => {
    setCongratsMessage(message);
    setShowCongrats(true);
  };

  const handleLogicComplete = (message) => {
    setCongratsMessage(message);
    setShowCongrats(true);
    setQrCodeData(ENCRYPTED_QR_MESSAGE);
  };

  const handleDecryptionComplete = (message) => {
    setCongratsMessage(message);
    setShowCongrats(true);
  };

  const handleContinue = () => {
    setShowCongrats(false);
    
    if (currentStage === "drawing" && isDrawingComplete) {
      setCurrentStage("riddle");
    } else if (currentStage === "riddle") {
      setCurrentStage("mindlock");
    } else if (currentStage === "mindlock") {
      setCurrentStage("logic");
    } else if (currentStage === "logic") {
      setCurrentStage("decryption");
    } else if (currentStage === "decryption") {
      setCurrentStage("complete");
    }
  };

  if (showCongrats) {
    return <CongratsModal message={congratsMessage} onContinue={handleContinue} />;
  }

  return (
    <div className="container py-4">
      <div className="text-center mb-2 d-flex align-items-center justify-content-center gap-2">
        <img src="/logo192.png" alt="logo" width={42} height={42} style={{ borderRadius: 8 }} />
        <h2 className="m-0">Draw It AI</h2>
      </div>
      
      {currentStage === "drawing" && <DrawingStage onComplete={handleDrawingComplete} />}
      {currentStage === "riddle" && <RiddleStage onComplete={handleRiddleComplete} />}
      {currentStage === "mindlock" && <MindlockStage onComplete={handleMindlockComplete} />}
      {currentStage === "logic" && <LogicCircuitStage onComplete={handleLogicComplete} />}
      {currentStage === "decryption" && <DecryptionStage qrCodeData={qrCodeData} onComplete={handleDecryptionComplete} />}
      {currentStage === "complete" && <CompleteStage />}
    </div>
  );
}
