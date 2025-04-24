// Update UTC time display
export function updateUTCTime() {
    const utcTimeDisplay = document.getElementById('utcTime');
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    utcTimeDisplay.textContent = `${hours}:${minutes}:${seconds} UTC`;
}

// Initialize theme toggle functionality
export function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Add event listener for theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
}

// Get appropriate weather icon class based on weather description
export function getWeatherIconClass(description) {
    description = description.toLowerCase();
    
    if (description.includes('thunderstorm') || description.includes('lightning')) {
        return 'fa-bolt';
    } else if (description.includes('rain') || description.includes('shower')) {
        return 'fa-cloud-rain';
    } else if (description.includes('snow') || description.includes('flurries')) {
        return 'fa-snowflake';
    } else if (description.includes('clear') || description.includes('sunny')) {
        return 'fa-sun';
    } else if (description.includes('cloud') || description.includes('overcast')) {
        return 'fa-cloud';
    } else if (description.includes('fog') || description.includes('mist')) {
        return 'fa-smog';
    } else if (description.includes('wind') || description.includes('gusty')) {
        return 'fa-wind';
    } else {
        return 'fa-cloud-sun';
    }
}

// Get risk level text and class based on risk score
export function getRiskLevel(riskScore) {
    let riskClass, riskText;
    
    if (riskScore > 0) {
        riskClass = 'badge-danger';
        riskText = 'High Risk';
    } else if (riskScore === 0) {
        riskClass = 'badge-warning';
        riskText = 'Moderate Risk';
    } else {
        riskClass = 'badge-success';
        riskText = 'Low Risk';
    }
    
    return { riskClass, riskText };
}

// Get color for risk based on risk score
export function getRiskColor(riskScore) {
    if (riskScore > 0) {
        return 'var(--danger)';
    } else if (riskScore === 0) {
        return 'var(--warning)';
    } else {
        return 'var(--success)';
    }
}

// Format METAR data for display
export function formatMetarData(metar) {
    if (!metar || metar.includes('failed') || metar.includes('No METAR')) {
        return 'No METAR data available';
    }
    
    // Return cleaned METAR string
    return metar.trim();
}

// Extract relevant weather information from METAR
export function extractWeatherInfo(metar) {
    if (!metar || metar.includes('failed') || metar.includes('No METAR')) {
        return 'Weather data unavailable';
    }
    
    // Simple extraction of weather condition
    if (metar.includes('TS')) {
        return 'Thunderstorms';
    } else if (metar.includes('RA')) {
        return 'Rain';
    } else if (metar.includes('SN')) {
        return 'Snow';
    } else if (metar.includes('FG')) {
        return 'Fog';
    } else if (metar.includes('BR')) {
        return 'Mist';
    } else if (metar.includes('OVC') || metar.includes('BKN')) {
        return 'Cloudy';
    } else if (metar.includes('SCT')) {
        return 'Partly cloudy';
    } else if (metar.includes('CLR') || metar.includes('SKC')) {
        return 'Clear skies';
    } else {
        return 'Variable conditions';
    }
}