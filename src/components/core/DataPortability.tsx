import { useRef, useState } from 'react';
import useWorkoutStore from '../../hooks/useWorkoutStore';
import './DataPortability.css';

export default function DataPortability() {
  const { plans, activePlanId } = useWorkoutStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const exportData = () => {
    try {
      const dataToExport = {
        plans,
        activePlanId,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gym-assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowMenu(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset file input
    event.target.value = '';

    try {
      // Show warning before importing
      const confirmImport = window.confirm(
        'Importing a new file will overwrite all current data. Are you sure you want to continue?'
      );
      
      if (!confirmImport) {
        return;
      }

      const fileContent = await file.text();
      const importedData = JSON.parse(fileContent);

      // Basic validation
      if (!importedData.plans || !Array.isArray(importedData.plans)) {
        throw new Error('Invalid file format: missing or invalid plans data');
      }

      // Validate plan structure
      for (const plan of importedData.plans) {
        if (!plan.id || !plan.name || !Array.isArray(plan.exercises)) {
          throw new Error('Invalid file format: invalid plan structure');
        }
      }

      // Clear existing data and import new data
      // Since we don't have a direct "replace all" action, we'll use the persist mechanism
      localStorage.setItem('workout-storage', JSON.stringify({
        state: {
          plans: importedData.plans,
          activePlanId: importedData.activePlanId || (importedData.plans[0]?.id || null)
        },
        version: 0
      }));

      // Reload the page to reflect imported data
      window.location.reload();
      
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      
      let errorMessage = 'Failed to import data. ';
      if (error instanceof SyntaxError) {
        errorMessage += 'The file is not a valid JSON file.';
      } else if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check the file format and try again.';
      }
      
      alert(errorMessage);
      
      // Reset status after 3 seconds
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  return (
    <div className="data-portability">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="data-menu-btn"
        title="Data Import/Export"
      >
        <span className="data-icon">💾</span>
        Data
      </button>

      {showMenu && (
        <div className="data-menu">
          <button onClick={exportData} className="data-action-btn export-btn">
            <span className="action-icon">📤</span>
            Export Data
          </button>
          
          <button onClick={handleImportClick} className="data-action-btn import-btn">
            <span className="action-icon">📥</span>
            Import Data
          </button>
          
          <button 
            onClick={() => setShowMenu(false)} 
            className="data-action-btn close-btn"
          >
            <span className="action-icon">✕</span>
            Close
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {importStatus === 'success' && (
        <div className="status-message success">
          Data imported successfully!
        </div>
      )}

      {importStatus === 'error' && (
        <div className="status-message error">
          Import failed. Please try again.
        </div>
      )}
    </div>
  );
}
