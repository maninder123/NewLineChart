var data = [];
// basic SVG setup
var margin = {top: 50, right: 200, bottom: 40, left: 100};
var height = 390 - margin.top - margin.bottom;
var width = 950 - margin.left - margin.right;
var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// setup scales - the domain is specified inside of the function called when we load the data
var xScale = d3.time.scale().range([0, width]);
var yScale = d3.scale.linear().range([height, 0]);
var color = d3.scale.linear().domain([0, 1, 2, 3, 4, 5]).range(["#7F0000", "#FDD5AF", "#BF0F0A", "#E7533A", "#FF7F7F", "rgb(181, 72, 17)"]);

// setup the axes
var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
        .ticks(d3.time.days, 20)
    .tickFormat(d3.time.format('%b %d %Y'))
//        .tickFormat()
var yAxis = d3.svg.axis().scale(yScale).orient("left").tickValues([0, 25, 50, 75, 100]);


// create function to parse dates into date objects
var parseDate = d3.time.format("%Y-%m-%d").parse;


// set the line attributes
var line = d3.svg.line()
        .interpolate("linear")
        .x(function (d) {
            return xScale(d.date);
        })
        .y(function (d) {
            return yScale(d.rate);
        });


// import data and create chart
d3.json("./data/electionData.json", function (response) {
    data = response;
    /*parse date and sort values*/
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i]['values'].length; j++) {
            data[i]['values'][j]['date'] = parseDate(data[i]['values'][j]['date']);
        }
        data[i]['values'].sort(function (a, b) {
            return a.date - b.date;
        })
    }



    // add domain ranges to the x and y scales
    xScale.domain([
        d3.min(data, function (c) {
            return d3.min(c.values, function (v) {
                return v.date;
            });
        }),
        d3.max(data, function (c) {
            return d3.max(c.values, function (v) {
                return v.date;
            });
        })
    ]);

    yScale.domain([0, 102]);


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
            .style({"fill": "none", "opacity": "0.1", "stroke": "gray"})
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -(height));
    svg.selectAll("g.y_axis g.tick")
            .append("line")
            .classed("grid-line", true)
            .style({"fill": "none", "opacity": "0.1", "stroke": "gray"})
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width)
            .attr("y2", 0);

 
    // add the line groups
    var Lines = svg.append("g").selectAll(".lines")
            .data(data)
            .enter().append("g")
            .attr("class", "lines");

    // add paths
    Lines.append("path")
            .attr("class", "line")
            .attr("id", function (d, i) {
                return "id" + i;
            })
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke-width", 2.5)
            .style("stroke", function (d, i) {
                return color(i);
            });


    // add the  labels at the right edge of chart
    renderLegends();
    
    /*append a rectangle to svg to handle mouse events*/
    svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseout", mouseout)
            .on("mousemove", mousemove);

    /*call fucntion to get race date lne and labels*/
    getRaceDateLineAndLabel();


});
//------------------------------------------------------------------------------
/**
 * Function to append race date line and lables to svg
 */
function getRaceDateLineAndLabel() {
    var end_date = data[0]['values'][data[0]['values'].length - 1]['date']
    /*append dahed line*/
    svg.append("g").attr("class", "race_date_line_labels")
            .append("line")
            .attr("class", "dashed_line")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("transform", function (d) {
                return "translate(" + (xScale(end_date)) + "," + 0 + ")";
            });
    /*append lables*/
    svg.select(".race_date_line_labels").append("text")
            .attr("transform", function (d) {
                return "translate(" + (xScale(end_date) - 30) + "," + -9 + ")";
            })
            .style({"font-size": "10px", "text-transform": "uppercase"})
            .attr("x", 3)
//            .attr("dy", ".35em")
            .text("Feb .9")
    /*append chart lable text*/
    svg.select(".race_date_line_labels").append("text")
            .attr("transform", function (d) {
                return "translate(" + (xScale(end_date) + 30) + "," + 65 + ")";
            })
            .attr("class", "chart-label")
//            .attr("x", 3)
//            .attr("dy", ".35em")
            .text("Chance of winning")
    /*append lables*/
    svg.select(".race_date_line_labels").append("text")
            .attr("transform", function (d) {
                return "translate(" + ((xScale(end_date)) - 50) + "," + -21 + ")";
            })
            .style({"font-size": "10px", "text-transform": "uppercase", "font-weight": "700"})
            .attr("x", 3)
//            .attr("dy", ".35em")
            .text("Primary")
    svg.select(".race_date_line_labels").append("text")
            .attr("transform", function (d) {
                return "translate(" + (xScale(end_date) - 8) + "," + 4 + ")";
            })
            .style({"font-size": "10px"})
            .attr("x", 3)
//            .attr("dy", ".35em")
            .text("▼");
    var hidedeG = svg.append("g").attr("class", "hide_label").style("visibility", "hidden").attr("transform", function (d) {
        return "translate(" + 0 + "," + height + ")";
    });

    hidedeG.append("text").attr("y", 8).style({"font-size": "10px"})
            .text("▲");
    hidedeG.append("text").attr("y", 25).attr("class", "current_text")
            .text("");
}

