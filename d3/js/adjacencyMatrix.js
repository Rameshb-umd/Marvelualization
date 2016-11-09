 var margin = {
         top: 100,
         right: 0,
         bottom: 10,
         left: 100
     },
     width = 600,
     height = 600;

 var x = d3.scale.ordinal().rangeBands([0, width]),
     z = d3.scale.linear().domain([0, 300]).clamp(true),
     c = d3.scale.category10().domain(d3.range(7));

 var svg = d3.select("#AdjacencyMatrix").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .attr("class", "MatrixSvg")
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 d3.json("json/adjacencyMatrix.json", function (miserables) {
     var matrix = [],
         nodes = miserables.nodes,
         n = nodes.length;

     // Compute index per node.
     nodes.forEach(function (node, i) {
         node.index = node.order;
         node.count = 0;
         matrix[i] = d3.range(n).map(function (j) {
             return {
                 x: j,
                 y: i,
                 z: 0
             };
         });
     });

     // Convert links to matrix; count character occurrences.
     miserables.links.forEach(function (link) {
         matrix[link.source][link.target].z = link.value;
         matrix[link.target][link.source].z = link.value;
         //matrix[link.source][link.source].z = link.value;
         //matrix[link.target][link.target].z = link.value;
         //nodes[link.source].count = link.value;
         //nodes[link.target].count = link.value;
     });

     // Precompute the orders.
     var orders = {
         name: d3.range(n).sort(function (a, b) {
             return d3.ascending(nodes[a].name, nodes[b].name);
         }),
         count: d3.range(n).sort(function (a, b) {
             return nodes[b].comicCount - nodes[a].comicCount;
         }),
         group: d3.range(n).sort(function (a, b) {
             return nodes[b].group - nodes[a].group;
         })
     };

     // The default sort order.
     x.domain(orders.name);

     svg.append("rect")
         .attr("class", "background")
         .attr("width", width)
         .attr("height", height);

     var row = svg.selectAll(".row")
         .data(matrix)
         .enter().append("g")
         .attr("class", "row")
         .attr("transform", function (d, i) {
             return "translate(0," + x(i) + ")";
         })
         .each(row);

     row.append("line")
         .attr("x2", width);

     row.append("text")
         .attr("x", -6)
         .attr("y", x.rangeBand() / 2)
         .attr("dy", ".32em")
         .attr("text-anchor", "end")
         .attr("font-family", "sans-serif")
         .attr("font-size", "12px")
         .text(function (d, i) {
             return nodes[i].name;
         });

     var column = svg.selectAll(".column")
         .data(matrix)
         .enter().append("g")
         .attr("class", "column")
         .attr("transform", function (d, i) {
             return "translate(" + x(i) + ")rotate(-90)";
         });

     column.append("line")
         .attr("x1", -width);

     column.append("text")
         .attr("x", 6)
         .attr("y", x.rangeBand() / 2)
         .attr("dy", ".32em")
         .attr("text-anchor", "start")
         .attr("font-family", "sans-serif")
         .attr("font-size", "12px")
         .text(function (d, i) {
             return nodes[i].name;
         });

     function row(row) {


         var cell = d3.select(this).selectAll(".cell")
             .data(row.filter(function (d) {
                 return d.z;
             }))
             .enter().append("g")
             .attr("x", function (d) {
                 return x(d.x);
             })

         d3.select(this).selectAll("g")
             .append("rect")
             .attr("class", "cell")
             .attr("x", function (d) {
                 return x(d.x);
             })
             .attr("width", x.rangeBand())
             .attr("height", x.rangeBand())
             .style("fill-opacity", function (d) {
                 //console.log(d.z + "???" + z(d.z));
                 return z(d.z);
             })
             .style("fill", function (d) {
                 //console.log(nodes[d.x].name + ":" + nodes[d.y].name + ":" + matrix[nodes[d.x].order][nodes[d.y].order].z);
                 return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null;
                 //return c(matrix[nodes[d.x].order][nodes[d.y].order].z);
             })
             .on("mouseover", mouseover)
             .on("mouseout", mouseout)
             .on('click', onclickEvent);


     }

     function onclickEvent(d) {
         //console.log(matrix[nodes[p.x].order][nodes[p.y].order].z + "??");
         alert(matrix[nodes[d.x].order][nodes[d.y].order].z + "??" + nodes[d.x].name + ":" + nodes[d.y].name + "Count" + nodes[d.x].comicCount);
     }

     function mouseover(p) {
         console.log(matrix[nodes[p.x].order][nodes[p.y].order].z + "??");
         d3.select(this).style("cursor", "pointer")
         d3.selectAll(".row text").classed("active", function (d, i) {
             return i == p.y;
         });
         d3.selectAll(".column text").classed("active", function (d, i) {
             return i == p.x;
         });
     }

     function mouseout() {
         d3.selectAll("text").classed("active", false);
         d3.select(this).style("cursor", "default")
     }

     d3.select("#order").on("change", function () {
         //clearTimeout(timeout);
         order(this.value);
     });

     function order(value) {
         console.log(value + "Value:" + orders[value]);
         x.domain(orders[value]);

         var t = svg.transition().duration(2500);

         t.selectAll(".row")
             .delay(function (d, i) {
                 return x(i) * 4;
             })
             .attr("transform", function (d, i) {
                 return "translate(0," + x(i) + ")";
             })
             .selectAll(".cell")
             .delay(function (d) {
                 return x(d.x) * 4;
             })
             .attr("x", function (d) {
                 return x(d.x);
             });

         t.selectAll(".column")
             .delay(function (d, i) {
                 return x(i) * 4;
             })
             .attr("transform", function (d, i) {
                 return "translate(" + x(i) + ")rotate(-90)";
             });
     }


 });