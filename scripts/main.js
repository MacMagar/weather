const $ = require("jquery") // importing jquery node modules
const Chart = require( "chart.js" ); // importing chartjs node module
const { removeData } = require("jquery");

$(function () {
    const btnRefresh = $(".current-info__refresh-icon");
    const hero = $(".hero");

    hero.on("click", function () {
        $(".navigation__results").slideUp(350);
    })

    
    navigator.geolocation.getCurrentPosition(function (pos) {
        if(!localStorage.getItem("coords")) {
        const latlon = pos.coords.latitude + "," + pos.coords.longitude;
        localStorage.setItem("coords", latlon)
        updateCurrentWeatherInfo(latlon);
        }
    }, function (er) {}, {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0
      })

    
    // fetches the current weather forecast from the server
    const getCurrentWeatherData = async (location) => {
        let aKey = "38be10540a0845859fa124936211109";
        let url = "https://api.weatherapi.com/v1/forecast.json?key=";
        let param = "&q=" + location
        let response = await fetch(url+aKey+param);
        let cTData =  await response.json();
        return cTData;
    }

    // update the UI with fetched data
    const updateCurrentWeatherInfo =  async (location) => {
        const data = getCurrentWeatherData(location);

        const cLocation = $(".current-info__location");
        const cTemp = $(".current-info__temp");
        const cConditionText = $(".current-info__status-text")
        const cConditionIcon = $(".current-info__status-icon")
        const tChart = $(".total-temp__chart")
        const tTemp = $(".total-temp")

        data.then(json => {
            cConditionIcon.attr("src", json.current.condition.icon)
            cConditionText.text(json.current.condition.text);
            cTemp.html(json.current.temp_c + "&#176;C");
            cLocation.text(json.location.name + ", " + json.location.country)
            tChart.remove();
            tTemp.append("<canvas class='total-temp__chart'>Upgrade to browser to use this feature!</canvas>")
            drawTotalTempChart(json, "bar")
        })
       
    }

    updateCurrentWeatherInfo(localStorage.getItem("coords"))
    

    const getSearchData = async (location) => {
        let aKey = "38be10540a0845859fa124936211109";
        let url = "https://api.weatherapi.com/v1/search.json?key=";
        let param = "&q=" + location;

        let response = await fetch(url + aKey + param);
        let sData = await response.json();
        return sData;
    }

    const updateSearchResult = (locationName) => {
        let sBox = $(".navigation__results");
        let elemStr = "";

        let locations = locationName;
        
        for(let i = 0; i < locations.length; i++) {
            elemStr += "<a class='d-block navigation__search-link'>" + locations[i].name +"</a>"
        }

        sBox.html(elemStr);

        $(".navigation__results a").each(function (i, el){
            $(el).data("coords", {
                lat: locations[i].lat,
                lon: locations[i].lon
            })
        })
        sBox.show();

    }


    const searchFieldAcitivation = () => {
        let sInputField = $(".navigation__search-input");
        let sInputBtn = $(".navigation__search-icon");
        let sBox = $(".navigation__results");
    

        sInputBtn.on("click", function () {
            let ivalue = sInputField.val();

            if(ivalue.length) {
                getSearchData(ivalue).then(function (sData) {
                    if(sData.length) {
                    updateSearchResult(sData);
                    sInputField.val("");
                    }
                })
            }
        })

        sBox.on("click", "a", function (eo) {   
            $(eo.target).parent().slideUp(200);
            updateCurrentWeatherInfo($(eo.target).data("coords").lat + "," + $(eo.target).data("coords").lon)
        })

    }

    searchFieldAcitivation();


    btnRefresh.on("click", function () {
        const elemt = $(this);
        elemt.addClass("rotater");
        setTimeout(function () {
            elemt.removeClass("rotater");
        }, 1500)
        updateCurrentWeatherInfo(localStorage.getItem("coords"))
    });


    // intantiate the Chart JS class to draw chart on canvas element representing some data
    const drawTotalTempChart = async (data, type) => {
    const ctx = $(".total-temp__chart"); // element or context to draw chart on

    Chart.defaults.font.family = "Roboto";
    Chart.defaults.font.size = "16";
    
    const totalTempChart = new Chart(ctx, {
        type: type,

        data: {
            labels: ["Minimum", "Average", "Maximum"],
            datasets: [{
                label: "Temperature in Degree Celsius",
                data: [data.forecast.forecastday[0].day.mintemp_c, data.forecast.forecastday[0].day.avgtemp_c, data.forecast.forecastday[0].day.maxtemp_c],
                backgroundColor: [
                    "blue",
                    "orange",
                    "red"
                ],
                borderColor: [
                    "blue",
                    "orange",
                    "red"
                ],
                borderWidth: 3,
                color: "#666"
            }]
        },

        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            layout: {
                padding: 15
            },
            plugins: {
               legend: {
                   labels: {
                       font: {
                           size: 14
                       },
                       color: "#121212"
                   }
               }
           }
        }

    }) // end of totalTempchart


    } // end of drawTotalTempchart
})