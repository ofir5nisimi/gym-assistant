import { useState } from 'react';
import type { Exercise } from './ExerciseRow';
import ExerciseAutocomplete from './ExerciseAutocomplete';
import PlateCalculator from '../core/PlateCalculator';

interface ExerciseCardProps {
  exercise: Exercise;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Exercise, value: string | number) => void;
}

export default function ExerciseCard({ exercise, onRemove, onUpdate }: ExerciseCardProps) {
  const [editingField, setEditingField] = useState<keyof Exercise | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [showPlateCalculator, setShowPlateCalculator] = useState(false);

  const handleFieldClick = (field: keyof Exercise) => {
    if (field === 'id') return;
    setEditingField(field);
    setTempValue(String(exercise[field]));
  };

  const handleInputBlur = () => {
    if (editingField) {
      let value: string | number = tempValue;
      
      if (editingField === 'sets' || editingField === 'reps' || editingField === 'weight') {
        const numValue = parseFloat(tempValue);
        value = isNaN(numValue) ? 0 : numValue;
      }
      
      onUpdate(exercise.id, editingField, value);
      setEditingField(null);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
    if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const renderMobileField = (field: keyof Exercise, value: string | number, placeholder: string) => {
    if (editingField === field) {
      if (field === 'name') {
        return (
          <ExerciseAutocomplete
            value={tempValue}
            onChange={setTempValue}
            onBlur={handleInputBlur}
            autoFocus
            placeholder={placeholder}
            className="mobile-input"
          />
        );
      } else {
        return (
          <input
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            autoFocus
            className="mobile-input"
            step={field === 'weight' ? '0.5' : '1'}
            placeholder={placeholder}
          />
        );
      }
    }
    
    return (
      <div 
        onClick={() => handleFieldClick(field)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFieldClick(field);
          }
        }}
        className="mobile-editable-field"
        title="Tap to edit"
        tabIndex={0}
        role="button"
        aria-label={`Edit ${field}: ${value || placeholder}`}
      >
        {value || placeholder}
      </div>
    );
  };

  return (
    <div className="mobile-exercise-card">
      <div className="mobile-card-header">
        <div className="mobile-exercise-name">
          {renderMobileField('name', exercise.name, 'Exercise name')}
        </div>
        <button 
          onClick={() => onRemove(exercise.id)}
          className="mobile-remove-btn"
          title="Remove exercise"
          aria-label={`Remove ${exercise.name || 'exercise'}`}
        >
          🗑️
        </button>
      </div>
      
      <div className="mobile-stats-grid">
        <div className="mobile-stat">
          <div className="mobile-stat-label">Sets</div>
          <div className="mobile-stat-value">
            {renderMobileField('sets', exercise.sets, '0')}
          </div>
        </div>
        
        <div className="mobile-stat">
          <div className="mobile-stat-label">Reps</div>
          <div className="mobile-stat-value">
            {renderMobileField('reps', exercise.reps, '0')}
          </div>
        </div>
        
        <div className="mobile-stat">
          <div className="mobile-stat-label">Weight (kg)</div>
          <div className="mobile-stat-value">
            {renderMobileField('weight', exercise.weight, '0')}
            {exercise.weight > 0 && (
              <button 
                onClick={() => setShowPlateCalculator(true)}
                className="mobile-calculator-btn"
                title="Plate Calculator"
                aria-label="Open plate calculator"
              >
                🧮
              </button>
            )}
          </div>
        </div>
      </div>
      
      <PlateCalculator
        targetWeight={exercise.weight}
        isOpen={showPlateCalculator}
        onClose={() => setShowPlateCalculator(false)}
        onWeightChange={(weight) => onUpdate(exercise.id, 'weight', weight)}
      />
    </div>
  );
}
