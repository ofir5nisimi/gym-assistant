import { useState, useEffect } from 'react';
import './PlateCalculator.css';

interface PlateConfig {
  weight: number;
  count: number;
  color?: string;
}

interface PlateCalculatorProps {
  targetWeight: number;
  isOpen: boolean;
  onClose: () => void;
  onWeightChange?: (weight: number) => void;
}

const DEFAULT_PLATES: PlateConfig[] = [
  { weight: 25, count: 4, color: '#dc3545' }, // Red - 25kg
  { weight: 20, count: 4, color: '#007bff' }, // Blue - 20kg  
  { weight: 15, count: 4, color: '#ffc107' }, // Yellow - 15kg
  { weight: 10, count: 4, color: '#28a745' }, // Green - 10kg
  { weight: 5, count: 4, color: '#6c757d' },  // Gray - 5kg
  { weight: 2.5, count: 4, color: '#17a2b8' }, // Cyan - 2.5kg
  { weight: 1.25, count: 4, color: '#6f42c1' }, // Purple - 1.25kg
];

const DEFAULT_BARBELL_WEIGHT = 20; // Standard Olympic barbell

export default function PlateCalculator({ targetWeight, isOpen, onClose, onWeightChange }: PlateCalculatorProps) {
  const [barbellWeight, setBarbellWeight] = useState(DEFAULT_BARBELL_WEIGHT);
  const [availablePlates, setAvailablePlates] = useState<PlateConfig[]>(DEFAULT_PLATES);
  const [customWeight, setCustomWeight] = useState(targetWeight.toString());
  const [showSettings, setShowSettings] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedBarbell = localStorage.getItem('plateCalc-barbellWeight');
    const savedPlates = localStorage.getItem('plateCalc-plates');
    
    if (savedBarbell) {
      setBarbellWeight(parseFloat(savedBarbell));
    }
    if (savedPlates) {
      try {
        setAvailablePlates(JSON.parse(savedPlates));
      } catch (e) {
        console.error('Failed to load plate settings');
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('plateCalc-barbellWeight', barbellWeight.toString());
    localStorage.setItem('plateCalc-plates', JSON.stringify(availablePlates));
  };

  // Calculate optimal plate combination
  const calculatePlates = (weight: number): { plates: { weight: number; count: number; color?: string }[]; totalWeight: number; possible: boolean } => {
    const plateWeight = weight - barbellWeight;
    if (plateWeight <= 0) {
      return { plates: [], totalWeight: barbellWeight, possible: true };
    }

    const perSideWeight = plateWeight / 2;
    const result: { weight: number; count: number; color?: string }[] = [];
    let remainingWeight = perSideWeight;

    // Sort plates by weight (descending)
    const sortedPlates = [...availablePlates].sort((a, b) => b.weight - a.weight);

    for (const plate of sortedPlates) {
      if (remainingWeight >= plate.weight && plate.count > 0) {
        const neededCount = Math.min(
          Math.floor(remainingWeight / plate.weight),
          plate.count
        );
        
        if (neededCount > 0) {
          result.push({
            weight: plate.weight,
            count: neededCount,
            color: plate.color
          });
          remainingWeight -= plate.weight * neededCount;
        }
      }
    }

    const actualWeight = barbellWeight + (result.reduce((sum, p) => sum + p.weight * p.count, 0) * 2);
    const possible = Math.abs(remainingWeight) < 0.01; // Account for floating point precision

    return { plates: result, totalWeight: actualWeight, possible };
  };

  const currentWeight = parseFloat(customWeight) || targetWeight;
  const calculation = calculatePlates(currentWeight);

  const updatePlateCount = (plateWeight: number, newCount: number) => {
    setAvailablePlates(prev => 
      prev.map(plate => 
        plate.weight === plateWeight 
          ? { ...plate, count: Math.max(0, newCount) }
          : plate
      )
    );
  };

  const handleWeightChange = (newWeight: string) => {
    setCustomWeight(newWeight);
    const weight = parseFloat(newWeight);
    if (!isNaN(weight) && weight > 0) {
      onWeightChange?.(weight);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="plate-calculator-overlay" onClick={onClose}>
      <div className="plate-calculator-modal" onClick={e => e.stopPropagation()}>
        <div className="plate-calculator-header">
          <h3>🏋️ Plate Calculator</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="plate-calculator-content">
          {/* Weight Input */}
          <div className="weight-input-section">
            <label>Target Weight (kg):</label>
            <input
              type="number"
              value={customWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
              step="0.5"
              min="0"
              className="weight-input"
            />
          </div>

          {/* Results */}
          <div className="calculation-results">
            {calculation.possible ? (
              <>
                <div className="result-summary">
                  <strong>Load {calculation.totalWeight}kg total</strong>
                  {calculation.totalWeight !== currentWeight && (
                    <span className="weight-diff">
                      ({calculation.totalWeight > currentWeight ? '+' : ''}
                      {(calculation.totalWeight - currentWeight).toFixed(1)}kg)
                    </span>
                  )}
                </div>

                {calculation.plates.length > 0 && (
                  <div className="plates-per-side">
                    <h4>Per side ({barbellWeight}kg barbell):</h4>
                    <div className="plate-visualization">
                      {calculation.plates.map((plate, index) => (
                        <div key={index} className="plate-group">
                          <div 
                            className="plate-visual"
                            style={{ backgroundColor: plate.color || '#6c757d' }}
                          >
                            {plate.weight}kg
                          </div>
                          <div className="plate-count">×{plate.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="impossible-weight">
                ❌ Cannot achieve {currentWeight}kg with available plates
              </div>
            )}
          </div>

          {/* Settings Toggle */}
          <div className="settings-section">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="settings-toggle"
            >
              ⚙️ {showSettings ? 'Hide' : 'Show'} Settings
            </button>

            {showSettings && (
              <div className="settings-panel">
                <div className="barbell-setting">
                  <label>Barbell Weight (kg):</label>
                  <input
                    type="number"
                    value={barbellWeight}
                    onChange={(e) => setBarbellWeight(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    min="0"
                    className="barbell-input"
                  />
                </div>

                <div className="plates-setting">
                  <h4>Available Plates:</h4>
                  {availablePlates.map((plate, index) => (
                    <div key={index} className="plate-setting">
                      <span className="plate-weight">{plate.weight}kg:</span>
                      <input
                        type="number"
                        value={plate.count}
                        onChange={(e) => updatePlateCount(plate.weight, parseInt(e.target.value) || 0)}
                        min="0"
                        max="20"
                        className="plate-count-input"
                      />
                      <span className="plate-label">plates</span>
                    </div>
                  ))}
                </div>

                <button onClick={saveSettings} className="save-settings-btn">
                  💾 Save Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
