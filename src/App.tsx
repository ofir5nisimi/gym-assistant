import { useState } from 'react';
import ExerciseTable from './components/plan/ExerciseTable';
import PlanManager from './components/plan/PlanManager';
import Metronome from './components/core/Metronome';
import DataPortability from './components/core/DataPortability';
import ToastContainer from './components/core/Toast';
import LiveWorkout from './components/workout/LiveWorkout';
import WorkoutHistory from './components/workout/WorkoutHistory';
import useWorkoutStore from './hooks/useWorkoutStore';
import { useToast } from './hooks/useToast';
import type { Exercise } from './components/plan/ExerciseRow';
import './App.css';

function App() {
  const { 
    getActiveExercises, 
    addExercise, 
    removeExercise, 
    updateExercise, 
    getActivePlan,
    isLiveWorkout,
    startWorkout
  } = useWorkoutStore();
  
  const { messages, removeToast, showSuccess, showInfo } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  
  const exercises = getActiveExercises();
  const activePlan = getActivePlan();

  const handleAddExercise = () => {
    addExercise();
    showSuccess('Exercise added successfully!');
  };

  const handleRemoveExercise = (id: string) => {
    const exercise = exercises.find(ex => ex.id === id);
    const exerciseName = exercise?.name || 'Exercise';
    
    if (window.confirm(`Are you sure you want to remove "${exerciseName}"?`)) {
      removeExercise(id);
      showInfo(`"${exerciseName}" removed`);
    }
  };

  const handleUpdateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    updateExercise(id, field, value);
    // Only show toast for name changes to avoid spam
    if (field === 'name' && value) {
      showSuccess('Exercise updated!');
    }
  };

  const handleStartWorkout = () => {
    if (!activePlan || exercises.length === 0) {
      showInfo('Add some exercises to your plan first!');
      return;
    }
    startWorkout();
    showSuccess('Workout started! Good luck! 💪');
  };

  // If in live workout mode, show only the live workout interface
  if (isLiveWorkout) {
    return (
      <div className="app">
        <ToastContainer messages={messages} onRemove={removeToast} />
        <LiveWorkout />
      </div>
    );
  }

  // If showing history, show only the history interface
  if (showHistory) {
    return (
      <div className="app">
        <ToastContainer messages={messages} onRemove={removeToast} />
        
        <header>
          <h1>Gym Assistant</h1>
          <button 
            onClick={() => setShowHistory(false)}
            className="back-btn"
          >
            ← Back to Planner
          </button>
        </header>

        <WorkoutHistory />
      </div>
    );
  }

  return (
    <div className="app">
      <DataPortability />
      <Metronome />
      <ToastContainer messages={messages} onRemove={removeToast} />

      <header>
        <h1>Gym Assistant</h1>
        <p>Your personal workout planner</p>
      </header>

      <nav aria-label="Plan management">
        <PlanManager />
      </nav>

      <main>
        {activePlan && (
          <div className="plan-header">
            <h2 id="current-plan">Current Plan: {activePlan.name}</h2>
            
            <div className="workout-actions">
              <button 
                onClick={handleStartWorkout}
                className="start-workout-btn"
                disabled={exercises.length === 0}
              >
                🏋️ Start Workout
              </button>
              <button 
                onClick={() => setShowHistory(true)}
                className="history-btn"
              >
                📊 View History
              </button>
            </div>
          </div>
        )}

        <section aria-labelledby="current-plan">
          <ExerciseTable 
            exercises={exercises}
            onRemoveExercise={handleRemoveExercise}
            onUpdateExercise={handleUpdateExercise}
          />

          <button 
            onClick={handleAddExercise}
            className="add-exercise-btn"
            aria-describedby="add-exercise-help"
          >
            + Add Exercise
          </button>
          <div id="add-exercise-help" className="sr-only">
            Add a new exercise to your current workout plan
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;