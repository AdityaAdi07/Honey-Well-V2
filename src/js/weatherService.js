// Fetch weather data from the backend
export async function fetchWeatherData(srcCity, destCity) {
    try {
        const response = await fetch('/api/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                start_airport: srcCity,
                destination_airport: destCity
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${errorText || response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        
        // If we're in development mode, return mock data for testing
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Returning mock data for development');
            return getMockData(srcCity, destCity);
        }
        
        throw error;
    }
}

// Generate mock data for development/testing
function getMockData(srcCity, destCity) {
    // Generate a path between the two airports with random cities
    const mockCities = [
        { city: 'Delhi', icao_code: 'VIDP' },
        { city: 'Jaipur', icao_code: 'VIJP' },
        { city: 'Ahmedabad', icao_code: 'VAAH' },
        { city: 'Mumbai', icao_code: 'VABB' },
        { city: 'Kolkata', icao_code: 'VECC' },
        { city: 'Hyderabad', icao_code: 'VOHY' },
        { city: 'Bangalore', icao_code: 'VOBL' },
        { city: 'Chennai', icao_code: 'VOMM' },
        { city: 'Goa', icao_code: 'VOGO' }
    ];
    
    // Select 3-5 random cities for our path
    const numCities = Math.floor(Math.random() * 3) + 3;
    const selectedCities = [];
    
    // Ensure we don't repeat cities
    while (selectedCities.length < numCities) {
        const randomIndex = Math.floor(Math.random() * mockCities.length);
        const city = mockCities[randomIndex];
        
        if (!selectedCities.some(c => c.icao_code === city.icao_code)) {
            selectedCities.push(city);
        }
    }
    
    // Generate mock weather data for each city
    return selectedCities.map(cityData => {
        const riskScore = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const randomDetails = [];
        
        if (riskScore > 0) {
            randomDetails.push('Hazard in METAR');
        }
        
        // Generate mock METAR data
        let metar = `${cityData.icao_code} ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}Z AUTO `;
        
        // Add random weather conditions
        if (riskScore > 0) {
            metar += '10005KT 1/2SM TS BR OVC005 18/17 A2992 RMK AO2 LTG DSNT ALQDS TSB25 SLP133';
        } else if (riskScore === 0) {
            metar += '15010KT 5SM SCT030 BKN080 24/18 A3002 RMK AO2 SLP166';
        } else {
            metar += '12003KT 10SM CLR 28/15 A3010 RMK AO2 SLP193';
        }
        
        return {
            city: cityData.city,
            icao_code: cityData.icao_code,
            weather: {
                metar: metar,
                taf: `TAF ${cityData.icao_code} VALID FOR 24HRS`,
                risk_score: riskScore,
                risk_details: randomDetails
            }
        };
    });
}