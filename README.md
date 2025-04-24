# ✈️ Flight Weather Assessment Tool

Website link: https://scintillating-stardust-681206.netlify.app/

A powerful, responsive web application designed to visualize and assess weather risks for flights across India. Built with a modern UI and backed by real-time aviation weather APIs, it provides professional-grade flight planning and risk analysis using METAR and TAF data.

---

## 📌 Project Highlights

- ✅ Input flight plan using Indian **IATA codes**
- 🌍 Backend suggests **intermediate en-route cities**
- 📡 Pulls **real-time METAR/TAF** data via `aviationweather.gov`
- 🧠 Computes **weather risks**: fog, storms, low visibility, cloud cover
- 🗺️ Visualizes **flight path** and weather risks on an **interactive map**
- 📄 Generates a downloadable **PDF report**
- 🎨 Professional aviation-style responsive UI

---

## 🧠 Core Functionality

### 🛫 1. Flight Route Input

- Enter departure and destination cities using **IATA codes** (e.g., `DEL`, `BOM`)
- Input is validated and user-friendly

📸 `![Flight Route Input Form](path/to/image)`

---

### 🔁 2. Backend Intelligence (Python + Flask)

- **Flight Path Calculation**: Uses the **Gemini API** to generate a probable route between cities with 5–10 en-route airports
- **ICAO Code Retrieval**: Maps each en-route city to its corresponding **ICAO airport code**
- **Weather Data Fetching**: Uses `aviationweather.gov` to fetch:
  - **METAR** for real-time conditions
  - **TAF** for forecasts
- **Data Aggregation**: Combines path, codes, weather, and timestamps

📸 `![API Flow Visualization](path/to/image)`

---

### 🌦️ 3. Risk Assessment Engine

- Decodes weather conditions using METAR/TAF codes
- Evaluates hazards like:
  - `TS` = Thunderstorm
  - `FG` = Fog
  - `BKN` / `OVC` = Significant cloud cover
  - `LIFR` = Low visibility flying conditions
- Assigns **risk scores** to each segment:
  - 🔵 Good (Safe)
  - 🟠 Caution (Check)
  - 🔴 Danger (Avoid)
- Displays in dynamic weather tables and alerts

📸 `![Risk Visualization Table](path/to/image)`

---

### 🗺️ 4. Map-Based Visualization

- Uses **Leaflet.js** to render an interactive map
- Each airport on route shown with **color-coded markers**
- Tooltips provide quick summaries of weather conditions
- Route visually connects cities for spatial awareness

📸 `![Route Map Screenshot](path/to/image)`

---

### 📄 5. PDF Report Generation

- One-click export of:
  - Route details
  - Weather data
  - Risk ratings
  - Timestamps and sources
- Download-ready for flight crew/airline use

📸 `![PDF Preview](path/to/image)`

---

## 💻 Technologies Used

| Layer        | Tech Stack |
|--------------|------------|
| **Frontend** | HTML5, CSS3, Bootstrap, JavaScript, Leaflet.js |
| **Backend**  | Python, Flask |
| **Data APIs**| Gemini API (routing), aviationweather.gov (weather) |
| **Processing**| XML Parsing (for METAR/TAF) |
| **Export**   | jsPDF / Flask PDF toolkit |

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/FlightWeatherAssessment.git
pip install -r requirements.txt
cd FlightWeatherAssessment/api/ python server.py
GEMINI_API_KEY=your_gemini_api_key_here
```
```bash
cd FlightWeatherAssesment npm install
npm run dev
```


## ⚙️ Features Summary

| Feature | Description |
|--------|-------------|
| ✅ Flight input | Enter IATA codes for any two Indian cities |
| 🌍 Path Calculation | Auto-suggests realistic air route via en-route cities |
| 🌦️ Weather Fetch | Live METAR & TAF from aviationweather.gov |
| ⚠️ Risk Analysis | Evaluates weather risks with scoring system |
| 🗺️ Visual Map | Interactive route map with alerts |
| 📄 PDF Report | Downloadable summary of flight conditions |
| 💡 UI Features | Responsive, animated, dark/light mode toggle, UTC clock |

---

## 🧭 Roadmap

- 🔀 Add option for users to manually select alternate en-route cities
- 🌐 Deploy on cloud using Docker or Render
- 🛰️ Add satellite cloud overlay for map
- 🔒 Secure login + session-based flight planning history
- 📊 Historical weather trends per route

---

## 📃 License

Licensed under the **MIT License**. Free for personal and educational use.

---

## 🙏 Acknowledgements

- [aviationweather.gov](https://aviationweather.gov/)
- [Leaflet.js](https://leafletjs.com/)
- [Google Gemini API](https://ai.google.dev/)
- Open source contributors and weather API docs

---


