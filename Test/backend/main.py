# This file contains all functions to and from our database
from geopy.distance import geodesic
import mysql.connector, random
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import Database
import json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
db=Database()

# -------------------------------------------------DATABASE----------------------------------------------------------#

# Function to create a new player in the database. Function return the player ID in json.
# Require one arguments <player_name>

# URL: /localhost/create_user?player_name=<name>

@app.route('/create_user/')    
def create_user():
    args = request.args
    name = args.get("player_name")
    #home_airport = args.get("home_airport")

    try:
        sql = f"INSERT INTO PLAYER (name,ap_ident,distance,used_time,cons_gas,money,score) VALUES ('{name}','EFHK',0,0,0,0,0);"
        cursor = db.get_conn().cursor()
        cursor.execute(sql)
        user_id = cursor.lastrowid

        return jsonify({"user_id": user_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -------------------------------------------------------------------------------------------------------------------#

# Function select randomly (15) airports from designed continent and add them to dictionary.
# Its also select random values of boxes for each airports (1-15).
# Require one arguments <continent>

# URL: /localhost/get_ap_idents?continent=<continent>

@app.route('/get_ap_idents/')
def get_ap_idents():
    args = request.args
    continent = args.get("continent")

    visited = []

    try:
        sql = f"SELECT ident FROM airport WHERE continent = '{continent}'"
        cursor = db.get_conn().cursor()
        cursor.execute(sql)
        result = cursor.fetchall()

        game_airports = {}

        for time in range(16):
            choice_airport = random.choice(result)
            if choice_airport not in game_airports and choice_airport[0] != 'EFHK' and choice_airport not in visited:
                game_airports[choice_airport[0]] = {'box': random.randint(1,15)}
                visited.append(choice_airport)
                # {EFHK: {BOX:15, jne.}, AAHK:{BOX:3, jne}}
        
        return jsonify(game_airports), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
    
# -------------------------------------------------------------------------------------------------------------------#

# Fuction to get information of any given airport. Fuction return airport details (Name, city and country)
# Return "ap name", "ap municipality", "ap country name"
# Require one arguments <ident>

# URL: /localhost/get_ap_info?ident=<ident>

@app.route('/get_ap_info/')
def get_ap_info():
    args = request.args
    ident = args.get("ident")

    try:
        sql = f"SELECT airport.name, airport.municipality, country.name FROM airport, country WHERE airport.ident = '{ident}' and airport.iso_country = country.iso_country;"
        cursor = db.get_conn().cursor()
        cursor.execute(sql)
        result = cursor.fetchall()

        for info in result:
            return jsonify({'name': info[0],'city':info[1],'country':info[2]}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
        
# -------------------------------------------------------------------------------------------------------------------#
# Function to get coordinates of any given airport identified by ident
# Function return latitude, longitude coordinates in tuple
# Require one arguments <ident>

# URL: /localhost/get_ap_coordinates?ident=<ident>

@app.route('/get_ap_coordinates/')
def get_ap_coordinates():
    args = request.args
    ident = args.get("ident")

    try:
        sql = f"SELECT airport.latitude_deg, airport.longitude_deg FROM airport WHERE airport.ident = '{ident}';"
        cursor = db.get_conn().cursor()
        cursor.execute(sql)
        result = cursor.fetchall()

        for coordinates in result:
            return jsonify({'lat':coordinates[0], 'long':coordinates[1]}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# -------------------------------------------------------------------------------------------------------------------#
# Function to get info from airplane name, model, fuel consume, capasity
# Function return "ap name", "ap fuel ratio litres per 100km per passenger", "ap speed in m/s" and "ap max box capasity"
# Require one arguments <plane_id>

# URL: /localhost/get_airplane_info?plane_id=<plane_id>

@app.route('/get_airplane_info/')
def get_airplane_info():
    args = request.args
    plane_id = args.get("plane_id")

    try:
        sql = f"SELECT airplane.plane_id, airplane.name, airplane.consume, airplane.speed, airplane.capasity FROM airplane WHERE airplane.plane_id = '{plane_id}';"
        cursor = db.get_conn().cursor()
        cursor.execute(sql)
        result = cursor.fetchall()

        for content in result:
            return jsonify({'name':content[1], 'fuel':content[2], 'speed':content[3], 'capasity':content[4]}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400, 400

# -------------------------------------------------------------------------------------------------------------------#
# Function to update player values. Values distance in km, used_time in hours, cons_gas in litres
# Require five arguments <player_name>, <player_id>, <distance>, <time_spent>, <fuel_consumed>

# URL: /localhost/update_player?player_name=<player_name>&player_id=<player_id>&distance=<distance>&time_spent=<time_spent>&fuel_consumed=<fuel_consumed>

@app.route('/update_player/')
def update_player():
    args = request.args
    player_name = args.get("player_name")
    player_id = args.get("player_id")
    distance = args.get("distance")
    time_spent = args.get("time_spent")
    fuel_consumed = args.get("fuel_consumed")


    try:
        sql = f"UPDATE player SET distance = distance + {distance}, used_time = used_time + {time_spent}, cons_gas = cons_gas + {fuel_consumed} WHERE name = '{player_name}' AND player_id = {player_id};"
        kursori = db.get_conn().cursor()
        kursori.execute(sql)

        return jsonify({'status': 'true'}),200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# -------------------------------------------------------------------------------------------------------------------#
# Function to get players info and
# Return traveled distance, used time, used fuel, money and score (distance, used_time, cons_gas, money, score)
# Require two arguments <player_name>, <player_id>

# URL: /localhost/get_player_info?player_name=<player_name>&player_id=<player_id>

@app.route('/get_player_info/')
def get_player_info():
    args = request.args
    player_name = args.get("player_name")
    player_id = args.get("player_id")

    try:
        sql = f"SELECT * FROM player WHERE name = '{player_name}' and player_id = {player_id}"
        cursor = db.get_conn().cursor()
        cursor.execute(sql)
        result = cursor.fetchall()

        for player in result:
            return jsonify({'distance':player[3],'used_time': player[4],'cons_gas': player[5],'money': player[6],'score': player[7]}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

# -------------------------------------------------MATH--------------------------------------------------------------#

# This function calculates the distance between any 2 airport locations given and return distance in km
# Require four arguments <latitude1>, <longitude1>, <latitude2>, <longitude2>

# URL: /localhost/distance_calculate?lati1=<lati1>&long1=<long1>&lati2=<lati2>&long2=<long2>

@app.route('/distance_calculate/')
def distance_calculate():
    args = request.args
    latitude1 = args.get("lati1")
    longitude1 = args.get("long1")
    latitude2 = args.get("lati2")
    longitude2 = args.get("long2")

    try:
        location1 = (latitude1, longitude1)
        location2 = (latitude2, longitude2)

        distance = geodesic(location1, location2).km

        return jsonify({'distance': distance}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# -------------------------------------------------------------------------------------------------------------------#

# This function calculates how much fuel airplane has used. Function return used fuel in litres
# Fuel_burn_rate is in database in airplane table and value is litres per 100km per passenger
# Require two arguments <distance> and <fuel_burn_rate>

# URL: /localhost/calculate_fuel?distance=<distance>&fuel_burn_rate=<fuel_burn_rate>

@app.route('/calculate_fuel/')
def calculate_fuel():
    args = request.args
    distance = args.get("distance")
    fuel_burn_rate = args.get("fuel_burn_rate")

    try:
        fuel_consumed = float(distance) * (float(fuel_burn_rate) / 100 )
        return jsonify({'fuel': fuel_consumed}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# -------------------------------------------------------------------------------------------------------------------#

# Function to calculate time spent while flying. Distance is in km and speed in database is in metres per second. Return time spend in hours.
# Require two arguments <speed> and <distance>

# URL: /localhost/calculate_time_spent?speed=<speed>&distance=<distance>

@app.route('/calculate_time_spent')
def calculate_time_spent():
    args = request.args
    speed = args.get("speed")
    distance = args.get("distance")
    
    try:
        time_spent = float(distance) / (float(speed) * 3.6)
        return jsonify({'time_spent': time_spent}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000, debug=True)