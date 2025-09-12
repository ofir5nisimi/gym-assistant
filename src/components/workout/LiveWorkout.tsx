import { useState } from 'react';
import useWorkoutStore from '../../hooks/useWorkoutStore';
import type { LoggedSet } from '../../hooks/useWorkoutStore';
import { useToast } from '../../hooks/useToast';
import './LiveWorkout.css';

export default function LiveWorkout() {
  const { 
    currentWorkoutLog, 
    finishWorkout, 
    cancelWorkout, 
    updateLoggedSet 
  } = useWorkoutStore();
  
  const { showSuccess, showInfo } = useToast();
  const [notes, setNotes] = useState('');
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  if (!currentWorkoutLog) return null;

  const startTime = new Date(currentWorkoutLog.date);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  });

  const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / 60000);

  const handleSetToggle = (exerciseId: string, setIndex: number) => {
    const exercise = currentWorkoutLog.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const currentSet = exercise.sets[setIndex];
    const newCompleted = !currentSet.completed;
    
    updateLoggedSet(exerciseId, setIndex, { completed: newCompleted });
    
    if (newCompleted) {
      showSuccess(`Set ${setIndex + 1} completed!`);
    }
  };

  const handleSetUpdate = (exerciseId: string, setIndex: number, field: keyof LoggedSet, value: number) => {
    updateLoggedSet(exerciseId, setIndex, { [field]: value });
  };

  const handleFinishWorkout = () => {
    finishWorkout(notes.trim() || undefined);
    showSuccess('Workout completed and saved!');
    setShowFinishDialog(false);
  };

  const handleCancelWorkout = () => {
    if (window.confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      cancelWorkout();
      showInfo('Workout cancelled');
    }
  };

  const totalSets = currentWorkoutLog.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = currentWorkoutLog.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(set => set.completed).length, 
    0
  );

  return (
    <div className="live-workout">
      <div className="live-workout-header">
        <div className="workout-info">
          <h1>{currentWorkoutLog.planName}</h1>
          <div className="workout-stats">
            <span className="elapsed-time">{elapsedMinutes} min</span>
            <span className="set-progress">{completedSets}/{totalSets} sets</span>
          </div>
        </div>
        
        <div className="workout-actions">
          <button 
            onClick={() => setShowFinishDialog(true)}
            className="finish-btn"
            disabled={completedSets === 0}
          >
            Finish Workout
          </button>
          <button 
            onClick={handleCancelWorkout}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="exercises-list">
        {currentWorkoutLog.exercises.map((exercise) => (
          <div key={exercise.id} className="live-exercise">
            <h3 className="exercise-name">{exercise.name}</h3>
            
            <div className="sets-grid">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className={`set-row ${set.completed ? 'completed' : ''}`}>
                  <div className="set-number">Set {setIndex + 1}</div>
                  
                  <div className="set-inputs">
                    <div className="input-group">
                      <label>Reps:</label>
                      <input
                        type="number"
                        min="0"
                        value={set.reps}
                        onChange={(e) => handleSetUpdate(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                        className="set-input"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label>Weight:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight}
                        onChange={(e) => handleSetUpdate(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                        className="set-input"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSetToggle(exercise.id, setIndex)}
                    className={`complete-btn ${set.completed ? 'completed' : ''}`}
                    title={set.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {set.completed ? '✓' : '○'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showFinishDialog && (
        <div className="finish-dialog-overlay">
          <div className="finish-dialog">
            <h3>Finish Workout</h3>
            <p>Great job! You completed {completedSets} out of {totalSets} sets.</p>
            
            <div className="notes-section">
              <label htmlFor="workout-notes">Notes (optional):</label>
              <textarea
                id="workout-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the workout feel? Any observations..."
                rows={3}
              />
            </div>
            
            <div className="dialog-actions">
              <button onClick={handleFinishWorkout} className="confirm-finish-btn">
                Save Workout
              </button>
              <button onClick={() => setShowFinishDialog(false)} className="cancel-dialog-btn">
                Continue Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
