import { useState, useRef, useEffect } from 'react';
import './Metronome.css';

export default function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [tempo, setTempo] = useState({ eccentric: 2, pause1: 1, concentric: 4, pause2: 1 });
  const [currentPhase, setCurrentPhase] = useState(0); // 0=eccentric, 1=pause1, 2=concentric, 3=pause2
  const [phaseProgress, setPhaseProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    // Create AudioContext on first user interaction to comply with browser policies
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Add event listener for first user interaction
    const handleFirstInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playTick = (phase?: number) => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    
    // Resume AudioContext if it's suspended (browser requirement)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Create oscillator for tick sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Connect oscillator to gain node to audio destination
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different phases in advanced mode
    let frequency = 1000; // Default frequency
    if (isAdvancedMode && phase !== undefined) {
      const frequencies = [600, 400, 800, 400]; // eccentric, pause1, concentric, pause2
      frequency = frequencies[phase] || 1000;
    }

    // Configure the tick sound (short, sharp click)
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'square';

    // Configure volume envelope (quick attack and decay for sharp click)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.001); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1); // Quick decay

    // Play the sound for a short duration
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const startMetronome = () => {
    if (!audioContextRef.current) {
      // Try to initialize AudioContext if it doesn't exist
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    setIsPlaying(true);
    setCurrentPhase(0);
    setPhaseProgress(0);
    
    if (isAdvancedMode) {
      startAdvancedTempo();
    } else {
      startBasicTempo();
    }
  };

  const startBasicTempo = () => {
    // Play immediately on start
    playTick();
    
    // Set interval for 60 BPM (1000ms = 1 second)
    intervalRef.current = setInterval(() => {
      playTick();
    }, 1000);
  };

  const startAdvancedTempo = () => {
    const phases = [tempo.eccentric, tempo.pause1, tempo.concentric, tempo.pause2];
    let currentPhaseIndex = 0;
    let currentCount = 0;
    
    // Play first tick immediately
    playTick(currentPhaseIndex);
    
    intervalRef.current = setInterval(() => {
      currentCount++;
      setPhaseProgress(currentCount);
      
      if (currentCount >= phases[currentPhaseIndex]) {
        // Move to next phase
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        currentCount = 0;
        setCurrentPhase(currentPhaseIndex);
        setPhaseProgress(0);
      }
      
      playTick(currentPhaseIndex);
    }, 1000); // 1 second intervals
  };

  const stopMetronome = () => {
    setIsPlaying(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleMetronome = () => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const phaseNames = ['Eccentric', 'Pause', 'Concentric', 'Pause'];
  const phaseColors = ['#dc3545', '#6c757d', '#28a745', '#6c757d'];

  return (
    <div className="metronome">
      <div className="metronome-header">
        <button 
          onClick={toggleMetronome}
          className={`metronome-btn ${isPlaying ? 'playing' : ''}`}
          title={isAdvancedMode ? 'Advanced Tempo Controller' : 'Basic Tempo (60 BPM)'}
        >
          {isPlaying ? (
            <>
              <span className="metronome-icon">⏸️</span>
              Stop Tempo
            </>
          ) : (
            <>
              <span className="metronome-icon">🎵</span>
              Start Tempo
            </>
          )}
        </button>
        
        <button 
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className={`mode-toggle ${isAdvancedMode ? 'advanced' : 'basic'}`}
          title={isAdvancedMode ? 'Switch to Basic Mode' : 'Switch to Advanced Mode'}
        >
          {isAdvancedMode ? '🔧 Advanced' : '⚡ Basic'}
        </button>
      </div>

      {isAdvancedMode && !isPlaying && (
        <div className="tempo-controls">
          <h4>Tempo Pattern (seconds)</h4>
          <div className="tempo-inputs">
            <div className="tempo-input-group">
              <label>Eccentric:</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={tempo.eccentric}
                onChange={(e) => setTempo({...tempo, eccentric: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="tempo-input-group">
              <label>Pause:</label>
              <input 
                type="number" 
                min="0" 
                max="5" 
                value={tempo.pause1}
                onChange={(e) => setTempo({...tempo, pause1: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="tempo-input-group">
              <label>Concentric:</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={tempo.concentric}
                onChange={(e) => setTempo({...tempo, concentric: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="tempo-input-group">
              <label>Pause:</label>
              <input 
                type="number" 
                min="0" 
                max="5" 
                value={tempo.pause2}
                onChange={(e) => setTempo({...tempo, pause2: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="tempo-preview">
            Pattern: {tempo.eccentric}-{tempo.pause1}-{tempo.concentric}-{tempo.pause2}
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="tempo-indicator">
          {isAdvancedMode ? (
            <div className="advanced-indicator">
              <div className="current-phase">
                <span 
                  className="phase-name"
                  style={{ color: phaseColors[currentPhase] }}
                >
                  {phaseNames[currentPhase]}
                </span>
              </div>
              <div className="phase-progress">
                {phaseProgress}/{[tempo.eccentric, tempo.pause1, tempo.concentric, tempo.pause2][currentPhase]}
              </div>
            </div>
          ) : (
            <span className="bpm-text">60 BPM</span>
          )}
        </div>
      )}
    </div>
  );
}
