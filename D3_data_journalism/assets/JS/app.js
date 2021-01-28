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
function ToolTipUpdate(chosenXaxis, chosenYaxis, circlesGroup){
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

// Get data from  CSV file, process data
(async function(){
    const healthData = await d3.csv("../data/data.csv");

    // convert data from string to interger
    healthData.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    })

    // xLinearScale function to process data post importing
    let xLinearScale = xScale(healthData, chosenXaxis);

    // yLinearScale function to process data post importing
    let yLinearScale = yScale(healthData, chosenYaxis)

     // Create axis functions
     const bottomAxis = d3.axisBottom(xLinearScale);
     const leftAxis = d3.axisLeft(yLinearScale);

      // append X-axis
    let xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)

let yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis)

let crlTxtGroup = chartGroup.selectAll("mycircles")
  .data(healthData)
  .enter()
  .append("g")

let circlesGroup = crlTxtGroup.append("circle")
        .attr("cx", d=>xLinearScale(d[chosenXaxis]))
        .attr("cy", d=>yLinearScale(d[chosenYaxis]))
        .classed("stateCircle", true)
        .attr("r", 8)
        .attr("opacity", "1");

let txtGroup = crlTxtGroup.append("text")
          .text(d=>d.abbr)
          .attr("x", d=>xLinearScale(d[chosenXaxis]))
          .attr("y", d=>yLinearScale(d[chosenYaxis])+3)
          .classed("stateText", true)
          .style("font-size", "7px")
          .style("font-weight", "800")

// Create group for  3 x- axis labels
const xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

// Create group for  3 y- axis labels
const ylabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${0-margin.left/4}, ${height/2})`);

const povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("value", "poverty") // value for the event listener
            .classed("active", true)
            .classed("aText", true)
            .text("In Poverty (%)");

const ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "age") // value for the event listener
            .classed("inactive", true)
            .classed("aText", true)
            .text("Age (Median)");

const incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "income") // value for the event listener
            .classed("inactive", true)
            .classed("aText", true)
            .text("Household Income (Median)");

const healthCareLabel = ylabelsGroup.append("text")
            .attr("y", 0 - 20)
            .attr("x", 0)
            .attr("transform", "rotate(-90)")
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .classed("aText", true)
            .text("Lacks Healthcare (%)");

const smokeLabel = ylabelsGroup.append("text")
            .attr("y", 0 - 40)
            .attr("x", 0)
            .attr("transform", "rotate(-90)")
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .classed("aText", true)
            .text("Smokes (%)");
            
const obesityLabel = ylabelsGroup.append("text")
            .attr("y", 0 - 60)
            .attr("x", 0)
            .attr("transform", "rotate(-90)")
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .classed("aText", true)
            .text("Obese (%)");

 // updateToolTip function after importing csv 
 circlesGroup = ToolTipUpdate(chosenXaxis, chosenYaxis, circlesGroup);

 // x axis labels event listener
 xlabelsGroup.selectAll("text")
    .on("click", function() {

    // OBTAIN THE value of selection
    const value = d3.select(this).attr("value");
    console.log(`${value} click`)
         if (value !== chosenXaxis) {
            // this replaces chosenXAxis with new val
            chosenXaxis = value;
            console.log(chosenXaxis)

      // functions here found above csv import
        // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXaxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

             // updates texts with new x values
            txtGroup = renderTexts(txtGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

            // changes classes to change bold text
            if (chosenXaxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXaxis === "age"){
              povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
              ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
              incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
            }
            else{
              povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);  
            }
          // update tooltip with new info after changing x-axis 
          circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup); 
      }})
