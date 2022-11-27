const API_KEY = "d70119e45ddd9f3893ca56fc14fcb2cb";

const DAYS_OF_THE_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thrus", "Fri", "Sat"];

const  getCitiesGeoLocation = async (searchText)=>{
 const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limits=5&appid=${API_KEY}`);
 
 return response.json();
}
const getCurrentWeatherData = async () => {
  const city = "pune";

  console.log(API_KEY, city);
  const resposnse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );

  return resposnse.json();
};

const getHourlyForecast = async ({ name: city }) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );
  const data = await response.json();
  return data.list.map((forecast) => {
    const {
      main: { temp, temp_max, temp_min },
      dt,
      dt_txt,
      weather: [{ description, icon }],
    } = forecast;
    return {
      temp,
      temp_max,
      temp_min,
      dt,
      dt_txt,
      description,
      icon,
    };
  });
};
const formatTemperature = (temp) => `${temp?.toFixed(1)}°`;

const createIconUrl = (icon) =>
  `http://openweathermap.org/img/wn/${icon}@2x.png`;

const loadCurrentForecast = ({
  name,
  main: { temp, temp_max, temp_min },
  weather: [{ description }],
}) => {
  const currentForecastElement = document.querySelector("#current-forecast");
  currentForecastElement.querySelector(".city").textContent = name;
  currentForecastElement.querySelector(".temp").textContent =
    formatTemperature(temp);
  currentForecastElement.querySelector(".description").textContent =
    description;
  currentForecastElement.querySelector(
    ".min-max-temp"
  ).textContent = `H: ${formatTemperature(temp_max)} L: ${formatTemperature(
    temp_min
  )}`;
};

const loadHourlyForecast = ({name, main: {temp: temp_now}, weather: [{icon: iconNow}]}  ,hourlyForecast) => {
 const timeFormatter =  Intl.DateTimeFormat("en", {hour12: true, hour: "numeric"})
   let dataFor12Hours = hourlyForecast.slice(2, 14);
  const hourlyContainer = document.querySelector(".hourly-container");
  let innerHtmlString = `<article >
  <h3 class="time">Now</h3>
  <img class="icon" src="${createIconUrl(iconNow)}"/>
  <p class="hourly-temp">${formatTemperature(temp_now)}</p>
   </article>`;
  for (let { temp, icon, dt_txt } of dataFor12Hours) {
    innerHtmlString += `<article >
      <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
      <img class="icon" src="${createIconUrl(icon)}"/>
      <p class="hourly-temp">${formatTemperature(temp)}</p>
       </article>`;
       
  }
  hourlyContainer.innerHTML = innerHtmlString;
};

const calculateDayWiseForecast = (hourlyForecast) => {
  let dayWiseForecast = new Map();
  for (let forecast of hourlyForecast) {
    const [date] = forecast.dt_txt.split(" ");
    const dayOfTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];
    console.log(dayOfTheWeek);
    if (dayWiseForecast.has(dayOfTheWeek)) {
      let foreCastForTheDay = dayWiseForecast.get(dayOfTheWeek);
      foreCastForTheDay.push(forecast);
      dayWiseForecast.set(dayOfTheWeek, [forecast]);
    } else {
      dayWiseForecast.set(dayOfTheWeek, [forecast]);
    }
  }

  console.log(dayWiseForecast);

  for (let [key, value] of dayWiseForecast) {
    let temp_min = Math.min(...Array.from(value, (val) => val.temp_min));
    let temp_max = Math.max(...Array.from(value, (val) => val.temp_max));

    dayWiseForecast.set(key, {
      temp_min,
      temp_max,
      icon: value.find((v) => v.icon).icon,
    });
  }

  console.log(dayWiseForecast);
  return dayWiseForecast;
};

const loadFiveDayForecast = (hourlyForecast) => {
  console.log(hourlyForecast);
  const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);

  const container = document.querySelector(".five-day-forecast-container");
  let dayWiseInfo = '';

  Array.from(dayWiseForecast).map(([day,{temp_max,temp_min,icon}],index) => {
     
   if (index < 5)
   {
      dayWiseInfo += `
                <article class="day-wise-forecast">
                  <h3 class="day">${ index === 0? "Today": day}</h3>
                
                  <img class="icon" src="${createIconUrl(icon)}" alt="icon for the forecast">
                  <p class="min-temp">${formatTemperature( temp_min)}</p>
                  <p class="max-temp"> ${formatTemperature(temp_max)} </p>
                </article>`;

   }
  });

  container.innerHTML =dayWiseInfo
};

const loadFeelsLike = ({ main: { feels_like } }) => {
  let container = document.querySelector("#feel-like");
  container.querySelector(".feels-like-temp").textContent =
    formatTemperature(feels_like);
};

const loadHumidity = ({ main: { humidity } }) => {
  let container = document.querySelector("#humidity");
  container.querySelector(".humidity-value").textContent = `${humidity} %`;
};

function debounce (func){
  let timer;

  return (...args)=>
  {
    clearTimeout(timer);
    timer=  setTimeout( ()=> {
      func.apply(this, args);
    }, 500);
  }
}

const onSearch = async (event)=>{
 let value = event.target.value;

  const listOfCities= await getCitiesGeoLocation(value);
  let options = '';
  for ({lat, lon, name, state, country }of listOfCities){

    options += `<option data-city-details='${JSON.stringify({ lat, lon, name})}' value="${name} , ${state}, ${country}"></option>`

  }
  document.querySelector('#cities').innerHTML = options;
  console.log(listOfCities); 
}

const debounceSearch =  debounce( (event) => onSearch(event))

document.addEventListener("DOMContentLoaded", async () => {

 const search =  document.querySelector("#search");
 search.addEventListener('input',debounceSearch);
  const currentWeather = await getCurrentWeatherData();
  loadCurrentForecast(currentWeather);

  const hourlyForecast = await getHourlyForecast(currentWeather);
  loadHourlyForecast( currentWeather,hourlyForecast);
  loadFiveDayForecast(hourlyForecast);
  loadFeelsLike(currentWeather);
  loadHumidity(currentWeather);
});
