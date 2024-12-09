# This file contains all functions to and from our database
from geopy.distance import geodesic
import mysql.connector, random
from flask import Flask, request
import json

app = Flask(__name__)

class StartGameVariables: # Parent

    # Variables for the game

    def __init__(self, player_id, player_name, boxes_to_transport, boxes_delivered,
                boxes_in_plane, ident, plane_id=1, game_airports={}, home_airport='EFHK', home_continent='EU'):
        
        self.game_airports = game_airports
        self.player_name = player_name
        self.player_id = player_id
        self.boxes_to_transport = boxes_to_transport
        self.home_airport = home_airport
        self.home_continent = home_continent
        self.plane_id = plane_id
        self.boxes_delivered = boxes_delivered
        self.boxes_in_plane = boxes_in_plane
        self.ident = ident

class Database(StartGameVariables): # Child A

    def __init__(self, player_id, player_name, boxes_to_transport, boxes_delivered,
                boxes_in_plane, plane_id, game_airports, home_airport, home_continent, ident):
        
        super().__init__(player_id, player_name, boxes_to_transport, boxes_delivered,
                boxes_in_plane, plane_id, game_airports, home_airport, home_continent,ident)
        
        self.yhteys = mysql.connector.connect(
            host="localhost",
            port=3306,
            database="rahtipeli",
            user="pilotti",
            password="pilotti12345",
            autocommit=True,
            collation='utf8mb4_unicode_ci'
            )

    @app.route('/create_users')    
    def create_users(self):
        sql = f"INSERT INTO PLAYER (name,ap_ident,distance,used_time,cons_gas,money,score) VALUES ('{self.player_name}','{self.home_airport}',0,0,0,0,0);"
        kursori = self.yhteys.cursor()
        kursori.execute(sql)
        user_id = kursori.lastrowid
        self.player_id = user_id


    # Function select randomly airports from designed continent and add them to dictionary.
    # Its also select random values of boxes for each airports.

    @app.route('/create_game')
    def create_game(self):
        sql = f"SELECT ident FROM airport WHERE continent = '{self.home_continent}'"
        kursori = self.yhteys.cursor()
        kursori.execute(sql)
        tulos = kursori.fetchall()

        for time in range(15):
            choice_airport = random.choice(tulos)
            if choice_airport not in self.game_airports:
                # add new random airport to dictionary and add random 1-15 boxes to airport
                self.game_airports[choice_airport[0]] = random.randint(1,15) #Generate random numbers for airport.

        # return game_airports


    # Fuction to get information of any given airport. Fuction return airport details (Name, city and country)
    @app.route('/get_information')
    def get_information(self):
        sql = f"SELECT airport.name, airport.municipality, country.name FROM airport, country WHERE airport.ident = '{self.ident}' and airport.iso_country = country.iso_country;"
        kursori = self.yhteys.cursor()
        kursori.execute(sql)
        tulos = kursori.fetchall()

        for info in tulos:
            # return ap name, ap municipality, ap country name
            return(info[0],info[1],info[2])


    # Function to get coordinates of any given airport identified by ident
    @app.route('/get_coordinates')
    def get_coordinates(self):
        sql = f"SELECT airport.latitude_deg, airport.longitude_deg FROM airport WHERE airport.ident = '{self.ident}';"
        kursori = self.yhteys.cursor()
        kursori.execute(sql)
        tulos = kursori.fetchall()

        for kordinaatti in tulos:
            # return latitude, longitude coordinates
            place = kordinaatti[0], kordinaatti[1]
            return place # return coordinates


    # Function to get info from airplane name, model, fuel consume, capasity
    @app.route('/airplane_info')
    def airplane_info(self):
        sql = f"SELECT airplane.plane_id, airplane.name, airplane.consume, airplane.speed, airplane.capasity FROM airplane WHERE airplane.plane_id = '{self.plane_id}';"
        kursori = self.yhteys.cursor()
        kursori.execute(sql)
        tulos = kursori.fetchall()

        for content in tulos:
            # return: ap name, ap fuel ratio litres per 100km per passenger, ap speed in m/s and ap max box capasity
            return (content[1], content[2], content[3], content[4])


    # Function to update player values
    @app.route('/update_game')
    def update_game(self):
        # distance in km, used_time in hours, cons_gas in litres
        sql = f"UPDATE player SET distance = distance+{Math.distance}, used_time = used_time+{Math.time_spent}, cons_gas = cons_gas+{Math.fuel_consumed} WHERE name = '{self.player_name}' and player_id = {self.player_id};"
        kursori = self.yhteys.cursor()
        kursori.execute(sql)


    # Function to get players info and
    # return traveled distance, used time, used fuel, money and score
    @app.route('/close_game')
    def close_game(self,player_name: str):
        sql = f"SELECT * FROM player WHERE name = '{player_name}' and player_id = {self.player_id}"
        kursori = self.yhteys.cursor()
        kursori.execute(sql)
        tulos = kursori.fetchall()

        for player in tulos:
            # return: distance, used_time, cons_gas, money, score
            return(player[3],player[4],player[5],player[6],player[7])


class Math(StartGameVariables): # Child B

    def __init__(self, longitude1, latitude1,latitude2, longitude2, distance, fuel_burn_rate):  
        self.latitude1 = latitude1
        self.longitude1 = longitude1
        self.latitude2 = latitude2
        self.longitude2 = longitude2
        self.distance = distance
        self.fuel_burn_rate = fuel_burn_rate

    # This function calculates the distance between any 2 airport locations given
    # distance return in km
    @app.route('/distance_calculate')
    def distance_calculate(self):

        self.location1 = (self.latitude1, self.longitude1)
        self.location2 = (self.latitude2, self.longitude2)

        self.distance = geodesic(self.location1, self.location2).km

        # return distance in kilometers
        # return distance


    # This function calculates how much fuel airplane has used
    # fuel_burn_rate is in database in airplane table
    @app.route('/calculeta_fuel')
    def calculate_fuel(self):

        # fuel_burn_rate in database in litres per 100km per passenger
        # calculate litres used

        self.fuel_consumed = self.distance * (self.fuel_burn_rate / 100)
        # return used fuel in litres
        # return fuel_consumed


    # Function to calculate time spent while flying
    # distance is in km
    # speed in database is in metres per second
    @app.route('/calculeta_time_spent')
    def calculate_time_spent(self, speed):
        self.speed = speed
        self.time_spent = self.distance / (speed * 3.6)

        # return time_spend in hours

        # return time_spent


    # Function to calculate score for player
    # def calculate_score(flight_time, fuel_used, money ):




if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)