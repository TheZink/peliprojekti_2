'use strict';

// Game flow
//
//
//
// Peli alkaa pyytämällä pelaajalta nimen
// ja sitten kutsumalla pelin aloittavia funktioita
// ensin liitetään pelaajan nimeen pelaajalle annettava pelaajaid
// joka syntyy tietokannan rivin järjestysnumerosta
// sitten haetaan kaikki tarvittavat tiedot taustalta fronttiin
// ja peli voi alkaa
// pelaaja voi valita kartalta mille lentokentälle menee
// laatikot siirtyvät kyytiin
// ne pitää palauttaa kotiin
// ja sitten hakea lisää
// kunnes tarvittava määrä viety kotiin
// pelin aikana päivitetään backendiä
// ja kutsutaan päivitettyjä tietoja backendistä takas fronttiin
//
// pelaaja liikkuu kartalla klikkaamalla kartan markkereiden popup
// puhekuplissa olevia "lennä tänne" nappeja
//
// lähdetään liikkeelle kotikentältä (Hki-Vantaa)
// aina kun mennään toiselle kentälle niin
//  otetaan laatikot kyytiin
//  ja päivitetään lennetty matka, kulunut aika, syntynyt co2 tietokantaan
// aina kun käydään kotona
//  jätetään laatikot sinne
//  ja päivitetään lennetty matka, kulunut aika, syntynyt co2 tietokantaan
//  ja tarkastetaan onko laatikoita jo riittävästi
//  jos riittävästi, game over ja tilastot näkyviin.



//
//
// Map setup
//
//
// Leaflet kirjasto ja Google kartta.
/* 1. show map using Leaflet library. (L comes from the Leaflet library) */
//
// link L.map to constant
const map = L.map('map', { tap: false });
//
// setup tileLayer from Google and add it to Map
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
//
// set startup view coordinates of the Map view
map.setView([60, 24], 4);


//
//
// global variables
//
// address to backend
const apiUrl = 'http://127.0.0.1:3000/';
// from where we want to start we will put ident
const startLocation = 'EFHK';
const homeLocation = 'EFHK';
const homeContinent = 'EU';
const planeId = 1;
let AirportsIdents = {};
let userId = '';
// create airport markers constant to map
const airportMarkers = L.featureGroup().addTo(map);
// OpenWeatherMap API key
const APIkey = '7bfbeb2ebaec8cdb59103f744a3e8c1f';



//
//
// icons definitions
const blueIcon = L.divIcon({ className: 'blue-icon' });
const greenIcon = L.divIcon({ className: 'green-icon' });


//
//
//
//
//
//
//
//
//
//
//
//
// TÄSTÄ PELAAMINEN ALKAA
//
//
// form for player name
// aloitetaan peli pyytämällä pelaajalta pelaajan nimi
// ja odottamalla että pelaaja klikkaa game start nappia
document.querySelector('#player-form').addEventListener('submit', function (evt) {
  evt.preventDefault();
  //
  // save player name from form into constant
  const playerName = document.querySelector('#player-input').value;
  //
  // hide player name form div
  document.querySelector('#start-form').classList.add('hide');
  //
  //
  // call gamePlay function to start the game
  gamePlay(playerName);
  // GetAirports(homeContinent);
  //
})



// Do we need this?
//
// function to fetch data from API
async function getData(apiUrl) {
  const response = await fetch('apiUrl');
  if (!response.ok) throw new Error('Invalid server input!');
  const data = await response.json();
  return data;

}

//
//
// function to update game status to UI
function updateStatus(status) {

  document.querySelector('#consumed').innerHTML = `${airport.co2_consumed}`;
  document.querySelector('#budget').innerHTML = `${airport.co2_budget}`;
  document.querySelector('#speed').innerHTML = `${airport.speed}`;
  // document.querySelector('#laatiko-maara').innerHTML = status.


}

//
//
// function to show weather at selected airport in UI
function showWeather(airport) {
  document.querySelector('#airport-name').innerHTML = `Weather at ${airport.name}`;
  document.querySelector('#weather-icon').src = airport.weather.icon;
  document.querySelector('#airport-condition').innerHTML = airport.weather.description;
  document.querySelector('#irport-temp').innerHTML = `${airport.weather.temp}`;

}


// function to check if any goals have been reached?

// function to update goal data and goal table in UI?

// function to check if game is over?



//
//
//
// HERE WILL BE THE GAMEPLAY ENGINE FUNCTIONS
//
//
//
// To play
// we need back player id, airplane info, home airport name and location, 15 airports idents, and their names and their locations
//
//


