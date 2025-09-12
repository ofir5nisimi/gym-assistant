import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import useWorkoutStore from '../../hooks/useWorkoutStore';
import './ProgressVisualization.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressData {
  date: string;
  weight: number;
  volume: number;
  estimatedOneRM: number;
}

export default function ProgressVisualization() {
  const { getWorkoutHistory, getActiveExercises } = useWorkoutStore();
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [chartType, setChartType] = useState<'weight' | 'volume' | 'oneRM'>('weight');

  const workoutHistory = getWorkoutHistory();
  const exercises = getActiveExercises();

  // Get all unique exercises from workout history
  const allExercises = useMemo(() => {
    const exerciseMap = new Map<string, string>();
    
    // Add exercises from current plans (only if they have names)
    exercises.forEach(ex => {
      if (ex.name.trim()) {
        exerciseMap.set(ex.id, ex.name);
      }
    });
    
    // Add exercises from workout history (only if they have names)
    workoutHistory.forEach(workout => {
      workout.exercises.forEach(ex => {
        if (ex.name.trim()) {
          exerciseMap.set(ex.id, ex.name);
        }
      });
    });
    
    return Array.from(exerciseMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, workoutHistory]);

  // Calculate estimated 1RM using Epley formula: weight * (1 + reps/30)
  const calculateOneRM = (weight: number, reps: number): number => {
    if (reps <= 0 || weight <= 0) return 0;
    return weight * (1 + reps / 30);
  };

  // Process workout data for selected exercise
  const progressData = useMemo(() => {
    if (!selectedExercise) return [];

    const data: ProgressData[] = [];

    workoutHistory.forEach(workout => {
      const exercise = workout.exercises.find(ex => ex.id === selectedExercise || ex.name === selectedExercise);
      if (!exercise || exercise.sets.length === 0) return;

      const completedSets = exercise.sets.filter(set => set.completed);
      if (completedSets.length === 0) return;

      // Calculate metrics for this workout
      const maxWeight = Math.max(...completedSets.map(set => set.weight));
      const totalVolume = completedSets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
      
      // Find the best set for 1RM calculation (highest weight, if tied then highest reps)
      const bestSet = completedSets.reduce((best, current) => {
        if (current.weight > best.weight) return current;
        if (current.weight === best.weight && current.reps > best.reps) return current;
        return best;
      }, completedSets[0]);
      
      const estimatedOneRM = calculateOneRM(bestSet.weight, bestSet.reps);

      data.push({
        date: workout.date,
        weight: maxWeight,
        volume: totalVolume,
        estimatedOneRM
      });
    });

    // Sort by date
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedExercise, workoutHistory]);

  // Chart configuration
  const chartData = useMemo(() => {
    const labels = progressData.map(data => 
      new Date(data.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    );

    let dataset;
    let yAxisLabel;
    let color;

    switch (chartType) {
      case 'weight':
        dataset = progressData.map(data => data.weight);
        yAxisLabel = 'Weight (kg)';
        color = 'rgb(59, 130, 246)'; // Blue
        break;
      case 'volume':
        dataset = progressData.map(data => data.volume);
        yAxisLabel = 'Volume (kg)';
        color = 'rgb(16, 185, 129)'; // Green
        break;
      case 'oneRM':
        dataset = progressData.map(data => data.estimatedOneRM);
        yAxisLabel = 'Estimated 1RM (kg)';
        color = 'rgb(239, 68, 68)'; // Red
        break;
    }

    return {
      labels,
      datasets: [
        {
          label: yAxisLabel,
          data: dataset,
          borderColor: color,
          backgroundColor: color + '20', // 20% opacity
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.1
        }
      ]
    };
  }, [progressData, chartType]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `${selectedExercise ? allExercises.find(ex => ex.id === selectedExercise || ex.name === selectedExercise)?.name : 'Select Exercise'} - ${
          chartType === 'weight' ? 'Max Weight Progression' :
          chartType === 'volume' ? 'Volume Progression' :
          'Estimated 1RM Progression'
        }`,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: 20
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const unit = chartType === 'volume' || chartType === 'weight' || chartType === 'oneRM' ? ' kg' : '';
            return `${context.dataset.label}: ${value.toFixed(1)}${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Workout Date'
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: chartType === 'weight' ? 'Weight (kg)' :
                chartType === 'volume' ? 'Volume (kg)' :
                'Estimated 1RM (kg)'
        },
        beginAtZero: false,
        grid: {
          color: '#f3f4f6'
        }
      }
    }
  };

  if (allExercises.length === 0) {
    return (
      <div className="progress-visualization">
        <div className="no-data">
          <h2>📊 Progress Visualization</h2>
          <p>No exercise data available yet.</p>
          <p>Complete some workouts to see your progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-visualization">
      <div className="progress-header">
        <h2>📊 Progress Visualization</h2>
        <p>Track your strength progression over time</p>
      </div>

      <div className="progress-controls">
        <div className="control-group">
          <label htmlFor="exercise-select">Select Exercise:</label>
          <select 
            id="exercise-select"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="exercise-select"
          >
            <option value="">Choose an exercise...</option>
            {allExercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>

        {selectedExercise && (
          <div className="control-group">
            <label htmlFor="chart-type">Chart Type:</label>
            <select 
              id="chart-type"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as 'weight' | 'volume' | 'oneRM')}
              className="chart-type-select"
            >
              <option value="weight">Max Weight</option>
              <option value="volume">Total Volume</option>
              <option value="oneRM">Estimated 1RM</option>
            </select>
          </div>
        )}
      </div>

      {selectedExercise && progressData.length > 0 && (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {selectedExercise && progressData.length === 0 && (
        <div className="no-data">
          <p>No workout data found for this exercise.</p>
          <p>Complete some workouts with this exercise to see progress!</p>
        </div>
      )}

      {selectedExercise && progressData.length > 0 && (
        <div className="progress-stats">
          <h3>Progress Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Workouts</span>
              <span className="stat-value">{progressData.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">First Recorded</span>
              <span className="stat-value">
                {new Date(progressData[0].date).toLocaleDateString()}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Latest Weight</span>
              <span className="stat-value">{progressData[progressData.length - 1].weight} kg</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Best Est. 1RM</span>
              <span className="stat-value">
                {Math.max(...progressData.map(d => d.estimatedOneRM)).toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
