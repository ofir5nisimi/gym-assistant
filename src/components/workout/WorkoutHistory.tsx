import { useState } from 'react';
import useWorkoutStore from '../../hooks/useWorkoutStore';
import type { WorkoutLog } from '../../hooks/useWorkoutStore';
import './WorkoutHistory.css';

export default function WorkoutHistory() {
  const { getWorkoutHistory } = useWorkoutStore();
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  
  const workoutHistory = getWorkoutHistory();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateStats = (workout: WorkoutLog) => {
    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = workout.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(set => set.completed).length, 
      0
    );
    const totalVolume = workout.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((setSum, set) => 
        set.completed ? setSum + (set.reps * set.weight) : setSum, 0
      ), 0
    );
    
    return { totalSets, completedSets, totalVolume };
  };

  const toggleWorkoutDetails = (workoutId: string) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  if (workoutHistory.length === 0) {
    return (
      <div className="workout-history">
        <div className="history-header">
          <h2>Workout History</h2>
        </div>
        <div className="empty-history">
          <div className="empty-icon">📊</div>
          <h3>No workouts logged yet</h3>
          <p>Start your first workout to see your progress here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-history">
      <div className="history-header">
        <h2>Workout History</h2>
        <div className="history-stats">
          <span className="total-workouts">{workoutHistory.length} workouts</span>
        </div>
      </div>

      <div className="workouts-list">
        {workoutHistory.map((workout) => {
          const stats = calculateStats(workout);
          const isExpanded = expandedWorkout === workout.id;

          return (
            <div key={workout.id} className={`workout-card ${isExpanded ? 'expanded' : ''}`}>
              <div 
                className="workout-summary"
                onClick={() => toggleWorkoutDetails(workout.id)}
              >
                <div className="workout-main-info">
                  <h3 className="workout-plan-name">{workout.planName}</h3>
                  <div className="workout-date">{formatDate(workout.date)}</div>
                </div>
                
                <div className="workout-quick-stats">
                  <div className="stat">
                    <span className="stat-value">{stats.completedSets}/{stats.totalSets}</span>
                    <span className="stat-label">sets</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{formatDuration(workout.duration)}</span>
                    <span className="stat-label">duration</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{stats.totalVolume.toLocaleString()}</span>
                    <span className="stat-label">kg total</span>
                  </div>
                </div>
                
                <div className="expand-indicator">
                  {isExpanded ? '▼' : '▶'}
                </div>
              </div>

              {isExpanded && (
                <div className="workout-details">
                  {workout.notes && (
                    <div className="workout-notes">
                      <h4>Notes:</h4>
                      <p>{workout.notes}</p>
                    </div>
                  )}
                  
                  <div className="exercises-breakdown">
                    <h4>Exercises:</h4>
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id} className="exercise-summary">
                        <h5>{exercise.name}</h5>
                        <div className="sets-summary">
                          {exercise.sets.map((set, index) => (
                            <div key={index} className={`set-summary ${set.completed ? 'completed' : 'skipped'}`}>
                              <span className="set-number">Set {index + 1}:</span>
                              <span className="set-details">
                                {set.reps} reps × {set.weight}kg
                              </span>
                              <span className="set-status">
                                {set.completed ? '✓' : '○'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
