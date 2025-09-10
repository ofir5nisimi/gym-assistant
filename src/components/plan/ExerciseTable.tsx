import ExerciseRow, { type Exercise } from './ExerciseRow';
import ExerciseCard from './ExerciseCard';
import './ExerciseTable.css';

interface ExerciseTableProps {
  exercises: Exercise[];
  onRemoveExercise: (id: string) => void;
  onUpdateExercise: (id: string, field: keyof Exercise, value: string | number) => void;
}

export default function ExerciseTable({ exercises, onRemoveExercise, onUpdateExercise }: ExerciseTableProps) {
  return (
    <div className="exercise-table-container">
      {/* Desktop Table Layout */}
      <table className="exercise-table">
        <thead>
          <tr>
            <th>Exercise Name</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Weight (kg)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <ExerciseRow 
              key={exercise.id} 
              exercise={exercise} 
              onRemove={onRemoveExercise}
              onUpdate={onUpdateExercise}
            />
          ))}
        </tbody>
      </table>

      {/* Mobile Card Layout */}
      <div className="mobile-exercise-list">
        {exercises.length === 0 ? (
          <div className="empty-state">
            <p>No exercises added yet. Click "Add Exercise" to get started!</p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onRemove={onRemoveExercise}
              onUpdate={onUpdateExercise}
            />
          ))
        )}
      </div>
    </div>
  );
}
