# Gym Assistant App - Implementation TODO List

This list breaks down the development of the Gym Assistant app into logical phases. Complete the items in order to ensure dependencies are met before building upon them.

---

## Phase 1: Core UI and Static Functionality (The Skeleton)

*Goal: Build the visual components and make them interactive in isolation, without any data persistence. This phase focuses on getting the look and feel right with temporary, in-component state.*

- [x] **1.1: Project Setup**
    - **Acceptance Criteria:**
        - [x] A new Vite/React project is created with the TypeScript template.
        - [x] The project runs successfully using `npm run dev`.
        - [x] Unnecessary boilerplate (e.g., default logos, CSS) has been removed.

- [x] **1.2: Build Static `ExerciseTable` and `ExerciseRow` Components**
    - **Acceptance Criteria:**
        - [x] An `ExerciseTable` component is created that displays a table with headers: "Exercise Name", "Sets", "Reps", "Weight (kg)".
        - [x] An `ExerciseRow` component is created that renders a single `<tr>` with `<td>` cells.
        - [x] The `ExerciseTable` can accept an array of exercise objects as a prop and render a list of `ExerciseRow` components correctly.
        - [x] Each `ExerciseRow` includes a visible "Remove" button (e.g., a trash can icon).

- [x] **1.3: Implement "Add Exercise" (Static)**
    - **Acceptance Criteria:**
        - [x] An "+ Add Exercise" button is visible below the table.
        - [x] Clicking the button adds a new, empty, editable row to the table.
        - [x] This functionality works using local component state (`useState`) for now. The new row does *not* need to persist on refresh.

- [x] **1.4: Implement "Remove Exercise" (Static)**
    - **Acceptance Criteria:**
        - [x] Clicking the "Remove" button on an `ExerciseRow` removes that specific row from the UI.
        - [x] This functionality works using local component state. The change does *not* need to persist on refresh.

- [x] **1.5: Implement In-Place Cell Editing (Static)**
    - **Acceptance Criteria:**
        - [x] Clicking on any cell in the table (e.g., "Exercise Name", "Weight") turns it into an active `<input>` field.
        - [x] The user can type a new value into the input field.
        - [x] When the user clicks away (onBlur) or presses "Enter", the input field reverts back to a normal `<td>` cell displaying the new value.
        - [x] This functionality updates the local component state. The change does *not* need to persist on refresh.

---

## Phase 2: Data Persistence & State Management (The Brain)

*Goal: Introduce a global state management solution and connect it to the browser's `localStorage` to make the application's data persistent.*

- [x] **2.1: Integrate Zustand for State Management**
    - **Acceptance Criteria:**
        - [x] `zustand` is added as a project dependency.
        - [x] A new store (`useWorkoutStore`) is created.
        - [x] The store is configured to hold the state for a *single* workout plan's exercises for now.

- [x] **2.2: Connect UI to the Zustand Store**
    - **Acceptance Criteria:**
        - [x] The `ExerciseTable` component no longer uses local `useState` for the exercise list; it now reads data directly from the Zustand store.
        - [x] The "Add Exercise", "Remove Exercise", and cell editing functions now call actions defined in the Zustand store to modify the global state.
        - [x] The UI behaves exactly as it did in Phase 1, but the "source of truth" is now the global store.

- [x] **2.3: Implement `localStorage` Persistence**
    - **Acceptance Criteria:**
        - [x] Zustand's `persist` middleware is configured for the workout store.
        - [x] Any change made to the exercises (add, remove, edit) is automatically saved to the browser's `localStorage`.
        - [x] When the application is reloaded, the `ExerciseTable` is re-populated with the data from the last session. All data is successfully restored.

---

## Phase 3: Multi-Plan Management (The Organizer)

*Goal: Expand the data structure and UI to support creating and switching between multiple, distinct workout plans.*

- [x] **3.1: Update Data Structure for Multiple Plans**
    - **Acceptance Criteria:**
        - [x] The Zustand store's data structure is updated to manage an array of `plans`.
        - [x] The store also tracks which plan is currently active (e.g., via an `activePlanId`).
        - [x] Each `plan` object in the array contains its own `id`, `name`, and array of `exercises`.

