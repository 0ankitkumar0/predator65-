# Predator 65 Yacht Booking

A responsive Progressive Web App (PWA) built with React for luxury yacht charter bookings. The application features an interactive 3D yacht model viewer, route map, booking panel, and offline support.

---

## 1. Project Overview

**Predator 65 Yacht Booking** is a frontend web application designed for browsing and chartering the Sunseeker Predator 65 luxury yacht. It provides users with a comprehensive view of the yacht, including:

- An interactive 3D model viewer to inspect the yacht from different angles.
- An interactive map showing charter routes and pickup locations.
- Charter details, specifications, target species for fishing, and what is included.
- A dynamic booking panel to calculate trip duration, guests, and pricing.

The project is configured as a **Progressive Web App (PWA)**, allowing users to install it directly on their desktop or mobile devices and browse cached pages even when offline.

---

## 2. Technologies Used

- **React (v17)**: Frontend JavaScript library for building the component-based UI.
- **Three.js**: 3D library used to render and interact with the 3D yacht model (`.glb`).
- **Leaflet**: Lightweight mapping library for displaying pickup locations and routes.
- **CSS3**: Custom modular styling for responsive layouts across all screen sizes.
- **PWA Technologies**:
  - **Web App Manifest (`manifest.json`)**: Configures app metadata, theme color, and icons.
  - **Service Worker (`service-worker.js`)**: Handles caching and offline page delivery.
  - **Cache API**: Stores static assets for offline use.

---

## 3. PWA Features

- **Installable**: Can be installed directly to your device home screen or desktop without using an app store.
- **Offline Support**: Caches key application assets so the app opens and functions even without an active internet connection.
- **Fast Performance**: Serves assets from the local cache on repeat visits for near-instant load times.
- **Standalone App Experience**: Launches in its own window without browser navigation bars, using custom branding and theme colors (`#ff7900`).
- **Responsive Layout**: Adapts smoothly to mobile phones, tablets, and desktop displays.

---

## 4. How to Install Dependencies (`npm install`)

Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

1. Open your terminal or command prompt.
2. Navigate to the project root directory:
   ```bash
   cd yacht-booking
   ```
3. Install the required project packages:
   ```bash
   npm install
   ```

---

## 5. How to Run Locally (`npm start`)

To start the local development server:

```bash
npm start
```

- The app will automatically compile and open in your default browser at [http://localhost:3000](http://localhost:3000).
- The development server supports hot-reloading, meaning the page updates automatically whenever you save code changes.

---

## 6. How to Create a Production Build (`npm run build`)

To build the application for deployment:

```bash
npm run build
```

This command optimizes and minifies the HTML, CSS, and JavaScript code into the `build/` folder. The production build is lightweight, performant, and ready for production deployment.

---

## 7. How to Test the Production Build (`npx serve -s build`)

Because Service Workers and PWA installation are best evaluated in a production environment, you can test the production build locally:

1. Create the build:
   ```bash
   npm run build
   ```
2. Serve the production build using the `serve` package:
   ```bash
   npx serve -s build
   ```
3. Open the URL shown in your terminal (typically [http://localhost:3000](http://localhost:3000) or [http://localhost:5000](http://localhost:5000)) in Google Chrome.

---

## 8. How to Test Service Worker and Offline Mode using Chrome DevTools

You can easily verify the Service Worker and test offline capabilities using Google Chrome:

1. Run the app and open it in **Google Chrome**.
2. Press `F12` (or right-click anywhere and select **Inspect**) to open **Chrome DevTools**.
3. Select the **Application** tab from the top menu:
   - Under the **Application** section on the left sidebar, click **Service Workers**.
   - Check that `service-worker.js` is displayed with a status of **activated and is running**.
4. Check **Cache Storage**:
   - In the left sidebar under **Storage**, expand **Cache Storage**.
   - Select the `predator-v1` cache to see all cached files and pages.
5. **Test Offline Mode**:
   - Go to either **Application > Service Workers** or the **Network** tab in DevTools.
   - Check the **Offline** checkbox to simulate having no internet connection.
   - Refresh the page (`Ctrl + R` or `F5`).
   - The application will still load successfully from the local cache.

---

## 9. How to Install the PWA on Desktop and Android

### Installing on Desktop (Google Chrome or Microsoft Edge)
1. Open the app URL in Google Chrome or Microsoft Edge.
2. Look at the right side of the address bar (omnibox) for the **Install** icon (a screen with a down arrow).
3. Alternatively, click the browser's three-dot menu (**⋮**) and choose **Install Predator 65 Yacht Booking...**
4. Click **Install** in the confirmation popup.
5. The app will launch in its own standalone desktop window, and a desktop shortcut will be created.

### Installing on Android
> **Important Note**: Installing a PWA on an Android device requires the app to be deployed to a live server with a valid **HTTPS** certificate (or accessed via remote port forwarding for local development). Android installation has **not been tested** in this local development environment yet.

Once the project is deployed to an HTTPS URL:
1. Open Google Chrome on your Android device and navigate to your deployed website URL.
2. Tap the three-dot menu (**⋮**) in the top-right corner of Chrome.
3. Tap **Install app** or **Add to Home screen**.
4. Tap **Install** to confirm.
5. The Predator 65 icon will be added to your home screen and app drawer, functioning like a native app.

---

## 10. PWA File Structure

Below is an overview of the key files responsible for PWA functionality within the project:

```text
yacht-booking/
├── public/
│   ├── icons/
│   │   ├── icon-192.png        # 192x192 icon used for mobile home screens and taskbars
│   │   └── icon-512.png        # 512x512 icon used for splash screens and high-DPI displays
│   ├── images/                 # Yacht gallery images and brand logos
│   ├── models/                 # 3D yacht model file (yacht.glb)
│   ├── favicon.ico             # Browser tab shortcut icon
│   ├── index.html              # Links the web manifest, theme color, and icons
│   ├── manifest.json           # PWA metadata (app name, colors, start URL, display mode)
│   └── service-worker.js       # Service worker caching logic and offline fallback handling
├── src/
│   ├── components/             # React UI components (3D viewer, map, booking panel, etc.)
│   ├── App.css                 # Global styling
│   ├── App.js                  # Main root layout component
│   ├── index.css               # Base CSS styling
│   └── index.js                # React application entry point
├── package.json                # Project dependencies and build scripts
└── README.md                   # Project documentation
```

### Key PWA Files Explained:
- **`public/manifest.json`**: Provides browser metadata such as the app name (`Predator 65 Yacht Booking`), short name (`Predator 65`), display mode (`standalone`), theme color (`#ff7900`), and icon paths.
- **`public/service-worker.js`**: Listens for network requests and caches visited pages and core assets into a cache named `predator-v1` for offline availability.
- **`public/icons/`**: Contains the PNG application icons (`icon-192.png` and `icon-512.png`) required by PWA standards for device home screens and splash screens.
- **`public/index.html`**: Contains the `<link rel="manifest">` and meta tags that connect the web app to its manifest and set the mobile browser theme color.
