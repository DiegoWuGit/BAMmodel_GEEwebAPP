// Define band-specific visualization ranges
var BAND_RANGES = {
    'b1': { min: 0.0, max: 0.2, palette: ['blue', 'green', 'yellow', 'red'] },
    'b2': { min: 0.0, max: 5.0, palette: ['blue', 'green', 'yellow', 'red'] },
    'b3': { min: 0.0, max: 1.0, palette: ['blue', 'green', 'yellow', 'red'] },
    'b4': { min: 0, max: 10000000, palette: ['blue', 'green', 'yellow', 'red'] }
  };
  
  // Function to load and extract a specific band from the selected asset
  function getRasterBand(asset, band) {
    var image = ee.Image(asset).select([band]); 
    return image.visualize(BAND_RANGES[band]); 
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////////
  // Organizing the assets
  var assets = {
    'TEWA 2010': 'projects/rnationalmodel/assets/TEWA_mosaic_2010',
    'TEWA 2015': 'projects/rnationalmodel/assets/TEWA_mosaic_2015',
    'VESP 1985': 'projects/rnationalmodel/assets/VESP_mosaic_1985',
    'VESP 2020': 'projects/rnationalmodel/assets/VESP_mosaic_2020',
    'YBFL 1990': 'projects/rnationalmodel/assets/YBFL_mosaic_1990'
  };
  
  // Band names for display
  var BANDS = ['b1', 'b2', 'b3', 'b4'];
  
  ////////////////////////////////////////////////////////////////////////////////////////////
  // Create a map for each band.
  var maps = [];
  BANDS.forEach(function(band, index) {
    var map = ui.Map();
    map.add(ui.Label('Band ' + (index + 1))); // Label each map with Band Number
    map.setControlVisibility(false);
    map.setCenter(-110, 60, 3); 
    maps.push(map);
  });
  
  // Link all maps together for synchronized panning and zooming.
  var linker = ui.Map.Linker(maps);
  
  // Enable zooming on the top-left map.
  maps[0].setControlVisibility({zoomControl: true});
  
  // Show the scale (e.g., '500m') on the bottom-right map.
  maps[3].setControlVisibility({scaleControl: true});
  
  // Function to update all maps with the selected dataset
  function updateMaps(selection) {
    var selectedAsset = assets[selection];
    
    // Apply the correct band visualization to each map
    maps.forEach(function(map, index) {
      var band = BANDS[index]; // Get the correct band for this map
      map.layers().set(0, ui.Map.Layer(getRasterBand(selectedAsset, band), {}, 'Band ' + (index + 1)));
      map.setCenter(-110, 60, 3); 
    });
  }
  
  // Create a dropdown to select the dataset
  var select = ui.Select({
    items: Object.keys(assets),
    onChange: updateMaps
  });
  select.setValue(Object.keys(assets)[0], true); 
  
  // Create a control panel for the dropdown
  var controlPanel = ui.Panel({
    widgets: [ui.Label('Select a dataset:'), select],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {position: 'top-center'}
  });
  
  // Create a grid of maps.
  var mapGrid = ui.Panel(
    [
      ui.Panel([maps[0], maps[1]], null, {stretch: 'both'}),
      ui.Panel([maps[2], maps[3]], null, {stretch: 'both'})
    ],
    ui.Panel.Layout.Flow('horizontal'), {stretch: 'both'}
  );
  
  ////////////////////////////////////////////////////////////////////////////////////////////
  // Create a title
  var title = ui.Label('Population, Uncertainty, and Extrapolation of Prediction Rasters', {
    stretch: 'horizontal',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '20px'
  });
  
  // Add elements to the UI
  ui.root.widgets().reset([title, controlPanel, mapGrid]);
  ui.root.setLayout(ui.Panel.Layout.Flow('vertical'));
  