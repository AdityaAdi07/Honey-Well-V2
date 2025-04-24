import google.generativeai as genai
import logging
import sys
import json
import requests
import xml.etree.ElementTree as ET

# Configure logging
logging.basicConfig(level=logging.ERROR,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[logging.StreamHandler(sys.stderr)])

# Replace with your actual Gemini API key
API_KEY = "YOUR_API"  

def get_common_flight_path(start_airport_code, destination_airport_code):
    """
    Retrieves a list of major cities that a flight might pass through
    between two given Indian airports using the Gemini API.

    Args:
        start_airport_code (str): The IATA code of the starting airport.
        destination_airport_code (str): The IATA code of the destination airport.

    Returns:
        list: A list of major cities on a common flight path, or None on error.
    """
    try:
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"""
            You are an expert travel assistant.  A user is planning a trip in India
            from {start_airport_code} to {destination_airport_code}.  Suggest a
            possible flight path, listing at least 5-10 major cities the flight is likely to
            pass through.  Consider that there may not be direct flights, and provide a
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

    except ImportError as e:
        logging.error(f"ImportError: {e}. Please ensure you have installed the google-generativeai library.  You can install it using: pip install google-generativeai")
        return None
    except Exception as e:
        logging.error(f"Error: {e}")
        return None

def get_city_icao_codes(cities):
    """
    Retrieves ICAO codes for a list of cities.  This is a placeholder
    function.  You'll need to replace this with a real implementation
    if you have an ICAO code database or API.

    Args:
        cities (list): A list of city names.

    Returns:
        dict: A dictionary where keys are city names and values are their ICAO codes.
    """
    icao_codes = {}
    for city in cities:
        if city == "Delhi":
            icao_codes[city] = "VIDP"
        elif city == "Jaipur":
            icao_codes[city] = "VIJP"
        elif city == "Ahmedabad":
            icao_codes[city] = "VAAH"
        elif city == "Mumbai":
            icao_codes[city] = "VABB"
        elif city == "Kolkata":
            icao_codes[city] = "VECC"
        elif city == "Bhubaneswar":
            icao_codes[city] = "VEBS"
        elif city == "Hyderabad":
            icao_codes[city] = "VOHY"
        elif city == "Bangalore":
            icao_codes[city] = "VOBL"
        elif city == "Goa":
            icao_codes[city] = "VOGO"
        elif city == "Coimbatore":
            icao_codes[city] = "VOCB"
        elif city == "Kochi":
            icao_codes[city] = "VOCI"
        elif city == "Thiruvananthapuram":
            icao_codes[city] = "VOTV"
        else:
            icao_codes[city] = "Unknown"  
    return icao_codes

def fetch_metar(icao_code):
    """Fetches METAR data for a given ICAO code from aviationweather.gov."""
    url = f"https://aviationweather.gov/api/data/metar?ids={icao_code}&format=xml"
    try:
        response = requests.get(url)
        response.raise_for_status() 
        root = ET.fromstring(response.content)
        metar = root.find('data/METAR/raw_text')
        return metar.text if metar is not None else "No METAR data"
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching METAR for {icao_code}: {e}")
        return "METAR fetch failed"
    except ET.ParseError as e:
        logging.error(f"Error parsing METAR XML for {icao_code}: {e}")
        return "METAR parse failed"
    except Exception as e:
        logging.error(f"Error processing METAR for {icao_code}: {e}")
        return "METAR processing failed"

def fetch_taf(icao_code):
    """Fetches TAF data for a given ICAO code from aviationweather.gov."""
    url = f"https://aviationweather.gov/api/data/taf?ids={icao_code}&format=xml"
    try:
        response = requests.get(url)
        response.raise_for_status()  
        root = ET.fromstring(response.content)
        taf = root.find('data/TAF/raw_text')
        return taf.text if taf is not None else "No TAF data"
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching TAF for {icao_code}: {e}")
        return "TAF fetch failed"
    except ET.ParseError as e:
        logging.error(f"Error parsing TAF XML for {icao_code}: {e}")
        return "TAF parse failed"
    except Exception as e:
        logging.error(f"Error processing TAF for {icao_code}: {e}")
        return "TAF processing failed"

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

if __name__ == "__main__":
    start_airport = input("Enter the IATA code of the starting airport: ").upper()
    destination_airport = input("Enter the IATA code of the destination airport: ").upper()

    flight_path_cities = get_common_flight_path(start_airport, destination_airport)

    if flight_path_cities is None:
        print("Could not retrieve flight path. Please check your API key and try again.")
        sys.exit()
    elif not flight_path_cities:
        print(f"There is no common flight path between {start_airport} and {destination_airport}.")
        sys.exit()

    city_icao_codes = get_city_icao_codes(flight_path_cities)
    flight_path_icao = list(city_icao_codes.values())

    weather_report = generate_weather_report(flight_path_icao)

    route_data = []
    for city, icao_code in city_icao_codes.items():
        weather = weather_report.get(icao_code, {})  
        route_data.append({
            "city": city,
            "icao_code": icao_code,
            "weather": weather
        })

    print(json.dumps(route_data, indent=4))
