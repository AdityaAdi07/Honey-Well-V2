from flask import Flask, request, jsonify, send_from_directory
import os
import sys
import json
import logging
import requests
import xml.etree.ElementTree as ET
import google.generativeai as genai
from werkzeug.serving import run_simple

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__, static_folder='../dist')

# Replace with your actual Gemini API key
API_KEY = "YOUR_CODE"

def get_common_flight_path(start_airport_code, destination_airport_code):
    """
    Retrieves a list of major cities that a flight might pass through
    between two given Indian airports using the Gemini API.
    """
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""
            You are an expert travel assistant. A user is planning a trip in India
            from {start_airport_code} to {destination_airport_code}. Suggest a
            possible flight path, listing at least 5-10 major cities the flight is likely to
            pass through. Consider that there may not be direct flights, and provide a
            reasonable, common route. Do not number the cities.
            Do not include the starting or destination airport codes in the list.
            Provide the city names only, separated by commas.
            If there are no likely cities, or you cannot determine a path, respond with "None".

            Examples:
            User: DEL to BOM
            Assistant: Delhi,Jaipur,Ahmedabad,Mumbai
            User: CCU to GOI
            Assistant: Kolkata,Bhubaneswar,Hyderabad,Bangalore,Goa
            User: CJB to TRV
            Assistant: Coimbatore,Kochi,Thiruvananthapuram
            User: abcd to xyz
            Assistant: None
        """

        if not API_KEY or API_KEY == "YOUR_API_KEY":
            raise ValueError("API_KEY is not set. Please replace 'YOUR_API_KEY' with your actual API key.")

        response = model.generate_content(prompt)
        response_text = response.text

        if "None" in response_text:
            return []

        cities = [city.strip() for city in response_text.split(',')]
        return cities

    except Exception as e:
        logging.error(f"Error in get_common_flight_path: {e}")
        return None

def get_city_icao_codes(cities):
    """Retrieves ICAO codes for a list of cities."""
    icao_codes = {
        "Delhi": "VIDP",
        "Jaipur": "VIJP",
        "Ahmedabad": "VAAH",
        "Mumbai": "VABB",
        "Kolkata": "VECC",
        "Bhubaneswar": "VEBS",
        "Hyderabad": "VOHY",
        "Bangalore": "VOBL",
        "Goa": "VOGO",
        "Coimbatore": "VOCB",
        "Kochi": "VOCI",
        "Thiruvananthapuram": "VOTV"
    }
    
    return {city: icao_codes.get(city, "Unknown") for city in cities}

def fetch_metar(icao_code):
    """Fetches METAR data for a given ICAO code."""
    url = f"https://aviationweather.gov/api/data/metar?ids={icao_code}&format=xml"
    try:
        response = requests.get(url)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        metar = root.find('data/METAR/raw_text')
        return metar.text if metar is not None else "No METAR data"
    except Exception as e:
        logging.error(f"Error fetching METAR for {icao_code}: {e}")
        return "METAR fetch failed"

def fetch_taf(icao_code):
    """Fetches TAF data for a given ICAO code."""
    url = f"https://aviationweather.gov/api/data/taf?ids={icao_code}&format=xml"
    try:
        response = requests.get(url)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        taf = root.find('data/TAF/raw_text')
        return taf.text if taf is not None else "No TAF data"
    except Exception as e:
        logging.error(f"Error fetching TAF for {icao_code}: {e}")
        return "TAF fetch failed"

def assess_risk(metar, taf):
    """Assess weather risk based on METAR and TAF data."""
    risk_score = 0
    hazards = ['TS', 'FG', 'BKN', 'OVC', 'LIFR']
    risk_details = []

    if isinstance(metar, str) and "failed" not in metar and "No METAR" not in metar:
        if any(term in metar for term in hazards):
            risk_score += 1
            risk_details.append("Hazard in METAR")
    elif not isinstance(metar, str):
        risk_score = -1
        risk_details.append("METAR is not a string")

    if isinstance(taf, str) and "failed" not in taf and "No TAF" not in taf:
        if any(term in taf for term in hazards):
            risk_score += 1
            risk_details.append("Hazard in TAF")
    elif not isinstance(taf, str):
        risk_score = -1
        risk_details.append("TAF is not a string")
    
    return risk_score, risk_details

def generate_weather_report(icao_list):
    """Generates a weather report and risk assessment for a list of ICAO codes."""
    result = {}
    for airport in icao_list:
        metar = fetch_metar(airport)
        taf = fetch_taf(airport)
        risk_score, risk_details = assess_risk(metar, taf)

        result[airport] = {
            "metar": metar,
            "taf": taf,
            "risk_score": risk_score,
            "risk_details": risk_details
        }
    return result

@app.route('/')
def serve_index():
    return send_from_directory('../', 'index.html')

@app.route('/src/<path:path>')
def serve_static(path):
    return send_from_directory('../src', path)

@app.route('/api/weather', methods=['POST'])
def get_weather():
    try:
        data = request.json
        start_airport = data.get('start_airport')
        destination_airport = data.get('destination_airport')
        
        if not start_airport or not destination_airport:
            return jsonify({"error": "Missing start_airport or destination_airport parameter"}), 400
        
        # Get flight path cities
        flight_path_cities = get_common_flight_path(start_airport, destination_airport)
        
        if flight_path_cities is None:
            return jsonify({"error": "Could not retrieve flight path. Check API key and try again."}), 500
        
        if not flight_path_cities:
            return jsonify({"error": f"No common flight path found between {start_airport} and {destination_airport}"}), 404
        
        # Get ICAO codes for cities
        city_icao_codes = get_city_icao_codes(flight_path_cities)
        flight_path_icao = list(city_icao_codes.values())
        
        # Generate weather report
        weather_report = generate_weather_report(flight_path_icao)
        
        # Combine city and weather data
        route_data = []
        for city, icao_code in city_icao_codes.items():
            weather = weather_report.get(icao_code, {})
            route_data.append({
                "city": city,
                "icao_code": icao_code,
                "weather": weather
            })
        
        return jsonify(route_data)
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logging.info(f"Starting server on port {port}")
    run_simple('0.0.0.0', port, app, use_reloader=True, use_debugger=True)
