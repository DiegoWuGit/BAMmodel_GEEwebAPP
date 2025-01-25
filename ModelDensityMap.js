////////////////////////////////////////////////////////////////////////////////////////////
// Define a dictionary of layers with asset paths, and
// Map visualization parameters
////////////////////////////////////////////////////////////////////////////////////////////
// var layers = {
//     'OVEN_mosaic_1985': {
//       asset: 'projects/rnationalmodel/assets/OVEN_mosaic_1985',
//       palette: ['blue', 'green', 'yellow', 'red'] // Visualization palette for this layer
//     },
//     'OVEN_mosaic_2020': {
//       asset: 'projects/rnationalmodel/assets/OVEN_mosaic_2020',
//       palette:['blue', 'green', 'yellow', 'red']  // Visualization palette for this layer
//     },
//     'AMCR-CAN-Mean': {
//       asset: 'projects/rnationalmodel/assets/pred-AMCR-CAN-Mean',
//       palette: ['black', 'white'] // Visualization palette for this layer
//     }
//     // Add more layers as needed...
//   };

var layers = {
  'OVEN': [
    { year: 1985, asset: 'projects/rnationalmodel/assets/OVEN_mosaic_1985' },
    { year: 1990, asset: 'projects/rnationalmodel/assets/OVEN_mosaic_1990' },
    { year: 1995, asset: 'projects/rnationalmodel/assets/OVEN_mosaic_1995' },
    { year: 2000, asset: 'projects/rnationalmodel/assets/OVEN_mosaic_2000' },
    { year: 2005, asset: 'projects/rnationalmodel/assets/OVEN_mosaic_2005' },
    { year: 2010, asset: 'projects/rnationalmodel/assets/OVEN_mosaic_2010' },
    { year: 2015, asset: 'projects/rnationalmodel/assets/OVEN_mosaic_2015' },
    { year: 2020, asset: 'projects/rnationalmodel/assets/OVEN_mosaic_2020' }
  ],
  'AMCR': [
    { year: 1985, asset: 'projects/rnationalmodel/assets/pred-AMCR-CAN-Mean' }
    // Add other species and their layers as needed
  ]
};

////////////////////////////////////////////////////////////////////////////////////////////
// Map center point and zoom level
Map.setCenter(-100, 58, 3.5); // Default zoom to North America

// Change the projection to Albers Equal Area for North America (EPSG:5070)
var projection = ee.Projection('EPSG:5070');

////////////////////////////////////////////////////////////////////////////////////////////
// Panel organisation
////////////////////////////////////////////////////////////////////////////////////////////
var panel = ui.Panel({
  style: { width: '400px' }
});
ui.root.add(panel);

panel.add(ui.Label({
  value: 'BAM bird density model v.5 trend tool',
  style: {
    fontSize: '18px', // Set the font size
    color: 'blue',    // Set the font color
    fontWeight: 'bold' // Optional: making the text bold
  }
}));

// Variables to track active species and images globally
var activeSpecies = null;
var activeImages = null;

////////////////////////////////////////////////////////////////////////////////////////////
// Section 1 - Choose a species
// Create a list of items for the dropdown menu, displaying species codes
////////////////////////////////////////////////////////////////////////////////////////////
var title1 = ui.Label('Step 1: Select a species');
panel.add(title1);

// Dropdown menu for selecting layers
var layerSelector = ui.Select({
  items: Object.keys(layers),
  placeholder: 'Select a species',
  onChange: function (species) {
    Map.layers().reset(); // Clear existing layers
    activeSpecies = species; // Update active species
    activeImages = layers[species].map(function (layer) {
      return ee.Image(layer.asset).select([0]);
    });

    // Add layers for the selected species to the map
    layers[species].forEach(function (layer) {
      var image = ee.Image(layer.asset).select([0]);
      Map.addLayer(
        image,
        { min: 0.0, max: 0.35, palette: ['blue', 'green', 'yellow', 'red'] },
        species + ' - ' + layer.year
      );
    });
  }
});
panel.add(layerSelector);

////////////////////////////////////////////////////////////////////////////////////////////
// Label to display clicked pixel values
var valueLabel = ui.Label('Step 2: Click on the map to generate a time series plot.');
panel.add(valueLabel);

