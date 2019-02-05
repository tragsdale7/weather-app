let domElements = {
	x: document.getElementById("demo"),
	userLocation: document.getElementById('user-location'),
	weatherDescription: document.querySelector('.weather-description'),
	weatherImg: document.querySelector('.weather-img'),
	weatherTemp: document.querySelector('.weather-temp'),
    zipInput: document.getElementById('zipInput'),
    cityInput: document.getElementById('cityInput'),
    updateZipBtn: document.querySelector('.location-btn'),
    updateCityBtn: document.querySelector('.city-btn'),
    errorMsg: document.querySelector('.error-msg')
}

// Event listeners
domElements.updateZipBtn.addEventListener('click', function(e){
    let position = domElements.zipInput.value;

    // check that input is 5 digits long and a number
    if(isNaN(position) || position.length !== 5) {
        // output error message
        domElements.errorMsg.textContent = 'Error! Please enter a valid 5 digit zip.';
        displayError();
        setTimeout(function() {removeError()}, 4000)
        domElements.zipInput.value = "";
        return;
    }

    // update UI and reset input field 
    showCityAndCountry(position);
    domElements.zipInput.value = "";
})

domElements.updateCityBtn.addEventListener('click', function(){
    let city = domElements.cityInput.value;

    // update UI using the inputted city name
    showCityAndCountry(city, true);

    //reset input field
    domElements.cityInput.value = '';
});

// end event listeners
(function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos){
    	// showPosition(pos);
    	showCityAndCountry(pos);
    });
  } else { 
    domElements.x.innerHTML = "Geolocation is not supported by this browser.";
  }
})();

function displayError() {
    domElements.errorMsg.style.display = 'block';
}

function removeError() {
    domElements.errorMsg.style.display = 'none';
}

function showPosition(coord) {
    domElements.x.innerHTML = "Latitude: " + coord.lat + 
    "<br>Longitude: " + coord.lon;
}

function displayLocation(city) {
	domElements.userLocation.innerHTML = `Here is the current weather in <b>${city}, United States</b>`;
}

function displayDescription(desc) {
	domElements.weatherDescription.textContent = desc;
}

function displayTemperature(temp) {
	domElements.weatherTemp.innerHTML = `${Math.round(temp)}\xB0`
}

function displayImage(id) {
	switch (true) {
		case id < 300:
			domElements.weatherImg.src = './img/thunderstorm.png'
			break;

		case id < 600:
			domElements.weatherImg.src = './img/rain.png'
			break;

		case id < 700:
			domElements.weatherImg.src = './img/snow.png'
			break;

		case id < 800:
			domElements.weatherImg.src = './img/fog.png'
			break;

		case id < 801:
			domElements.weatherImg.src = './img/sun.png'
			break;

		case id < 805:
			domElements.weatherImg.src = './img/cloudy.png'
			break;
	}
}


function showCityAndCountry(position, isCity) {
	// weather api request
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){
        if(this.status === 404) {
            // output error message
            if(!isCity) {
                domElements.errorMsg.textContent = 'Error! Zipcode not found. Please enter a valid zip.';
            } else if(isCity) {
                domElements.errorMsg.textContent = 'Error! City not found. Please enter a valid city name.';
            }
    
            displayError();

            // remove error message after 4 seconds
            setTimeout(function() {removeError()}, 4000)

            // exit the server request
            xhttp.abort();
        }
		if(this.readyState === 4 && this.status === 200) {
			// parse json into javascript object
			let json = this.response;
			let obj = JSON.parse(json);
			console.log(obj);
			displayLocation(obj.name);
			displayDescription(obj.weather[0].main);
			displayImage(obj.weather[0].id);
			displayTemperature(obj.main.temp)
            showPosition(obj.coord)
		}
	}
    if(position.coords) {
        xhttp.open('GET', `http://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial&APPID=f791d1536e0411789668d40d454aa0f0`, true);
    } else if(!isNaN(position)) {
        xhttp.open('GET', `http://api.openweathermap.org/data/2.5/weather?zip=${position},us&units=imperial&APPID=f791d1536e0411789668d40d454aa0f0`, true);
    } else if (isCity) {
        xhttp.open('GET', `http://api.openweathermap.org/data/2.5/weather?q=${position},us&units=imperial&APPID=f791d1536e0411789668d40d454aa0f0`, true);
    }
	
	xhttp.send(); 
}
