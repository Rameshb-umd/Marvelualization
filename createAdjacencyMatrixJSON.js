if (typeof require !== 'undefined') XLSX = require('xlsx');
var fs = require('fs');
var HashMap = require('hashmap');
var jsonfile = require('jsonfile')


function CreateAdjacencyMatrixJSON() {
    this.workbook = XLSX.readFile('data/collaboration/collaboration_title.xlsx');
    var first_sheet_name = this.workbook.SheetNames[0];
    this.edges = this.workbook.Sheets[first_sheet_name];
    this.edgelist = new HashMap();
    this.nodeOrder = new HashMap();
    this.nodeID = new HashMap();;
}


CreateAdjacencyMatrixJSON.prototype.computeWeight = function () {

    for (z in this.edges) {

        var tt = 0;
        for (var i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        };
        var col = z.substring(0, tt);
        var row = parseInt(z.substring(tt));
        /* all keys that do not begin with "!" correspond to cell addresses */
        if (z[0] === '!') continue;
        if (z[0] === 'A') {
            if (row != 1) {
                var target_cell = 'C' + row;
                var source = JSON.stringify(this.edges[z].v); //Title
                var target = JSON.stringify(this.edges[target_cell].v); //Comic_id
                //console.log(source + ":" + target);
                if (this.edgelist.has(source + ":" + target)) {
                    var count = this.edgelist.get(source + ":" + target);
                    this.edgelist.set((source + ":" + target), (count + 1));
                } else {
                    this.edgelist.set((source + ":" + target), 1);
                }
            }
        }
    }
};

CreateAdjacencyMatrixJSON.prototype.createJson = function () {

    this.computeWeight();
    var nodelist = this.createNodeListJSON();
    var edgeList = this.createEdgeListJSON();
    var matrix = new matrixJson(nodelist, edgeList);
    var file = 'data/JSON/adjacencyMatrix.json';
    jsonfile.writeFile(file, matrix, {
        spaces: 2
    }, function (err) {
        console.error(err);
    });
};


CreateAdjacencyMatrixJSON.prototype.createEdgeListJSON = function () {

    var edgeListArray = new Array();
    var edgeLists = this.edgelist.keys();
    var edgeLists_length = edgeLists.length;
    for (var i = 0; i < edgeLists_length; i++) {
        var key = edgeLists[i];
        var _key = key.replace(/"/g, "")
        var _src_target = _key.split(":");
        var source = _src_target[0];
        var target = _src_target[1];
        var value = this.edgelist.get(key);
        var edgeObject = new edgeListJson(this.nodeOrder.get(source), this.nodeOrder.get(target),
            value, source, target,
            this.nodeOrder.get(source), this.nodeOrder.get(target));
        edgeListArray.push(edgeObject);
    }
    return edgeListArray;
};

CreateAdjacencyMatrixJSON.prototype.createNodeListJSON = function () {

    var nodeListArray = new Array();
    var XLSX = require('xlsx');
    var workbook = XLSX.readFile('data/marvel_characters_list.xlsx');
    var first_sheet_name = workbook.SheetNames[0];
    var characters_wk = workbook.Sheets[first_sheet_name];
    var order = 0;
    for (var i = 2; i <= 51; i++) {
        var characterID = characters_wk["A" + i].v;
        var characterName = characters_wk["B" + i].v;
        var comicCount = characters_wk["C" + i].v;
        var nodeObject = new nodeListJson(characterName, characterID, order, order, comicCount);
        nodeListArray.push(nodeObject);
        this.nodeOrder.set(characterName, order);
        this.nodeID.set(characterName, characterID);
        order++;
    };
    return nodeListArray;
};


function edgeListJson(source, target, value, source_id, target_id, source_name, target_name) {
    this.source = source;
    this.target = target;
    this.value = value;
    this.source_id = source_id;
    this.target_id = target_id;
    this.source_name = source_name;
    this.target_name = target_name;
}

function nodeListJson(name, id, group, order, comicCount) {
    this.name = name;
    this.id = id;
    this.group = group;
    this.order = order;
    this.comicCount = comicCount;
}

function matrixJson(nodes, links) {
    this.nodes = nodes;
    this.links = links;
}

//Export into class
module.exports = CreateAdjacencyMatrixJSON;

var edgeWeight = new CreateAdjacencyMatrixJSON();
edgeWeight.createJson();