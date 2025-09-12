# Software Requirements Specification: Gym Assistant Web App (v1.1)

## 1.0 Introduction

### 1.1 Project Overview
This document outlines the software requirements for a web-based Gym Assistant application. The primary purpose of this application is to help a single user create, manage, and track their weightlifting workout plans on a specific device. It will provide a simple interface for recording exercises, sets, reps, and weight, ensuring data persistence across sessions using browser storage. Key features include an integrated metronome for workout tempo and the ability to export and import all user data for backup or migration purposes.

### 1.2 Technology Stack
*   **Frontend Framework:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** (To be determined - e.g., CSS Modules, Tailwind CSS)

## 2.0 Functional Requirements

This section details the core features and functionality of the application.

### 2.1 Plan Management
The user must be able to create and manage multiple, distinct workout plans.

*   **Create Plan:** The user shall be able to create a new, empty workout plan. Upon creation, the application will prompt the user to provide a name for the plan (e.g., "Push Day," "Leg Day").
*   **Select Plan:** An always-visible interface element, such as a dropdown menu or a set of tabs, will display all created plans by name. This allows the user to easily select and switch between their workout plans.
*   **Rename/Delete Plan:** The user shall have the ability to rename an existing plan or delete it entirely. A deletion action must trigger a confirmation prompt (e.g., "Are you sure you want to delete 'Push Day' and all its exercises?") to prevent accidental data loss.
*   **Default View:** Upon loading the application, it will display the most recently viewed plan. If no plans exist, it will present a clean state with a clear call-to-action to create the first plan.

### 2.2 Exercise Table Management
The core of each plan is an interactive table of exercises that the user can manipulate directly.

*   **Table Structure:** Each plan's content will be displayed in a table with the following columns:
    *   **Exercise Name:** Text input.
    *   **Sets:** Numerical input (integers only).
    *   **Reps:** Numerical input (integers only).
    *   **Weight (kg):** Numerical input (accepting decimals).
*   **Add Exercise:** A clearly labeled button, such as "+ Add Exercise," will be present. Clicking this button will append a new, empty row to the bottom of the currently active plan's table.
*   **Remove Exercise:** Each row in the exercise table will contain a "Remove" button (e.g., a trash can icon). Clicking this button will instantly remove the corresponding row from the table. To prevent accidental deletion, a subtle "Undo" option could briefly appear.
*   **Direct In-place Editing:** All cells within the table shall be directly editable. A user can click on any cell (e.g., the weight for "Chest Press") to activate an input field and modify its value. The change will be saved automatically when the user clicks away from the input field (on blur) or presses the "Enter" key.

### 2.3 Data Persistence and Portability
The application must retain all user data between sessions and provide tools for manual backup and recovery.

*   **Local Storage:** All workout plans and their associated exercises will be automatically saved to the browser's `localStorage`. Any change—creating a plan, editing a weight, adding an exercise—will trigger an immediate update to the stored data. There is no manual "Save" button.
*   **Data Export:** The application will provide an "Export Data" button. When clicked, it will generate a JSON file containing all the user's workout plans. The browser will then prompt the user to download and save this file (e.g., `gym-assistant-backup.json`) to their local device.
*   **Data Import:** The application will provide an "Import Data" button.
    1.  Clicking this button will open a file selection dialog, allowing the user to select a previously exported JSON file.
    2.  Before proceeding, the application will display a clear warning message, such as: "Importing a new file will overwrite all current data. Are you sure you want to continue?".
    3.  Upon user confirmation, the application will read the selected file, parse its contents, and replace the existing data in `localStorage` with the imported data. The application will then refresh to display the newly loaded plans.

### 2.4 Tempo Metronome
The application will include a simple metronome to help users control their exercise tempo, which will be accessible at all times.

