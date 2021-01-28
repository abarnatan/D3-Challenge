const svgWidth = 660;
const svgHeight = 460;

const margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Set width and height of chart
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Make SVG wrapper, append an SVG group that will hold our chart,
// move by left and top margins.
const svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Append SVG group
const chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`)

// Set the initial parameters 
var chosenXaxis = "poverty";
var chosenYaxis = "healthcare";

// Update xAxis with click on label
function renderXAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// Update xyAxis with click on label
function renderYAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// updating circles group to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d=>newYScale(d[chosenYAxis]));
    return circlesGroup;
  }
  function renderTexts(txtGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  
    txtGroup.transition()
      .duration(1000)
      .attr("x", d=>newXScale(d[chosenXAxis]))
      .attr("y", d=>newYScale(d[chosenYAxis]))
    return txtGroup;
  }

// update x-scale with click
function xScale(healthData, chosenXaxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXaxis]*0.8),
        d3.max(healthData, d => d[chosenXaxis]*1.2)
      ])
      .range([0, width]);
    return xLinearScale;
}
function yScale(healthData, chosenYaxis) {
    const yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d=>d[chosenYaxis])*0.8, d3.max(healthData, d=>d[chosenYaxis])*1.2 ])
      .range([height, 0]);
    return yLinearScale;
}

// Update the tooltip for circles group
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup){
    let xLabel = ""
    let yLabel = ""
    if (chosenXaxis === "poverty"){
      xLabel = "Poverty: ";
    }
    else if (chosenXaxis === "age"){
      xLabel = "Age: ";
    }
    else{
      xLabel = "Income: $";
    }
    if (chosenYaxis === "healthcare"){
      yLabel = "Healthcare: "
    }
    else if (chosenYaxis === "smokes"){
      yLabel = "Smokes: "
    }
    else{
      yLabel = "Obesity: "
    }
    const toolTip = d3.tip()
                      .attr("class", "d3-tip")
                      .offset([80, -60])
                      .html(function(d){
                        if (chosenYaxis === "smokes" || chosenYaxis === "obesity") {
                          if (chosenXaxis === "poverty"){
                            return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}%<br>${yLabel}${d[chosenYaxis]}%`)
                          }
                          return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}<br>${yLabel}${d[chosenYaxis]}%`)
                        }
                        else if (chosenXaxis === "poverty"){
                          return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}%<br>${yLabel}${d[chosenYaxis]}`)
                        }
                        else{
                          return(`${d.state},${d.abbr}<br>${xLabel}${d[chosenXaxis]}<br>${yLabel}${d[chosenYaxis]}`)
                        }  
                      })

    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(data){
        toolTip.show(data, this);
     d3.select(this).style("stroke", "black");               
        })
    circlesGroup.on("mouseout", function(data, index){
                        toolTip.hide(data, this)
                        d3.select(this).style("stroke", "white");
                      })
                      return circlesGroup;
                    }
// Retrieve data from the CSV file and execute everything below
(async function(){
    const healthData = await d3.csv("assets/data/data.csv");

    // parse data to interger from string
    healthData.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    })

    // xLinearScale function after csv import
    let xLinearScale = xScale(healthData, chosenXaxis);

    // yLinearScale function after csv import
    let yLinearScale = yScale(healthData, chosenYaxis)

     // Create initial axis functions
     const bottomAxis = d3.axisBottom(xLinearScale);
     const leftAxis = d3.axisLeft(yLinearScale);