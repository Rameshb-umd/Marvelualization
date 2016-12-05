var width = window.innerWidth,
    height = window.innerHeight,
    sens = 0.25,
    focused;
var PlanetsNameMap = new Object();
var countryNameMap = new Object();
var planetNames;
var planetIndex = 0;

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
                radius: sizeOfStar(i),
                className: classOfStar(i),
                name: getPlanetName(i)
            }
        });
    }
    return data;
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getPlanetName(i) {
    var rem = (i % 10);
    var big = (i % 250);
    if (rem == 0 && big != 0) {
        return "MARVEL-A" + Math.random();
    } else if (big == 0) {
        return planetNames[planetIndex++];
    } else {
        return "STAR-S" + Math.random();
    }
}

function sizeOfStar(i) {
    var rem = (i % 10);
    var big = (i % 250);
    if (rem == 0 && big != 0) {
        return [randomIntFromInterval(0.2, 0.4) * 2];
    } else if (big == 0) {
        return [randomIntFromInterval(0.6, 0.8) * 8];
    } else {
        return [Math.random() * 1.2];
    }

}

function classOfStar(i) {
    var rem = (i % 10);
    var big = (i % 250);
    if (rem == 0 && big != 0) {
        return "bigStar";
    } else if (big == 0) {
        return "planet";
    } else {
        return "star";
    }

}

function randomLonLat() {
    return [Math.random() * 360 - 180, Math.random() * 180 - 90];
}



var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip"),
    countryList = d3.select("body").append("select").attr("name", "countries").attr("id", "countryList"),
    marvelList = d3.select("body").append("select").attr("name", "marvelCountries").attr("id", "marvelList");


queue()
    .defer(d3.json, "json/worldMap.json")
    .defer(d3.tsv, "json/countries.tsv")
    .defer(d3.json, "json/geoLocatedCharacters.json")
    .await(ready);

//Main function