Map.onClick(function (coords) {
  if (!activeSpecies || !activeImages) {
    valueLabel.setValue('Please select a species first.');
    return;
  }

  var point = ee.Geometry.Point([coords.lon, coords.lat]);

  // Check the bands in the first image for debugging
  activeImages[0].bandNames().evaluate(function (bands) {
    print('Bands in the first image:', bands);
  });

  // Extract raw pixel values from all images for debugging
  var rawValues = activeImages.map(function (image) {
    return image.sample({
      region: point,
      scale: 100, // Adjust scale based on your data resolution
      numPixels: 1
    }).first();
  });

  ee.FeatureCollection(rawValues).evaluate(function (result) {
    print('Raw Pixel Values at Location:', result);
  });

  // Extract pixel values using reduceRegion
  var timeSeries = activeImages.map(function (image) {
    return image.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: 100, // Match your raster resolution
      crs: projection
    }).get('b1');
  });

  // Extract years for the selected species
  var years = layers[activeSpecies].map(function (layer) {
    return layer.year;
  });

  // Evaluate and process the time series data
  ee.List(timeSeries).evaluate(function (values) {
    print('Raw Time Series Values:', values);

    // Filter out null values and prepare chart data
    var data = [];
    years.forEach(function (year, index) {
      var value = values[index] !== null ? values[index] : 0; // Replace null with 0
      data.push([year.toString(), value]);
    });

    print('Filtered Data:', data);
    print('Chart Data Format:', data);
    data = ee.List(data).getInfo(); // Convert to client-side JavaScript array

    data.unshift(["Year", "Population"]);
    // if (data.length === 0) {
    //   valueLabel.setValue('No valid data at this location.');
    //   return;
    // }

    // Create the time series chart
    var chart = ui.Chart(data)
      .setChartType('LineChart')
      .setOptions({
        title: 'Population trend model',
        hAxis: {
          title: 'Year',
          format: '####',
          slantedText: true,
          slantedTextAngle: 45,
          textStyle: { fontSize: 10 }
        },
        vAxis: { title: 'Population (per km²)' },
        width: 500, // Increase chart width to provide more room for labels
        height: 300,
        lineWidth: 2,
        pointSize: 4
      });

    // Add the chart to the panel
    panel.widgets().set(4, chart);
  });
});

////////////////////////////////////////////////////////////////////////////////////////////
// Section 2 - 
// Add the stock photo to the panel using a ui.Thumbnail 
////////////////////////////////////////////////////////////////////////////////////////////
// var imageUrl = 'https://photo-api.abmi.ca/photo-api/get-profile-image?sname=Turdus%20migratorius';

// var imageLink = ui.Label({
//   value: 'Click here to view the bird image',
//   style: {
//     fontSize: '14px',
//     color: 'blue',
//     textAlign: 'center',
//     textDecoration: 'underline'
//   }
// });

// imageLink.setUrl(imageUrl); // Direct the label to the external image URL
//   panel.add(imageLink);

//////////////////////////////////////////////////////////////
var title3 = ui.Label('');
panel.add(title3);
var title4 = ui.Label('*Hint: type the location name above and fly there');
panel.add(title4);
var title5 = ui.Label('');
panel.add(title5);
//////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////
// Section 3 - 
// Download link 1,2,3
////////////////////////////////////////////////////////////////////////////////////////////
var title6 = ui.Label('Step 3: Download options');
panel.add(title6);

// Download link 1
var imageUrl1 = 'https://drive.google.com/drive/u/1/folders/1aJUZr4fACdD02H8AYejR2XG6zuA6E492';

var imageLink1 = ui.Label({
  value: '- through Google Drive:',
  style: {
    fontSize: '14px',
    color: 'blue',
    textAlign: 'center',
    textDecoration: 'underline'
  }
});

imageLink1.setUrl(imageUrl1); // Direct the label to the external image URL
panel.add(imageLink1);

// Download link 2
var imageUrl2 = 'https://github.com/borealbirds/BAMexploreR';

var imageLink2 = ui.Label({
  value: '- through R package (BAMexploreR):',
  style: {
    fontSize: '14px',
    color: 'blue',
    textAlign: 'center',
    textDecoration: 'underline'
  }
});

imageLink2.setUrl(imageUrl2); // Direct the label to the external image URL
panel.add(imageLink2);

// Download link 3 
var assetNameLabel = ui.Label('Asset name: Not selected');
panel.add(assetNameLabel);

var spacing = ui.Label('');
panel.add(spacing);

// Add a copyright label at the bottom of the panel
var copyrightLabel = ui.Label({
  value: 'Copyright by Boreal Avian Modelling Project (BAM)',
  style: {
    fontSize: '12px',
    textAlign: 'right',
    color: 'gray',
    margin: '10px auto'
  }
});
panel.add(copyrightLabel);

////////////////////////////////////////////////////////////////////////////////////////////
// Map manupulation:
// Optionally add the first layer by default (if needed)
////////////////////////////////////////////////////////////////////////////////////////////
var defaultSpeciesKey = Object.keys(layers)[0]; // Get the first species key (e.g., 'OVEN')
var defaultLayer = layers[defaultSpeciesKey][0]; // Get the first layer for the default species (1985 layer in this case)

// Add the default layer to the map
var defaultImage = ee.Image(defaultLayer.asset).select([0]); // Load the default raster layer
Map.addLayer(
  defaultImage,
  {
    min: 0.0,  // Adjust the minimum value for visualization
    max: 0.35, // Adjust the maximum value for visualization
    palette: ['blue', 'green', 'yellow', 'red'], // Set a default palette
    crs: projection.crs(), // Ensure the CRS matches the projection
    crsTransform: projection.transform() // Apply the transform
  },
  defaultSpeciesKey + ' - ' + defaultLayer.year // Layer name
);
////////////////////////////////////////////////////////////////////////////////////////////