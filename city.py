import google.generativeai as genai
import logging
import sys
import json

# Configure logging
logging.basicConfig(level=logging.ERROR,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[logging.StreamHandler(sys.stderr)])

API_KEY = "AIzaSyDtFLUrAZC6WDi5-entZum3dsHjpO-A9XY"  

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
            possible flight path, listing at least 5-6 major cities the flight is likely to
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

        # Check if the API key is valid.
        if not API_KEY or API_KEY == "YOUR_API_KEY":
            raise ValueError("API_KEY is not set. Please replace 'YOUR_API_KEY' with your actual API key.")

        # Send the prompt to the Gemini API and get the response.
        response = model.generate_content(prompt)
        response_text = response.text

        # Process the response.  Handle "None" and comma-separated cities.
        if "None" in response_text:
            return []  # Return an empty list for no path

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
        elif city == "Chennai":
            icao_codes[city] = "VOMM"
        elif city == "Nagpur":
            icao_codes[city] = "VANP"
        elif city == "Lucknow":
            icao_codes[city] = "VILK"
        elif city == "Pune":
            icao_codes[city] = "VAPO"
        elif city == "Chandigarh":
            icao_codes[city] = "VICG"
        elif city == "Guwahati":
            icao_codes[city] = "VEGT"
        elif city == "Mysuru":
            icao_codes[city] = "VOMY"
        elif city == "Patna":
            icao_codes[city] = "VEPT"
        elif city == "Bhopal":
            icao_codes[city] = "VABP"
        else:
            icao_codes[city] = "Unknown" 
    return icao_codes



if __name__ == "__main__":
    start_airport = input("Enter the IATA code of the starting airport: ").upper()
    destination_airport = input("Enter the IATA code of the destination airport: ").upper()

    flight_path = get_common_flight_path(start_airport, destination_airport)

    if flight_path is None:
        print("Could not retrieve flight path. Please check your API key and try again.")
    elif not flight_path:
        print(f"There is no common flight path between {start_airport} and {destination_airport}.")
    else:
        print(f"Common flight path from {start_airport} to {destination_airport}:")
        print(", ".join(flight_path))

        city_icao_codes = get_city_icao_codes(flight_path)

        city_data = {}
        for city in flight_path:
            city_data[city] =  city_icao_codes.get(city)


        print("\nCity and ICAO Codes:")
        print(json.dumps(city_data, indent=4))