//------------------------------------------------------------------------------
//dynamically render the lengends and change opacity of other lines when mouse in on one of the lines//
function renderLegends() {
    var lablesArray = [];
    var Lines = svg.selectAll(".lines")
    /*append rect*/
    Lines.append("rect").datum(function (d, i) {
        return {name: d.name, value: d.values[d.values.length - 1]};
    }).attr("class", function (d, i) {
        return "flag-bg bg-rect" + i
    })
            .attr("width", function (d) {
                return  (((d.name).length) * 8) + (4 * 11)  /*get the width based on length of text (4->xx% ), 11->approx width taken by each alphbet*/
            })
            .attr("height", 20)
            .attr("transform", function (d, i) {//10->height of the rect/2
                /*create labels array here to adjust labels*/
                lablesArray.push({
                    y: (yScale(d.value.rate)),
                    index: i,
                    x: (xScale(d.value.date))
                });
                return "translate(" + (xScale(d.value.date) + 30) + "," + (yScale(d.value.rate) - 10) + ")";
            })
            .attr("rx", 2)
            .attr("ry", 2);

    /*append rect*/
    Lines.append("rect").datum(function (d, i) {
        return {name: d.name, value: d.values[d.values.length - 1]};
    }).attr("class", function (d, i) {
        return "flag  flag-rect" + i
    })
            .attr("width", function (d) {
                return  (((d.name).length) * 8) + (4 * 11) /*get the width based on length of text (4->xx% ), 11->approx width taken by each alphbet*/
            })
            .attr("height", 20)
            .attr("transform", function (d) {//10->height of the rect/2
                return "translate(" + (xScale(d.value.date) + 30) + "," + (yScale(d.value.rate) - 10) + ")";
            }).attr("fill", "#fde1ba").attr("stroke", "#fde1ba")
            .attr("rx", 2)
            .attr("ry", 2);

    /*append dotted line*/

    Lines.append("line").datum(function (d, i) {
        return {name: d.name, value: d.values[d.values.length - 1]};
    })
            .attr("class", function (d, i) {
                return "dotted_line" + i
            })
            .attr("stroke", "#3c3c3c")
            .attr("stroke-dasharray", "2,2")
            .attr("fill", "none")
            .attr("x1", 0)
            .attr("y1", function(d){
               return (yScale(d.value.rate))
            })
            .attr("x2", 30)
            .attr("y2", 0)
            .attr("transform", function (d) {//10->height of the rect/2
                return "translate(" + (xScale(d.value.date)) + "," + 0 + ")";
            })

    /*append text*/
    var text = Lines.append("text")
            .datum(function (d, i) {
                return {name: d.name, value: d.values[d.values.length - 1]};
            })
            .attr("transform", function (d) {
                return "translate(" + (xScale(d.value.date) + 30) + "," + yScale(d.value.rate) + ")";
            })
            .attr("id", function (d, i) {
                return "text_id" + i;
            })
            .attr("x", 3)
            .attr("dy", ".35em")
//            .text(function (d) {
//                return "    " + d.value.rate + "%" + "  " + d.name;
//            })
            .on("mouseover", function (d, i) {
                for (j = 0; j < 6; j++) {
                    if (i !== j) {
                        d3.select("#id" + j).style("opacity", 0.1);
                        d3.select("#text_id" + j).style("opacity", 0.2);
                    }
                }
                ;
            })
            .on("mouseout", function (d, i) {
                for (j = 0; j < 6; j++) {
                    d3.select("#id" + j).style("opacity", 1);
                    d3.select("#text_id" + j).style("opacity", 1);
                }
                ;
            })
    text.append("tspan").attr("class", "label-percentage")
            .text(function (d) {
                return "   " + d.value.rate + "%";
            });
    text.append("tspan").attr("class", "label-cand")
            .text(function (d) {
                return " " + d.name;
            });
    adjustLables(lablesArray);
}
//------------------------------------------------------------------------------
/**
 * Function to handle mouse move on svg
 */
