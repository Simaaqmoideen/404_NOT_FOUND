<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/leaf.svg" alt="BinWise Logo" width="120" height="120" />
  
  # ♻️ BinWise
  
  **AI-Powered Smart Waste Management & Gamified Segregation Platform**

  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Python](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

  <p align="center"> 
    <a href="#sparkles-features">Features</a> •
    <a href="#rocket-quick-start">Quick Start</a> •
    <a href="#earth_asia-multilingual-support">Multilingual</a> •
    <a href="#camera-ai-detection">AI Detection</a> •
    <a href="#bar_chart-dashboards">Dashboards</a>
  </p>
</div>

---

## 📖 Overview

**BinWise** (formerly SmartWaste) is a state-of-the-art web application designed to revolutionize municipal waste management. By combining **Computer Vision AI** with a **gamified citizen reward system**, BinWise encourages responsible waste segregation at the source. It features dual interfaces: an engaging portal for residents to earn "Eco Points," and a powerful real-time command center for municipal administrators to manage smart bins and fleet operations.

---

## ✨ Features

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/scan-line.svg" width="40"/><br/>
        <b>Real-Time AI Detection</b><br/>
        Identifies and classifies waste instantly using YOLOv8 & MobileNet hybrid models.
      </td>
      <td align="center" width="33%">
        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/award.svg" width="40"/><br/>
        <b>Gamified Rewards</b><br/>
        Citizens earn Eco Points for correct segregation, climbing local leaderboards.
      </td>
      <td align="center" width="33%">
        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/languages.svg" width="40"/><br/>
        <b>Multilingual Engine</b><br/>
        Full interface translation in 8 Indian languages for ultimate accessibility.
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/layout-dashboard.svg" width="40"/><br/>
        <b>Municipal Dashboard</b><br/>
        Live map tracking of smart bin fill levels and automated truck routing alerts.
      </td>
      <td align="center">
        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/smartphone.svg" width="40"/><br/>
        <b>Camera Integration</b><br/>
        Supports IP cameras and DroidCam for live physical bin monitoring.
      </td>
      <td align="center">
        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/moon.svg" width="40"/><br/>
        <b>Dark Mode UI</b><br/>
        Premium, glassmorphic design system that looks stunning day or night.
      </td>
    </tr>
  </table>
</div>

---

## :earth_asia: Multilingual Support
Built specifically for diverse demographics, BinWise supports seamless context-aware translations in 8 languages without page reloads:
🇺🇸 English • 🇮🇳 Hindi (हिन्दी) • 🇮🇳 Kannada (ಕನ್ನಡ) • 🇮🇳 Tamil (தமிழ்) • 🇮🇳 Telugu (తెలుగు) • 🇮🇳 Malayalam (മലയാളം) • 🇮🇳 Marathi (मराठी) • 🇮🇳 Bengali (বাংলা)

---

## 🛠 Tech Stack

### Frontend Application
* **Framework**: React 18 + Vite
* **Language**: TypeScript
* **Styling**: Tailwind CSS + Vanilla CSS (Glassmorphism UI)
* **Animations**: Framer Motion
* **Icons**: Lucide React
* **Routing**: React Router DOM
* **State Management**: React Context API

### Backend / AI Engine
* **API Framework**: FastAPI (Python)
* **Computer Vision**: YOLOv8 (Object Detection) & MobileNet (Image Classification)
* **Camera Integration**: OpenCV + DroidCam
* **Mock Data Service**: Persistent LocalStorage with rich mock interfaces for demo capabilities.

---

## 🚀 Quick Start

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* Python 3.10+ (If running the local AI backend)

### 1. Frontend Setup

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/your-org/binwise.git
cd binwise

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be running at `http://localhost:5173`.

### 2. Administrator Access
To view the Municipal Admin dashboard, you can use the built-in demo credentials:
* **Email**: `admin@bbmp.gov.in`
* **Password**: `admin123`

---

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── admin/           # Admin dashboard widgets
│   ├── auth/            # Login and registration forms
│   ├── chatbot/         # AI Assistant widget
│   ├── detection/       # WebRTC & Camera AI views
│   └── shared/          # Navbar, Footer, Language Switcher
├── context/             # Global React Contexts (Auth, Theme, Language)
├── pages/               # Main application route views
├── services/            # API wrappers and mock data engines
├── translations/        # i18n JSON language packs (en, hi, kn, etc.)
├── index.css            # Global stylesheet & Tailwind tokens
└── main.tsx             # Application entry point
```

---

## 🤖 Camera & AI Detection Details

The core functionality involves a **Hybrid AI Fallback System**:
1. The app streams a live camera feed (or accepts an image upload).
2. It sends the frame to the FastAPI YOLOv8 service for high-confidence object detection (e.g., "Plastic Bottle").
3. If YOLOv8 is uncertain, it falls back to a MobileNet classification model.
4. If confidence is still too low, an intuitive manual correction UI allows the user to override and train the system.

---

<div align="center">
  <p>Built with ❤️ for a cleaner, greener tomorrow.</p>
  <p>© 2024 BinWise Initiative</p>
</div>
