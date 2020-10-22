    /* 
        script.js builds our Weather Dashboard using jQuery.
        We are using the openweather.org API in order to
        access weather conditions by city name.
    */

    // Assign our global DOM elements to variables.
    var cityInput = $("#cityInput");
    // Define our variables.
    // isFahrenheit default is true.
    var isFahrenheit = true;
    var unitSelected;
    var unit = "F";


    // Have beautiful Riyadh, Saudi Arabia load on the page by default.
    setWeather("Riyadh");

    // Allow our user to switch between Fahrenheit and Celsius via radio
    // buttons so only one can be selected at a time.
    $(".units").on("click", "input", function () {
        // Select the "value" attribute from the selected button.
        unitSelected = $(this).attr("value");
        // Determine if the user selected Fahrenheit or Celsius.
        if (unitSelected === "fahrenheit") {
            // Set our units flag to true if Fahrenheit clicked.
            isFahrenheit = true;
            // Set unit var to F, this will be used for styling.
            unit = "F";
        } else {
            // Set our units flag to false if anything other than Fahrenheit is selected.
            isFahrenheit = false;
            // Set unit variable to C, this will be used for styling.
            unit = "C";
        }
    })

    // Define what our submit button does.
    $("#submitBtn").on("click", function (e) {
        // Stop the input box from clearing out on button click.
        e.preventDefault();
        // Get the user supplied city name from the input box. Trim whitespaces.
        city = cityInput.val().trim();
        // Call our setWeather() function with the submitted city name passed as an argument.
        setWeather(city)
    });


    // Define what our city list table clicks do.
    $("#cityList").on("click", "td", function (e) {
        // Find what td was clicked on, get value
        var clicked = $(this).text();
        // Pass clicked value into our setWeather function as an arg.
        setWeather(clicked);
    });

    /*
        setWeather() takes one argument, city, which is supplied to our
        API call. Our API response provides the necessary weather components
        to be shown to the user.
    */
    function setWeather(city) {
        
        // First determine what units our user wants, imperial (fahrenheit), or metric (celsius).
        if (isFahrenheit) {
            // Define our query URL, supply the user input and API key to the query.
            var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=b774102802580c232f4e227fa165c18f";
        } else {
            // Define our query URL, supply the user input and API key to the query.
            var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&appid=b774102802580c232f4e227fa165c18f";
        }

        // Make our AJAX call to openweathermap.org's API, pull our necessary values
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {

            // Store the lat and lon data for use for the uvi
            var lattitude = response.city.coord.lat;
            var longitude = response.city.coord.lon;

            // call getUVI, pass in lat and lon.
            getUVI(lattitude, longitude);

            // Make the dateTime look better than any of what is provided by the API.
            var dateTime = convertDate(response.list[0].dt);

            // Grab our DOM elements and display the appropriate weather values to the page.
            $("#cityName").text(response.city.name);
            $("#temperature").html(response.list[0].main.temp + " &#730" + unit);
            $("#main_weather").text(response.list[0].weather[0].main)
            $("#humidity").text(response.list[0].main.humidity);
            $("#wind").text(response.list[0].wind.speed);
            $("#weather_image").attr("src", "http://openweathermap.org/img/w/" + response.list[0].weather[0].icon + ".png");
            $("#dateString").text(dateTime);
            $("#feels").html(response.list[0].main.feels_like + " &#730" + unit);
            $("#max").html(response.list[0].main.temp_max + " &#730" + unit);
            $("#min").html(response.list[0].main.temp_min + " &#730" + unit);

            // Call getDailyForecast and pass the city we were provided in as an argument.
            getDailyForecast(city);


            /* 
                getDailyForecast() takes one argument, city, and displays a 5 day forecast of that
                city's weather.
            */
            function getDailyForecast(city) {
                // Make our AJAX call to pull our necessary values
                $.ajax({
                    url: queryURL,
                    method: "GET"
                }).then(function (response) {
                    // Clear out the div to make room for new forecasts
                    $("#forecastDays").empty();

                    // Start at response.list[8] to skip day0.
                    // Add by 7 to cycle through all hourly entries for each day.
                    for (var i = 0, j = 1; i < response.list.length, j <= 5; i += 8, j++) {
                        // Convert our date to human readable format, store in var.
                        var dateTime = convertDate(response.list[i].dt);
                        // Create, style, and set our dynamic DOM elements
                        var newDiv = $("<div>").attr("id", "day" + j);
                        var pTemp = $("<p>");
                        var pHumid = $("<p>");
                        var iconImage = $("<img>");

                        newDiv.attr("class", "col-lg-2").appendTo("#forecastDays");
                        newDiv.html("<h6>" + dateTime + "</h6>").appendTo(newDiv);
                        pTemp.html('<i class="fas fa-thermometer-full"></i>' + response.list[i].main.temp + " &#730" + unit).appendTo(newDiv);
                        pHumid.html('<i class="fas fa-smog"></i>' + response.list[i].main.humidity + "%").appendTo(newDiv);
                        iconImage.attr("src", "http://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png").appendTo(newDiv);

                        // Append our dynamic elements to the DOM.
                        $("#forecastDays").append(newDiv);
                    }
                });
            }


        });

    }

    /*
        getUVI() takes two arguments, lattitude and longitude, supplied
        from our openweathermap forecast API JSON. Returns the UV Index
        of the selected city.
    */
    function getUVI(lattitude, longitude){
        var queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat="+lattitude+"&lon=" +longitude+"&appid=b774102802580c232f4e227fa165c18f";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {

            // Pull our uvindex data from the JSON, store in variable uvi.
            var uvi = parseFloat(response.value);
            console.log(uvi);
            // Push uvi to the DOM.
            $("#uvindex").html(uvi);

            // Determine the conditions of the uv index
            // Green = favorable, orange = moderate, red = severe.
            if(uvi >= 0 && uvi <= 2){
                // Remove any dynamically applied classes.
                $("#uvindex").removeClass();
                // Add the appropriate color class.
                $("#uvindex").addClass("uvi favorable");
            }
            else if(uvi > 2 && uvi <= 5){
                // Remove any dynamically applied classes.
                $("#uvindex").removeClass();
                // Add the appropriate color class.
                $("#uvindex").addClass("uvi moderate");

            }
            else if(uvi > 5 && uvi <= 10){
                // Remove any dynamically applied classes.
                $("#uvindex").removeClass();
                // Add the appropriate color class.
                $("#uvindex").addClass("uvi severe")
            }

        });
        
   }
    /*
        ConvertDate() takes one argument, date, which is the supplied
        dt value from openweathermap.org's API. The date is supplied in
        UNIX GMT and needs to be converted to the current locale.
    */
    function convertDate(date) {
        // Build our new Date object, multiply by 1000 for milliseconds.
        var newDate = new Date(date * 1000);
        // Formate our new date.
        var newDateFormat = newDate.toLocaleDateString();
        // Return our nicely converted date string.
        return newDateFormat;
    }
