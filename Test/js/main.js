'use strict';

//
// Map setup
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
  attribution: 'Map data &copy; 2024 Google'
}).addTo(map);
//
// set startup view coordinates of the Map view
map.setView([60, 24], 4);


//
// global variables
//
// address to backend
const apiUrl = 'http://127.0.0.1:3000/';
// from where we want to start we will put ident
const startLocation = 'EFHK';
const homeLocation = 'EFHK';
const homeContinent = 'EU';
const homeCoordinates = [60.3172, 24.963301];
const planeId = 1;
let AirportsIdents = {};
let PlaneInfo = {};
let userId = '';
let userName = '';
const boxToDel = 25;
let boxInPlane = 0;
let boxDel = 0;

//
// create airport markers constant to map
const airportMarkers = L.featureGroup().addTo(map);
// OpenWeatherMap API key
const APIkey = '7bfbeb2ebaec8cdb59103f744a3e8c1f';

//
// icons definitions
const blueIcon = L.divIcon({ className: 'blue-icon' });
const greenIcon = L.divIcon({ className: 'green-icon' });
const redIcon = L.divIcon({ className: 'red-icon' });

//
// GAMING STARTS HERE
//
// form for player name
document.querySelector('#player-form').addEventListener('submit', function (evt) {
  evt.preventDefault();
  //
  // save player name from form into constant
  const playerName = document.querySelector('#player-input').value;
  //
  // hide player name form div
  document.querySelector('#start-form').classList.add('hide');
  //
  // call gameStart function to start the game
  gameStart(playerName);
})

//
// HERE WILL BE THE GAMEPLAY ENGINE FUNCTIONS
// START
// PLAY
// END
//
async function gameStart(playerName) {
  // This create user by sending player name to backend, return with userid
  try {
    const responseName = await fetch(`${apiUrl}create_user?player_name=${playerName}`);
    const NameData = await responseName.json();
    userId = NameData.user_id;
    userName = playerName;
    console.log(userId);
    const section1 = document.querySelector('#player-info');
    const p1 = document.createElement('p');
    p1.innerHTML = `Nimi: ${playerName}`;
    section1.append(p1);
  } catch (error) {
    console.log(error);
  }

  //
  // This create randomly 15 airports, return with each ident and each with random number of boxes as object literal?
  try {
    const responseGetAirports = await fetch(`${apiUrl}get_ap_idents?continent=${homeContinent}`);
    AirportsIdents = await responseGetAirports.json();
    // console.log(AirportsIdents);
  } catch (error) {
    console.log(error);
  }

  //
  // This get airplane info, return with name, fuel cons, airspeed, capasity
  try {
    const responseGetPlaneInfo = await fetch(`${apiUrl}get_airplane_info?plane_id=${planeId}`);
    const AirPlaneInfoData = await responseGetPlaneInfo.json();
    PlaneInfo = AirPlaneInfoData;
    console.log(AirPlaneInfoData);
    const section2 = document.querySelector('#airplane-info');
    const p2a = document.createElement('p');
    const p2b = document.createElement('p');
    const p2c = document.createElement('p');
    const p2d = document.createElement('p');
    p2a.innerHTML = `Nimi: ${AirPlaneInfoData['name']}`;
    p2b.innerHTML = `Kulutus: ${AirPlaneInfoData['fuel']} l/km`;
    p2c.innerHTML = `Nopeus: ${AirPlaneInfoData['speed']} m/s`;
    p2d.innerHTML = `Tilavuus: ${AirPlaneInfoData['capasity']} laatikkoa`;
    section2.append(p2a);
    section2.append(p2b);
    section2.append(p2c);
    section2.append(p2d);
  } catch (error) {
    console.log(error);
  }

  //
  // Statistiikka INFOS to UI
  //
  // This get player current info from DB to UI
  try {
    const responseGetPlayerInfo = await fetch(`${apiUrl}get_player_info?player_name=${playerName}&player_id=${userId}`);
    const GetPlayerInfo = await responseGetPlayerInfo.json();
    console.log(GetPlayerInfo)
    const section3ul = document.querySelector('#statistics-listname');
    const li3a = document.createElement('li');
    const li3b = document.createElement('li');
    const li3c = document.createElement('li');
    const li3d = document.createElement('li');
    const li3e = document.createElement('li');
    li3a.innerHTML = `Matka: ${GetPlayerInfo['distance']} km.`;
    li3b.innerHTML = `Aika: ${GetPlayerInfo['used_time']} tuntia.`;
    li3c.innerHTML = `Päästöt yhteensä: ${GetPlayerInfo['cons_gas']} g.`;
    li3d.innerHTML = `Laatikoita lentokoneessa: ${boxInPlane}`;
    li3e.innerHTML = `Laatikoita kuljetettu: ${boxDel}`;
    section3ul.append(li3a);
    section3ul.append(li3b);
    section3ul.append(li3c);
    section3ul.append(li3d);
    section3ul.append(li3e);


  } catch (error) {
    console.log(error)
  }

  //
  // Weather info into UI. Do if time.
  //
  // function to show weather at selected airport in UI
  function showWeather(airport) {
    document.querySelector('#airport-name').innerHTML = `Weather at ${airport.name}`;
    document.querySelector('#weather-icon').src = airport.weather.icon;
    document.querySelector('#airport-condition').innerHTML = airport.weather.description;
    document.querySelector('#irport-temp').innerHTML = `${airport.weather.temp}`;

  }

  //
  // This get airport info per Airport to put into UI
  try {
    for (let ident in AirportsIdents) {
      const responseAirportsInfo = await fetch(`${apiUrl}get_ap_info?ident=${ident}`);
      const GetAirportInfoData = await responseAirportsInfo.json();

      AirportsIdents[ident] = { ...AirportsIdents[ident], ...GetAirportInfoData };
    }
  } catch (error) {
    console.log(error);
  }

  //
  // This get each airport location and attach it into info and then put it all into UI
  try {

    for (let ident in AirportsIdents) {
      const responseGetAirportCoord = await fetch(`${apiUrl}get_ap_coordinates?ident=${ident}`);
      const GetAirportCoord = await responseGetAirportCoord.json();
      AirportsIdents[ident] = { ...AirportsIdents[ident], ...GetAirportCoord };
    }
    // console.log(AirportsIdents);

    //
    // Add airport markers and popups to Map
    airportMarkers.clearLayers();

    //
    // Home airport marker and popup
    const marker_home = L.marker([60.3172, 24.963301]).addTo(map);
    airportMarkers.addLayer(marker_home);
    marker_home.setIcon(redIcon);
    marker_home.bindPopup(`Helsinki-Vantaa<br>Your home airport.`);
    marker_home.openPopup();

    //
    // Other airport markers and popup
    for (let airport in AirportsIdents) {
      const marker = L.marker([parseFloat(AirportsIdents[airport]['lat']), parseFloat(AirportsIdents[airport]['long'])]).addTo(map);
      airportMarkers.addLayer(marker);
      marker.setIcon(blueIcon);
      // popup
      const popupContent = document.createElement('div');
      const h4 = document.createElement('h4');
      h4.innerHTML = AirportsIdents[airport]['name'];
      popupContent.append(h4);
      const pB = document.createElement('p');
      pB.innerHTML = `Boxes: ${AirportsIdents[airport]['box']}`;
      popupContent.append(pB);
      // with button
      const goButton = document.createElement('button');
      goButton.classList.add('button');
      goButton.innerHTML = 'Fly here?';
      popupContent.append(goButton);
      marker.bindPopup(popupContent);


      // here goButton addEventListener type click function transport plane to next location....
      // console.log(`${userId},${homeLocation},${airport}`);
      goButton.addEventListener('click', function () {
        gamePlay(userId, homeLocation, airport);
      });
    }

  } catch (error) {
    console.log(error);
  }

}

