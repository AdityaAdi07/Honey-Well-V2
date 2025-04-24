import { getWeatherIconClass, getRiskLevel, getRiskColor, formatMetarData, extractWeatherInfo } from './uiHelpers.js';

// Show loading indicator
export function showLoading() {
    document.getElementById('loadingContainer').style.display = 'flex';
    document.getElementById('resultsContainer').style.display = 'none';
}

// Hide loading indicator
export function hideLoading() {
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('resultsContainer').style.display = 'grid';
}

// Show error message
export function showError(message) {
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');
    
    alertMessage.textContent = message;
    alertBanner.style.display = 'flex';
    
    // Hide after 5 seconds
    setTimeout(() => {
        alertBanner.style.display = 'none';
    }, 5000);
}

// Update weather display with fetched data
export function updateWeatherDisplay(data, srcCity, destCity) {
    // Update flight route information
    document.getElementById('departureCity').textContent = srcCity;
    document.getElementById('arrivalCity').textContent = destCity;
    
    // Update summary information
    document.getElementById('cityCount').textContent = data.length;
    
    // Calculate overall risk level
    const riskScores = data.map(item => item.weather.risk_score);
    const maxRiskScore = Math.max(...riskScores);
    
    updateRiskSummary(maxRiskScore);
    
    // Update weather table
    updateWeatherTable(data);
    
    // Update progress tracker
    updateProgressTracker(data);
    
    // Update detailed weather information
    updateDetailedWeather(data);
}

// Update risk summary based on overall risk
function updateRiskSummary(maxRiskScore) {
    const weatherStatus = document.getElementById('weatherStatus');
    const riskAssessment = document.getElementById('riskAssessment');
    
    if (maxRiskScore > 0) {
        weatherStatus.textContent = 'Hazardous';
        riskAssessment.textContent = 'Not Recommended';
        weatherStatus.style.color = 'var(--danger)';
        riskAssessment.style.color = 'var(--danger)';
    } else if (maxRiskScore === 0) {
        weatherStatus.textContent = 'Caution';
        riskAssessment.textContent = 'Proceed with Caution';
        weatherStatus.style.color = 'var(--warning)';
        riskAssessment.style.color = 'var(--warning)';
    } else {
        weatherStatus.textContent = 'Favorable';
        riskAssessment.textContent = 'Safe to Fly';
        weatherStatus.style.color = 'var(--success)';
        riskAssessment.style.color = 'var(--success)';
    }
}

// Update weather table with data
function updateWeatherTable(data) {
    const weatherTable = document.getElementById('weatherTable');
    weatherTable.innerHTML = '';
    
    data.forEach(location => {
        const { city, icao_code, weather } = location;
        const { risk_score, metar } = weather;
        
        const weatherDescription = extractWeatherInfo(metar);
        const { riskClass, riskText } = getRiskLevel(risk_score);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${city}</td>
            <td>${icao_code}</td>
            <td>
                <i class="fas ${getWeatherIconClass(weatherDescription)} weather-icon"></i>
                ${weatherDescription}
            </td>
            <td><span class="badge ${riskClass}">${riskText}</span></td>
        `;
        
        weatherTable.appendChild(row);
    });
}

// Update progress tracker visualization
export function updateProgressTracker(data) {
    const progressTracker = document.getElementById('progressTracker');
    const airportsContainer = document.getElementById('airportsContainer');
    
    progressTracker.innerHTML = '';
    airportsContainer.innerHTML = '';
    
    // Create the progress bar segments
    data.forEach((location, index) => {
        const { city, icao_code, weather } = location;
        const { risk_score } = weather;
        
        // For progress bar
        if (index < data.length - 1) {
            const segment = document.createElement('div');
            segment.style.position = 'absolute';
            segment.style.height = '100%';
            segment.style.width = `${100 / (data.length - 1)}%`;
            segment.style.left = `${(index / (data.length - 1)) * 100}%`;
            segment.style.backgroundColor = getRiskColor(risk_score);
            
            progressTracker.appendChild(segment);
        }
        
        // For city indicators
        const airportPoint = document.createElement('div');
        airportPoint.className = 'airport-point';
        
        const indicator = document.createElement('div');
        indicator.className = 'airport-indicator';
        indicator.style.backgroundColor = getRiskColor(risk_score);
        
        const label = document.createElement('span');
        label.textContent = city;
        
        airportPoint.appendChild(indicator);
        airportPoint.appendChild(label);
        airportPoint.style.flex = '1';
        airportPoint.style.textAlign = 'center';
        
        airportsContainer.appendChild(airportPoint);
    });
}

// Update detailed weather information
function updateDetailedWeather(data) {
    const detailedWeather = document.getElementById('detailedWeather');
    detailedWeather.innerHTML = '';
    
    data.forEach(location => {
        const { city, icao_code, weather } = location;
        const { risk_score, metar, taf, risk_details } = weather;
        
        const { riskClass, riskText } = getRiskLevel(risk_score);
        const weatherDescription = extractWeatherInfo(metar);
        
        const card = document.createElement('div');
        card.className = 'weather-card';
        
        card.innerHTML = `
            <div class="weather-card-header">
                <div class="weather-card-title">${city} (${icao_code})</div>
                <div class="weather-card-risk badge ${riskClass}">${riskText}</div>
            </div>
            <div class="weather-card-body">
                <div class="weather-data-item">
                    <strong>Weather:</strong>
                    <span>${weatherDescription}</span>
                </div>
                <div class="weather-data-item">
                    <strong>METAR:</strong>
                    <span>${formatMetarData(metar).substring(0, 30)}${metar && metar.length > 30 ? '...' : ''}</span>
                </div>
                <div class="weather-data-item">
                    <strong>Risk Details:</strong>
                    <span>${risk_details && risk_details.length ? risk_details.join(', ') : 'None identified'}</span>
                </div>
            </div>
        `;
        
        detailedWeather.appendChild(card);
    });
}