/*
*    main.js
*    Line Graph with interactivity features in D3.js
*/

var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

var t = function(){ return d3.transition().duration(1000); }

var parseTime = d3.timeParse("%m/%d/%Y");
var formatTime = d3.timeFormat("%m/%d/%Y");
var bisectDate = d3.bisector(function(d) { return d.report_date; }).left;

// Add the line for the first time
g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "3px");

// Labels
var xLabel = g.append("text")
    .attr("class", "x axisLabel")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .text("Time");
var yLabel = g.append("text")
    .attr("class", "y axisLabel")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -170)
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .text("Number of cases or deaths")

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// X-axis
var xAxisCall = d3.axisBottom()
    .ticks(4);
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")");

// Y-axis
var yAxisCall = d3.axisLeft()
var yAxis = g.append("g")
    .attr("class", "y axis");

// Event listeners
$("#coin-select").on("change", update)
$("#var-select").on("change", update)

// Add jQuery UI slider
$("#date-slider").slider({
    range: true,
    max: parseTime("7/27/2020").getTime(),
    min: parseTime("1/22/2020").getTime(),
    step: 86400000, // One day
    values: [parseTime("1/22/2020").getTime(), parseTime("7/27/2020").getTime()],
    slide: function(event, ui){
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        update();
    }
});


d3.json("data/counties_line_graph.json").then(function(data){
    //console.log(data);

    // Prepare and clean data
    filteredData = {};
    for (var coin in data) {
        // coin is a string "Harris County"

        // makes sure that the current record at least contains some data
        if (!data.hasOwnProperty(coin)) {
            continue;
        }

        // get all 2nd level informatioon pertaining to the current county where the report date is not null
        filteredData[coin] = data[coin].filter(function(d){
            return !(d["report_date"] == null)
        })

        // cast to the correct data type
        filteredData[coin].forEach(function(d){
            d["report_date"] = parseTime(d["report_date"]);
            d["cases"] = +d["cases"];
            d["new_cases"] = +d["new_cases"];
            d["deaths"] = +d["deaths"];
            d["new_deaths"] = +d["new_deaths"]
        });
    }

    // Run the visualization for the first time
    update();
})


function update(){
    // Filter data based on selections
    var coin = $("#coin-select").val(),
        yValue = $("#var-select").val(),
        sliderValues = $("#date-slider").slider("values");
    var dataTimeFiltered = filteredData[coin].filter(function(d){
        return ((d.report_date >= sliderValues[0]) && (d.report_date <= (sliderValues[1])))
    });

    // Update scales
    x.domain(d3.extent(dataTimeFiltered, function(d){ return d.report_date; }));
    y.domain([d3.min(dataTimeFiltered, function(d){ return d[yValue]; }) / 1.005,
        d3.max(dataTimeFiltered, function(d){ return d[yValue]; }) * 1.005]);

    // Fix for format values
    var formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
        var s = formatSi(x);
        switch (s[s.length - 1]) {
            case "G": return s.slice(0, -1) + "B";
            case "k": return s.slice(0, -1) + "K";
        }
        return s;
    }

    // Update axes
    xAxisCall.scale(x);
    xAxis.transition(t()).call(xAxisCall);
    yAxisCall.scale(y);
    yAxis.transition(t()).call(yAxisCall.tickFormat(formatAbbreviation));

    // Clear old tooltips
    d3.select(".focus").remove();
    d3.select(".overlay").remove();

    // Tooltip code
    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");
    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);
    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);
    focus.append("circle")
        .attr("r", 5);
    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");
    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisectDate(dataTimeFiltered, x0, 1);
        var d0 = dataTimeFiltered[i - 1];
        var d1 = dataTimeFiltered[i];
        var d = (d1 && d0) ? (x0 - d0.report_date > d1.report_date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + x(d.report_date) + "," + y(d[yValue]) + ")");
        focus.select("text").text(function() { return d3.format(",")(d[yValue].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", height - y(d[yValue]));
        focus.select(".y-hover-line").attr("x2", -x(d.report_date));
    }

    // Path generator
    line = d3.line()
        .x(function(d){ return x(d.report_date); })
        .y(function(d){ return y(d[yValue]); });


    console.log(yValue);

    // Update our line path
    g.select(".line")
        .transition(t)
        .attr("d", line(dataTimeFiltered));

    if((yValue == "cases") || (yValue == "new_cases")){
        g.select(".line")
            .attr("stroke","#86C5E7");
    } else {
        g.select(".line")
            .attr("stroke","#D6AED6");
    }


    // Update y-axis label
    var newText = (yValue == "cases") ? "Number of cases" :
        ((yValue == "new_cases") ?  "Number of new cases" :
                ((yValue == "deaths") ? "Number of deaths" : "Number of new deaths"))
    yLabel.text(newText);

}