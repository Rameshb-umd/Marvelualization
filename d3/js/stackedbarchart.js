 var margin = {
         top: 10,
         right: 0,
         bottom: 30,
         left: 40
     },
     width = 1200 - margin.left - margin.right,
     height = 650 - margin.top - margin.bottom;

 var z = d3.scale.linear();

 var x0 = d3.scale.ordinal()
     .rangeRoundBands([0, width], 0.5);

 var x1 = d3.scale.ordinal();

 var y = d3.scale.linear()
     .range([height, 0]);

 var xAxis = d3.svg.axis()
     .scale(x0)
     .orient("bottom");

 var yAxis = d3.svg.axis()
     .scale(y)
     .orient("left")
     .tickFormat(d3.format(".2s"));

 var color = d3.scale.ordinal()
     .range(["#0080FF", "#FF0000"]);

 var svg = d3.select("#StackedGroupChart").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .attr("class", "mainSVg")
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
     .attr('stroke-width', 2);

 var yBegin;

 var Tooltip = d3.select("#StackedGroupChart").append("div").attr("class", "Tooltip");

 function loadSVG(start, end) {

     d3.json("json/StackedBarChart.json", function (result) {

         var maxYvalue = 0;
         var maxDifference = 0;
         result.data.forEach(function (d) {
             d.columnDetails = d.prices;
             d.total = d3.max(d.columnDetails, function (d) {
                 if (parseInt(d.yend) > maxYvalue) {
                     maxYvalue = parseInt(d.yend);
                 }
                 var diff = parseInt(d.yend) - parseInt(d.ybegin);
                 if (diff > maxDifference) {
                     maxDifference = diff;
                 }
                 return d.yend;
             });
             //console.log("d.total" + d.total);

         });
         x0.domain(result.data.map(function (d) {
             return d.year;
         }));

         var innercolumns = eval("(" + result.innercolumns + ')');
         x1.domain(d3.keys(innercolumns)).rangeRoundBands([0, x0.rangeBand()]);

         y.domain([0, d3.max(result.data, function (d) {
             return maxYvalue;
         })]);

         z.domain([0, maxDifference]).clamp(true);

         svg.append("g")
             .attr("class", "x axis")
             .attr("transform", "translate(0," + height + ")")
             .call(xAxis);

         svg.append("text")
             .attr("class", "x label")
             .attr("text-anchor", "end")
             .attr("x", width)
             .attr("y", height + 20)
             .attr("font-family", "sans-serif")
             .style("font-size", "14px")
             .text("Years");

         svg.append("text")
             .attr("class", "y label")
             .attr("text-anchor", "end")
             .attr("y", 6)
             .attr("dy", ".75em")
             .attr("transform", "rotate(-90)")
             .style("font-size", "14px")
             .text("Total Cost in Dollars");

         svg.append("g")
             .attr("class", "y axis")
             .call(yAxis)
             .append("text")
             .attr("transform", "rotate(-90)")
             .attr("y", 6)
             .attr("dy", ".2em")
             .style("text-anchor", "end")
             .text("");

         var project_stackedbar = svg.selectAll(".project_stackedbar")
             .data(result.data)
             .enter().append("g")
             .attr("class", "g")
             .attr("transform", function (d) {
                 return "translate(" + x0(d.year) + ",0)";
             })

         project_stackedbar.selectAll("rect")
             .data(function (d) {
                 return d.columnDetails;
             })
             .enter().append("rect")
             .attr("width", x1.rangeBand())
             .attr("x", function (d) {
                 return x1(d.column);
             })
             .attr("y", function (d) {
                 return y(d.yend);
             })
             .attr("height", function (d) {
                 return y(d.ybegin) - y(d.yend);
             })
             .style("fill", function (d) {
                 return color(d.column);
             })
             .style("fill-opacity", function (d) {
                 return z(d.yend - d.ybegin);
             })
             .style("stroke-width", 0.1) // set the stroke width
             .style("stroke", "white")
             .attr("class", "comics")
             .on("mouseover", function (d) {
                 var message = "<label>Character Name: &nbsp;&nbsp;</label><label class='ToolTipText'> " + d.column + "</label><br>" +
                     "<label>Comic Name: &nbsp;&nbsp;</label><label class='ToolTipText'> " + d.comicTitle + "</label><br>" +
                     "<label>Comic Cost: &nbsp;&nbsp;</label><label class='ToolTipText'>" + Math.round((d.yend - d.ybegin) * 100) / 100 + "$</label><br>";
                 Tooltip.html(message)
                     .style("left", (d3.event.pageX) - 300 + "px")
                     .style("top", (d3.event.pageY) - 100 + "px")
                     .style("display", "block")
                     .style("opacity", 1);
             }).on("mouseout", function (d) {
                 Tooltip.style("display", "none")
             });

         ;
     });


 }

 loadSVG();

 var scale = [];
 for (var i = 1940; i <= 2020; i++) {
     if (i % 10 == 0) {
         scale.push(i);
     }

 }
 $(document).ready(function () {
     $('.range-slider').jRange({
         from: 1940,
         to: 2020,
         step: 1,
         format: '%s',
         width: 1000,
         showLabels: true,
         isRange: true,
         theme: "theme-blue",
         scale: scale
     });
 });