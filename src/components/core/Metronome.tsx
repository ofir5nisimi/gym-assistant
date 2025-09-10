import { useState, useRef, useEffect } from 'react';
import './Metronome.css';

export default function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const playTick = () => {
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

    // Configure the tick sound (short, sharp click)
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // 1kHz frequency
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
    
    // Play immediately on start
    playTick();
    
    // Set interval for 60 BPM (1000ms = 1 second)
    intervalRef.current = setInterval(() => {
      playTick();
    }, 1000);
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

  return (
    <div className="metronome">
      <button 
        onClick={toggleMetronome}
        className={`metronome-btn ${isPlaying ? 'playing' : ''}`}
        title={isPlaying ? 'Stop Tempo (60 BPM)' : 'Start Tempo (60 BPM)'}
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
      {isPlaying && (
        <div className="tempo-indicator">
          <span className="bpm-text">60 BPM</span>
        </div>
      )}
    </div>
  );
}
