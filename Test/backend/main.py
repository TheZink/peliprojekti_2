# This file contains all functions to and from our database
from geopy.distance import geodesic
import mysql.connector, random
from flask import Flask, request
from database import Database
import json

app = Flask(__name__)
db=Database()

# -------------------------------------------------DATABASE----------------------------------------------------------#

# Function to create a new player in the database. Function return the player ID in json.
# Require two arguments <player_name>, <home_airport>.

# Function works

@app.route('/create_users/')    
def create_users():
    args = request.args
    name = args.get("player_name")
    #home_airport = args.get("home_airport")

    try:
        sql = f"INSERT INTO PLAYER (name,ap_ident,distance,used_time,cons_gas,money,score) VALUES ('{name}','EFHK',0,0,0,0,0);"
        cursor = db.get_conn().cursor()
        cursor.execute(sql)
        user_id = cursor.lastrowid

        return {"user_id": user_id}, 200

    except Exception as e:
        return {"error": str(e)}, 400


# -------------------------------------------------------------------------------------------------------------------#

# Function select randomly (15) airports from designed continent and add them to dictionary.
# Its also select random values of boxes for each airports (1-15).
# Require one arguments <continent>

# Function works 

@app.route('/create_game/')
def create_game():
    args = request.args
    continent = args.get("continent")

    try:
        sql = f"SELECT ident FROM airport WHERE continent = '{continent}'"
        cursor = db.get_conn().cursor()
        cursor.execute(sql)
        result = cursor.fetchall()

        game_airports = {}

        for time in range(15):
            choice_airport = random.choice(result)
            if choice_airport not in game_airports:
                game_airports[choice_airport[0]] = random.randint(1,15)
    
    except Exception as e:
        return {"error": str(e)}, 400
    
    return game_airports

# -------------------------------------------------------------------------------------------------------------------#

# Fuction to get information of any given airport. Fuction return airport details (Name, city and country)
# Return "ap name", "ap municipality", "ap country name" in tuple
# Require one arguments <ident>

@app.route('/get_information/')
def get_information():
    args = request.args
    ident = args.get("ident")

    sql = f"SELECT airport.name, airport.municipality, country.name FROM airport, country WHERE airport.ident = '{ident}' and airport.iso_country = country.iso_country;"
    kursori = db.get_conn.cursor()
    kursori.execute(sql)
    tulos = kursori.fetchall()

    for info in tulos:
        return(info[0],info[1],info[2]) 
        
# -------------------------------------------------------------------------------------------------------------------#
# Function to get coordinates of any given airport identified by ident
# Function return latitude, longitude coordinates in tuple
# Require one arguments <ident>

@app.route('/get_coordinates/<ident>')
def get_coordinates():
    args = request.args
    ident = args.get("ident")

    sql = f"SELECT airport.latitude_deg, airport.longitude_deg FROM airport WHERE airport.ident = '{ident}';"
    kursori = db.get_conn.cursor()
    kursori.execute(sql)
    tulos = kursori.fetchall()

    for kordinaatti in tulos:
        return kordinaatti[0], kordinaatti[1]

# -------------------------------------------------------------------------------------------------------------------#
# Function to get info from airplane name, model, fuel consume, capasity
# Function return "ap name", "ap fuel ratio litres per 100km per passenger", "ap speed in m/s" and "ap max box capasity"
# Require one arguments <plane_id>

@app.route('/airplane_info/<plane_id>')
def airplane_info():
    args = request.args
    plane_id = args.get("plane_id")

    sql = f"SELECT airplane.plane_id, airplane.name, airplane.consume, airplane.speed, airplane.capasity FROM airplane WHERE airplane.plane_id = '{plane_id}';"
    kursori = db.get_conn.cursor()
    kursori.execute(sql)
    tulos = kursori.fetchall()

    for content in tulos:
        return (content[1], content[2], content[3], content[4])

# -------------------------------------------------------------------------------------------------------------------#
# Function to update player values. Values distance in km, used_time in hours, cons_gas in litres
# Require five arguments <player_name>, <player_id>, <distance>, <time_spent>, <fuel_consumed>

@app.route('/update_game')
def update_game(self):
    args = request.args
    player_name = args.get("player_name")
    player_id = args.get("player_id")
    distance = args.get("distance")
    time_spent = args.get("time_spent")
    fuel_consumed = args.get("fuel_consumed")

    sql = f"UPDATE player SET distance = distance+{distance}, used_time = used_time+{time_spent}, cons_gas = cons_gas+{fuel_consumed} WHERE name = '{player_name}' and player_id = {player_id};"
    kursori = db.get_conn.cursor()
    kursori.execute(sql)

# -------------------------------------------------------------------------------------------------------------------#
# Function to get players info and
# Return traveled distance, used time, used fuel, money and score (distance, used_time, cons_gas, money, score)
# Require two arguments <player_name>, <player_id>

@app.route('/close_game')
def close_game():
    args = request.args
    player_name = args.get("player_name")
    player_id = args.get("player_id")

    sql = f"SELECT * FROM player WHERE name = '{player_name}' and player_id = {player_id}"
    kursori = db.get_conn.cursor()
    kursori.execute(sql)
    tulos = kursori.fetchall()

    for player in tulos:
        return(player[3],player[4],player[5],player[6],player[7])

# -------------------------------------------------MATH--------------------------------------------------------------#

# This function calculates the distance between any 2 airport locations given and return distance in km
# Require four arguments <latitude1>, <longitude1>, <latitude2>, <longitude2>

@app.route('/distance_calculate')
def distance_calculate(self):
    args = request.args
    latitude1 = args.get("latitude1")
    longitude1 = args.get("longitude1")
    latitude2 = args.get("latitude2")
    longitude2 = args.get("longitude2")

    location1 = (latitude1, longitude1)
    location2 = (latitude2, longitude2)

    distance = geodesic(location1, location2).km

    return distance

# -------------------------------------------------------------------------------------------------------------------#

# This function calculates how much fuel airplane has used. Function return used fuel in litres
# Fuel_burn_rate is in database in airplane table and value is litres per 100km per passenger
# Require two arguments <distance> and <fuel_burn_rate>

@app.route('/calculeta_fuel')
def calculate_fuel(self):
    args = request.args
    distance = args.get("distance")
    fuel_burn_rate = args.get("fuel_burn_rate")

    fuel_consumed = distance * (fuel_burn_rate / 100)
    return fuel_consumed

# -------------------------------------------------------------------------------------------------------------------#

# Function to calculate time spent while flying. Distance is in km and speed in database is in metres per second. Return time spend in hours.
# Require two arguments <speed> and <distance>

@app.route('/calculeta_time_spent')
def calculate_time_spent(speed):
    args = request.args
    speed = args.get("speed")
    distance = args.get("distance")
    
    time_spent = distance / (speed * 3.6)

    return time_spent


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000, debug=True)