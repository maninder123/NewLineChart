
// basic SVG setup
var margin = { top: 20, right: 100, bottom: 40, left: 100 };
var height = 500 - margin.top - margin.bottom;
var width = 960 - margin.left - margin.right;
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// setup scales - the domain is specified inside of the function called when we load the data
var xScale = d3.time.scale().range([0, width]);
var yScale = d3.scale.linear().range([height, 0]);
var color = d3.scale.category10();


// setup the axes
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
var yAxis = d3.svg.axis().scale(yScale).orient("left");


// create function to parse dates into date objects
var parseDate = d3.time.format("%Y-%m-%d").parse;
var formatDate = d3.time.format("%Y-%m-%d");
var bisectDate = d3.bisector(function (d) { return d.date; }).left;


// set the line attributes
var line = d3.svg.line()
    .interpolate("linear")
    .x(function (d) { return xScale(d.date); })
    .y(function (d) { return yScale(d.rate); });

var focus = svg.append("g").style("display", "none");


// import data and create chart
d3.json("./data/electionData.json", function (data) {
    
    /*parse date and sort values*/
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i]['values'].length; j++) {
            data[i]['values'][j]['date'] = parseDate(data[i]['values'][j]['date']);
        }
        data[i]['values'].sort(function (a, b) {
            return a.date - b.date;
        })
    }
    // color domain
    color.domain(d3.keys(data[0]).filter(function (key) { return key !== "date"; }));

       

    // add domain ranges to the x and y scales
    xScale.domain([
        d3.min(data, function (c) { return d3.min(c.values, function (v) { return v.date; }); }),
        d3.max(data, function (c) { return d3.max(c.values, function (v) { return v.date; }); })
    ]);

    yScale.domain([0, 100]);


    // add the x axis
    svg.append("g")
        .attr("class", "x axis x_axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // add the y axis
    svg.append("g")
        .attr("class", "y axis y_axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Percent");
        
    //Grid Lines
    svg.selectAll("g.x_axis g.tick")
        .append("line")
        .classed("grid-line", true)
        .style({ "fill": "none", "opacity": "0.3", "stroke": "gray" })
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -(height));
    svg.selectAll("g.y_axis g.tick")
        .append("line")
        .classed("grid-line", true)
        .style({ "fill": "none", "opacity": "0.3", "stroke": "gray" })
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0);


    
    
    
    // add vertical line at intersection
    focus.append("line")
        .attr("class", "y")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append rectangle for capturing if mouse moves within area
   
			
    // add the line groups
    var stock = svg.selectAll(".stockXYZ")
        .data(data)
        .enter().append("g")
        .attr("class", "stockXYZ");

    // add the stock price paths
    stock.append("path")
        .attr("class", "line")
        .attr("id", function (d, i) { return "id" + i; })
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke-width", 2.5)
        .style("stroke", function (d) { return color(d.name); });


    // add the stock labels at the right edge of chart
    renderLegends();
 svg
    .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function () { focus.style("display", null); })
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);

    // mousemove function
    function mousemove() {
        var currentDate = xScale.invert(d3.mouse(this)[0]);
        for (var i = 0; i < data.length; i++) {
            var currentData = [];
            for (var j = 0; j < data[i].values.length; j++) {
                if (data[i].values[j]['date'] < currentDate) {
                    currentData.push(data[i].values[j]);
                }
            }
            focus.select(".y").attr("transform", "translate(" + (d3.mouse(this)[0]) + "," + 0 + ")");
            svg.select("#id" + i)
                .data([currentData])
                .attr("d", line);
            svg.select("#text_id" + i).attr("transform", function (d) {
                return "translate(" + (xScale(currentData[currentData.length - 1].date)+20) + "," + yScale(currentData[currentData.length - 1].rate) + ")";
            }).text( currentData[currentData.length - 1].rate+"%"+"  "+data[i].name )


        };
    }

    //re-render everything on mouse-out//
    function mouseout() {
        focus.style("display", "none");
        for (var i = 0; i < data.length; i++) {
            svg.select("#id" + i)
                .data([data[i]['values']])
                .attr("d", line);
            svg.select("#text_id" + i).attr("transform", function (d) {
                return "translate(" + xScale(data[i]['values'][data[i]['values'].length - 1].date) + "," + yScale(data[i]['values'][data[i]['values'].length - 1].rate) + ")";
            }).text(data[i]['values'][data[i]['values'].length - 1].rate+"%"+"  "+data[i].name)
        }
    }
});



//dynamically render the lengends and change opacity of other lines when mouse in on one of the lines//
function renderLegends() {
    var stock = svg.selectAll(".stockXYZ")
    stock.append("text")
        .datum(function (d, i) {
            return { name: d.name, value: d.values[d.values.length - 1] };
        })
        .attr("transform", function (d) {
            return "translate(" + xScale(d.value.date) + "," + yScale(d.value.rate) + ")";
        })
        .attr("id", function (d, i) { return "text_id" + i; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function (d) { return "    "+d.value.rate+"%"+"  "+d.name; })
        .on("mouseover", function (d, i) {
            for (j = 0; j < 6; j++) {
                if (i !== j) {
                    d3.select("#id" + j).style("opacity", 0.1);
                    d3.select("#text_id" + j).style("opacity", 0.2);
                }
            };
        })
        .on("mouseout", function (d, i) {
            for (j = 0; j < 6; j++) {
                d3.select("#id" + j).style("opacity", 1);
                d3.select("#text_id" + j).style("opacity", 1);
            };
        });
}