async function gamePlay(userId, fromAirport, toAirport) {
  console.log(userId, fromAirport, toAirport)
  // console.log(AirportsIdents['lat'])

  //
  // This calc distance between APs, used time, cons fuel
  try {

    // This get ap coordinates
    const ResponseAp1Coord = await fetch(`${apiUrl}get_ap_coordinates?ident=${fromAirport}`);
    const Ap1CoordData = await ResponseAp1Coord.json();
    const ResponseAp2Coord = await fetch(`${apiUrl}get_ap_coordinates?ident=${toAirport}`);
    const Ap2CoordData = await ResponseAp2Coord.json();

    // This calculate distance between ap and time used to fly
    const ResponseApDistance = await fetch(`${apiUrl}distance_calculate?lati1=${Ap1CoordData['lat']}&long1=${Ap1CoordData['long']}&lat2=${Ap2CoordData['lat']}&long2=${Ap2CoordData['long']}`);
    const ApDistanceData = await ResponseApDistance.json();
    const ResponseFlyTime = await fetch(`${apiUrl}calculate_time_spent?speed=${PlaneInfo['speed']}&distance=${ApDistanceData['distance']}`);
    const FlyTimeData = await ResponseFlyTime.json();

    // This calculate fuel consumed
    const ResponseFuelConsumed = await fetch(`${apiUrl}calculate_fuel?distance=${ApDistanceData['distance']}&fuel_burn_rate=${PlaneInfo['fuel']}`);
    const FuelConsumed = await ResponseFuelConsumed.json();

    // Update player stats to BEDB
    const ResponseUpdatePlayer = await fetch(`${apiUrl}update_player?player_name=${userName}&player_id=${userId}&distance=${ApDistanceData['distance']}&time_spent=${FlyTimeData['time_spent']}&fuel_consumed=${FuelConsumed['fuel']}`);

  } catch (error) {
    console.log(error);
  }

  //
  // Update player stats to UI
  try {

    //  This check plane capacity and amount at airport
    let ableToGetInPlane = PlaneInfo['capasity'] - boxInPlane;

    if (toAirport === homeLocation) {
      boxDel = boxDel + boxInPlane;
      boxInPlane = 0;
      if (boxDel >= boxToDel) {
        endGame(userId, userName);
      }
    }
    // This to pick up boxes from AP to Plane, remove from AP
    else if (AirportsIdents[toAirport]['box'] < ableToGetInPlane) {
      let loadingInToPlane = AirportsIdents[toAirport]['box'];
      boxInPlane += loadingInToPlane;
      AirportsIdents[toAirport]['box'] -= loadingInToPlane;
    }
    else {
      let loadingInToPlane = ableToGetInPlane;
      boxInPlane += loadingInToPlane;
      AirportsIdents[toAirport]['box'] -= loadingInToPlane;
    }

    //
    // Update Player stats into UI
    const responseGetPlayerInfo = await fetch(`${apiUrl}get_player_info?player_name=${userName}&player_id=${userId}`);
    const GetPlayerInfo = await responseGetPlayerInfo.json();
    console.log(GetPlayerInfo);
    const section3ul = document.querySelector('#statistics-listname');
    section3ul.innerHTML = '';
    const li3a = document.createElement('li');
    const li3b = document.createElement('li');
    const li3c = document.createElement('li');
    const li3d = document.createElement('li');
    const li3e = document.createElement('li');
    li3a.innerHTML = `Matka: ${GetPlayerInfo['distance']} km.`;
    li3b.innerHTML = `Aika: ${GetPlayerInfo['used_time']} tuntia.`;
    li3c.innerHTML = `Päästöt yhteensä: ${GetPlayerInfo['cons_gas']} g.`;
    li3d.innerHTML = `Laatikoita lentokoneessa: ${boxInPlane}`;
    li3e.innerHTML = `Laatikoita kuljetettu: ${boxDel}`;
    section3ul.append(li3a);
    section3ul.append(li3b);
    section3ul.append(li3c);
    section3ul.append(li3d);
    section3ul.append(li3e);


  } catch (error) {
    console.log(error)
  }

  //
  // MAP UPDATE
  //
  // Add airport markers and popups to Map
  airportMarkers.clearLayers();

  //
  // Home airport marker and popup
  const marker_home = L.marker([60.3172, 24.963301]).addTo(map);
  airportMarkers.addLayer(marker_home);
  marker_home.setIcon(redIcon);
  // popup
  const popupContent = document.createElement('div');
  const h4 = document.createElement('h4');
  h4.innerHTML = 'Your home airport.';
  popupContent.append(h4);
  // with button
  const goButton = document.createElement('button');
  goButton.classList.add('button');
  goButton.innerHTML = 'Fly home?';
  popupContent.append(goButton);
  marker_home.bindPopup(popupContent);
  // marker_home.openPopup();
  goButton.addEventListener('click', function () {
    gamePlay(userId, toAirport, homeLocation);
  });

  //
  // Other airport markers and popups
  for (let airport in AirportsIdents) {
    const marker = L.marker([parseFloat(AirportsIdents[airport]['lat']), parseFloat(AirportsIdents[airport]['long'])]).addTo(map);
    airportMarkers.addLayer(marker);
    if (airport === toAirport) {
      marker.setIcon(greenIcon)
    } else {
      marker.setIcon(blueIcon);
    }
    // popup
    const popupContent = document.createElement('div');
    const h4 = document.createElement('h4');
    h4.innerHTML = AirportsIdents[airport]['name'];
    popupContent.append(h4);
    const pB = document.createElement('p');
    pB.innerHTML = `Boxes: ${AirportsIdents[airport]['box']}`;
    popupContent.append(pB);
    // with button
    const goButton = document.createElement('button');
    goButton.classList.add('button');
    goButton.innerHTML = 'Fly here!';
    popupContent.append(goButton);
    marker.bindPopup(popupContent);
    marker.openPopup();
    goButton.addEventListener('click', function () {
      gamePlay(userId, toAirport, airport);
    });
  }
}

