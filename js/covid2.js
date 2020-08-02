var margin = { left:60, right:60, top:60, bottom:60 };
var width = 920 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


// Tooltip
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
       var text = "<strong>Date:&nbsp;&nbsp;&nbsp;</strong> <span style='color:red'>" + d.date_text + "</span><br>";
       text += "<strong>Cases:</strong> <span style='color:red'>" + d3.format(",.0f")(d.cases) + "</span><br>";
       return text;
    });
g.call(tip);



// X label
g.append("text")
    .attr("class", "x axis-label")
    .attr("y", (height + (margin.bottom/1.5)))
    .attr("x", width / 2)
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .text("Total Coronavirus Cases Per Day in the United States");

// Y label
g.append("text")
    .attr("class", "y axis-label")
    .attr("y", -(margin.left/1.5))
    .attr("x", -(height/2))
    .attr("font-size", "13px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Cases (log base 10)");

d3.csv("data/jd_us_cases_and_deaths.csv").then(function(data){
    console.log(data)

    // Clean data - cast the cases values to numeric
    data.forEach(function(d) {
        d.cases = +d.cases;
    });

    // X scale
    var x = d3.scaleBand()
        .domain(data.map(function(d){ return d.date_text; }))
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    // Y scale
    var y = d3.scaleLog().clamp(true)
        .domain([1, d3.max(data, function(d) { return d.cases })])
        .range([height, 0])
        .base(10);

    // X axis
    var xAxisCall = d3.axisBottom(x)
        .tickValues(["Jan 26","Feb 26","Mar 26","Apr 26","May 26","Jun 26","Jul 26"]);
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisCall);

    // Y axis
    var yAxisCall = d3.axisLeft(y)
        .tickValues([10, 100, 1000, 10000, 100000, 1000000, 4000000])
        .tickFormat(d3.format(".0s"))
        .tickSizeOuter(5)
    g.append("g")
        .attr("cllass", "y axis")
        .call(yAxisCall);

    // Bars
    var rects = g.selectAll("rect")
        .data(data)

    rects.enter()
        .append("rect")
        .attr("x", function(d){ return x(d.date_text); })
        .attr("width", x.bandwidth)
        .attr("height", function(d){ return height - y(d.cases); })
        .attr("fill", "#86C5E7")
        .attr("y", y(0))
        .attr("fill-opacity", 0)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .transition(d3.transition().duration(2000))
            .attr("y", function(d){ return y(d.cases); })
            .attr("fill-opacity", 1);
})

