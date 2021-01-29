const svgWidth = 660;
const svgHeight = 460;

const margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Calc the chart's width and height here
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Make the SVG wrapper and append the SVG group which will hold the chart,
// then shift by top and left margions
const svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Append SVG 
const chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)

// Set the initial parametes
var chosenXaxis = "poverty";
var chosenYaxis = "healthcare";

// Update the xAxis const with click on xAxis label 
function updateXAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(3000)
    .call(bottomAxis);

  return xAxis;
}
// Update the yAxis const with click on xAxis label 
function updateYAxes(newYScale, yAxis) {
  const leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(3000)
    .call(leftAxis);

  return yAxis;
}


// updating circles group to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(3000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d=>newYScale(d[chosenYAxis]));
  return circlesGroup;
}
function renderTexts(txtGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  txtGroup.transition()
    .duration(3000)
    .attr("x", d=>newXScale(d[chosenXAxis]))
    .attr("y", d=>newYScale(d[chosenYAxis]))
  return txtGroup;
}

// update x-scale with click on axis label
function xScale(healthData, chosenXaxis) {
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

// update the tooltip for circles group
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
    const healthData = await d3.csv("assets/data/data.csv");

    // convert data from string to interger
    healthData.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    })

    // xLinearScale to process data post importing
    let xLinearScale = xScale(healthData, chosenXaxis);

    // yLinearScale to process data post importing
    let yLinearScale = yScale(healthData, chosenYaxis)

    // here are initial axis functions
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
                                .attr("value", "income") /// value for the event listener
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

     // ToolTipUpdate function after csv import
     circlesGroup = ToolTipUpdate(chosenXaxis, chosenYaxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value");
        console.log(`${value} click`)
        if (value !== chosenXaxis) {

            // replaces chosenXAxis with value
            chosenXaxis = value;
            console.log(chosenXaxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXaxis);

            // updates x axis with transition
            xAxis = updateXAxes(xLinearScale, xAxis);

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
          // update tooltip with change of xaxis with new data 
          circlesGroup = ToolTipUpdate(chosenXaxis, chosenYaxis, circlesGroup); 
      }})

// call the y axis label event listener
ylabelsGroup.selectAll("text")
.on("click", function() {
// obtain and store the selection
const value = d3.select(this).attr("value");
console.log(`${value} click`)
if (value !== chosenYaxis) {

    // this will replace chosenXAxis with value
    chosenYaxis = value;
    console.log(chosenYaxis)

    /// this will update x scale for new data
    yLinearScale = yScale(healthData, chosenYaxis);

    // this will update x axis with transition
    yAxis = updateYAxes(yLinearScale, yAxis);

    // update the circles with newly selected x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

     // update circle texts with new x values
    txtGroup = renderTexts(txtGroup, xLinearScale, yLinearScale, chosenXaxis, chosenYaxis);

    // change selected text to bold text 
    if (chosenYaxis === "healthcare") {
      healthCareLabel
            .classed("active", true)
            .classed("inactive", false);
      smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      obesityLabel
            .classed("active", false)
            .classed("inactive", true);
    }
    else if (chosenYaxis === "smokes"){
      healthCareLabel
          .classed("active", false)
          .classed("inactive", true);
      smokeLabel
          .classed("active", true)
          .classed("inactive", false);
      obesityLabel
          .classed("active", false)
          .classed("inactive", true);
    }
    else{
      healthCareLabel
            .classed("active", false)
            .classed("inactive", true);
      smokeLabel
            .classed("active", false)
            .classed("inactive", true);
      obesityLabel
            .classed("active", true)
            .classed("inactive", false);  
    }
     // update the tooltip when yaxis changes with new data 
     circlesGroup = ToolTipUpdate(chosenXaxis, chosenYaxis, circlesGroup); 
  }})

})()