function mousemove() {
    var lablesArray = [];
    svg.selectAll(".x_axis text").style("visibility", "hidden")
    var currentDate = xScale.invert(d3.mouse(this)[0]);
    svg.select(".hide_label").attr("transform", function (d) {
        return "translate(" + (xScale(currentDate)) + "," + height + ")";
    }).style("visibility", "visible");
    svg.select(".current_text").text(function () {
        var current_text = currentDate.toString().split(" ")
        return current_text[1] + " " + current_text[2];
    });
    for (var i = 0; i < data.length; i++) {
        var currentData = [];
        for (var j = 0; j < data[i].values.length; j++) {
            if (data[i].values[j]['date'] < currentDate) {
                currentData.push(data[i].values[j]);
            }
        }
        lablesArray.push({
            y: yScale(currentData[currentData.length - 1].rate),
            index: i,
            x: (xScale(currentData[currentData.length - 1].date))
        });
        svg.select("#id" + i)
                .data([currentData])
                .attr("d", line);
        svg.select("#text_id" + i).attr("transform", function (d) {
            return "translate(" + (xScale(currentData[currentData.length - 1].date) + 30) + "," + yScale(currentData[currentData.length - 1].rate) + ")";
        }).text("");
        svg.select("#text_id" + i).append("tspan").attr("class", "label-percentage")
                .text(function (d) {
                    return "   " + d.value.rate + "%";
                });
        svg.select("#text_id" + i).append("tspan").attr("class", "label-cand")
                .text(function (d) {
                    return " " + d.name;
                });
//                .text(currentData[currentData.length - 1].rate + "%" + "  " + data[i].name)
        svg.select(".bg-rect" + i).attr("transform", function (d) {
            return "translate(" + (xScale(currentData[currentData.length - 1].date) + 30) + "," + (yScale(currentData[currentData.length - 1].rate) - 10) + ")";
        })
        svg.select(".flag-rect" + i).attr("transform", function (d) {
            return "translate(" + (xScale(currentData[currentData.length - 1].date) + 30) + "," + (yScale(currentData[currentData.length - 1].rate) - 10) + ")";
        })
        svg.select(".dotted_line" + i).attr("transform", function (d) {
            return "translate(" + (xScale(currentData[currentData.length - 1].date)) + "," + 0 + ")";
        }).attr("y1",(yScale(currentData[currentData.length - 1].rate)))


    }
    adjustLables(lablesArray)
}
//------------------------------------------------------------------------------
/**
 * Function to handle mouseout on svg
 */
function mouseout() {
    var lablesArray = [];
    svg.selectAll(".x_axis text").style("visibility", "visible")
    svg.select(".hide_label").style("visibility", "hidden");
    for (var i = 0; i < data.length; i++) {
        lablesArray.push({
            y: yScale(data[i]['values'][data[i]['values'].length - 1].rate),
            index: i,
            x: (xScale(data[i]['values'][data[i]['values'].length - 1].date))
        });
        svg.select("#id" + i)
                .data([data[i]['values']])
                .attr("d", line);
        svg.select("#text_id" + i).attr("transform", function (d) {
            return "translate(" + (xScale(data[i]['values'][data[i]['values'].length - 1].date) + 30) + "," + yScale(data[i]['values'][data[i]['values'].length - 1].rate) + ")";
        }).text("");
        svg.select("#text_id" + i).append("tspan").attr("class", "label-percentage")
                .text(function (d) {
                    return "   " + d.value.rate + "%";
                });
        svg.select("#text_id" + i).append("tspan").attr("class", "label-cand")
                .text(function (d) {
                    return " " + d.name;
                });
        svg.select(".bg-rect" + i).attr("transform", function (d) {
            return "translate(" + (xScale(data[i]['values'][data[i]['values'].length - 1].date) + 30) + "," + (yScale(data[i]['values'][data[i]['values'].length - 1].rate) - 10) + ")";
        })
        svg.select(".flag-rect" + i).attr("transform", function (d) {
            return "translate(" + (xScale(data[i]['values'][data[i]['values'].length - 1].date) + 30) + "," + (yScale(data[i]['values'][data[i]['values'].length - 1].rate) - 10) + ")";
        })
        svg.select(".dotted_line" + i).attr("transform", function (d) {
            return "translate(" + (xScale(data[i]['values'][data[i]['values'].length - 1].date)) + "," + 0 + ")";
        }).attr("y1",(yScale(data[i]['values'][data[i]['values'].length - 1].rate)))
    }
    adjustLables(lablesArray);
}
//------------------------------------------------------------------------------
/**
 * Function to adjust lables
 */
function adjustLables(lablesArray) {
    if (lablesArray) {
        lablesArray.sort(function (a, b) {
            return b.y - a.y;
        });

        for (var i = 0; i < lablesArray.length; i++) {
            if (i == 0) {
                if (height - lablesArray[i].y < 10) {
                    lablesArray[i].y = lablesArray[i].y - 10;
                }
            }
            if (i != lablesArray.length - 1) {
                if (lablesArray[i].y - lablesArray[i + 1].y <= 20) {
                    lablesArray[i + 1].y = lablesArray[i].y - 20;
                }
            }
            svg.select(".flag-rect" + lablesArray[i]['index']).attr("transform", function (d) {
                return "translate(" + (lablesArray[i].x + 30) + "," + (lablesArray[i].y - 10) + ")";
            });
            svg.select(".bg-rect" + lablesArray[i]['index']).attr("transform", function (d) {
                return "translate(" + (lablesArray[i].x + 30) + "," + (lablesArray[i].y - 10) + ")";
            });
            svg.select("#text_id" + lablesArray[i]['index']).attr("transform", function (d) {
                return "translate(" + (lablesArray[i].x + 30) + "," + (lablesArray[i].y) + ")";
            });
            svg.select(".dotted_line" + lablesArray[i]['index'])
                    .attr("transform", function (d) {
                return "translate(" + (lablesArray[i].x) + "," +0 + ")";
            }).attr("y2", (lablesArray[i].y));
        }

    }
}