    /* 
        script.js builds our Weather Dashboard using jQuery.
    */

    // Assign our DOM elements to variables.
    var cityInput = $("#cityInput");
    var isFahrenheit = true;
    var unitSelected;
    var unit = "F";


    // Have Riyadh, Saudi Arabia load on the page by default.
    setWeather("Riyadh");

    // Allow our user to switch between Fahrenheit and Celsius via radio
    // buttons so only one can be selected at a time.
    $(".units").on("click", "input", function() {
        //console.log($(this).attr("value"))
        unitSelected = $(this).attr("value");
        if (unitSelected === "fahrenheit"){
            isFahrenheit = true;
            unit = "F";

        } else {
            isFahrenheit = false;
            unit = "C";
        }
            })

    // Define what our submit button does.
    $("#submitBtn").on("click", function() {
        // Stop the input box from clearing out on button click.
        e.preventDefault();
        // Get the user supplied city name from the input box.
        city = cityInput.val().trim();

        setWeather(city)
    });


    // Define what our city list clicks do.
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
        // Define our query URL, supply the user input and API key to the query.
        
        if(isFahrenheit){
        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=b774102802580c232f4e227fa165c18f";
        } else {
        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=metric&appid=b774102802580c232f4e227fa165c18f";
        }

        // Make our AJAX call to pull our necessary values
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // Make the dateTime look better than any of what is provided.
            console.log(response);
            var dateTime = convertDate(response.list[0].dt);

            // Grab our DOM elements and displa them to the page.
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

            getDailyForecast(city);


            /* 
        getDailyForecast() takes one argument, city, and displays a 5 day forecast of that
        city's weather.
    */
    function getDailyForecast(city) {
        showingForecast = true;

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
                var newUL = $("<ul>");
                var pTemp = $("<p>");
                var pHumid = $("<p>");
                var iconImage = $("<img>");

                newDiv.attr("class", "col-lg-2").appendTo("#forecastDays");
                newDiv.html("<p>" + dateTime + "</p>").appendTo(newDiv);
                pTemp.html('<i class="fas fa-thermometer-full"></i>' + response.list[i].main.temp  + " &#730" + unit).appendTo(newDiv);
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
        ConvertDate() takes one argument, date which is the supplied
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