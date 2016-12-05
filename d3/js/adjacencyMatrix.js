 var margin = {
         top: 180,
         right: 0,
         bottom: 10,
         left: 200
     },
     width = 700,
     height = 700;

 var x = d3.scale.ordinal().rangeBands([0, width]),
     z = d3.scale.linear().domain([0, 300]).clamp(true),
     c = d3.scale.category10().domain(d3.range(7));


 var ObjectMap = {};

 var colores_g = {};
 colores_g["Avengers"] = "#3366cc";
 colores_g["Fantastic Four"] = "#ff9900";
 colores_g["Defenders"] = "#651067";
 colores_g["X-Men"] = "#66aa00";
 colores_g["X-Force"] = "#5574a6";
 colores_g["None"] = "#8e1258";

 for (var index in colores_g) {
     var legend = '<span style="width:15px;height:15px;background:' + colores_g[index] +
         '">&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;' + index + "&nbsp;&nbsp;&nbsp;&nbsp;";
     $("#Legend").append(legend);
     console.log(index + " : " + +"<br />");
 }

 function colores_google(n) {
     if (n in colores_g) {
         return colores_g[n];
     } else {
         return "Red";
     }
 }

 var svg = d3.select("#AdjacencyMatrix").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .attr("class", "MatrixSvg")
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


 d3.json("json/adjacencyMatrix.json", function (marvel) {
     var matrix = [],
         nodes = marvel.nodes,
         n = nodes.length;

     // Compute index per node.
     var totalComics = 2812;
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
         var comicPT = Math.round((parseInt(node.comicCount) / totalComics) * 100);
         var html = '<li class="ui-state-default characterDragLi character_' + node.order + '" order="' + node.order + '"' +
             '><div class= "CharacterDiv draggable" ">' +
             '<div class="CharacterDivHeader" style="width:' + comicPT + '%; background:' + colores_g[node.group] + '"></div>' +
             '<label class = "characterName"> ' + node.name + ' </label>' +
             '<label class = "comicCount">(' + node.comicCount + ' )</label></div></li> ';
         //console.log(html);
         $('#Characterssortable').append(html);
         $("#Characterssortable").sortable({
             stop: customSortFunction
         });
     });
     //style="background:' + colores_g[node.group] + '


     // Convert links to matrix; count character occurrences.
     marvel.links.forEach(function (link) {
         matrix[link.source][link.target].z = link.value;
         matrix[link.target][link.source].z = link.value;
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
             return d3.ascending(nodes[a].group, nodes[b].group);
         })
     };

     var defaultOrder = orders.name;

     var arrayLength = defaultOrder.length;
     var prevElement = null;

     for (var i = 0; i < arrayLength; i++) {
         var element = defaultOrder[i];
         ObjectMap[element] = $(".character_" + element).remove();
     }

     for (var i = 0; i < arrayLength; i++) {
         var element = defaultOrder[i];
         $('#Characterssortable').append(ObjectMap[element]);
     }

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
             .attr("nodeX", function (d) {
                 return d.x;
             }).attr("nodeY", function (d) {
                 return d.y;
             })
             .attr("width", x.rangeBand())
             .attr("height", x.rangeBand())
             .style("fill-opacity", function (d) {
                 //console.log(d.z + "???" + z(d.z));
                 return z(d.z);
             })
             .style("fill", function (d) {
                 return nodes[d.x].group == nodes[d.y].group ? colores_google(nodes[d.x].group) : null;
             })
             .on("mouseover", mouseover)
             .on("mouseout", mouseout)
             .on('click', onclickEvent);

     }

     function onclickEvent(d) {
         //console.log(matrix[nodes[p.x].order][nodes[p.y].order].z + "??");
         $('#my_popup').popup('show');
         //         var MarvelAPI = "http://gateway.marvel.com/v1/public/characters/" + nodes[d.x].id;
         //         $.getJSON(MarvelAPI, {
         //                 apikey: "a8737e8ce63836b20a6db288a19286be",
         //                 format: "json"
         //             })
         //             .done(function (data) {
         //                 alert("Hi??");
         //             });
         //alert(matrix[nodes[d.x].order][nodes[d.y].order].z + "??" + nodes[d.x].name + ":" + nodes[d.y].name + "Count" + nodes[d.x].comicCount);
     }

     function mouseover(p) {
         // console.log(matrix[nodes[p.x].order][nodes[p.y].order].z + "??");
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
         orderWrapper(this.value);
     });

     d3.select(".Dominance").on("change", function () {
         changeColor(this.value);
     });
     d3.select(".Affiliation").on("change", function () {
         changeColor(this.value);
     });

     function changeColor(value) {
         if (value == "Dominance") {
             d3.selectAll(".row").selectAll("g").selectAll("rect")
                 .style("fill", function () {
                     var x = d3.select(this).attr("nodeX");
                     var y = d3.select(this).attr("nodeY");
                     if (x != null) {
                         if (nodes[x].comicCount > nodes[y].comicCount) {
                             return colores_google(nodes[x].group);
                         } else {
                             return colores_google(nodes[y].group);
                         }
                     }
                 });
             console.log("done");
         } else {
             d3.selectAll(".row").selectAll("g").selectAll("rect")
                 .style("fill", function () {
                     var x = d3.select(this).attr("nodeX");
                     var y = d3.select(this).attr("nodeY");
                     if (x != null) {
                         return nodes[x].group == nodes[y].group ? colores_google(nodes[x].group) : null;
                     }

                 });
             console.log("done");
         }
     }

     function customSortFunction() {
         var customOrder = new Array();
         $(".characterDragLi").each(function (index) {
             customOrder.push($(this).attr("order"));
         });
         order(customOrder, 1500);
     }

     function orderWrapper(value) {
         var prebuiltOrder = orders[value];
         order(prebuiltOrder, 2500);

         //Change the side elements
         $('#Characterssortable').empty(500);
         for (var i = 0; i < prebuiltOrder.length; i++) {
             var element = prebuiltOrder[i];
             var $new = ObjectMap[element];
             $('#Characterssortable').append($new);
             $new.show('slow');
         }
     }

     function order(prebuiltOrder, duration) {
         x.domain(prebuiltOrder);
         var t = svg.transition().duration(duration);
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