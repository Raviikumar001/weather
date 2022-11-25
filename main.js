
const API_KEY = "d70119e45ddd9f3893ca56fc14fcb2cb";


console.log('heoll')


const getCurrentWeatherData= async ()=>{
    const city ="pune";
    
    console.log(API_KEY, city)
    const resposnse  = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    
    return resposnse.json();
    
}




const getHourlyForecast = async({name: city})=>{
   const response =await  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`) 
   const data = await response.json();
   return data.list.map( forecast =>{

     const {main: {temp, temp_max, temp_min}, dt, dt_txt, weather:[{ description, icon }]} = forecast;
     return {
        temp, temp_max,temp_min,dt, dt_txt,description,icon
     }
   })



}
 const formatTemperature = (temp)=> `${temp?.toFixed(1)}°`

 const createIconUrl = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`


 const loadCurrentForecast = ({ name, main: {temp,temp_max, temp_min}, weather: [{ description }]})=>{

     const currentForecastElement = document.querySelector('#current-forecast');
     currentForecastElement.querySelector('.city').textContent = name;
     currentForecastElement.querySelector('.temp').textContent = formatTemperature(temp);
     currentForecastElement.querySelector('.description').textContent = description;
     currentForecastElement.querySelector('.min-max-temp').textContent = `H: ${formatTemperature(temp_max)} L: ${formatTemperature(temp_min)}`
 }


 const loadHourlyForecast = (hourlyForecast) =>{
  
   let dataFor12Hours = hourlyForecast.slice(1,13);
  const hourlyContainer =  document.querySelector(".hourly-container");
  let innerHtmlString = ``;
   for (let  {temp,icon,dt_txt} of dataFor12Hours )
   {
      innerHtmlString += `<article >
      <h3 class="time">${dt_txt.split(" ")[1]}</h3>
      <img class="icon" src="${createIconUrl(icon)}"/>
      <p class="hourly-temp">${formatTemperature(temp)}</p>
       </article>`
   }
   hourlyContainer.innerHTML = innerHtmlString;

 }

 
 const loadFiveDayForecast = (hourlyForecast)=>{

    console.log(hourlyForecast)
 }


 const loadFeelsLike = ({main: {feels_like}})=>{
  let container =  document.querySelector("#feel-like");
  container.querySelector(".feels-like-temp").textContent = formatTemperature(feels_like)

 }

 const loadHumidity = ({main: {humidity}})=>{
   let container =  document.querySelector("#humidity");
   container.querySelector(".humidity-value").textContent = `${humidity} %`;
 
  }



document.addEventListener('DOMContentLoaded', async ()=>{
     const currentWeather = await getCurrentWeatherData();
     loadCurrentForecast(currentWeather)
     
     const hourlyForecast = await  getHourlyForecast(currentWeather)
     loadHourlyForecast(hourlyForecast) 
     loadFiveDayForecast(hourlyForecast);
     loadFeelsLike(currentWeather);
     loadHumidity(currentWeather);
})