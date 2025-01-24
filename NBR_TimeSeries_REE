// Initialize the GEE environment
// Define the area of interest (AOI) - Yukon, Canada
var aoi = ee.Geometry.Polygon(
  [[[-141.0, 60.0],
    [-141.0, 69.5],
    [-128.0, 69.5],
    [-128.0, 60.0]]], null, false);

// Set the map to the AOI and a reasonable zoom level
Map.centerObject(aoi, 6);

// Load the Landsat 5 TM Image Collection for the years 1984-2013
var landsat5 = ee.ImageCollection('LANDSAT/LT05/C01/T1')
  .filterBounds(aoi)
  .filterDate('1984-01-01', '2013-05-05') // Adjusted final date for when Landsat 5 was operational
  .select(['B4', 'B7']); // Selecting the bands needed for NBR (Near-IR and SWIR)

// Function to calculate NBR for each image in the collection
var addNBR = function(image) {
  return image.addBands(
    image.normalizedDifference(['B4', 'B7']).rename('NBR')
  );
};

// Map the function over the collection
var nbrCollection = landsat5.map(addNBR);

// Create a UI panel to hold the chart and form.
var panel = ui.Panel({style: {width: '400px', position: 'bottom-left'}});
ui.root.add(panel);

// Create input widgets for longitude and latitude
var lonInput = ui.Textbox({
  placeholder: 'Enter longitude',
  style: {width: '95%'}
});
var latInput = ui.Textbox({
  placeholder: 'Enter latitude',
  style: {width: '95%'}
});
var submitButton = ui.Button({
  label: 'Generate NBR Time Series',
  onClick: function() {
    var lon = parseFloat(lonInput.getValue());
    var lat = parseFloat(latInput.getValue());
    var point = ee.Geometry.Point([lon, lat]);

    // Center the map on the new point with an appropriate zoom level
    Map.centerObject(point, 13);  // Adjust zoom level as needed

    // Remove previous point layers to avoid clutter
    //Map.layers().reset();

    // Create and add a point feature to the map
    Map.addLayer(point, {color: 'yellow'}, 'Sampling Point Check');

    // Generate the NBR time series chart
    updateChart(point);
  }
});

// Add widgets to the panel
panel.add(ui.Label({
  value: 'Generating NBR change plots between 1984-2013 using Landsat 5 images',
  style: {
    fontSize: '18px', // Set the font size
    color: 'blue',    // Set the font color
    fontWeight: 'bold' // Optional: making the text bold
  }
}));
panel.add(ui.Label('Input Longitude and Latitude:'));
panel.add(lonInput);
panel.add(latInput);
panel.add(submitButton);

// Function to generate and display the NBR time series chart at the provided point
function updateChart(point) {
  // Create a time series chart of NBR at the specified location
  var nbrTimeSeries = ui.Chart.image.series({
    imageCollection: nbrCollection.select('NBR'),
    region: point,
    reducer: ee.Reducer.mean(),
    scale: 30
  }).setOptions({
    title: 'NBR Time Series at Selected Location',
    vAxis: {title: 'NBR'},
    hAxis: {title: 'Date', format: 'yyyy-MM'},
    lineWidth: 1,
    pointSize: 3,
    series: {0: {color: 'FF0000'}}  // Red color for the line
  });

  // Clear existing chart and add new chart to the panel
  panel.clear();
  panel.add(ui.Label('Input Longitude and Latitude:'));
  panel.add(lonInput);
  panel.add(latInput);
  panel.add(submitButton);
  panel.add(nbrTimeSeries);
}

// Add some text as instructions to the user
panel.add(ui.Label('Enter GPS coordinates and click the button to generate an NBR time series chart.'));


///////////////////////////////////////////////////////////////////////

// Define the area of interest (AOI) - Yukon, Canada
var aoi = ee.Geometry.Polygon(
        [[[-141.0, 60.0],
          [-141.0, 69.5],
          [-128.0, 69.5],
          [-128.0, 60.0]]], null, false);

// Load the Landsat 5 TM Image Collection
var landsat5 = ee.ImageCollection('LANDSAT/LT05/C01/T1')
                .filterBounds(aoi)
                .filterDate('1999-05-01', '1999-09-30')
                .filter(ee.Filter.lt('CLOUD_COVER', 5))
                .median()
                .clip(aoi);

