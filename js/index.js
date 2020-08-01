/*

Flip the chart between data about number of cases and data about number of deaths.
We use a flag (TRUE = use the cases data; FALSE = use the deaths data).

The D3 Update Pattern

// DATA JOIN
// Join new data with old elements if any.

// EXIT
// Remove old elements as needed.

// UPDATE
// Update old elements as needed.

// ENTER
// Create new elements as needed.

 */

var margin = {left: 60, right: 60, top: 60, bottom: 60};

var width = 920 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Add a flag that we'll use to choose whether to use cases or deaths data.
var flag = true;

// Duration should be lower than our loop's delay. (see d3.interval below)
var t = d3.transition().duration(2000);

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


// Only create the group "g" once and not each time the viz is updated.
var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

// Only create the group "g" once and not each time the viz is updated.
var yAxisGroup = g.append("g")
    .attr("cllass", "y axis");


// X Scale
var x = d3.scaleBand()
    .range([0, width])
    .paddingInner(0.3)
    .paddingOuter(0.3);

// Y Scale
var y = d3.scaleLog().clamp(true)
    .range([height, 0])
    .base(10);

// X Label
var xLabel = g.append("text")
    .attr("class", "x axis-label")
    .attr("y", (height + (margin.bottom / 1.5)))
    .attr("x", width / 2)
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .text("Total COVID-19 Cases Per Day (United States Nationwide)");

// Y Label
var yLabel = g.append("text")
    .attr("class", "y axis-label")
    .attr("y", -(margin.left / 1.5))
    .attr("x", -(height / 2))
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Cases (log base 10)");

d3.csv("data/jd_us_cases_and_deaths.csv").then(function (data) {

    // Clean data - cast the cases values to numeric
    data.forEach(function (d) {
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    d3.interval(function () {
        var newData = flag ? data : data.slice(1);
        update(newData);
        flag = !flag;
    }, 2500);

    // Run the viz for the first time to get rid of the initial delay from the update function above.
    update(data);
})


// Step 1
function update(data) {

    var value = flag ? "cases" : "deaths";

    /*var current_time = Date(Date.now());
    console.log("Updating... " + current_time.toString());*/

    // Only update the domain where the data is supposed to change each time the interval is hit.
    x.domain(data.map(function (d) { return d.date_text; }));
    y.domain([1, d3.max(data, function (d) { return d[value] })]);

    // X Axis
    var xAxisCall = d3.axisBottom(x)
        .tickValues(["Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26"]);
    xAxisGroup.transition(t).call(xAxisCall);

    // Y Axis
    var yAxisCall = d3.axisLeft(y)
        .tickFormat(d3.format(".0s"))
        .tickSizeOuter(5);
    if (value == "cases") {
        yAxisCall.tickValues([10, 100, 1000, 10000, 100000, 1000000, 4000000])
    } else {
        yAxisCall.tickValues([10, 100, 1000, 10000, 100000])
    }

    yAxisGroup.transition(t).call(yAxisCall);

    // The D3 Update Pattern
    // Repaints the bars of the bar plot with currently loaded data.

    // JOIN new data with old elements.
    var rects = g.selectAll("rect")
        .data(data, function(d){
            return d.date_text;
        });

    // EXIT old elements not present in new data.
    rects.exit()
            .attr("fill", "red")
        .transition(t)
            .attr("y", y(0))
            .attr("height", 0)
        .remove();

    // ENTER new elements present in new data...
    rects.enter()
        .append("rect")
            .attr("fill", "#6495ed")
            .attr("y", y(0))
            .attr("height", 0)
            .attr("x", function (d) { return x(d.date_text); })
            .attr("width", x.bandwidth)
        // and UPDATE old elements present in new data.
        .merge(rects)
        .transition(t)
            .attr("x", function (d) { return x(d.date_text); })
            .attr("width", x.bandwidth)
            .attr("y", function (d) { return y(d[value]); })
            .attr("height", function (d) { return height - y(d[value]); })

    if (value == "cases") {
        rects.attr("fill", "#6495ed");
    } else {
        rects.attr("fill", "#8B008B");
    }


    var ylabel = flag ? "Number of Cases (log base 10)" : "Number of Deaths (log base 10)";
    var xlabel = flag ? "Total COVID-19 Cases Per Day in the United States": "Total COVID-19 Deaths Per Day in the United States";
    yLabel.text(ylabel);
    xLabel.text(xlabel);
}

