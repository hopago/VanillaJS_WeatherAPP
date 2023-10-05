import { 
    setLocationObject,
    getHomeLocation,
    cleanText,
    getCoordsFromApi,
    getWeatherFromCoords
} from './dataFunctions.js';
import { 
    addSpinner,
    displayApiError,
    displayError,
    setPlaceholderText,
    updateScreenReaderConfirmation,
    updateDisplay
} from './domFunctions.js';
import CurrentLocation from './CurrentLocation.js';

const currentLoc = new CurrentLocation();

const initApp = () => {
    // listeners
    const geoButton = document.getElementById("getLocation");
    geoButton.addEventListener("click", getGeoWeather);
    const homeButton = document.getElementById("home");
    homeButton.addEventListener("click", loadWeather);
    const saveButton = document.getElementById("saveLocation");
    saveButton.addEventListener("click", saveLocation);
    const unitButton = document.getElementById("unit");
    unitButton.addEventListener("click", setUnitPref);
    const refreshButton = document.getElementById("refresh");
    refreshButton.addEventListener("click", refreshWeather);
    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);
    // set up
    setPlaceholderText();
    // load weather
    loadWeather();
};

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (e) => {
    if (e){
        if(e.type === 'click') {
            // add spinner
            const mapIcon = document.querySelector(".fa-map-marker-alt");
            addSpinner(mapIcon);
        }
    }
    if(!navigator.geolocation) return geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

const geoError = (errObj) => {
    const errorMessage = errObj ? errObj.message : "Geolocation not supported...";
    displayError(errorMessage, errorMessage);
};

const geoSuccess = (position) => {
    const myCoordinatesObject ={
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `Lat: ${position.coords.latitude} Long: ${position.coords.longitude}`,
    };
    // set location object
    setLocationObject(currentLoc, myCoordinatesObject);
    // update data and display
    updateDataAndDisplay(currentLoc);
};

const loadWeather = (e) => {
    const savedLocation = getHomeLocation();
    if (!savedLocation && !e) return getGeoWeather();
    if (!savedLocation && e.type === "click") {
        displayError(
            "No Home Location Saved...",
            "Please save your home location first..."
        );
    } else if (savedLocation && !e) {
        displayHomeLocationWeather(savedLocation);
    } else {
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
    }
};

const displayHomeLocationWeather = (home) => {
    if (typeof home === "string") {
        const locationJson = JSON.parse(home);
        const myCoordsObj = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name: locationJson.name,
            unit: locationJson.unit
        };
        setLocationObject(currentLoc, myCoordsObj);
        updateDataAndDisplay(currentLoc);
    }
};

const saveLocation = () => {
    if (currentLoc.getLat() && currentLoc.getLon()) {
        const saveIcon = document.querySelector(".fa-save");
        addSpinner(saveIcon);
        const location = {
            name: currentLoc.getName(),
            lat: currentLoc.getLat(),
            lon: currentLoc.getLon(),
            unit: currentLoc.getUnit()
        };
        localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
        updateScreenReaderConfirmation(`Saved ${currentLoc.getName()} as home location`);
    }
};

const setUnitPref = () => {
    const unitIcon = document.querySelector(".fa-chart-bar");
    addSpinner(unitIcon);
    currentLoc.toggleUnit();
    updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
    const refreshIcon = document.querySelector(".fa-sync-alt");
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLoc);
};

const submitNewLocation = async (e) => {
    e.preventDefault();
    const text = document.getElementById("searchBar__text").value;
    const entryText = cleanText(text);
    if (!entryText.length) return;
    const locationIcon = document.querySelector(".fa-magnifying-glass");
    addSpinner(locationIcon);
    const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
    if (coordsData) {
        if (coordsData.cod === 200) {
            // 200
            console.log(coordsData);
            const myCoordsObj = {
                lat: coordsData.coord.lat,
                lon: coordsData.coord.lon,
                name: coordsData.sys.country 
                  ? `${coordsData.name}, ${coordsData.sys.country}` 
                  : coordsData.name,
            };
            setLocationObject(currentLoc, myCoordsObj);
            updateDataAndDisplay(currentLoc);
        } else {
            displayApiError(coordsData);
        }
    } else {
        displayError("Connection Error", "Connection Error");
    }
};

const updateDataAndDisplay = async (locationObj) => {
    const weatherJSON = await getWeatherFromCoords(locationObj);
    if (weatherJSON) updateDisplay(weatherJSON, locationObj);
};