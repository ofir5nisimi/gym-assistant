import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exercise } from '../components/plan/ExerciseRow';

interface Plan {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface WorkoutState {
  plans: Plan[];
  activePlanId: string | null;
  
  // Plan management actions
  createPlan: (name: string) => void;
  deletePlan: (planId: string) => void;
  setActivePlan: (planId: string) => void;
  renamePlan: (planId: string, newName: string) => void;
  
  // Exercise management actions (for the active plan)
  addExercise: () => void;
  removeExercise: (id: string) => void;
  updateExercise: (id: string, field: keyof Exercise, value: string | number) => void;
  
  // Getters
  getActivePlan: () => Plan | null;
  getActiveExercises: () => Exercise[];
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
      }
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({ 
        plans: state.plans, 
        activePlanId: state.activePlanId 
      }),
    }
  )
);

export default useWorkoutStore;
export type { Plan };