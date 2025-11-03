# Component Structure

## File Organization

```
src/
├── App.js (Main orchestrator - 70 lines)
├── App_backup.js (Original monolithic version - backup)
├── components/
│   ├── CongratsModal.js (Congratulations screen between stages)
│   ├── DrawingStage.js (5 drawing rounds - Chapter 1-5)
│   ├── RiddleStage.js (Ancient riddle puzzle - Trial 1/4)
│   ├── MindlockStage.js (4-dial code puzzle - Trial 2/4)
│   ├── LogicCircuitStage.js (7-input circuit puzzle - Trial 3/4)
│   ├── DecryptionStage.js (2-step decryption - Trial 4/4)
│   └── CompleteStage.js (Final victory screen)
```

## Component Responsibilities

### App.js
- **Purpose**: Main application orchestrator
- **State Management**:
  - `currentStage`: Tracks which stage is active
  - `showCongrats`: Controls congratulations modal display
  - `congratsMessage`: Message to show in congrats modal
  - `qrCodeData`: QR code data for decryption stage
- **Functions**:
  - Stage completion handlers for each component
  - Navigation between stages via `handleContinue()`

### CongratsModal.js
- **Props**: `message`, `onContinue`
- **Purpose**: Reusable congratulations screen shown between stages
- **Features**: Full-screen modal with celebration emoji and continue button

### DrawingStage.js
- **Props**: `onComplete(message, allComplete)`
- **Purpose**: 5 drawing rounds where players collect letters
- **Features**:
  - Canvas drawing interface
  - AI guess integration
  - Timer and attempts tracking
  - Letter collection (Q-U-E-S-T)
  - Journey log sidebar
- **Calls parent**: When round complete or all 5 rounds done

### RiddleStage.js
- **Props**: `onComplete(message)`
- **Purpose**: Ancient riddle puzzle
- **Features**:
  - Displays collected letters
  - Riddle question and answer input
  - Answer validation (correct answer: "creativity")
- **Calls parent**: When riddle solved correctly

### MindlockStage.js
- **Props**: `onComplete(message)`
- **Purpose**: 4-dial digital lock puzzle
- **Features**:
  - 4 number input dials (5 digits total: 31063)
  - Hint cards for each dial
  - Code validation
- **Calls parent**: When correct code entered

### LogicCircuitStage.js
- **Props**: `onComplete(message)`
- **Purpose**: Logic circuit with 7 inputs and 3 outputs
- **Features**:
  - 7 toggle switches (A-G)
  - 3 output formulas
  - Real-time output status display
  - Auto-detection when all outputs are green
- **Calls parent**: When circuit solved (all outputs ON)

### DecryptionStage.js
- **Props**: `qrCodeData`, `onComplete(message)`
- **Purpose**: Two-step decryption challenge
- **Features**:
  - QR code display
  - Two input fields:
    1. Decryption method (base64, caesar, complete)
    2. Decrypted key verification
  - Step-by-step feedback
  - Caesar cipher + Base64 decryption
- **Calls parent**: When final code verified

### CompleteStage.js
- **Props**: None
- **Purpose**: Final victory screen
- **Features**:
  - Master Collaborator badge display
  - Final code reveal
  - Celebration message

## Data Flow

```
App.js (State Manager)
    ↓
    ├─→ DrawingStage → onComplete(msg, isComplete) → App updates stage
    ├─→ CongratsModal → onContinue() → App changes stage
    ├─→ RiddleStage → onComplete(msg) → App updates stage
    ├─→ CongratsModal → onContinue() → App changes stage
    ├─→ MindlockStage → onComplete(msg) → App updates stage
    ├─→ CongratsModal → onContinue() → App changes stage
    ├─→ LogicCircuitStage → onComplete(msg) → App updates stage + sets QR data
    ├─→ CongratsModal → onContinue() → App changes stage
    ├─→ DecryptionStage → onComplete(msg) → App updates stage
    ├─→ CongratsModal → onContinue() → App changes stage
    └─→ CompleteStage (Final screen - no callbacks)
```

## Benefits of Component Structure

1. **Separation of Concerns**: Each stage is self-contained
2. **Maintainability**: Easy to update individual puzzles
3. **Reusability**: Components can be reused or extended
4. **Readability**: Main App.js is only ~70 lines vs 900+ lines
5. **Testing**: Each component can be tested independently
6. **Scalability**: Easy to add new stages or modify existing ones

## Stage Flow

```
Drawing (5 rounds) 
  → 🎉 Congrats
  → Riddle
  → 🎉 Congrats
  → Mindlock
  → 🎉 Congrats
  → Logic Circuit
  → 🎉 Congrats
  → Decryption
  → 🎉 Congrats
  → Complete (Final Badge)
```
