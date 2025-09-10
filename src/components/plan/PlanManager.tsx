import { useState } from 'react';
import useWorkoutStore from '../../hooks/useWorkoutStore';
import './PlanManager.css';

export default function PlanManager() {
  const { 
    plans, 
    activePlanId, 
    setActivePlan, 
    createPlan, 
    deletePlan 
  } = useWorkoutStore();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const handleCreatePlan = () => {
    if (newPlanName.trim()) {
      createPlan(newPlanName.trim());
      setNewPlanName('');
      setShowCreateForm(false);
    }
  };

  const handleDeletePlan = (planId: string, planName: string) => {
    if (plans.length <= 1) {
      alert('Cannot delete the last remaining plan.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete '${planName}' and all its exercises?`)) {
      deletePlan(planId);
    }
  };

  return (
    <div className="plan-manager">
      <div className="plan-selector">
        <label htmlFor="plan-select">Select Plan:</label>
        <select 
          id="plan-select"
          value={activePlanId || ''} 
          onChange={(e) => setActivePlan(e.target.value)}
          className="plan-dropdown"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      <div className="plan-actions">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-plan-btn"
        >
          + Create Plan
        </button>
        
        {activePlanId && (
          <button 
            onClick={() => {
              const activePlan = plans.find(p => p.id === activePlanId);
              if (activePlan) {
                handleDeletePlan(activePlanId, activePlan.name);
              }
            }}
            className="delete-plan-btn"
          >
            Delete Plan
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="create-form">
          <input
            type="text"
            placeholder="Enter plan name..."
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreatePlan();
              }
              if (e.key === 'Escape') {
                setShowCreateForm(false);
                setNewPlanName('');
              }
            }}
            autoFocus
            className="plan-name-input"
          />
          <div className="form-actions">
            <button onClick={handleCreatePlan} className="confirm-btn">
              Create
            </button>
            <button 
              onClick={() => {
                setShowCreateForm(false);
                setNewPlanName('');
              }} 
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