/* Tasseled Cap Transformation Coefficients for Landsat 5 TM
var coefficients = {
  brightness: [0.2043, 0.4158, 0.5524, 0.5741, 0.3124, 0.2303],
  greenness: [-0.1603, -0.2819, -0.4934, 0.7940, -0.0002, -0.1446],
  wetness: [0.0315, 0.2021, 0.3102, 0.1594, -0.6806, -0.6109]
};

// Apply the Tasseled Cap Transformation
function applyTasseledCap(image) {
  var brightness = image.expression(
    'B * B1 + G * B2 + R * B3 + NIR * B4 + SWIR1 * B5 + TIR * B6', {
      'B': image.select('B1'), // Blue band
      'G': image.select('B2'), // Green band
      'R': image.select('B3'), // Red band
      'NIR': image.select('B4'), // Near-Infrared band
      'SWIR1': image.select('B5'), // Shortwave Infrared 1 band
      'TIR': image.select('B6'), // Thermal Infrared band
      'B1': coefficients.brightness[0],
      'B2': coefficients.brightness[1],
      'B3': coefficients.brightness[2],
      'B4': coefficients.brightness[3],
      'B5': coefficients.brightness[4],
      'B6': coefficients.brightness[5]
    }).rename('brightness');

  var greenness = image.expression(
    'B * G1 + G * G2 + R * G3 + NIR * G4 + SWIR1 * G5 + TIR * G6', {
      'B': image.select('B1'),
      'G': image.select('B2'),
      'R': image.select('B3'),
      'NIR': image.select('B4'),
      'SWIR1': image.select('B5'),
      'TIR': image.select('B6'),
      'G1': coefficients.greenness[0],
      'G2': coefficients.greenness[1],
      'G3': coefficients.greenness[2],
      'G4': coefficients.greenness[3],
      'G5': coefficients.greenness[4],
      'G6': coefficients.greenness[5]
    }).rename('greenness');

  var wetness = image.expression(
    'B * W1 + G * W2 + R * W3 + NIR * W4 + SWIR1 * W5 + TIR * W6', {
      'B': image.select('B1'),
      'G': image.select('B2'),
      'R': image.select('B3'),
      'NIR': image.select('B4'),
      'SWIR1': image.select('B5'),
      'TIR': image.select('B6'),
      'W1': coefficients.wetness[0],
      'W2': coefficients.wetness[1],
      'W3': coefficients.wetness[2],
      'W4': coefficients.wetness[3],
      'W5': coefficients.wetness[4],
      'W6': coefficients.wetness[5]
    }).rename('wetness');

  return image.addBands([brightness, greenness, wetness]);
}

var landsat5_tc = applyTasseledCap(landsat5);

var tcVis = {
  bands: ['brightness', 'greenness', 'wetness'],
  min: -0.3,
  max: 0.3,
  gamma: [1.0, 1.0, 1.0]
};


// Display the Tasseled Cap transformed image
Map.centerObject(aoi, 6);
Map.addLayer(landsat5_tc, tcVis, 'Landsat 5 Tasseled Cap Transformation');

// Print the transformed image information
print(landsat5_tc);
*/

//////////////////////////////////////////////
var myVector = ee.FeatureCollection('projects/rnationalmodel/assets/Fire_History_Before1996');

// add fire history before 1996
function styleFeature(color) {
  return {
    color: color,
    fillColor: '00000000'  // Transparent fill
  };
}


// List of colors for different decades
var colors = ['FF0000', '00FF00', '0000FF', 'FFFF00', '00FFFF', 'FF00FF', '990000', '009900', '000099', '999900'];

// Group the features by 'DECADE'
var distinctDecades = myVector.distinct('DECADE');
var groupedByDecade = distinctDecades.map(function(decadeFeature) {
  var decade = decadeFeature.get('DECADE');
  var filteredCollection = myVector.filter(ee.Filter.eq('DECADE', decade));
  var unionedGeometry = filteredCollection.union(1); // Buffer of 1 meter to prevent gaps
  return ee.Feature(unionedGeometry.geometry(), {
    'DECADE': decade
  });
});

// Add each group to the map with unique colors
groupedByDecade.evaluate(function(result) {
  result.features.forEach(function(feat, index) {
    var color = colors[index % colors.length];  // Cycle through colors
    var layerName = 'Decade: ' + feat.properties.DECADE;
    var style = styleFeature(color);
    var layer = ee.FeatureCollection([ee.Feature(ee.Geometry(feat.geometry))]);
    Map.addLayer(layer.style(style), {}, layerName);
  });
});

// Calculate NBR
var nbr = landsat5.normalizedDifference(['B4', 'B7']).rename('NBR');
var nbrVis = {
  min: -0.2,
  max: 0.6,
  palette: ['blue', 'white', 'red']
};

Map.addLayer(nbr, nbrVis, 'Landsat 5 1999 NBR Image');

/////////////////////////////////////////////////////////////////////////
// Create a UI panel to hold the GPS coordinates
var coordPanel = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// Add the panel to the UI
ui.root.add(coordPanel);

// Initialize a label in the panel for displaying coordinates
var coordLabel = ui.Label();
coordPanel.add(coordLabel);

// Define an event handler for map clicks that updates the coordinate display
Map.onClick(function(coords) {
  // coords is an object with lat and lon properties
  var lat = coords.lat;
  var lon = coords.lon;

  // Update the label with the latitude and longitude
  coordLabel.setValue('Latitude: ' + lat.toFixed(6) + ', Longitude: ' + lon.toFixed(6));
});

// Add a label to inform users where to click on the map
coordPanel.add(ui.Label('Click on the map to get GPS coordinates.'));


////////////////////////////////////////////////////////////////////////////////////////////////
// add event listener to display information about the feature.
var label = ui.Label();
label.style().set('position', 'bottom-right');
Map.add(label);

// Function to handle click events on the map
function showFeatureInfo(coords) {
    // Convert the clicked coordinates into an EE Geometry.
    var point = ee.Geometry.Point([coords.lon, coords.lat]);

    // Create a spatial filter to get the feature at the clicked location.
    var spatialFilter = ee.Filter.intersects({
        leftField: '.geo',
        rightValue: point
    });

    // Filter the collection using the spatial filter.
    var clickedFeature = myVector.filter(spatialFilter).first();

    // Use getInfo to fetch information about the feature and display it.
    clickedFeature.getInfo(function(feature) {
        // Check if a feature was clicked.
        if (feature) {
            // Display the selected property of the feature.
            label.setValue('Fire Year: ' + feature.properties['FIRE_YEAR']);
        } else {
            label.setValue('No feature found.');
        }
    });
}

// Set a click listener on the map to display the feature info.
Map.onClick(showFeatureInfo);













