import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise } from '../components/plan/ExerciseRow';

interface Plan {
  id: string;
  name: string;
  exercises: Exercise[];
}


interface LoggedSet {
  reps: number;
  weight: number;
  completed: boolean;
}

interface LoggedExercise {
  id: string;
  name: string;
  sets: LoggedSet[];
}

interface WorkoutLog {
  id: string;
  planId: string;
  planName: string;
  date: string; // ISO string
  exercises: LoggedExercise[];
  duration?: number; // in minutes
  notes?: string;
}

interface WorkoutState {
  plans: Plan[];
  activePlanId: string | null;
  workoutLogs: WorkoutLog[];
  
  // Live workout state
  isLiveWorkout: boolean;
  currentWorkoutLog: WorkoutLog | null;
  
  // Plan management actions
  createPlan: (name: string) => void;
  deletePlan: (planId: string) => void;
  setActivePlan: (planId: string) => void;
  renamePlan: (planId: string, newName: string) => void;
  
  // Exercise management actions (for the active plan)
  addExercise: () => void;
  removeExercise: (id: string) => void;
  updateExercise: (id: string, field: keyof Exercise, value: string | number) => void;
  
  // Workout logging actions
  startWorkout: () => void;
  finishWorkout: (notes?: string) => void;
  cancelWorkout: () => void;
  updateLoggedSet: (exerciseId: string, setIndex: number, updates: Partial<LoggedSet>) => void;
  
  // Getters
  getActivePlan: () => Plan | null;
  getActiveExercises: () => Exercise[];
  getWorkoutHistory: () => WorkoutLog[];
}


const defaultPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Push Day',
    exercises: [
      { id: '1', name: 'Bench Press', sets: 3, reps: 10, weight: 80 },
      { id: '2', name: 'Overhead Press', sets: 3, reps: 8, weight: 50 },
      { id: '3', name: 'Dips', sets: 3, reps: 12, weight: 0 },
    ]
  },
  {
    id: 'plan-2', 
    name: 'Pull Day',
    exercises: [
      { id: '4', name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
      { id: '5', name: 'Rows', sets: 3, reps: 10, weight: 60 },
      { id: '6', name: 'Face Pulls', sets: 3, reps: 15, weight: 20 },
    ]
  },
  {
    id: 'plan-3',
    name: 'Leg Day', 
    exercises: [
      { id: '7', name: 'Squats', sets: 4, reps: 8, weight: 100 },
      { id: '8', name: 'Deadlift', sets: 3, reps: 6, weight: 120 },
      { id: '9', name: 'Lunges', sets: 3, reps: 12, weight: 40 },
    ]
  }
];

const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      plans: defaultPlans,
      activePlanId: 'plan-1',
      workoutLogs: [],
      isLiveWorkout: false,
      currentWorkoutLog: null,
      
      createPlan: (name: string) => set((state) => {
        const newPlan: Plan = {
          id: `plan-${Date.now()}`,
          name,
          exercises: []
        };
        return {
          plans: [...state.plans, newPlan],
          activePlanId: newPlan.id
        };
      }),
      
      deletePlan: (planId: string) => set((state) => {
        const filteredPlans = state.plans.filter(plan => plan.id !== planId);
        const newActivePlanId = state.activePlanId === planId 
          ? (filteredPlans.length > 0 ? filteredPlans[0].id : null)
          : state.activePlanId;
        
        return {
          plans: filteredPlans,
          activePlanId: newActivePlanId
        };
      }),
      
      setActivePlan: (planId: string) => set(() => ({
        activePlanId: planId
      })),
      
      renamePlan: (planId: string, newName: string) => set((state) => ({
        plans: state.plans.map(plan => 
          plan.id === planId ? { ...plan, name: newName } : plan
        )
      })),
      
      addExercise: () => set((state) => {
        const activePlan = state.plans.find(plan => plan.id === state.activePlanId);
        if (!activePlan) return state;
        
        const newExercise: Exercise = {
          id: Date.now().toString(),
          name: '',
          sets: 0,
          reps: 0,
          weight: 0,
        };
        
        return {
          plans: state.plans.map(plan => 
            plan.id === state.activePlanId 
              ? { ...plan, exercises: [...plan.exercises, newExercise] }
              : plan
          )
        };
      }),
      
      removeExercise: (exerciseId: string) => set((state) => ({
        plans: state.plans.map(plan => 
          plan.id === state.activePlanId
            ? { ...plan, exercises: plan.exercises.filter(ex => ex.id !== exerciseId) }
            : plan
        )
      })),
      
      updateExercise: (exerciseId: string, field: keyof Exercise, value: string | number) => set((state) => ({
        plans: state.plans.map(plan => 
          plan.id === state.activePlanId
            ? {
                ...plan, 
                exercises: plan.exercises.map(exercise =>
                  exercise.id === exerciseId
                    ? { ...exercise, [field]: value }
                    : exercise
                )
              }
            : plan
        )
      })),
      
      getActivePlan: () => {
        const state = get();
        return state.plans.find(plan => plan.id === state.activePlanId) || null;
      },
      
      getActiveExercises: () => {
        const state = get();
        const activePlan = state.plans.find(plan => plan.id === state.activePlanId);
        return activePlan ? activePlan.exercises : [];
      },
      

      // Workout logging actions
      startWorkout: () => set((state) => {
        const activePlan = state.plans.find(plan => plan.id === state.activePlanId);
        if (!activePlan) return state;

        const workoutLog: WorkoutLog = {
          id: `workout-${Date.now()}`,
          planId: activePlan.id,
          planName: activePlan.name,
          date: new Date().toISOString(),
          exercises: activePlan.exercises.map(exercise => ({
            id: exercise.id,
            name: exercise.name,
            sets: Array(exercise.sets).fill(null).map(() => ({
              reps: exercise.reps,
              weight: exercise.weight,
              completed: false
            }))
          }))
        };

        return {
          isLiveWorkout: true,
          currentWorkoutLog: workoutLog
        };
      }),

      finishWorkout: (notes?: string) => set((state) => {
        if (!state.currentWorkoutLog) return state;

        const finishedLog: WorkoutLog = {
          ...state.currentWorkoutLog,
          notes,
          duration: Math.round((Date.now() - new Date(state.currentWorkoutLog.date).getTime()) / 60000) // minutes
        };

        return {
          workoutLogs: [...state.workoutLogs, finishedLog],
          isLiveWorkout: false,
          currentWorkoutLog: null
        };
      }),

      cancelWorkout: () => set({
        isLiveWorkout: false,
        currentWorkoutLog: null
      }),

      updateLoggedSet: (exerciseId: string, setIndex: number, updates: Partial<LoggedSet>) => set((state) => {
        if (!state.currentWorkoutLog) return state;

        const updatedExercises = state.currentWorkoutLog.exercises.map(exercise =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((set, index) =>
                  index === setIndex ? { ...set, ...updates } : set
                )
              }
            : exercise
        );

        return {
          currentWorkoutLog: {
            ...state.currentWorkoutLog,
            exercises: updatedExercises
          }
        };
      }),

      getWorkoutHistory: () => {
        const state = get();
        return state.workoutLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({ 
        plans: state.plans, 
        activePlanId: state.activePlanId,
        workoutLogs: state.workoutLogs
      }),
    }
  )
);

export default useWorkoutStore;
export type { Plan, WorkoutLog, LoggedExercise, LoggedSet };