- [x] **3.2: Create `PlanManager` Component**
    - **Acceptance Criteria:**
        - [x] A new `PlanManager` component is created (e.g., a dropdown menu or a list of tabs).
        - [x] The component displays a list of all available plan names from the Zustand store.
        - [x] Selecting a plan from the component updates the `activePlanId` in the store.
        - [x] The `ExerciseTable` now dynamically displays the exercises for the currently active plan.

- [x] **3.3: Implement "Create New Plan"**
    - **Acceptance Criteria:**
        - [x] A "Create Plan" button is added to the UI.
        - [x] Clicking the button prompts the user for a plan name.
        - [x] A new plan object (with the given name and an empty exercises array) is added to the plans array in the Zustand store.
        - [x] The new plan automatically appears in the `PlanManager` component.

- [x] **3.4: Implement "Delete Plan"**
    - **Acceptance Criteria:**
        - [x] A "Delete Plan" button is available for the active plan.
        - [x] Clicking the button triggers a confirmation dialog (`window.confirm`) to prevent accidental deletion.
        - [x] Upon confirmation, the active plan is removed from the Zustand store, and the view switches to another available plan or an empty state.

---

## Phase 4: Core Features (The Gadgets)

*Goal: Build the remaining key features from the specification: the metronome and data portability.*

- [x] **4.1: Build the `Metronome` Component**
    - **Acceptance Criteria:**
        - [x] A `Metronome` component with a single "Start Tempo" / "Stop Tempo" button is created.
        - [x] The component is placed in a fixed position on the screen (e.g., header or footer) and is always visible.
        - [x] Clicking the button starts a "click" sound playing precisely once per second (60 BPM), using the Web Audio API for accuracy.
        - [x] Clicking the button again stops the sound. The button label updates accordingly.

- [x] **4.2: Implement "Export Data"**
    - **Acceptance Criteria:**
        - [x] An "Export Data" button is added to the UI (e.g., in a settings menu).
        - [x] Clicking the button retrieves the entire state from the Zustand store.
        - [x] The state object is converted to a formatted JSON string.
        - [x] The browser prompts the user to download a `.json` file containing this data.

- [x] **4.3: Implement "Import Data"**
    - **Acceptance Criteria:**
        - [x] An "Import Data" button is added, which opens a file selection dialog filtered for `.json` files.
        - [x] A clear warning is displayed to the user that importing will overwrite all existing data.
        - [x] Upon user confirmation, the application reads the selected JSON file.
        - [x] The application state (in Zustand and `localStorage`) is completely replaced with the data from the file.
        - [x] The UI correctly refreshes to show the newly imported plans and exercises.
        - [x] The application handles errors gracefully if the user selects an invalid or malformed file.

---

## Phase 5: Polish and Refinement (The Shine)

*Goal: Improve the user experience with responsive design, visual feedback, and accessibility enhancements.*

- [x] **5.1: Implement Responsive Design**
    - **Acceptance Criteria:**
        - [x] On narrow screens (e.g., mobile phones), the main exercise table reflows into a more readable format (e.g., a list of cards) to avoid horizontal scrolling.
        - [x] All controls (buttons, menus) are easily usable on a touch screen.
        - [x] The layout looks clean and organized on all screen sizes, from mobile to desktop.

- [x] **5.2: Add User Feedback and Minor UX Improvements**
    - **Acceptance Criteria:**
        - [x] After a cell is edited, a subtle "Saved" indicator provides feedback.
        - [x] After a successful data import, a confirmation message (e.g., a toast notification) is displayed.
        - [x] Add a confirmation dialog for removing an exercise row to prevent accidental clicks.

- [x] **5.3: Perform Accessibility (A11y) Review**
    - **Acceptance Criteria:**
        - [x] The entire application can be navigated and operated using only the keyboard.
        - [x] All interactive elements have clear focus states (e.g., outlines).
        - [x] All controls are properly labeled with `aria-label` for screen reader users where necessary.
        - [x] Color contrast ratios meet WCAG 2.1 AA standards.
