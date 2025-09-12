interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

import { useState } from 'react';

interface ExerciseRowProps {
  exercise: Exercise;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Exercise, value: string | number) => void;
}

export default function ExerciseRow({ exercise, onRemove, onUpdate }: ExerciseRowProps) {
  const [editingField, setEditingField] = useState<keyof Exercise | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleCellClick = (field: keyof Exercise) => {
    if (field === 'id') return; // Don't allow editing ID
    setEditingField(field);
    setTempValue(String(exercise[field]));
  };

  const handleInputBlur = () => {
    if (editingField) {
      let value: string | number = tempValue;
      
      // Convert to number for numeric fields
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

  const renderCell = (field: keyof Exercise, value: string | number) => {
    if (editingField === field) {
      return (
        <input
          type={field === 'name' ? 'text' : 'number'}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
          className="cell-input"
          step={field === 'weight' ? '0.5' : '1'}
          placeholder={field === 'name' ? 'Exercise name' : '0'}
        />
      );
    }
    
    return (
      <span 
        onClick={() => handleCellClick(field)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCellClick(field);
          }
        }}
        className="editable-cell"
        title="Click to edit"
        tabIndex={0}
        role="button"
        aria-label={`Edit ${field}: ${value || (field === 'name' ? 'Enter exercise name' : '0')}`}
      >
        {value || (field === 'name' ? 'Enter exercise name' : '0')}
      </span>
    );
  };

  return (
    <tr>
      <td>{renderCell('name', exercise.name)}</td>
      <td>{renderCell('sets', exercise.sets)}</td>
      <td>{renderCell('reps', exercise.reps)}</td>
      <td>{renderCell('weight', exercise.weight)}</td>
      <td>
        <button 
          onClick={() => onRemove(exercise.id)}
          className="remove-btn"
          title="Remove exercise"
          aria-label={`Remove ${exercise.name || 'exercise'}`}
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}

export type { Exercise };
