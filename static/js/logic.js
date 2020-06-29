// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"
       + "<hr><p>" + "Magnitude: " + feature.properties.mag + "</p>")
    ;
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng)},
    style: function(feature) {
        if (feature.properties.mag <= 1) {
            return {radius: 5,
                    color: "#1a9850",
                    fillOpacity: 1}
        } else if (feature.properties.mag <= 2) {
            return {radius: 8,
                    color: "#91cf60"}
        } else if (feature.properties.mag <= 3) {
            return {radius: 12,
                    color: "#ffff00"}
        } else if (feature.properties.mag <= 4) {
            return {radius: 15,
                    color: "#ff751a"}
        } else if (feature.properties.mag < 5) {
            return {radius: 18,
                    color: "#fc8d59"
                    }
        } else {
            return {radius: 21,
                    color: "#d73027"
                    
            }
        }
    }
  });

  

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
  });

  var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/dark-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
  });



  // Define Satellite Map
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

 

  // Create the faultline layer
  var faultLine = new L.LayerGroup();

  // Query to retrieve the faultline data
 var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

 // Create the faultlines and add them to the faultline layer
 d3.json(faultlinequery, function(data) {
   L.geoJSON(data, {
     style: function() {
       return {color: "red", fillOpacity: .2}
     }
   }).addTo(faultLine)
 }) 

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite Map": satellitemap,
    
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine
  };



  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [streetmap, earthquakes, faultLine]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}

 

// color function to be used when creating the legend
function getColor(d) {
    return d > 5 ? '#d73027' :
           d <= 5 ? '#d73027' : 
           d <= 4  ? '#fc8d59' :
           d <= 3  ? '#ff9933' :
           d <= 2  ? '#ffcc33' :
           d <= 1  ? '#ffff33' :
                    '#ccff33';
  }

// Add legend to the map
var legend = L.control({position: 'bottomright'});
  
legend.onAdd = function (map) {
  
    var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
  
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
    }
  
    return div;
  };
  
legend.addTo(myMap);




