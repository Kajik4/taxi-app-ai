const REQUESTS_KEY = "taxi-prototype-requests";

const tabs = document.querySelectorAll(".tab");
const screens = {
  rider: document.getElementById("rider-screen"),
  driver: document.getElementById("driver-screen"),
};

const locationStatus = document.getElementById("location-status");
const requestButton = document.getElementById("request-ride");
const requestsList = document.getElementById("ride-requests");

let currentLocation = { lat: 51.505, lng: -0.09 };
let map;
let marker;

function initTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const { screen } = tab.dataset;
      tabs.forEach((button) => button.classList.toggle("is-active", button === tab));
      Object.entries(screens).forEach(([key, section]) => {
        section.classList.toggle("is-active", key === screen);
      });
      if (screen === "rider") {
        setTimeout(() => map.invalidateSize(), 100);
      }
    });
  });
}

function initMap() {
  map = L.map("map").setView([currentLocation.lat, currentLocation.lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  marker = L.marker([currentLocation.lat, currentLocation.lng])
    .addTo(map)
    .bindPopup("You are here")
    .openPopup();
}

function updateCurrentLocation(position) {
  currentLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };

  locationStatus.textContent = `Current location: ${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`;
  map.setView([currentLocation.lat, currentLocation.lng], 15);
  marker.setLatLng([currentLocation.lat, currentLocation.lng]);
}

function initGeolocation() {
  if (!navigator.geolocation) {
    locationStatus.textContent = "Geolocation not supported. Showing default map location.";
    return;
  }

  navigator.geolocation.getCurrentPosition(updateCurrentLocation, () => {
    locationStatus.textContent = "Unable to fetch GPS location. Showing default map location.";
  });
}

function getRideRequests() {
  const raw = localStorage.getItem(REQUESTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveRideRequests(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

function renderRideRequests() {
  const requests = getRideRequests();
  requestsList.innerHTML = "";

  if (!requests.length) {
    requestsList.innerHTML = '<li class="empty">No ride requests yet.</li>';
    return;
  }

  requests
    .slice()
    .reverse()
    .forEach((request) => {
      const item = document.createElement("li");
      item.textContent = `Pickup at ${request.lat.toFixed(5)}, ${request.lng.toFixed(5)} • ${new Date(request.timestamp).toLocaleTimeString()}`;
      requestsList.appendChild(item);
    });
}

function initRequestButton() {
  requestButton.addEventListener("click", () => {
    const requests = getRideRequests();
    requests.push({ ...currentLocation, timestamp: Date.now() });
    saveRideRequests(requests);
    renderRideRequests();
    locationStatus.textContent = "Ride requested! A driver can now see it in the Driver tab.";
  });
}

function init() {
  initTabs();
  initMap();
  initGeolocation();
  initRequestButton();
  renderRideRequests();
}

init();
