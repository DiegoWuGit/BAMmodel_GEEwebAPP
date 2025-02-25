// Function to load and visualize the first band of a raster asset
function getRasterComposite(asset) {
    var image = ee.Image(asset).select(['b1']); // Select only the first band
    return image.visualize({
      min: 0.0,
      max: 0.2,
      palette: ['blue', 'green', 'yellow', 'red']
    });
  }
  
  //////////////////////////////////////////////////////////////////////////////////////
  // Organizing the assets with the correct label and path
  var layers = {
    'TEWA 2010': getRasterComposite('projects/rnationalmodel/assets/TEWA_mosaic_2010'),
    'TEWA 2015': getRasterComposite('projects/rnationalmodel/assets/TEWA_mosaic_2015'),
    'VESP 1985': getRasterComposite('projects/rnationalmodel/assets/VESP_mosaic_1985'),
    'VESP 2020': getRasterComposite('projects/rnationalmodel/assets/VESP_mosaic_2020'),
    'YBFL 1990': getRasterComposite('projects/rnationalmodel/assets/YBFL_mosaic_1990'),
  };
  
  //////////////////////////////////////////////////////////////////////////////////////
  //Set up the maps and control widgets
  
  // Create the left map, and have it display the first layer.
  var leftMap = ui.Map();
  leftMap.setControlVisibility(false);
  var leftSelector = addLayerSelector(leftMap, 0, 'top-left');
  
  // Create the right map, and have it display the second layer.
  var rightMap = ui.Map();
  rightMap.setControlVisibility(false);
  var rightSelector = addLayerSelector(rightMap, 1, 'top-right');
  
  // Function to add a layer selection dropdown for each map.
  function addLayerSelector(mapToChange, defaultValue, position) {
    var label = ui.Label('Choose the species and prediction year');
  
    // Update the map when a new layer is selected
    function updateMap(selection) {
      mapToChange.layers().set(0, ui.Map.Layer(layers[selection]));
    }
  
    // Create dropdown menu for selecting layers
    var select = ui.Select({
      items: Object.keys(layers), 
      onChange: updateMap
    });
    select.setValue(Object.keys(layers)[defaultValue], true);
  
    var controlPanel = ui.Panel({widgets: [label, select], style: {position: position}});
    mapToChange.add(controlPanel);
  }
  
  //////////////////////////////////////////////////////////////////////////////////////
  //Tie everything together
  
  // Create a SplitPanel for side-by-side map comparison
  var splitPanel = ui.SplitPanel({
    firstPanel: leftMap,
    secondPanel: rightMap,
    wipe: true,
    style: {stretch: 'both'}
  });
  
  // Set the SplitPanel as the UI root
  ui.root.widgets().reset([splitPanel]);
  
  // Link the two maps together (sync zoom and pan)
  var linker = ui.Map.Linker([leftMap, rightMap]);
  
  // Set initial map center to a reasonable default location
  leftMap.setCenter(-100, 58, 3.5);
  