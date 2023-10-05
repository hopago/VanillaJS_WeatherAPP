export const setPlaceholderText = () => {
    const input = document.getElementById("searchBar__text");
    window.innerWidth < 400 
      ? (input.placeholder = "City, State, Country") 
      : (input.placeholder = "City, State, Country or Zip Code");
};

export const addSpinner = (element) => {
    animateButton(element);
    setTimeout(animateButton, 700, element);
};

const animateButton = (element) => {
    element.classList.toggle("none");
    element.nextElementSibling.classList.toggle("block");
    element.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMsg, screenMsg) =>  {
    updateWeatherLocationHeader(headerMsg);
    updateScreenReaderConfirmation(screenMsg);
};

export const displayApiError = (statusCode) => {
    const properMessage = toProperCase(statusCode.message);
    updateWeatherLocationHeader(properMessage);
    updateScreenReaderConfirmation(`${properMessage}. Please Try Again...`);
};

const toProperCase = (text) => {
    const words = text.split(" ");
    const properWords = words.map(word =>{
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return properWords.join(" ");
};

const updateWeatherLocationHeader = (message) => {
    const h1 = document.getElementById("currentForecast__location");
    if (message.indexOf("Lat:") !== - 1 && message.indexOf("Long:") !== -1) {
        const messageArray = message.split(" ");
        const mapArray = messageArray.map(msg => {
            return msg.replace(":", ": ");
        });
        const lat = mapArray[0].indexOf("-") === -1 
          ? mapArray[0].slice(0, 10) 
          : mapArray[0].slice(1, 11);
        const lon = mapArray[1].indexOf("-") === -1 
          ? mapArray[1].slice(0, 11) 
          : mapArray[1].slice(0, 12);
        h1.textContent = `${lat} | ${lon}`;
    } else {
        h1.textContent = message;
    }
};

export const updateScreenReaderConfirmation = (message) => {
    document.getElementById("confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj) => {
    fadeDisplay();

    clearDisplay();

    const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
    setBgImg(weatherClass);

    const screenReaderWeather = buildScreenReaderWeather(weatherJson, locationObj);

    updateScreenReaderConfirmation(screenReaderWeather);
    updateWeatherLocationHeader(locationObj.getName());

    // current conditions
    const ccArray = createCurrentConditionsDivs(weatherJson, locationObj.getUnit());
    displayCurrentConditions(ccArray);
    displaySixDayForecast(weatherJson);

    // daily forecast
    setFocusOnSearch();

    fadeDisplay();
};

const fadeDisplay = () => {
    const currentCondition = document.getElementById("currentForecast");
    currentCondition.classList.toggle("zero-vis");
    currentCondition.classList.toggle("fade-in");
    const sixDay = document.getElementById("dailyForecast");
    sixDay.classList.toggle("zero-vis");
    sixDay.classList.toggle("fade-in");
};

const clearDisplay = () => {
    const currentCondition = document.getElementById("currentForecast__conditions");
    deleteContents(currentCondition);
    const sixDayForecast = document.getElementById("dailyForecast__contents");
    deleteContents(sixDayForecast);
};

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};

const getWeatherClass = (icon) => {
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    const weatherLookUp = {
        "09": "snow",
        "10": "rain",
        "11": "rain",
        "13": "snow",
        "50": "fog"
    };
    let weatherClass;
    if (weatherLookUp[firstTwoChars]) {
        weatherClass = weatherLookUp[firstTwoChars];
    } else if (lastChar === "d") {
        weatherClass = "clouds";
    } else {
        weatherClass = "night";
    }
    return weatherClass;
};

const setBgImg = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach(img => {
        if (img !== weatherClass) document.documentElement.classList.remove(img);
    });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "imperial" ? "Fahrenheit" : "Celsius";
    return `${weatherJson.current.weather[0].description} 
    and ${Math.round(Number(weatherJson.current.temp))}°
    ${tempUnit} in ${location}
    `;
};

const setFocusOnSearch = () => {
    document.getElementById("searchBar__text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
    const tempUnit = unit === "imperial" ? "Fahrenheit" : "Celsius";
    const windUnit = unit === "imperial" ? "mph" : "m/s";
    const icon = createMainImgDiv(
        weatherObj.current.weather[0].icon,
        weatherObj.current.weather[0].description
    );
    const temp = createElement("div", "temp", `${Math.round(Number(weatherObj.current.temp))}°`, tempUnit);
    const properDesc = toProperCase(weatherObj.current.weather[0].description);
    const desc = createElement("div", "desc", properDesc);
    const feels = createElement("div", "feels", `Feels Like ${Math.round(Number(weatherObj.current.feels_like))}°`);
    const maxTemp = createElement("div", "maxtemp", `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`);
    const minTemp = createElement("div", "mintemp", `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`);
    const humidity = createElement("div", "humidity", `Humidity ${weatherObj.current.humidity}%`);
    const wind = createElement("div", "wind", `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`);
    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImgDiv = (icon, altText) => {
    const iconDiv = createElement("div", "icon");
    iconDiv.id = "icon";
    const faIcon = translateIconToFontAweSome(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
};

const createElement = (type, className, text, unit) => {
    const div = document.createElement(type);
    div.className = className;
    if (text) {
        div.textContent = text;
    }
    if (className === "temp") {
        const unitDiv = document.createElement("div");
        unitDiv.className = "unit";
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    };
    return div;
};

const translateIconToFontAweSome = (icon) => {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0, 2);
    const lastChar = icon.slice(2);
    switch (firstTwoChars) {
        case "01":
            if (lastChar === "d") {
                i.classList.add("far", "fa-sun");
            } else {
                i.classList.add("far", "fa-moon");
            }
            break;
        case "02":
            if (lastChar === "d") {
                i.classList.add("fas", "fa-cloud-sun");
            } else {
                i.classList.add("fas", "fa-cloud-moon");
            }
            break;
        case "03":
            i.classList.add("fas", "fa-cloud");
            break;
        case "04":
            i.classList.add("fas", "fa-cloud-meatball");
            break;
        case "09":
            i.classList.add("fas", "fa-cloud-rain");
            break;
        case "10":
            if (lastChar === "d") {
                i.classList.add("fas", "fa-cloud-sun-rain");
            } else {
                i.classList.add("fas", "fa-cloud-moon-rain");
            }
        case "11":
            i.classList.add("fas", "fa-poo-storm");
            break;
        case "13":
            i.classList.add("far", "fa-snowflake");
            break;
        case "50":
            i.classList.add("fas", "fa-smog");
            break;
        default:
            i.classList.add("far", "fa-question-circle");
    }
    return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
    const ccContainer = document.getElementById("currentForecast__conditions");
    currentConditionsArray.forEach(cc => {
        ccContainer.appendChild(cc);
    });
};

const displaySixDayForecast = (weatherJson) => {
    for (let i = 1; i <=7; i++) {
        const dfArray = createDailyForecastDivs(weatherJson,daily[i]);
        displayDailyForecast(dfArray);
    }
};

const createDailyForecastDivs = (dayWeather) => {
    const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
    const dayAbbreviation = createElement("p", "dayAbbreviation", dayAbbreviationText);
    const dayIcon = createDailyForecastIcon(dayWeather.weather[0].icon, dayWeather.weather[0].description);
    const dayHigh = createElement("p", "dayHigh", `${Math.round(Number(dayWeather.temp.max))}°`);
    const dayLow = createElement("p", "dayLow", `${Math.round(Number(dayWeather.temp.min))}°`);
    return [dayAbbreviation, dayIcon, dayHigh, dayLow];
};

const getDayAbbreviation = (data) => {
    const dateObj = new Date(data * 1000);
    const utcString = dateObj.toUTCString();
    return utcString.slice(0,3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText) => {
    const img = document.createElement("img");
    if (window.innerWidth < 768 || window.innerHeight < 1025) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    } else {
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    img.alt = altText;
    return img;
};

const displayDailyForecast = (dfArray) => {
    const dayDiv = createElement("div", "forecastDay");
    dfArray.forEach(element => {
        dayDiv.appendChild(element);
    });
    const dailyForecastContainer = document.getElementById("dailyForecast__contents");
    dailyForecastContainer.appendChild(dayDiv);
};