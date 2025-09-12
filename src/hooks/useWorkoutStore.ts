import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise } from '../components/plan/ExerciseRow';

interface Plan {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface ExerciseLibraryItem {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

interface WorkoutState {
  plans: Plan[];
  activePlanId: string | null;
  exerciseLibrary: ExerciseLibraryItem[];
  
  // Plan management actions
  createPlan: (name: string) => void;
  deletePlan: (planId: string) => void;
  setActivePlan: (planId: string) => void;
  renamePlan: (planId: string, newName: string) => void;
  
  // Exercise management actions (for the active plan)
  addExercise: () => void;
  removeExercise: (id: string) => void;
  updateExercise: (id: string, field: keyof Exercise, value: string | number) => void;
  
  // Exercise library management
  addExerciseToLibrary: (name: string, category?: string, description?: string) => void;
  removeExerciseFromLibrary: (id: string) => void;
  updateExerciseInLibrary: (id: string, updates: Partial<ExerciseLibraryItem>) => void;
  
  // Getters
  getActivePlan: () => Plan | null;
  getActiveExercises: () => Exercise[];
  searchExerciseLibrary: (query: string) => ExerciseLibraryItem[];
}

const defaultExerciseLibrary: ExerciseLibraryItem[] = [
  // Chest
  { id: 'ex-1', name: 'Bench Press', category: 'Chest', description: 'Barbell bench press on flat bench' },
  { id: 'ex-2', name: 'Incline Bench Press', category: 'Chest', description: 'Barbell bench press on incline bench' },
  { id: 'ex-3', name: 'Dumbbell Bench Press', category: 'Chest', description: 'Dumbbell bench press on flat bench' },
  { id: 'ex-4', name: 'Dips', category: 'Chest', description: 'Parallel bar dips or assisted dips' },
  { id: 'ex-5', name: 'Push-ups', category: 'Chest', description: 'Standard push-ups or variations' },
  
  // Back
  { id: 'ex-6', name: 'Pull-ups', category: 'Back', description: 'Pull-ups or chin-ups' },
  { id: 'ex-7', name: 'Rows', category: 'Back', description: 'Barbell or dumbbell rows' },
  { id: 'ex-8', name: 'Lat Pulldowns', category: 'Back', description: 'Cable lat pulldowns' },
  { id: 'ex-9', name: 'Face Pulls', category: 'Back', description: 'Cable face pulls for rear delts' },
  { id: 'ex-10', name: 'Deadlift', category: 'Back', description: 'Conventional deadlift' },
  
  // Shoulders
  { id: 'ex-11', name: 'Overhead Press', category: 'Shoulders', description: 'Standing barbell overhead press' },
  { id: 'ex-12', name: 'Dumbbell Shoulder Press', category: 'Shoulders', description: 'Seated or standing dumbbell press' },
  { id: 'ex-13', name: 'Lateral Raises', category: 'Shoulders', description: 'Dumbbell lateral raises' },
  { id: 'ex-14', name: 'Front Raises', category: 'Shoulders', description: 'Dumbbell front raises' },
  
  // Legs
  { id: 'ex-15', name: 'Squats', category: 'Legs', description: 'Back squats with barbell' },
  { id: 'ex-16', name: 'Romanian Deadlift', category: 'Legs', description: 'Romanian deadlift for hamstrings' },
  { id: 'ex-17', name: 'Lunges', category: 'Legs', description: 'Walking or stationary lunges' },
  { id: 'ex-18', name: 'Leg Press', category: 'Legs', description: 'Machine leg press' },
  { id: 'ex-19', name: 'Calf Raises', category: 'Legs', description: 'Standing or seated calf raises' },
  
  // Arms
  { id: 'ex-20', name: 'Bicep Curls', category: 'Arms', description: 'Barbell or dumbbell bicep curls' },
  { id: 'ex-21', name: 'Tricep Extensions', category: 'Arms', description: 'Overhead tricep extensions' },
  { id: 'ex-22', name: 'Hammer Curls', category: 'Arms', description: 'Dumbbell hammer curls' },
  { id: 'ex-23', name: 'Close Grip Bench Press', category: 'Arms', description: 'Close grip bench press for triceps' },
];

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
      exerciseLibrary: defaultExerciseLibrary,
      
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
      
      // Exercise library management
      addExerciseToLibrary: (name: string, category?: string, description?: string) => set((state) => ({
        exerciseLibrary: [
          ...state.exerciseLibrary,
          {
            id: `ex-${Date.now()}`,
            name,
            category,
            description
          }
        ]
      })),
      
      removeExerciseFromLibrary: (id: string) => set((state) => ({
        exerciseLibrary: state.exerciseLibrary.filter(ex => ex.id !== id)
      })),
      
      updateExerciseInLibrary: (id: string, updates: Partial<ExerciseLibraryItem>) => set((state) => ({
        exerciseLibrary: state.exerciseLibrary.map(ex =>
          ex.id === id ? { ...ex, ...updates } : ex
        )
      })),
      
      searchExerciseLibrary: (query: string) => {
        const state = get();
        if (!query.trim()) return state.exerciseLibrary;
        
        const lowercaseQuery = query.toLowerCase();
        return state.exerciseLibrary.filter(exercise =>
          exercise.name.toLowerCase().includes(lowercaseQuery) ||
          exercise.category?.toLowerCase().includes(lowercaseQuery) ||
          exercise.description?.toLowerCase().includes(lowercaseQuery)
        );
      }
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({ 
        plans: state.plans, 
        activePlanId: state.activePlanId,
        exerciseLibrary: state.exerciseLibrary
      }),
    }
  )
);

export default useWorkoutStore;
export type { Plan, ExerciseLibraryItem };