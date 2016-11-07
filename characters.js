var api = require('marvel-api');
var fs = require('fs');

var marvel = api.createClient({
    publicKey: 'a8737e8ce63836b20a6db288a19286be',
    privateKey: '47fa5c8b68c7ff434081c16a9fa9fa214575bf0c'
});

//Class
function Characters() {
    // always initialize all instance properties
    this.characters_filename = "data/marvel_characters_list.xls";
    this.writeStream = fs.createWriteStream(this.characters_filename);
    this.maxcount = 100;
    this.offset = 0;
    this.totalCharacters = 0;
    this.resultFunction = (function (data) {
        // parenthesis are not necessary
        this.PrintResultsintoExcel(data) // but might improve readability
    }).bind(this);
}

//Print Header Method
Characters.prototype.printHeader = function () {
    var header = "Character_ID" +
        "\t" + "Character_Name" +
        //"\t" + "Character_Description" +
        "\t" + "Comics_Count" +
        "\t" + "Series_Count" +
        "\t" + "Stories_Count" +
        "\t" + "Events_Count" +
        "\t" + "Detail_Link" +
        "\t" + "Wiki_Link" +
        "\t" + "Comic_link" + "\n";
    this.writeStream.write(header);
};

//Error Handling method
Characters.prototype.errorHandling = function (data) {
    console.error(data);
};

//Connect to Marvel API for characters
Characters.prototype.getCharactersFromAPI = function () {
    marvel.characters.findAll(this.maxcount, this.offset)
        .then(this.resultFunction)
        .fail(this.errorHandling)
        .done();
}

//Get All characters from marvel api
Characters.prototype.getALLCharacters = function () {
    this.printHeader();
    this.getCharactersFromAPI(this.offset, this.maxcount);
}

//Print All results into Excel
Characters.prototype.PrintResultsintoExcel = function (res) {
    var dataValue = res.data;
    for (var i = 0; i < dataValue.length; i++) {
        this.printEachRow(dataValue[i]);
    }

    this.totalCharacters = res.meta.total;
    this.offset = res.meta.offset + res.meta.count;
    console.log("Current Offset : " + this.offset + " TotalCharacters:" + res.meta.total + ": Count:" + res.meta.count);

    if (this.offset < this.totalCharacters) {
        this.getCharactersFromAPI(this.offset);
    } else {
        this.writeStream.close();
    }

};

//Print each character in Excel Sheet
Characters.prototype.printEachRow = function (character) {
    var urls = character.urls;
    var detail = "";
    var wiki = "";
    var comic = "";
    for (var j = 0; j < urls.length; j++) {
        if (urls[j].type == "detail") {
            detail = urls[j].url;
        }
        if (urls[j].type == "wiki") {
            wiki = urls[j].url;
        }
        if (urls[j].type == "comiclink") {
            comic = urls[j].url;
        }
    }

    var row = character.id +
        "\t" + character.name +
        //"\t" + character.description +
        "\t" + character.comics.available +
        "\t" + character.series.available +
        "\t" + character.stories.available +
        "\t" + character.events.available +
        "\t" + detail +
        "\t" + wiki +
        "\t" + comic + "\n";
    this.writeStream.write(row);
}

//Export as Class
module.exports = Characters;