//
// THIS TO ENDGAME
//
async function endGame(userId, userName) {
  try {

    // update end stats to end UI
    const responseGetPlayerInfo = await fetch(`${apiUrl}get_player_info?player_name=${userName}&player_id=${userId}`);
    const GetPlayerInfo = await responseGetPlayerInfo.json();
    console.log(GetPlayerInfo);
    const endgameul = document.querySelector('#statistics-endgame');
    endgameul.innerHTML = '';
    const li4a = document.createElement('li');
    const li4b = document.createElement('li');
    const li4c = document.createElement('li');
    const li4e = document.createElement('li');
    li4a.innerHTML = `Kuljettu matka: ${GetPlayerInfo['distance']} km.`;
    li4b.innerHTML = `Kulunut aika: ${GetPlayerInfo['used_time']} tuntia.`;
    li4c.innerHTML = `Päästöt yhteensä: ${GetPlayerInfo['cons_gas']} g.`;
    li4e.innerHTML = `Laatikoita kuljetettu: ${boxDel}`;
    endgameul.append(li4a);
    endgameul.append(li4b);
    endgameul.append(li4c);
    endgameul.append(li4e);




  } catch (error) {
    console.log(error)
  }

  //
  // show END GAME STATS
  const gameOverElement = document.getElementById('game-over');
  gameOverElement.classList.remove('hide');

}
