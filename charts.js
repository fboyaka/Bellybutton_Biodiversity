function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var allSamples = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    targetPerson = allSamples.filter(ID => ID.id === sample);
    //  5. Create a variable that holds the first sample in the array.
    var fisrtSample = data.samples[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_IDs = targetPerson['0'].otu_ids;
    var labels = targetPerson['0'].otu_labels;
    var values = targetPerson['0'].sample_values;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    //BARCHART
    var yTicks = otu_IDs.slice(0,10).reverse().map(id => 'OTU ' + id);
    var xData = values.slice(0,10).reverse();
    var hoverText = labels.slice(0,10).reverse();

    // 8. Create the trace for the bar chart. 
    var barData = [{
      type : 'bar',
      y : yTicks,
      x : xData,
      marker: {
        color: 'rgba(58,200,225,.5)',
        line: {
          color: 'rgb(8,48,107)',
          width: 1.5
        }
      },
      text : hoverText,
      orientation : 'h'
      
    }];

    // 9. Create the layout for the bar chart. 

    var layout = {
      title: "Top 10 Bacteria Cultures Found",
      xaxis: { title: "Value Counts" },
    };

    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot('bar', barData, layout);
    
    //BUBBLE
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x : otu_IDs,
      y : values,
      text : labels,
      mode : 'markers',
      marker : {
        size : values,
        color : otu_IDs,
        colorscale: 'Portland',
      }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title : 'Bacteria Cultures Per Sample',
      xaxis : {
        title : 'OTU ID'
      },
      yaxis: {
        title: "Value Counts"
      }
      
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);

  // GAUGE
  // 1. create a variable that filters the metadata array for an object in 
  // that matches the sample person's id
  var allMetadata = data.metadata;
  var target_Metadata = allMetadata.filter(num => num.id === parseInt(sample));
  
  // In Step 2, create a variable that 
  // holds the first sample in the array created in Step 1.
  var fisrtMetadata = data.metadata[0];

  // get the washing frequency as an integer
  var wfreq = parseInt(target_Metadata['0'].wfreq);

  // create the trace for the gauge chart
  var data = [
    {
      domain: { x: [0, 1], y: [0, 1] },
      value: wfreq,
      title: '<b>Belly Button Washing Frequency</b> <br> Number of washes per week',
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        bar: { color: "black" },
        axis: { 
          nticks : 10,
          range: [null, 10] },
          steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "lightgreen" },
          { range: [8, 10], color: "green" }
          ]      
      }
    }
  ];

  Plotly.newPlot('gauge', data);
  });
}
