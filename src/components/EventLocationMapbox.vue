<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'
import 'mapbox-gl/dist/mapbox-gl.css'

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

const props = defineProps({
  longitude: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  placeName: {
    type: String,
    required: true
  },
  addressString: {
    type: String,
    required: true
  }
})

const mapContainer = ref(null)
let map = null
let marker = null
let directions = null
let isNavigating = ref(false)

const initializeMap = () => {
  if (map) return // Map already initialized

  mapboxgl.accessToken = mapboxToken

  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [props.longitude, props.latitude],
    zoom: 15
  })

  map.addControl(new mapboxgl.NavigationControl(), 'top-right')

  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  })
  map.addControl(geolocate, 'top-right')

  // Create the directions control but don't add it to the map yet
  directions = new MapboxDirections({
    accessToken: mapboxToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    alternatives: true,
    congestion: true,
    controls: {
      inputs: true,
      instructions: true,
      profileSwitcher: true
    },
    placeholderOrigin: 'Your location',
    placeholderDestination: props.placeName,
    interactive: false,
    zoom: false,
    flyTo: false
  })

  marker = new mapboxgl.Marker()
    .setLngLat([props.longitude, props.latitude])
    .setPopup(
      new mapboxgl.Popup().setHTML(
        `
      <dl>
        <dt>Location Name</dt>
        <dd>${props.placeName}</dd>
        <dt>Location Address</dt>
        <dd>${props.addressString}</dd>
      </dl>
      <button class="btn btn-outline-primary"
        onclick="document.dispatchEvent(new CustomEvent('navigate', {detail: {lng: ${props.longitude}, lat: ${props.latitude}}}))"
        >
        Navigate Here
      </button>
      `
      )
    )
    .addTo(map)

  // Open the popup by default
  marker.togglePopup()

  map.on('load', () => {
    map.resize()

    // Listen for the custom 'navigate' event
    document.addEventListener('navigate', (e) => {
      if (!isNavigating.value) {
        isNavigating.value = true
        // Add the directions control to the map
        map.addControl(directions, 'top-left')
        // Set the destination
        directions.setDestination([props.longitude, props.latitude])
        // Trigger geolocation to get user's current position
        geolocate.trigger()
        geolocate.once('geolocate', (position) => {
          const userLng = position.coords.longitude
          const userLat = position.coords.latitude
          // Set the origin to user's location
          directions.setOrigin([userLng, userLat])
        })
      }

      marker.togglePopup()
    })

    // Prevent automatic zooming when route is updated
    directions.on('route', (e) => {
      const bounds = new mapboxgl.LngLatBounds()
      e.route[0].legs[0].steps.forEach((step) => {
        step.maneuver.location.forEach((coord) => {
          bounds.extend(coord)
        })
      })
      map.fitBounds(bounds, { padding: 100, maxZoom: 15 })
    })

    // Allow manual zooming and panning
    map.on('zoom', () => {
      // Additional zoom handling if needed
    })
    map.on('drag', () => {
      // Additional drag handling if needed
    })
  })
}

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (map) {
    document.removeEventListener('navigate', () => {})
    map.remove()
    map = null
    marker = null
    directions = null
  }
})

watch([() => props.latitude, () => props.longitude], ([newLat, newLng]) => {
  if (map && marker && directions) {
    map.setCenter([newLng, newLat])
    marker.setLngLat([newLng, newLat])
    if (isNavigating.value) {
      directions.setDestination([newLng, newLat])
    }
  }
})
</script>

<style scoped>
@import 'mapbox-gl/dist/mapbox-gl.css';
@import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

.map-container {
  width: 100%;
  height: 500px;
  position: relative;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

/* Adjust the positioning of the Directions control */
:deep(.mapboxgl-ctrl-top-left .mapboxgl-ctrl) {
  margin: 10px 0 0 10px;
}

/* Make sure the Directions control doesn't overlap with the map */
:deep(.mapbox-directions-component) {
  max-width: 300px;
}

/* Hide the destination input field */
:deep(.mapbox-directions-component-keyline:nth-child(2)) {
  display: none;
}

/* Ensure the profile switcher is visible */
:deep(.mapbox-directions-profile) {
  display: block !important;
}

@media (max-width: 768px) {
  .map-container {
    height: 450px;
  }

  :deep(.mapbox-directions-component) {
    max-width: 250px;
  }
}
</style>
