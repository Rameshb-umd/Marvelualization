;
(function (w, d3, undefined) {
    "use strict";
    var width, height;

    function getSize() {
        width = w.innerWidth,
            height = w.innerHeight;

        if (width === 0 || height === 0) {
            setTimeout(function () {
                getSize();
            }, 100);
        } else {
            init();
        }
    }

    function init() {

        var projection = d3.geo.orthographic()
            .scale(245)
            .rotate([0, 0])
            .translate([width / 2, height / 2])
            .clipAngle(90);

        var path = d3.geo.path()
            .projection(projection);

        var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            //.call(zoom);
            //.on("dblclick.zoom", null);

        //Create a list of random stars and add them to outerspace
        var starList = createStars(3000);

        //Setup path for outerspace
        var space = d3.geo.orthographic()
            .mode("equidistant")
            .translate([width / 2, height / 2]);

        space.scale(space.scale() * 3);

        var spacePath = d3.geo.path()
            .projection(space)
            .pointRadius(1);

        var stars = svg.append("g")
            .selectAll("g")
            .data(starList)
            .enter()
            .append("path")
            .attr("class", "star")
            .attr("d", function (d) {
                spacePath.pointRadius(d.properties.radius);
                return spacePath(d);
            });

        svg.append("rect")
            .attr("class", "frame")
            .attr("width", width)
            .attr("height", height);





        svg.append("path")
            .datum({
                type: "Sphere"
            })
            .attr("class", "water")
            .attr("d", path);

        var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip"),
            countryList = d3.select("body").append("select").attr("name", "countries").attr("id", "countryList"),
            marvelList = d3.select("body").append("select").attr("name", "marvelCountries").attr("id", "marvelList");


        queue()
            .defer(d3.json, "json/worldMap.json")
            .defer(d3.tsv, "json/countries.tsv")
            .defer(d3.json, "json/geoLocatedCharacters.json")
            .await(ready);



        function createStars(number) {
            var data = [];
            for (var i = 0; i < number; i++) {
                data.push({
                    geometry: {
                        type: 'Point',
                        coordinates: randomLonLat()
                    },
                    type: 'Feature',
                    properties: {
                        radius: Math.random() * 1.5
                    }
                });
            }
            return data;
        }

        function randomLonLat() {
            return [Math.random() * 360 - 180, Math.random() * 180 - 90];
        }


    }
    getSize();
}(window, d3));