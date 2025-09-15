import { useState, useRef, useEffect } from 'react';
import './Metronome.css';

type MetronomeMode = 'basic' | 'advanced' | 'voice';

export default function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<MetronomeMode>('basic');
  const [tempo, setTempo] = useState({ eccentric: 2, concentric: 4 });
  const [voiceConfig, setVoiceConfig] = useState({ maxCycles: 8 });
  const [currentPhase, setCurrentPhase] = useState(0); // 0=eccentric, 1=concentric
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
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

  const speakNumber = (number: number) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(number.toString());
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Try to use a clear, neutral voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && !voice.name.includes('Google')
      ) || voices[0];
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

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

    // Different frequencies for different phases in advanced/voice modes
    let frequency = 1000; // Default frequency
    if ((mode === 'advanced' || mode === 'voice') && phase !== undefined) {
      const frequencies = [600, 800]; // eccentric, concentric
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
    setCurrentCycle(0); // Set to 0 for initial prep cycle
    
    switch (mode) {
      case 'basic':
        startBasicTempo();
        break;
      case 'advanced':
        startAdvancedTempo();
        break;
      case 'voice':
        startVoiceTempo();
        break;
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
    const phases = [tempo.eccentric, tempo.concentric];
    
    // Check if all phases are zero - fallback to basic mode
    const hasNonZeroPhase = phases.some(phase => phase > 0);
    if (!hasNonZeroPhase) {
      startBasicTempo();
      return;
    }
    
    let currentPhaseIndex = 0; // Start with eccentric
    let currentCount = 1; // Start counting from 1
    
    setCurrentPhase(currentPhaseIndex);
    setPhaseProgress(1); // Show 1 initially
    
    // Play first tick immediately
    playTick(currentPhaseIndex);
    
    intervalRef.current = setInterval(() => {
      currentCount++;
      setPhaseProgress(currentCount);
      
      if (currentCount > phases[currentPhaseIndex]) {
        // Switch between eccentric (0) and concentric (1)
        currentPhaseIndex = currentPhaseIndex === 0 ? 1 : 0;
        currentCount = 1; // Reset to 1 for next phase
        setCurrentPhase(currentPhaseIndex);
        setPhaseProgress(1); // Start next phase at 1
      }
      
      playTick(currentPhaseIndex);
    }, 1000); // 1 second intervals
  };

  const startVoiceTempo = () => {
    const { maxCycles } = voiceConfig;
    const concentricBeats = tempo.concentric;
    
    // Validate configuration
    if (concentricBeats <= 0 || maxCycles <= 0) {
      startBasicTempo();
      return;
    }
    
    let cycleNumber = 0; // Current cycle (rep) number (0 for initial, then 1+)
    let beatInCycle = 0; // Current beat within the concentric phase (0 = voice/prep, 1+ = beeps)
    let isInitialCycle = true; // Flag for the very first cycle after starting metronome
    
    setCurrentPhase(1); // Always concentric phase
    setCurrentCycle(0); // Show 0 for initial prep cycle
    setPhaseProgress(0); // Start at 0 for prep
    
    // Initial setup for the first cycle (no voice)
    playTick(1); // Play first beep immediately for the prep cycle
    
    intervalRef.current = setInterval(() => {
      beatInCycle++;
      setPhaseProgress(beatInCycle);
      
      if (isInitialCycle) {
        // During the initial prep cycle, only play beeps
        if (beatInCycle < concentricBeats) {
          playTick(1); // Play beep for concentric beats
        } else if (beatInCycle === concentricBeats) {
          // Prep cycle complete, transition to first counted cycle
          isInitialCycle = false;
          cycleNumber = 1;
          setCurrentCycle(cycleNumber);
          beatInCycle = 0; // Reset to voice/start of counted cycle
          setPhaseProgress(0);
          
          // Speak the first cycle number immediately
          speakNumber(cycleNumber);
        } // If beatInCycle > concentricBeats, it's an extra beat for voice, handled next interval

      } else { // Regular counted cycles
        if (beatInCycle <= concentricBeats) {
          // Play beep for concentric beats
          playTick(1); // 1 = concentric phase
        }
        
        if (beatInCycle >= concentricBeats) {
          // Cycle complete, move to next
          cycleNumber++;
          
          // Loop back to 1 if we exceed maxCycles
          if (cycleNumber > maxCycles) {
            cycleNumber = 1;
          }
          
          setCurrentCycle(cycleNumber);
          beatInCycle = 0; // Reset to voice/start of next cycle
          setPhaseProgress(0);
          
          // Speak the next cycle number immediately
          speakNumber(cycleNumber);
        }
      }
    }, 1000); // 1 second intervals
  };

  const stopMetronome = () => {
    setIsPlaying(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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

  const phaseNames = ['Eccentric', 'Concentric'];
  const phaseColors = ['#dc3545', '#28a745'];

  const getModeTitle = () => {
    switch (mode) {
      case 'basic': return 'Basic Tempo (60 BPM)';
      case 'advanced': return 'Advanced Tempo Controller';
      case 'voice': return 'Voice Counting Metronome';
    }
  };

  const getNextMode = (): MetronomeMode => {
    switch (mode) {
      case 'basic': return 'advanced';
      case 'advanced': return 'voice';
      case 'voice': return 'basic';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'basic': return '⚡';
      case 'advanced': return '🔧';
      case 'voice': return '🗣️';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'basic': return 'Basic';
      case 'advanced': return 'Advanced';
      case 'voice': return 'Voice';
    }
  };

  return (
    <div className="metronome">
      <div className="metronome-header">
        <button 
          onClick={toggleMetronome}
          className={`metronome-btn ${isPlaying ? 'playing' : ''}`}
          title={getModeTitle()}
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
          onClick={() => setMode(getNextMode())}
          className={`mode-toggle ${mode}`}
          title={`Switch to ${getModeLabel()} Mode`}
        >
          {getModeIcon()} {getModeLabel()}
        </button>
      </div>

      {mode === 'advanced' && !isPlaying && (
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
              <label>Concentric:</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={tempo.concentric}
                onChange={(e) => setTempo({...tempo, concentric: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>
          <div className="tempo-preview">
            Pattern: {tempo.eccentric}E-{tempo.concentric}C
          </div>
        </div>
      )}

      {mode === 'voice' && !isPlaying && (
        <div className="tempo-controls">
          <h4>Voice Counting Metronome</h4>
          <div className="tempo-inputs">
            <div className="tempo-input-group">
              <label>Concentric Beats:</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={tempo.concentric}
                onChange={(e) => setTempo({...tempo, concentric: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="tempo-input-group">
              <label>Max Cycles:</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={voiceConfig.maxCycles}
                onChange={(e) => setVoiceConfig({
                  ...voiceConfig, 
                  maxCycles: parseInt(e.target.value) || 1
                })}
              />
            </div>
          </div>
          <div className="tempo-preview">
            Pattern: Voice + {tempo.concentric} beeps × {voiceConfig.maxCycles} cycles (loops endlessly)
          </div>
          <div className="voice-info">
            <div className="info-item">🗣️ Voice says cycle number</div>
            <div className="info-item">🔊 Followed by {tempo.concentric} beeps (1 per second)</div>
            <div className="info-item">🔄 Example: "ONE, beep, beep, beep, TWO, beep, beep, beep..."</div>
            <div className="info-item">🔁 Loops: 1→2→...→{voiceConfig.maxCycles}→1→2→...</div>
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="tempo-indicator">
          {mode === 'basic' && (
            <span className="bpm-text">60 BPM</span>
          )}
          
          {mode === 'advanced' && (
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
                {phaseProgress}/{[tempo.eccentric, tempo.concentric][currentPhase]}
              </div>
            </div>
          )}
          
          {mode === 'voice' && (
            <div className="voice-indicator">
              <div className="cycle-counter">
                <span className="cycle-text">
                  {currentCycle === 0 ? 'Prep' : `Cycle ${currentCycle}/${voiceConfig.maxCycles}`}
                </span>
              </div>
              <div className="current-phase">
                <span className="phase-name" style={{ color: phaseColors[1] }}>
                  {phaseProgress === 0 && currentCycle !== 0 ? 'Speaking' : 'Concentric'}
                </span>
                <span className="phase-count">
                  ({phaseProgress === 0 && currentCycle !== 0 ? 'Voice' : `${phaseProgress}/${tempo.concentric}`})
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