async function gamePlay(playerName) {
  // This create user by sending player name to backend, return with userid
  try {
    const responseName = await fetch(`${apiUrl}create_user?player_name=${playerName}`);
    const NameData = await responseName.json();
    userId = NameData.user_id;
    console.log(userId);
  } catch (error) {
    console.log(error);
  }

  // This create randomly 15 airports, return with each ident and each with random number of boxes as object literal?
  try {
    const responseGetAirports = await fetch(`${apiUrl}get_ap_idents?continent=${homeContinent}`);
    AirportsIdents = await responseGetAirports.json();
    // console.log(AirportsIdents);
  } catch (error) {
    console.log(error);
  }

  // This get airplane info, return with name, fuel cons, airspeed, capasity
  try {
    const responseGetPlaneInfo = await fetch(`${apiUrl}get_airplane_info?plane_id=${planeId}`);
    const AirPlaneInfoData = await responseGetPlaneInfo.json();
    console.log(AirPlaneInfoData);
  } catch (error) {
    console.log(error);
  }

  // This get airport info per Airport to put into UI
  // /get_ap_info?ident=<ident>
  // get AirPort info by ident: ap name, ap muni, ap country
  // return info in JSON format

  try {
    for (let ident in AirportsIdents) {
      const responseAirportsInfo = await fetch(`${apiUrl}get_ap_info?ident=${ident}`);
      const GetAirportInfoData = await responseAirportsInfo.json();

      AirportsIdents[ident] = { ...AirportsIdents[ident], ...GetAirportInfoData };
      console.log(AirportsIdents)
    }
  } catch (error) {
    console.log(error);
  }
  // ident[]
  // This get each airport location to put into UI
  // /get_ap_coordinates?ident=<ident>
  // get AP loc by ident, return with aport lat, aport lon, both in deg
  // return info in JSON format

  try {

    for (let ident in AirportsIdents) {
      const responseGetAirportCoord = await fetch(`${apiUrl}get_ap_coordinates?ident=${ident}`);
      const GetAirportCoord = await responseGetAirportCoord.json();

      AirportsIdents[ident] = { ...AirportsIdents[ident], ...GetAirportCoord };
      console.log(AirportsIdents);
    }
  } catch (error) {
    console.log(error);
  }

  // This get player current info from DB to UI
  // /get_player_info?player_name=<player_name>&player_id=<player_id>
  // get player current total traveled distance, total used time, total consumed gas, money, score
  // this can be used to get start infos for game
  // and during gameplay getting updated infos from back to front
  // return info in JSON format
  try {
    const responseGetPlayerInfo = await fetch(`${apiUrl}get_player_info?player_name=${playerName}&player_id=${userId}`);
    const GetPlayerInfo = await responseGetPlayerInfo.json();
    console.log(GetPlayerInfo)
  } catch (error) {
    console.log(error)
  }

  // here all that shit into HTML
  // MAP


  // End this with waiting for user mouseclick on any available popup button
}





//
//
// /update_game?player_name=<player_name>&player_id=<player_id>&distance=<distance>&time_spent=<time_spent>&fuel_consumed=<fuel_consumed>
// send player name, player id, distance traveled, time spent, fuel consumed to backend DB
//
//
//
//
//
// other APIs in backend
// /distance_calculate?lati1=<lati1>&long1=<long1>&lati2=<lati2>&long2=<long2>
// return distance in km in JSON format
//
// /calculeta_fuel?distance=<distance>&fuel_burn_rate=<fuel_burn_rate>
// return used fuel in litres in JSON format
//
// /calculeta_time_spent?speed=<speed>&distance=<distance>
// return time spent in hours in JSON format
//
//
//
//
//
//
//
//
/*
updateStatus(gameData);
for (let airport of GetAirportsData)

  if (airport.active) {
    showWeather(airport);
    const marker = L.market([airport.latitude_deg, airport.longitude_deg]).addTo(map);
    const p = document.querySelector('#weather-icon')
    marker.openPopup;
    marker.bindPopup(p, `<b>${airport.name}</b><br>${airport.municipality}, ${airport.country}`);

    marker.setIcon(greenIcon);

  } else {
    marker.setIcon(blueIcon);
    const h4 = document.createElement('h4');
    const p = document.createElement('p');
    h4.innerHTML = `${airport.name}`;
    p.innerHTML = `Distance ${airport.distance}km`; // how to get distance??????
    





  }

*/


function checkGame(budget) {
  if (budget <= 0) {
    alert(`Game Over!!!`);
    return false;
  }
  return true;
}