*   **Interface and Placement:** The metronome will consist of a single toggle button, labeled "Start Tempo" / "Stop Tempo". This control will be placed in a fixed position on the screen (e.g., in a static top header or bottom footer) so that it is always visible and clickable, regardless of how far the user has scrolled.
*   **Functionality:**
    *   When the user clicks "Start Tempo," the application will begin producing an audible "click" sound once per second.
    *   The tempo is fixed at 60 BPM (1 click per second).
    *   The sound will play continuously until the user clicks the "Stop Tempo" button.
*   **Audio Implementation:** A short, crisp, pre-recorded sound file will be used for the click. The Web Audio API is recommended for playback to ensure precise and consistent timing, which is superior to a standard HTML `<audio>` element for this purpose.

## 3.0 User Interface (UI) and User Experience (UX) Requirements

*   **Layout:** The application will feature a clean, uncluttered, single-page design. The main focus will be the exercise table. Controls for plan management and data portability (Import/Export) should be grouped logically, perhaps under a "Settings" or "Plan Options" menu, to keep the primary view focused on the workout.
*   **Responsiveness:** The UI must be fully responsive. On smaller screens (mobile devices), the table layout should adapt to a more vertical, card-based list to ensure all information is readable and editable without horizontal scrolling.
*   **User Feedback:** The application must provide clear feedback. After an import is successful, a confirmation message should be shown. When data is saved (which happens automatically after an edit), a subtle indicator (like a quick fade-in/fade-out "Saved!" text) can reassure the user.

## 4.0 Non-Functional Requirements

*   **Performance:** The application should be lightweight and fast. All UI interactions (adding rows, editing cells) should be instantaneous, as they are processed entirely on the client-side.
*   **Browser Compatibility:** The application must be fully tested and functional on the latest stable versions of major desktop and mobile browsers, including Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge.
*   **Accessibility:** The application will adhere to Web Content Accessibility Guidelines (WCAG 2.1 AA). This includes full keyboard navigability (users can tab through all interactive elements), proper ARIA attributes for screen reader compatibility, and sufficient color contrast for readability.

## 5.0 Technical Implementation Suggestions

*   **State Management:** A lightweight state management library like **Zustand** is highly recommended. It simplifies managing the global state (all workout plans) and provides an easy way to create a middleware function that automatically syncs the state to `localStorage` on every change.
*   **Data Portability Logic:**
    *   **Export:** Create a function that gets the current state, runs it through `JSON.stringify(state, null, 2)` for readability, creates a `Blob` object, and generates a downloadable link.
    *   **Import:** Use an `<input type="file" accept=".json">`. When a file is selected, use the `FileReader` API to read its content. Wrap the `JSON.parse()` call in a `try...catch` block to handle invalid files gracefully. Before overwriting the state, perform a basic validation check to ensure the imported object has the expected structure.
*   **Component Structure:**
    ```
    - /src
      - /components
        - /layout
          - Header.tsx         # (Contains title, PlanManager, Metronome)
          - Footer.tsx         # (Could contain data portability buttons)
        - /plan
          - PlanManager.tsx      # (Dropdown to switch/manage plans)
          - ExerciseTable.tsx    # (The main table component)
          - ExerciseRow.tsx      # (A single, editable row)
        - /core
          - Metronome.tsx        # (The tempo button and audio logic)
          - DataPortability.tsx  # (Import/Export buttons and logic)
      - /hooks
        - useWorkoutStore.ts   # (Zustand store with localStorage middleware)
      - /assets
        - metronome-tick.mp3   # (Sound file)
      - App.tsx
      - main.tsx
    ```

## 6.0 Future Enhancements

*   **Automatic Cloud Sync:** Evolve the manual Import/Export feature into a seamless, automatic cloud synchronization service by adding a backend and user authentication.
*   **Workout Mode:** A dedicated "workout mode" that locks the plan editing and presents a larger, more focused view for the current exercise, perhaps with an integrated rest timer.
*   **Progression Tracking:** Log completed sets and reps to automatically generate charts showing strength progression over time for specific exercises.