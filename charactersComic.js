var api = require('marvel-api');
var fs = require('fs');

var marvel = api.createClient({
    publicKey: '',
    privateKey: ''
});


function CharactersComic(character_Id, character_Name) {
    // always initialize all instance properties
    this.writeStream;
    this.maxcount = 100;
    this.offset = 0;
    this.totalComics = 0;
    this.characterId = character_Id;
    this.characterName = character_Name;
    this.resultFunction = (function (data) {
        // parenthesis are not necessary
        this.printResultsintoExcel(data) // but might improve readability
    }).bind(this);
    this.errorFunction = (function (data) {
        // parenthesis are not necessary
        this.errorHandling(data) // but might improve readability
    }).bind(this);
}

//Wrapper class to get list of all Comics
CharactersComic.prototype.getListofComics = function () {
    var characters_filename = "data/comics/" + this.characterName + "_" + this.characterId + "_List.xls";
    this.writeStream = fs.createWriteStream(characters_filename);
    var header = "Character_name" +
        "\t" + "Character_id" +
        "\t" + "Comic_id" +
        "\t" + "Digital_id" +
        "\t" + "Title" +
        "\t" + "issueNumber" +
        "\t" + "pageCount" +
        "\t" + "Print_price" +
        "\t" + "digital_price" +
        "\t" + "image_url" +
        "\t" + "thumbnail_url" +
        "\t" + "characters_count" +
        "\t" + "stories_count" +
        "\t" + "series_name" +
        "\t" + "events_count" +
        "\t" + "creaters_count" +
        "\t" + "Comic_date" + "\n";
    this.writeStream.write(header);
    this.getListofComicsFromAPI(this.characterId, this.offset)
};

//Error Handling for marvel api connection
CharactersComic.prototype.errorHandling = function (res) {
    console.error(this.characterName + ":" + res);
};

// Connect to API to get the List of Comics
CharactersComic.prototype.getListofComicsFromAPI = function () {
    marvel.characters.comics(this.characterId, this.maxcount, this.offset)
        .then(this.resultFunction)
        .fail(this.errorFunction)
        .done();
}

//Print All results into Excel Sheet
CharactersComic.prototype.printResultsintoExcel = function (res) {
    //console.log("Filling excel values for:" + this.characterId);
    var comics = res.data;
    for (var i = 0; i < comics.length; i++) {
        this.printEachRow(comics[i]);
    }
    this.totalComics = res.meta.total;
    this.offset = res.meta.offset + res.meta.count;
    console.log("CharacterID:" + this.characterId +
        ";characterName:" + this.characterName + "; Current Offset : " + this.offset + "; TotalComics:" + res.meta.total + ";");
    if (this.offset < this.totalComics) {
        this.getListofComicsFromAPI(this.characterId, this.offset);
    } else {
        //this.writeStream.close();
    }
}

//Print each row value in Excel Sheet
CharactersComic.prototype.printEachRow = function (comic) {
    var prices = comic.prices;
    var printPrice = "";
    var digitalPurchasePrice = "";
    for (var j = 0; j < prices.length; j++) {
        if (prices[j].type == "printPrice") {
            printPrice = prices[j].price;
        }
        if (prices[j].type == "digitalPurchasePrice") {
            digitalPurchasePrice = prices[j].price;
        }
    }

    var images = comic.images;
    var imageText = "";
    if (images.length > 0) {
        imageText = images[0].path + images[0].extension;
    }

    var dates = comic.dates;
    var dateText = "";
    for (var j = 0; j < dates.length; j++) {
        if (dates[j].type == "onsaleDate") {
            dateText = dates[j].date;
        }
    }

    var row = this.characterName +
        "\t" + this.characterId +
        "\t" + comic.id +
        "\t" + comic.digitalId +
        "\t" + comic.title +
        "\t" + comic.issueNumber +
        "\t" + comic.pageCount +
        "\t" + printPrice +
        "\t" + digitalPurchasePrice +
        "\t" + imageText +
        "\t" + comic.thumbnail.path + "." + comic.thumbnail.extension +
        "\t" + comic.characters.available +
        "\t" + comic.stories.available +
        "\t" + comic.series.name +
        "\t" + comic.events.available +
        "\t" + comic.creators.available +
        "\t" + dateText + "\n";
    //console.log(row);
    this.writeStream.write(row);
};

//Export into class
module.exports = CharactersComic;