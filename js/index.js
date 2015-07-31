$(document).ready(function(){
	var cities = [
		'Birmingham',
		'Chicago',
		'Edinburgh',
		'London',
		'Los Angeles',
		'Miami',
		'New York'
	];
	var cityInfo = {
		'Birmingham': ['q=birmingham,uk',52.481419,-1.89983,'"Victoria Square, Birmingham at dusk" by Cristian Bortes - originally posted to Flickr as Birmingham. Licensed under CC BY 2.0 via Wikimedia Commons - https://commons.wikimedia.org/wiki/File:Victoria_Square,_Birmingham_at_dusk.jpg#/media/File:Victoria_Square,_Birmingham_at_dusk.jpg'],
		'Chicago': ['id=4887398',41.850029,-87.650047],
		'Edinburgh': ['id=2650225',55.952061,-3.19648],
		'London': ['q=london,uk',51.50853,-0.12574,'"London from a hot air balloon" by Daniel Chapma - Flickr. Licensed under CC BY 2.0 via Wikimedia Commons - https://commons.wikimedia.org/wiki/File:London_from_a_hot_air_balloon.jpg#/media/File:London_from_a_hot_air_balloon.jpg'],
		'Los Angeles': ['id=5368361',34.052231,-118.243683],
		'Miami': ['id=4164138',25.774269,-80.193657],
		'New York': ['id=5128638',43.000351,-75.499901]
	};
	var weatherScore = {
		'Clear': 0,
		'Clouds': 2.5,
		'Rain': 5
	};
	var today = new Date(),
		currentDay = today.getDate(),
		currentMonth = today.getMonth();
	var numThingsToDo;
	var dollarToPound;
	var pollutionLevel,minPolLvl,maxPolLvl,
		livingCost,minLivingCost,maxLivingCost,
		coffeeCost,minCoffeeCost,maxCoffeeCost,
		crimeIndex,minCrimeIndex,maxCrimeIndex,
		tempRating,totalTempScore=0,avgTempScore,avgWeatherScore,
		finalRating,
		finalGrade;

	$('window').scrollTop(0);
	$('.mainsearch').autocomplete({source: cities});

	var popularSearches = $('#popularsearches')

	cities.forEach(function(x,i,y){
		var z = x.replace(' ','+');
		popularSearches.append('<li class="thingtodo"><img class="imgclick" id="'+ z +'"  src="img/'+ x +'.jpg"><br><p class="whitetext">'+ x + '</p></li>')
	})

	// PARALLAX STUFF
	window.onscroll = function() {
	    var posY = (document.documentElement.scrollTop) ? document.documentElement.scrollTop : window.pageYOffset;
	    var imgOffset = posY * 0.7;
	    $('#searchbackgroundimg').css({'top':imgOffset-10 + 'px'})
	    $('.backgroundimgdarkener').css({'top':posY + 'px'})

	    if(posY > 50){

	    }
	}

	$('.searchbutton').click(function(){
		onCityClick($('.mainsearch').val());
	});
	$('.imgclick').click(function(){
		var cityName = $(this).attr('id').replace('+',' ');
		onCityClick(cityName);
	});

	function onCityClick(selectedCity){
		// KEEP THIS ORDER
		$('#resultspage').attr('z-index',1)
		$('#backgroundimgdarkener').attr('z-index',2)
		var deSpacedCity = selectedCity.replace(' ','%20')
		$('#searchbackgroundimg').attr('src','img/'+selectedCity+'.jpg');
		if(deSpacedCity.toLowerCase() == 'birmingham') deSpacedCity += ',UK';

		$('body').css({'overflow-y':'visible'})


		// 	WEATHER API
		$.getJSON('http://api.openweathermap.org/data/2.5/weather?' + cityInfo[selectedCity][0],function(data){
			$('#maincitytitle').html(data.name);
			var temp = Math.round((data.main.temp - 273) * 10 ) / 10;
			
			$('#temp').html(temp.toFixed(1) + '&#8451;');
			$('#weather').html("<i class='whitetext icon wi wi-"+getWeatherIcon(data.weather[0].main)+"'></i><h3 class='whitetext'>"+data.weather[0].main+", "+data.weather[0].description+"</h3>");
		})
		$.getJSON('http://api.openweathermap.org/data/2.5/forecast/daily?' + cityInfo[selectedCity][0] + '&mode=json&units=metric&cnt=15',function(data){
			var days = data.list,
				longTermWeather = $('#longtermweather'),
				totalTemp,
				totalWeatherScore = 0;

			days.forEach(function(x,i,y){
				totalWeatherScore += weatherScore[x.weather[0].main];
				var date = moment().add(i,'days')._d
				date = date.toString().substr(8,2);
				var weatherIcon = getWeatherIcon(x.weather[0].main);
				totalTempScore += x.temp.day;
				if(i<7) longTermWeather.append('<li class="weatherelement"><h3 class="whitetext">'+ date +'</h3><i class="whitetext icon shorticon wi wi-'+ weatherIcon +'"></i><h3 class="whitetext">'+ x.weather[0].main +'</h3></li>')
			})
			avgWeatherScore = totalWeatherScore/days.length;
			avgTempScore = totalTempScore/days.length;
			if(avgTempScore<10){
				tempRating = 5;
			}else if(avgTempScore<15){
				tempRating = 4;
			}else if(avgTempScore<20){
				tempRating = 3;
			}else if(avgTempScore<25){
				tempRating = 2;
			}else if(avgTempScore<30){
				tempRating = 1;
			}else{
				tempRating = 0;
			}
			console.log(avgWeatherScore);
		})
	
		function getWeatherIcon(s){
			switch(s){
				case 'Clear':
					return 'day-sunny';
					break;
				case 'Clouds':
					return 'cloudy';
					break;
				case 'Rain':
					return 'rain';
					break;
			}
		}
		// GOOGLE TIMEZONE API
		$.getJSON('https://maps.googleapis.com/maps/api/timezone/json?location='+ cityInfo[selectedCity][1] +','+cityInfo[selectedCity][2]+'&timestamp=1331766000&key=AIzaSyCedH44_tck-gnH5TzEAC99Wt1rXHvYNc4',function(data){
			var timeDifferenceInSeconds = data.rawOffset;
			var rawTimeDifference = timeDifferenceInSeconds/3600;
			var time = moment().add(rawTimeDifference,'hours');
		//	console.log(moment().add(rawTimeDifference,'hours'));
			var timeDifference = rawTimeDifference % 1 == 0 ? rawTimeDifference + ':00' : rawTimeDifference + ':30';
			$('#timedifference').html(timeDifference);
		})

		// DISTANCE ALGORITHM (HAVERSINE FORMULA)
		var rad = function(x) {
		  return x * Math.PI / 180;
		};
		var getDistance = function(lat, lon) {
		  var R = 6378137; // Earth’s mean radius in meters
		  var dLat = rad(lat - 51.50853);
		  var dLong = rad(lon - -0.12574);
		  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		    Math.cos(rad(51.50853)) * Math.cos(rad(lat)) *
		    Math.sin(dLong / 2) * Math.sin(dLong / 2);
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		  var d = R * c;
		  return d; // returns the distance in meters
		};
		var rawDistanceInMetres = getDistance(cityInfo[selectedCity][1],cityInfo[selectedCity][2]);
		var distanceInKm = Math.round(rawDistanceInMetres/1000);
		var planeSpeed = 750;
		var rawTimeByPlane = distanceInKm/planeSpeed;
		var timeByPlane = Math.round(rawTimeByPlane*100)/100;
		var minsByPlane = Math.round((timeByPlane % 1) * 60);
		var hoursByPlane = Math.floor(timeByPlane);
		$('#distance').html(distanceInKm + ' km away');
		$('#timetofly').html(hoursByPlane + ' hrs '+ minsByPlane + ' mins');

		$('#homepage').animate({opacity:0},function(){
			$('#resultspage').animate({opacity:1})
		})


		// GOOGLE MAPS
		$('#mapdiv').html('<iframe width="100%" height="400px" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCedH44_tck-gnH5TzEAC99Wt1rXHvYNc4&q='+deSpacedCity+'&zoom=5"></iframe>');

		// CURRENCY CONVERSION API
		// $.getJSON('http://api.exchangeratelab.com/api/current?apikey=7D20B719BCD74F8882E4AC39C152957D',function(data){
		// 	console.log(data)
		// 	dollarToPound = data.rates.GBP;
		// });


		// CRIME DATA API
		// $.getJSON('https://data.police.uk/api/crimes-no-location?category=all-crime&force=warwickshire',function(data){
		// 	console.log(data)
		// })
		// THINGS TO DO API
		$.getJSON('http://terminal2.expedia.com:80/x/activities/search?location=' + deSpacedCity + '&apikey=E7AezhbGouTnaQEROzQ9AzuniDLbjiGn',function(data){
			var priceInGbp,
				thingsToDoDiv = $('#thingstodo');
			numThingsToDo = data.activities.length;
			$('#numthingstodo').append(numThingsToDo);
			for(var i=0;i<10;i++){
				priceInGbp = parseFloat(data.activities[i].fromPrice.slice(1))*dollarToPound;
			//	console.log(parseFloat(data.activities[i].fromPrice.slice(1))*dollarToPound)
			//	console.log(parseFloat(data.activities[i].fromPrice.slice(1)));
				priceInGbp = Math.round(priceInGbp*100)/100;
			//	console.log(priceInGbp);
				thingsToDoDiv.append('<li class="thingtodo"><img src="'+ data.activities[i].imageUrl +'"><br><p class="whitetext">'+ data.activities[i].title + '</p><p class="whitetext">£'+ priceInGbp.toFixed(2) +'</p></li>');
			}
		});

		// PARSE POLLUTION DATA
		Papa.parse('/data/aap_pm_database_may2014.csv', {
			download: true,
			complete: function(data) {
				for(var i=8; i<=1997;i++){
					var thisData = data.data[i],
						csvTown = thisData[3];

					cities.forEach(function(x,i){
						if(csvTown.indexOf(x) !== -1 && csvTown.indexOf('Norwich')==-1 && csvTown.indexOf('Hoover')==-1){
							if(i==1){
								minPolLvl = thisData[4]
								maxPolLvl = thisData[4]
							}else if(i>1){
								if(thisData[4]<minPolLvl)minPolLvl=thisData[4];
								if(thisData[4]>maxPolLvl)maxPolLvl=thisData[4];
							}
						}
					})
					if(csvTown.indexOf(selectedCity) !== -1 && csvTown.indexOf('Norwich')==-1 && csvTown.indexOf('Hoover')==-1) {
						pollutionLevel = thisData[4];
					}
				}
				parseCityData();
			}
		});

		// PARSE OTHER CITY DATA
		function parseCityData(){
			Papa.parse('/data/cityData.csv', {
				download: true,
				complete: function(data) {
					for(var i=0; i<data.data.length;i++){
						var thisData = data.data[i],
							csvTown = thisData[0];

						if(i==1){
							// set base values
							minLivingCost = thisData[1];
							maxLivingCost = thisData[1];
							minCoffeeCost = thisData[2];
							maxCoffeeCost = thisData[2];
							minCrimeIndex = thisData[3];
							maxCrimeIndex = thisData[3];
						}else if(i>1){
							// finding maxes and mins
							var tempLivingCost = parseFloat(thisData[1]);
							if(tempLivingCost<minLivingCost)minLivingCost=tempLivingCost;
							if(tempLivingCost>maxLivingCost)maxLivingCost=tempLivingCost;
							if(thisData[2]<minCoffeeCost)minCoffeeCost=thisData[2];
							if(thisData[2]>maxCoffeeCost)maxCoffeeCost=thisData[2];
							if(thisData[3]<minCrimeIndex)minCrimeIndex=thisData[3];
							if(thisData[3]>maxCrimeIndex)maxCrimeIndex=thisData[3];
						}

						if(csvTown == selectedCity) {
							livingCost = thisData[1];
							coffeeCost = thisData[2];
							crimeIndex = thisData[3];
							
						}
					}
					getRating();
				} 
			});
		}
		// RATING ALGORITHM
		function getRating(){
			var polLvlRange = maxPolLvl- minPolLvl,
				livingCostRange = maxLivingCost- minLivingCost,
				coffeeCostRange = maxCoffeeCost- minCoffeeCost,
				crimeIndexRange = maxCrimeIndex- minCrimeIndex;

			$('#costofcoffee').html('£'+ parseFloat(coffeeCost).toFixed(2));

			pollutionLevel -= minPolLvl;
			livingCost -= minLivingCost;
			coffeeCost -= minCoffeeCost;
			crimeIndex -= minCrimeIndex;

			var polLvlRating = (pollutionLevel/polLvlRange)* 5,
				livingCostRating = (livingCost/livingCostRange)* 5,
				coffeeCostRating = (coffeeCost/coffeeCostRange)* 5,
				crimeIndexRating = (crimeIndex/crimeIndexRange)* 5;

			finalRating = (polLvlRating+livingCostRating+coffeeCostRating+crimeIndexRating+tempRating+avgWeatherScore)/6;

			$('#costofliving').html((livingCostRating*20).toFixed(2));
			$('#pollutionlevel').html((polLvlRating*20).toFixed(2))
			$('#crimeindex').html((crimeIndexRating*20).toFixed(2))

		/*	console.log(polLvlRating)
			console.log(livingCostRating)
			console.log(coffeeCostRating)
			console.log(crimeIndexRating)
			console.log(tempRating)
			console.log(avgWeatherScore) */
			getGrade(finalRating);

			// Load the Visualization API and the piechart package.
			setTimeout(function(){google.load('visualization', '1', {'callback':'alert("2 sec wait")', 'packages':['corechart']})}, 2000);
    //  google.load('visualization', '1.0', {'packages':['corechart']});

		      // Set a callback to run when the Google Visualization API is loaded.
		      google.setOnLoadCallback(function(){
		      	console.log('google loaded');

		      });

		      // Callback that creates and populates a data table,
		      // instantiates the pie chart, passes in the data and
		      // draws it.
		      function drawChart() {

		        // Create the data table.
		        var data = new google.visualization.DataTable();
		        data.addColumn('string', 'Data');
		        data.addColumn('number', 'Value');
		        data.addRows([
		          // ['Pollution', polLvlRating],
		          // ['Cost of living', livingCostRating],
		          // ['Crime', crimeIndexRating],
		          // ['Weather', avgWeatherScore],
		          // ['Temperature', tempRating]
		          ['Pollution', 1],
		          ['Cost of living', 2],
		          ['Crime', 3],
		          ['Weather', 4],
		          ['Temperature', 3]

		        ]);

		        // Set chart options
		        var options = {'title':'How Much Pizza I Ate Last Night',
		                       'width':400,
		                       'height':300};

		        // Instantiate and draw our chart, passing in some options.
		        var chart = new google.visualization.PieChart(document.getElementById('grapharea'));
		        chart.draw(data, options);
		      } 
		}

		function getGrade(rating){
			if(rating<1){
				finalGrade = 'A+'
			}else if(rating<1.5){
				finalGrade = 'A'
			}else if(rating<2){
				finalGrade = 'A-'
			}else if(rating<2.25){
				finalGrade = 'B+'
			}else if(rating<2.5){
				finalGrade = 'B'
			}else if(rating<2.75){
				finalGrade = 'B-'
			}else if(rating<3){
				finalGrade = 'C+'
			}else if(rating<3.5){
				finalGrade = 'C'
			}else if(rating<4){
				finalGrade = 'C-'
			}else if(rating<4.5){
				finalGrade = 'D+'
			}else if(rating<5){
				finalGrade = 'D'
			}
			console.log(finalGrade);
			$('#grade').html(finalGrade);
		}
	}

	// CLEAR ALL FIELDS ON BACK BUTTON PRESS
	$('#backbutton').click(function(){
		$('#resultspage').animate({opacity:0},function(){
			$('#homepage').animate({opacity:1});
		});

		totalWeatherScore = 0;
		totalTempScore=0;

		$('#resultspage').attr('z-index',-1);
		$('#backgroundimgdarkener').attr('z-index',-2);
		$('#searchbackgroundimg').attr('src','');
		$('body').css({'overflow-y':'hidden'})
		$('window').scrollTop(0);

		$('.mainsearch').val('');
		$('#maincitytitle').val('');
		$('#mapdiv').html('');
		$('#temp').html('');
		$('#weather').html('');
		$('#timeDifference').html('');
		$('#distance').html('');
		$('#timetofly').html('');
		$('#thingstodo').html('');
		$('#longtermweather').html('');
		$('#numthingstodo').html('');
	})

});