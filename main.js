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
    errorMsg: document.querySelector('.error-msg'),
    fiveDayImages: document.querySelectorAll('.five-day-img'),
    fiveDayDescriptons: document.querySelectorAll('.five-day-description'),
    fiveDayHighs: document.querySelectorAll('.five-day-high'),
    fiveDayBtn: document.querySelector('.forecast-container').getElementsByTagName('button')[0],
    fiveDayContainer: document.querySelector('.five-day-container'),
    fiveDayBtnCaret: document.getElementById('five-day-caret'),
    fiveDayDates: document.querySelectorAll('.five-day-date')
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
    displayFiveDayForecast(position);
    domElements.zipInput.value = "";
})

domElements.updateCityBtn.addEventListener('click', function(){
    let city = domElements.cityInput.value;

    // update UI using the inputted city name
    showCityAndCountry(city, true);
    displayFiveDayForecast(city);

    //reset input field
    domElements.cityInput.value = '';
});

domElements.fiveDayBtn.addEventListener('click', function(){
    // domElements.fiveDayContainer.classList.toggle('display-flex');
    // domElements.fiveDayContainer.style.opacity = '1';
    domElements.fiveDayContainer.classList.toggle('opacity1');
    domElements.fiveDayBtnCaret.classList.toggle('fa-caret-right');
    domElements.fiveDayBtnCaret.classList.toggle('fa-caret-down');
});

// end event listeners
(function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos){
    	showCityAndCountry(pos);
        displayFiveDayForecast(pos);
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

function displayDescription(el, description) {
	el.textContent = description;
}

function displayTemperature(el, temp) {
	el.innerHTML = `${Math.round(temp)}\xB0`;
}

function displayImage(id, imageTag) {
	switch (true) {
		case id < 300:
			imageTag.src = './img/thunderstorm.png'
			break;

		case id < 600:
			imageTag.src = './img/rain.png'
			break;

		case id < 700:
			imageTag.src = './img/snow.png'
			break;

		case id < 800:
			imageTag.src = './img/fog.png'
			break;

		case id < 801:
			imageTag.src = './img/sun.png'
			break;

		case id < 805:
			imageTag.src = './img/cloudy.png'
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
			// console.log(obj);
			displayLocation(obj.name);
			displayDescription(domElements.weatherDescription, obj.weather[0].main);
			displayImage(obj.weather[0].id, domElements.weatherImg);
			displayTemperature(domElements.weatherTemp, obj.main.temp)
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

function displayFiveDayForecast(location) {
    // 5 day forecast API request
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        // check that API request was successful
        if(this.readyState === 4 && this.status === 200) {
            // convert JSON to JS object
            let json = this.response;
            let obj = JSON.parse(json);
            let return1 = get5DayHighs(obj, getIndexOfNextDay(obj));
            console.log(return1);
            display5DayImages(return1, domElements.fiveDayImages);
            display5DayDescriptions(return1, domElements.fiveDayDescriptons);
            display5DayHighs(return1, domElements.fiveDayHighs);
            display5DayDates();
        }
    }
    
    if(location.coords) {
        xhttp.open('GET', `http://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=imperial&APPID=f791d1536e0411789668d40d454aa0f0`, true);
    } else if(!isNaN(location)) {
        xhttp.open('GET', `http://api.openweathermap.org/data/2.5/forecast?zip=${location},us&units=imperial&APPID=f791d1536e0411789668d40d454aa0f0`, true);
    } else {
        xhttp.open('GET', `http://api.openweathermap.org/data/2.5/forecast?q=${location},us&units=imperial&APPID=f791d1536e0411789668d40d454aa0f0`, true);
    }
    // xhttp.open('GET', 'http://api.openweathermap.org/data/2.5/forecast?q=albany,us&units=imperial&APPID=f791d1536e0411789668d40d454aa0f0', true);
    xhttp.send();

    function getIndexOfNextDay(APIresponse) {
        // get todays date
        let today = new Date();

        // find and return the index of the next day
        for(let i = 0; i < APIresponse.list.length; i++) {
            if(today.getDate() != APIresponse.list[i].dt_txt.slice(8,10)) {
                return i;
            }
        }
    }

    function get5DayHighs(APIresponse, startingIndex) {
        let resultsArr = [];
        let tracker = 1;
        let high = 0;
        let id = 0;
        let description = '';

        for(let i = startingIndex; i < APIresponse.list.length; i++) {
            let resultsObj = {};
            if(APIresponse.list[i].main.temp > high) {

                high = APIresponse.list[i].main.temp;
                id = APIresponse.list[i].weather[0].id;
                description = APIresponse.list[i].weather[0].main;
            }

            if(tracker === 9 || i === APIresponse.list.length - 1) {
                resultsObj.high = high;
                resultsObj.id = id;
                resultsObj.description = description;
                resultsArr.push(resultsObj);
                tracker = 1;
                high = 0;
                id = 0;
                description = '';
            }

            tracker++;
        }
        return resultsArr;
    }

    function display5DayImages(arr, imageTags) {
        for(let i = 0; i < arr.length; i++) {
            displayImage(arr[i].id, imageTags[i])
        }
    }

    function display5DayDescriptions(arr, descriptionTags) {
        for(let i = 0; i < arr.length; i++) {
            displayDescription(descriptionTags[i], arr[i].description)
        }
    }

    function display5DayHighs(arr, highTags) {
        for(let i = 0; i < arr.length; i++) {
            displayTemperature(highTags[i], arr[i].high)
        }
    }

    function display5DayDates() {
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1; //January is 0!

        if (dd < 10) {
          dd = '0' + dd;
        } 
        if (mm < 10) {
          mm = '0' + mm;
        } 

        today = mm + '/' + dd
    
        for(let i = 0; i < 5; i++) {
            domElements.fiveDayDates[i].textContent = today;
            dd++;
            if (dd < 10) {
                dd = '0' + dd;
            } 
            today = mm + '/' + dd;
        }
    }
}



// http://api.openweathermap.org/data/2.5/forecast?q=atlanta,us&units=imperial&APPID=f791d1536e0411789668d40d454aa0f0