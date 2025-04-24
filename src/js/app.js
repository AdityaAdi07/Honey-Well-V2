import { updateUTCTime, initThemeToggle } from './uiHelpers.js';
import { fetchWeatherData } from './weatherService.js';
import { updateWeatherDisplay, showLoading, hideLoading, showError, updateProgressTracker } from './uiUpdater.js';
import { generatePDF } from './pdfGenerator.js';

// Initialize UI components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    updateUTCTime();
    setInterval(updateUTCTime, 1000);
    initThemeToggle();
    
    // Get DOM elements
    const submitBtn = document.getElementById('submitBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const closeAlertBtn = document.getElementById('closeAlert');
    const srcCityInput = document.getElementById('srcCity');
    const destCityInput = document.getElementById('destCity');
    
    // Hide alert banner initially
    const alertBanner = document.getElementById('alertBanner');
    alertBanner.style.display = 'none';
    
    // Initialize results container as hidden
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'none';
    
    // Add event listeners
    submitBtn.addEventListener('click', handleWeatherRequest);
    downloadPdfBtn.addEventListener('click', handlePdfDownload);
    closeAlertBtn.addEventListener('click', () => {
        alertBanner.style.display = 'none';
    });
    
    // Store weather data globally for PDF generation
    window.weatherData = null;
    
    // Add example values for ease of testing
    srcCityInput.value = 'DEL';
    destCityInput.value = 'BOM';
});

// Handle the weather data request
async function handleWeatherRequest() {
    const srcCity = document.getElementById('srcCity').value.trim().toUpperCase();
    const destCity = document.getElementById('destCity').value.trim().toUpperCase();
    
    if (!srcCity || !destCity) {
        showError('Please enter both source and destination cities');
        return;
    }
    
    try {
        showLoading();
        
        // Fetch weather data from the backend
        const data = await fetchWeatherData(srcCity, destCity);
        
        // Store data for PDF generation
        window.weatherData = data;
        
        // Update the UI with the weather data
        updateWeatherDisplay(data, srcCity, destCity);
        
        // Check for severe weather and show alert if needed
        checkForSevereWeather(data);
        
        hideLoading();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        hideLoading();
        showError(`Error: ${error.message || 'Failed to fetch weather data'}`);
    }
}

// Handle PDF download
function handlePdfDownload() {
    if (!window.weatherData) {
        showError('No weather data available. Please submit a request first.');
        return;
    }
    
    const srcCity = document.getElementById('srcCity').value.trim().toUpperCase();
    const destCity = document.getElementById('destCity').value.trim().toUpperCase();
    
    generatePDF(window.weatherData, srcCity, destCity);
}

// Check for severe weather conditions
function checkForSevereWeather(data) {
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');
    
    // Check if any location has high risk
    const severeWeather = data.find(location => location.weather.risk_score > 0);
    
    if (severeWeather) {
        alertMessage.textContent = `⚠ Severe Weather Alert: Hazardous conditions detected near ${severeWeather.city} (${severeWeather.icao_code})`;
        alertBanner.style.display = 'flex';
    } else {
        alertBanner.style.display = 'none';
    }
}