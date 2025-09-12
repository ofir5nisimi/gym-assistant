import { useState, useRef, useEffect } from 'react';
import useWorkoutStore from '../../hooks/useWorkoutStore';
import type { ExerciseLibraryItem } from '../../hooks/useWorkoutStore';
import './ExerciseAutocomplete.css';

interface ExerciseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export default function ExerciseAutocomplete({ 
  value, 
  onChange, 
  onBlur, 
  placeholder = "Exercise name",
  autoFocus = false,
  className = ""
}: ExerciseAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { searchExerciseLibrary, addExerciseToLibrary } = useWorkoutStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get filtered suggestions
  const suggestions = searchExerciseLibrary(value);
  const showSuggestions = isOpen && value.length > 0 && suggestions.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length > 0);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    if (value.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Small delay to allow for suggestion clicks
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
      onBlur?.();
    }, 150);
  };

  const handleSuggestionClick = (suggestion: ExerciseLibraryItem) => {
    onChange(suggestion.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter' && value.trim() && suggestions.length === 0) {
        // Add new exercise to library if it doesn't exist
        addExerciseToLibrary(value.trim());
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        } else if (value.trim()) {
          // Add new exercise if none selected
          addExerciseToLibrary(value.trim());
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className={`exercise-autocomplete ${className}`} ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="exercise-autocomplete-input"
        autoComplete="off"
      />
      
      {showSuggestions && (
        <div className="exercise-autocomplete-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`exercise-autocomplete-item ${
                index === highlightedIndex ? 'highlighted' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="exercise-name">{suggestion.name}</div>
              {suggestion.category && (
                <div className="exercise-category">{suggestion.category}</div>
              )}
              {suggestion.description && (
                <div className="exercise-description">{suggestion.description}</div>
              )}
            </div>
          ))}
          
          {value.trim() && !suggestions.some(s => s.name.toLowerCase() === value.toLowerCase()) && (
            <div className="exercise-autocomplete-add">
              <div className="add-new-exercise">
                ➕ Add "{value}" to exercise library
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
