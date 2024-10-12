<template>
  <div class="find-services">
    <div class="container mt-5 mb-5">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <h1 class="text-center">Find Services Near You</h1>
          <p class="text-center">
            Search for SilverHealth locations in your community to visit service centres.
            <br />Get navigation to the selected destination.
            <br />Click the marker on the map to view location details.
            <br /><br /><strong>Note: Please set the location permission to "Allow" to use the navigation
              function.</strong>
          </p>
        </div>
      </div>

      <div class="map-container">
        <div class="search-overlay">
          <MapSearchComponent @location-selected="flyToLocation" @locations-loaded="handleLocationsLoaded" />
        </div>
        <div id="map" ref="mapContainer" style="width: 100%; height: 100%"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapSearchComponent from '@/components/MapSearchComponent.vue'

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const mapContainer = ref(null)
let map = null
let directions = null
const locations = ref([])

function createPopupContent(location) {
  const openingHours = location.openingHours
  const hoursHtml = `
    <p><strong>Opening Hours:</strong></p>
    <ul>
      <li>Weekdays: ${openingHours.weekday.open ? `${openingHours.weekday.open} - ${openingHours.weekday.close}` : 'Closed'}</li>
      <li>Saturday: ${openingHours.saturday.open ? `${openingHours.saturday.open} - ${openingHours.saturday.close}` : 'Closed'}</li>
      <li>Sunday: ${openingHours.sunday.open ? `${openingHours.sunday.open} - ${openingHours.sunday.close}` : 'Closed'}</li>
    </ul>
  `

  return `
    <div class="popup-content">
      <h3>${location.name}</h3>
      <button class="btn btn-outline-primary" onclick="document.dispatchEvent(new CustomEvent('navigate', {detail: {lng: ${location.longitude}, lat: ${location.latitude}}}))">Navigate Here</button>
      <p><strong>Type:</strong> ${location.type}</p>
      <p><strong>Address:</strong> ${location.address}</p>
      <p><strong>Phone:</strong> ${location.phoneNumber}</p>
      ${hoursHtml}
      <p><strong>Description:</strong> ${location.description}</p>
    </div>
  `
}

function navigateToLocation(coords) {
  if (directions && coords.lng && coords.lat) {
    const destLng = parseFloat(coords.lng);
    const destLat = parseFloat(coords.lat);

    if (!isNaN(destLng) && !isNaN(destLat)) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLng = position.coords.longitude;
          const userLat = position.coords.latitude;
          directions.setOrigin([userLng, userLat]);
          directions.setDestination([destLng, destLat]);
        },
        (error) => {
          console.error('Error getting user location:', error);
          directions.setDestination([destLng, destLat]);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.error('Invalid destination coordinates:', coords);
    }
  }
}

function getDirectionsPosition() {
  return window.innerWidth <= 767 ? 'bottom-left' : 'top-right'
}

function handleLocationsLoaded(serviceLocations) {
  locations.value = serviceLocations
  if (map) {
    addMarkersToMap()
  }
}

function addMarkersToMap() {
  locations.value.forEach((location) => {
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(createPopupContent(location))

    const marker = new mapboxgl.Marker()
      .setLngLat([location.longitude, location.latitude])
      .setPopup(popup)
      .addTo(map)


    // Show popup on mouse enter
    marker.getElement().addEventListener('mouseenter', () => {
      // Remove any popups that may have existed previously
      const popups = document.getElementsByClassName('mapboxgl-popup')
      if (popups.length) {
        popups[0].remove()
      }

      popup.addTo(map)
    })

    // Remove popup on mouse leave
    // marker.getElement().addEventListener('mouseleave', () => {
    //   popup.remove()
    // })

    // Navigation is triggered when the marker is clicked
    marker.getElement().addEventListener('click', () => {
      navigateToLocation({ lng: location.longitude, lat: location.latitude })
    })

    // marker.getElement().addEventListener('click', (e) => {
    //   e.stopPropagation()
    //   popup.addTo(map)
    // })
  })
}

onMounted(() => {
  mapboxgl.accessToken = mapboxToken

  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [145.1303405, -37.9132538], // Longitude, Latitude
    zoom: 10
  })

  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }), 'bottom-right')

  directions = new MapboxDirections({
    accessToken: mapboxToken,
    unit: 'metric',
    profile: 'mapbox/driving'
  })
  map.addControl(directions, getDirectionsPosition())

  window.addEventListener('resize', () => {
    map.removeControl(directions)
    map.addControl(directions, getDirectionsPosition())
  })

  map.on('load', () => {
    if (locations.value.length > 0) {
      addMarkersToMap()
    }
  })

  document.addEventListener('navigate', (e) => {
    navigateToLocation(e.detail)
  })
})

onUnmounted(() => {
  if (map) map.remove()
  document.removeEventListener('navigate', navigateToLocation)
  window.removeEventListener('resize', () => { })
})

function flyToLocation(location) {
  map.flyTo({
    center: [location.longitude, location.latitude],
    zoom: 15,
    essential: true
  })

  // Remove any popups that may have existed previously
  const popups = document.getElementsByClassName('mapboxgl-popup')
  if (popups.length) {
    popups[0].remove()
  }

  new mapboxgl.Popup({ offset: 25 })
    .setLngLat([location.longitude, location.latitude])
    .setHTML(createPopupContent(location))
    .addTo(map)
}
</script>

<style>
@import 'mapbox-gl/dist/mapbox-gl.css';
@import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

.map-container {
  position: relative;
  width: 100%;
  height: 650px;
}

.search-overlay {
  position: absolute;
  z-index: 1;
  width: 300px;
}

.popup-content {
  max-width: 300px;
  font-family: Arial, sans-serif;
}

.popup-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.popup-content p {
  margin: 5px 0;
  font-size: 14px;
}

.popup-content ul {
  padding-left: 20px;
  margin: 5px 0;
}

.popup-content li {
  font-size: 12px;
}

/* .popup-content button {
} */

.mapboxgl-ctrl-top-right .mapboxgl-ctrl-directions {
  margin-top: 10px;
  margin-right: 10px;
}

.mapboxgl-ctrl-bottom-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.mapboxgl-ctrl-bottom-right .mapboxgl-ctrl {
  margin: 0 10px 10px 0;
}

@media (max-width: 767px) {
  .mapboxgl-ctrl-top-right .mapboxgl-ctrl-directions {
    display: none;
  }

  .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl-directions {
    margin: 0 0 10px 10px;
  }
}

@media (min-width: 768px) {
  .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl-directions {
    display: none;
  }
}
</style>