# 🏋️ Gym Assistant

A modern, responsive web application for managing your workout plans and tracking exercises. Built with React, TypeScript, and Vite.

![Gym Assistant Screenshot](https://via.placeholder.com/800x400/007bff/ffffff?text=Gym+Assistant+App)

## ✨ Features

### 💪 Workout Management
- **Multiple Workout Plans** - Create and manage different workout routines (Push Day, Pull Day, Leg Day, etc.)
- **Exercise Tracking** - Add exercises with sets, reps, and weight tracking
- **In-Place Editing** - Click any cell to edit exercise details instantly
- **Plan Switching** - Easily switch between different workout plans

### 🎵 Training Tools
- **Built-in Metronome** - 60 BPM tempo tool for consistent workout rhythm
- **Always Accessible** - Fixed positioning keeps tools available during workouts

### 💾 Data Management
- **Automatic Saving** - All changes saved instantly to browser storage
- **Data Export** - Export all your workout data to JSON files
- **Data Import** - Import backup files to restore or transfer data
- **Persistent Storage** - Data survives browser restarts and updates

### 📱 Mobile Excellence
- **Responsive Design** - Beautiful card-based layout on mobile devices
- **Touch Optimized** - All controls designed for touch interaction
- **No Horizontal Scrolling** - Perfect experience on any screen size

### ♿ Accessibility
- **Keyboard Navigation** - Full app navigation using only keyboard
- **Screen Reader Support** - ARIA labels and semantic HTML
- **High Contrast** - WCAG 2.1 AA compliant color ratios
- **Focus Management** - Clear visual focus indicators

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gym-assistant.git
   cd gym-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **Storage:** Browser localStorage
- **Audio:** Web Audio API
- **Styling:** CSS3 with responsive design

## 📖 Usage

### Creating Your First Workout Plan

1. **Start with default plans** - The app comes with sample Push/Pull/Leg day plans
2. **Create custom plans** - Click "Create Plan" to add your own workout routine
3. **Add exercises** - Use the "+ Add Exercise" button to add new exercises
4. **Edit details** - Click any cell to edit exercise name, sets, reps, or weight

### Using the Metronome

1. **Access the metronome** - Always available in the top-right corner
2. **Start tempo** - Click to begin 60 BPM rhythm for consistent workout pace
3. **Stop anytime** - Click again to stop the metronome

### Managing Your Data

1. **Automatic saving** - All changes save automatically
2. **Export data** - Click the "Data" button → "Export Data" to download backup
3. **Import data** - Use "Import Data" to restore from backup files
4. **Switch devices** - Export from one device, import to another

## 🎯 Project Structure

```
src/
├── components/
│   ├── core/              # Core utilities (Metronome, Toast, DataPortability)
│   └── plan/              # Workout plan components (Table, Cards, Manager)
├── hooks/                 # Custom React hooks (useWorkoutStore, useToast)
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Responsive design inspired by mobile-first principles
- Accessibility guidelines following WCAG 2.1 standards
- Audio implementation using Web Audio API for precise timing

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/gym-assistant](https://github.com/yourusername/gym-assistant)

---

**Start tracking your workouts today!** 🏋️‍♀️💪