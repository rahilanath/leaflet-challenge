var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(queryUrl).then(earthquakeData => {
  console.log(earthquakeData);

  d3.json("./static/geojson/PB2002_boundaries.json").then(tetonicData => {
    console.log(tetonicData);

    createFeatures(earthquakeData.features, tetonicData.features);
  })
});

function createFeatures(earthquakeData, tetonicData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.title +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {
      return new L.Circle(latlng, {
        radius: feature.properties.mag*20000,
        fillColor: depthColor(feature.properties),
        stroke: true,
        weight: 1 
      });
    }
  });

  var tetonicPlates = L.geoJSON(tetonicData, {
    onEachFeature: onEachFeature,
  });

  function depthColor(depth) {
    switch(depth) {
      case depth <= 10: 
        return "#16A085"
      case depth <= 30:
        return "#1ABC9C"
      case depth <= 50:
        return "#3498D8"
      case depth <= 70:
        return "#9B59B6"
      case depth <= 90:
        return "#E74C3C"
      default:
        return "#C0392B"
    }
  };

  createMap(earthquakes, tetonicPlates);
}

function createMap(earthquakes, tetonicPlates) {

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var monochrome = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "rahilanath/ckgrld1ly08ry19s22foi8mbc",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "rahilanath/ckgrlinda0cli19lb83mttioo",
    accessToken: API_KEY
  });

  var baseMaps = {
    "Satellite Map": satellitemap,
    "Monochrome": monochrome,
    "Outdoors": outdoors
  };

  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tetonic Plates": tetonicPlates
  };

  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellitemap, earthquakes]
  });

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
