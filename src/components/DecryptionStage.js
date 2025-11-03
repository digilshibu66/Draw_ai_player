import React, { useState } from 'react';
import { QRCodeSVG } from "qrcode.react";

const ENCRYPTED_QR_MESSAGE = "Q01RV0stMDE=";
const LOGIC_PUZZLE_CODE = "SIGMA-01";
const CAESAR_SHIFT = 10;

export default function DecryptionStage({ qrCodeData, onComplete }) {
  const [decryptionKey, setDecryptionKey] = useState("");
  const [decryptionResult, setDecryptionResult] = useState("");
  const [currentDecryptionStep, setCurrentDecryptionStep] = useState(0);
  const [decryptedMessage, setDecryptedMessage] = useState("");

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

  const submitDecryptionResult = () => {
    if (!decryptionResult.trim()) {
      setDecryptedMessage("❌ Please enter the decrypted result.");
      return;
    }
    
    const input = decryptionResult.trim();
    
    if (currentDecryptionStep === 0.5) {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      if (input === base64Decoded) {
        setDecryptedMessage(`✅ Correct! "${input}" is the right key!\n\n🎉 Base64 decryption verified!\n\n💡 Next Clue: The letters look shifted.Type "caesar" in the method field above!`);
        setDecryptionResult("");
        setCurrentDecryptionStep(1);
      } else {
        setDecryptedMessage(`❌ Wrong key.`);
      }
      return;
    }
    
    if (currentDecryptionStep === 1.5) {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const caesarDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      if (input === caesarDecrypted) {
        setDecryptedMessage(`✅ Perfect! "${input}" is correct!\n\n🎉 Caesar decryption verified!\n\n💡 Final Step: Type "complete" in the method field above to finish the challenge!`);
        setDecryptionResult("");
        setCurrentDecryptionStep(2);
      } else {
        setDecryptedMessage(`❌ Wrong key.`);
      }
      return;
    }
    
    if (currentDecryptionStep === 2 && input === 'complete') {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const finalDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      setDecryptedMessage(`✅ Perfect! You typed "complete"\n\n🔑 Your final decrypted key is: ${finalDecrypted}\n\n💡 Enter this key below to complete the challenge!`);
      setDecryptionKey("");
      setCurrentDecryptionStep(2.5);
      return;
    }
    
    if (currentDecryptionStep === 2.5) {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const finalDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      if (input === finalDecrypted) {
        setDecryptedMessage(`✅ Excellent! "${input}" is the final code!\n\n🏆 You got it right! This is the secret code!`);
        setDecryptionResult("");
        setTimeout(() => {
          onComplete(`🏆 Decryption Successful!You are a Master Collaborator!`);
        }, 2000);
      } else {
        setDecryptedMessage(`❌ Wrong key.`);
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
    
    if (currentDecryptionStep === 1 && input === 'caesar') {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const caesarDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      setDecryptedMessage(`✅ Correct! You typed "caesar"\n\n 💡 Clue:10 Shifts.Now enter the decrypted key in the field below to verify!`);
      setDecryptionKey("");
      setCurrentDecryptionStep(1.5);
      return;
    }
    
    if (input === 'complete') {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      const finalDecrypted = caesarDecrypt(base64Decoded, CAESAR_SHIFT);
      setDecryptedMessage(`✅ Perfect! You typed "complete"\n\n💡 Enter the decrypted key below to complete the challenge!`);
      setDecryptionKey("");
      setCurrentDecryptionStep(2.5);
      return;
    }
    
    if (currentDecryptionStep === 0 && input === 'base64') {
      const base64Decoded = atob(ENCRYPTED_QR_MESSAGE);
      setDecryptedMessage(`✅ Correct! You typed "base64"\n\n💡 Now enter the decrypted key in the field below to proceed!`);
      setDecryptionKey("");
      setCurrentDecryptionStep(0.5);
      return;
    }
    
    setDecryptedMessage("❌ Unknown method or wrong step. Follow the instructions above.");
  };

  return (
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
                      <li><strong>Step 1:</strong> The data looks like Base64 (notice the "=" padding). </li>
                      <li><strong>Step 2:</strong> After Base64, you'll get shifted letters (Caesar cipher).</li>
                      {/* <li><strong>Quick Solution:</strong> Want to decrypt everything at once?</li> */}
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
                    placeholder="Enter the decryption method" 
                    value={decryptionKey} 
                    onChange={(e) => setDecryptionKey(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && attemptDecryptionMethod()} 
                  />
                  <button className="btn btn-warning" onClick={attemptDecryptionMethod}>🔑 Get Key</button>
                </div>
                <div className="small text-muted mt-1">💡 Type the decryption method name</div>
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
  );
}
