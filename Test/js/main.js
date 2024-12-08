'use strict';
/* 1. show map using Leaflet library. (L comes from the Leaflet library) */

const map = L.map('map', { tap: false });
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);
map.setView([60, 24], 7);

L.marker([60, 24]).addTo(map)
  .bindPopup('you are here!!!')
  .openPopup();


// global variables
const apiUrl = 'http://127.0.0.1:3000'//start address to python
const startLocation = ''; //from where we want to start we will put ident
// icons

// form for player name
document.querySelector('#player-form').addEventListener('submit', function (evt) {
  evt.preventDefault();
  const playerName = document.querySelector('#player-input').value;
  //playerName variable will connect to backend player name
  document.querySelector('#start-form').classList.add('hide');
})

// function to fetch data from API

// function to update game status

// function to show weather at selected airport

// function to check if any goals have been reached

// function to update goal data and goal table in UI

// function to check if game is over

// function to set up game
// this is the main function that creates the game and calls the other functions

// event listener to hide goal splash