function ready(error, world, countryData, marvel) {

    var countryById = {},
        countries = topojson.feature(world, world.objects.countries).features;

    var countryByName = {};

    //Adding countries to select

    countryData.forEach(function (d) {
        countryById[d.id] = d.name;
        option = countryList.append("option");
        option.text(d.name);
        option.property("value", d.id);

    });

    var outerSpaceId = 0;
    var outerSpace = 0;
    var earth = 0;
    var fictional = 0
    var dualCitizen = 0;
    var unrevealed = 0;
    marvel.forEach(function (d) {
        if (d.location != "null" && d.location != "undefined" && d.location != undefined) {
            option = marvelList.append("option");
            option.text(d.name);
            option.property("value", d.id);
            option.attr("location", d.location);
            option.attr("locationType", d.locationType);
            if (d.locationType == "Outer Space") {
                //console.log(d.location);
                if (d.location in PlanetsNameMap) {
                    var charCount = parseInt(PlanetsNameMap[d.location]);
                    PlanetsNameMap[d.location] = charCount + 1;
                } else {
                    PlanetsNameMap[d.location] = 1;
                }
                outerSpace++;
            } else if (d.locationType == "Real") {
                if (d.location in countryNameMap) {
                    var charCount = parseInt(countryNameMap[d.location]);
                    countryNameMap[d.location] = charCount + 1;
                } else {
                    countryNameMap[d.location] = 1;
                }
                earth++;
            } else if (d.locationType == "Fictional") {
                fictional++;
            } else if (d.locationType == "Dual Citizen") {
                dualCitizen++;
            } else {
                unrevealed++;
            }
        }
    });
    planetNames = Object.keys(PlanetsNameMap)


    console.log("Planets:" + JSON.stringify(PlanetsNameMap));
    console.log("countries:" + JSON.stringify(countryNameMap));
    console.log("Total outerSpace:" + outerSpace);
    console.log("Total earth:" + earth);
    console.log("Total fictional:" + fictional);
    console.log("Total dualCitizen:" + dualCitizen);
    console.log("Total unrevealed:" + unrevealed);



    //Create a list of random stars and add them to outerspace
    console.log("Cretaing Star");
    var starList = createStars(10000);

    //Setup path for outerspace
    var space = d3.geo.equirectangular()
        .translate([width / 2, height / 2]);

    space.scale(space.scale() * 3);

    var spacePath = d3.geo.path()
        .projection(space)
        .pointRadius(1);

    var svg = d3.select("#MarvelUniverse").append("svg")
        .attr("width", width)
        .attr("height", height);

    var stars = svg.append("g");
    stars.transition().attr("transform", "scale(5)")
    stars.selectAll("g")
        .data(starList)
        .enter()
        .append("path")
        .attr("class", function (d) {
            return d.properties.className;
        })
        .attr("d", function (d) {
            spacePath.pointRadius(d.properties.radius);
            return spacePath(d);
        }).on("mouseover", function (d) {
            if (d.properties.className == "planet") {
                countryTooltip.text(d.properties.name)
                    .style("left", (d3.event.pageX + 7) + "px")
                    .style("top", (d3.event.pageY - 15) + "px")
                    .style("display", "block")
                    .style("opacity", 1);
            }
        });

    //Setting projection

    var projection = d3.geo.orthographic()
        .scale(245)
        .rotate([0, 0])
        .translate([width / 2, height / 2])
        .clipAngle(90);

    var path = d3.geo.path()
        .projection(projection);

    var rect = svg.append("g")
        .attr("class", "frame")
        .attr("width", width)
        .attr("height", height)
        .attr('class', 'globe')
        .attr("filter", "url(#glow)")
        .attr("fill", "url(#gradBlue)");
    //Adding water

    rect.append("path")
        .datum({
            type: "Sphere"
        })
        .attr("class", "water")
        .attr("d", path);

    //Drawing countries on the globe

    var world = rect.selectAll("path.land")
        .data(countries)
        .enter().append("path")
        .attr("class", "land")
        .attr("d", path)

    //Drag event

    .call(d3.behavior.drag()
        .origin(function () {
            var r = projection.rotate();
            return {
                x: r[0] / sens,
                y: -r[1] / sens
            };
        })
        .on("drag", function () {
            var rotate = projection.rotate();
            projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
            rect.selectAll("path.land").attr("d", path);
            //rect.selectAll(".focused").classed("focused", focused = false);
        }))

    //Mouse events

    .on("mouseover", function (d) {
            countryTooltip.text(countryById[d.id])
                .style("left", (d3.event.pageX + 7) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("display", "block")
                .style("opacity", 1);
        })
        .on("mouseout", function (d) {
            countryTooltip.style("opacity", 0)
                .style("display", "none");
        })
        .on("mousemove", function (d) {
            countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        });

    function restColor() {
        p = d3.geo.centroid();
        rect.selectAll(".focused").classed("focused", focused = false);
        (function transition() {
            var originPoint = projection.rotate();
            d3.transition()
                .duration(1000)
                .tween("rotate", function () {
                    var r = d3.interpolate(projection.rotate(), [1, 1]);
                    return function (t) {
                        projection.rotate(r(t));
                        rect.selectAll("path").attr("d", path)
                            .classed("focused", function (d, i) {
                                //return d.id == focusedCountry.id ? focused = d : false;
                            });
                    };
                })
        })();
    }

    function matchAndperformTransition() {
        var location = $('option:selected', this).attr('location');
        var locationType = $('option:selected', this).attr('locationType');
        location = location.trim();
        var focusedLocation = $('#countryList option:contains(' + location + ')').attr("value");
        if (focusedLocation != "undefined" && focusedLocation != undefined) {
            rect.transition().duration(2500).attr("transform", "scale(1)")
            stars.transition().duration(2500).attr("transform", "scale(5)")
            var rotate = projection.rotate(),
                focusedCountry = countryByID(countries, focusedLocation),
                p = d3.geo.centroid(focusedCountry);
            rect.selectAll(".focused").classed("focused", focused = false);
            (function transition() {
                var originPoint = projection.rotate();
                d3.transition()
                    .duration(2500)
                    .tween("rotate", function () {
                        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                        return function (t) {
                            projection.rotate(r(t));
                            rect.selectAll("path").attr("d", path)
                                .classed("focused", function (d, i) {
                                    return d.id == focusedCountry.id ? focused = d : false;
                                });
                        };
                    })

            })();
        } else {
            if (locationType == "Outer Space") {
                rect.transition().duration(2500).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(.04)")
                stars.transition().duration(2500).attr("transform", "translate(" + width / 2 + "," + height / 3 + ")scale(1)")
            } else {
                alert(locationType);
            }
        }
    }

    d3.select("#marvelList").on("change", matchAndperformTransition);
    d3.select("#marvelList").on("click", restColor);

    function countryByID(cnt, sel) {
        for (var i = 0, l = cnt.length; i < l; i++) {
            if (cnt[i].id == sel) {
                return cnt[i];
            }
        }
    };
};