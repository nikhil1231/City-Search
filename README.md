# Downtown

Downtown is a website which grades major cities around the world based on crime, pollution, and weather data. The weather data is acquired from the OpenWeatherMap API, the pollution data from the WHO, and the crime and cost data from a crowd sourced database. All the data is then converted into a standardised format, allowing all the pieces of data to be averaged and converted to a grade from A+ to D. Currently there is no back-end to the website and it is written in HTML, CSS, and Javascript only.

### Issues and improvements

- The crime and cost data is from a crowd-sourced database, which does reduce reliablity in terms of crime statistics. Implementing a paid api with data from the government or similar organisation may yield better results.
- Currently the website is limited to 7 cities in the UK and USA, due to limitations of the apis which I am using, and adding more cities in more countries would definitely be a future expannsion to the site.
