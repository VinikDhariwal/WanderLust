mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: [75.8577, 22.7196],
  zoom: 11
});

map.addControl(new mapboxgl.NavigationControl());

map.dragRotate.disable();
map.touchZoomRotate.disableRotation();