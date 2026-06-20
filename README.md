# SmartLibrary Manager 📚✨

SmartLibrary Manager is an avant-garde, premium visual seat grid and fee reconciliation engine designed for modern co-working libraries. Built as an offline-first **Progressive Web App (PWA)** using React, Vite, and custom Glassmorphism styles, it allows library owners to manage seat allocations, shifts, and fee collection smoothly on any device.

---

## 🚀 Key Features

*   **Bespoke Asymmetric Layout:** A dark-themed visual cabin layout built using modern design rules, custom typography (`Outfit` & `Inter`), and interactive hover effects.
*   **Dual-Shift Seat Booking (Morning & Evening):** Allocate different students to the same physical seat for different shifts (Morning and Evening) without overwriting active bookings.
*   **Dynamic View Toggles:**
    *   `All Seats`: Highlighting all active bookings simultaneously.
    *   `Morning View`: Filters and focuses on morning shift allocations.
    *   `Evening View`: Filters and focuses on evening shift allocations.
    *   `Full-Day View`: Highlights only the premium full-day subscribers.
*   **Dynamic Seat Capacity Management:** Easily scale your library by clicking **+ Add Seat** in the grid header, or **Delete Seat** directly in any seat's modal. All statistics adjust in real-time.
*   **Real-time Dynamic Fee Ledger:**
    *   Calculates payment urgency dynamically (Paid, Due in 3 days, Overdue) in real-time without desyncs.
    *   Default monthly rates set to **₹600** for single shifts and **₹1000** for full-day bookings.
*   **Instant WhatsApp Reminders:** Pre-filled payment reminder messages sent to students in one click.
*   **PWA Offline Support:** Fully installable to homescreens with a custom launcher manifest and a Network-First service worker for offline functionality.

---

## 📥 Download and Setup

### 1. Direct Download Link
You can download the latest version of this repository as a ZIP archive directly using the link below:

👉 **[Download SmartLibrary Manager ZIP](https://github.com/xtremLYx/library-management-system/archive/refs/heads/main.zip)**

---

### 2. Local Installation & Development

To run this application locally on your computer, follow these simple steps:

#### Prerequisites
*   Ensure you have [Node.js](https://nodejs.org/) installed (version 16 or higher recommended).
*   Ensure you have a modern web browser.

#### Steps
1.  **Extract the ZIP** or clone the repository using Git:
    ```bash
    git clone https://github.com/xtremLYx/library-management-system.git
    cd library-management-system
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the local development server**:
    ```bash
    npm run dev
    ```
4.  **Open the App**: The console will provide a local link (typically `http://localhost:5173/` or `http://localhost:5174/`). Open this link in your browser!

---

## 📱 Mobile App (PWA) Installation

When accessing the hosted website on a mobile device or desktop browser, look for the **"Install App"** button next to the active shift simulator in the top header. Click it to install SmartLibrary Manager as a standalone application on your device!

---

## ⚙️ Project Tech Stack
*   **Core**: React 19 + Vite 8
*   **Icons**: Lucide React
*   **Styling**: Custom Vanilla CSS (Glassmorphism design tokens)
*   **Offline / Native**: Service Workers & Web Manifest (PWA)
