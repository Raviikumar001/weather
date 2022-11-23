
const API_KEY = "d70119e45ddd9f3893ca56fc14fcb2cb";

const getCurrentWeatherData= async ()=>{
    const city ="pune";

    console.log(API_KEY, city)
    const resposnse  = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    console.log(resposnse)
    return resposnse.json();

}


const loadCurrentForecast = ({main: {temp, temp_max, temp_min, weather:[{description}]}}) =>{

  const currentForecastElement =   document.querySelector('#current-forecast');
   currentForecastElement.querySelector(".temp");
}

document.addEventListener('DOMContentLoaded', async ()=>{
     const currentWeather =  getCurrentWeatherData();
})