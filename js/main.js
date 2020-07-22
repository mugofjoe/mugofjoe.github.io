/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.8 - Activity: Your first visualization!
*/

var svg = d3.select("#chart-area").append("svg")
    .attr("width", 500)
    .attr("height", 500);

d3.json("data/buildings.json").then(function(data){
    // Show the format of the array
    console.log(data);

    // Write a loop for your data array to convert the height
    // values from strings to numbers
    data.forEach(function(d){
        d.height = +d.height;
    });
    console.log(data);

    var rects = svg.selectAll()
        .data(data)
        .enter()
        .append("rect")
            .attr("y", 0)
            .attr("x", function(d, i){
                               return (i * 60); })
            .attr("width", 40)
            .attr("height", function(d){
                                return d.height; })
            .attr("fill", function(d) {
                              return "grey"; });


})