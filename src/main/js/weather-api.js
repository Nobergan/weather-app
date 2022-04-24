import refs from "./refs";
import notify from './notify';

let weather = {
    apiKey: "ecc8a7f8e9930546ff3832e10f35aaaf",
    mainUrl: "https://api.openweathermap.org/data/2.5/weather",

    fetchWeather(city) {
        fetch(`${this.mainUrl}?q=${city}&lang=ua&units=metric&appid=${this.apiKey}`)
        .then(response => {
            if (response.status === 404) {
                refs.weather.classList.remove("loading");
                notify.showNotice();
            }

            return response.json();
        })
        .then(data => this.displayWeather(data))
    },

    displayWeather(data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;

        refs.city.innerText = `${name}`;
        refs.icon.src = `https://openweathermap.org/img/wn/${icon}.png`;
        refs.descr.innerText = description;
        refs.temp.innerText = `${temp}°С`;
        refs.humidity.innerText = `Вологість: ${humidity}%`;
        refs.wind.innerText = `Швидкість вітру: ${speed} км/год`;

        refs.weather.classList.remove("loading");

        refs.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${name}')`;
    },

    search() {
        refs.weather.classList.add("loading");

        if (!refs.input.value) {
            refs.weather.classList.remove("loading");
            notify.showError();
        }

        this.fetchWeather(refs.input.value);
    },

    clearInput() {
        refs.input.value = '';
    }
}

// Handle search button

refs.btn.addEventListener("click", handleBtn);

function handleBtn() {

    weather.search();
    weather.clearInput();
}

// On ENTER click

refs.input.addEventListener("keyup", handleEnterBtn);

function handleEnterBtn(e) {
    if (e.key === "Enter") {
        weather.search();
        weather.clearInput();
    }
}


