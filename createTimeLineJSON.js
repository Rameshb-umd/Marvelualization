var request = require('sync-request');
var replaceall = require("replaceall");
var Excel = require('exceljs');
var HashMap = require('hashmap');
var cheerio = require('cheerio');
var fs = require('fs');
var excelXlsx = require('xlsx');

global.isProcessRunning = false;

//Create WorkBook
var workbook = new Excel.Workbook();
workbook.xlsx.readFile("data/marvel_characters_list.xlsx")
    .then(function (worksheet) {
        console.log("Open Excel Sheet");
        getTimelineData(worksheet);
    });

function getTimelineData(worksheet) {
    var worksheet = workbook.getWorksheet(1);
    console.log("Getting Character Info");
    worksheet.eachRow(function (row, rowNumber) {
        if (rowNumber > 1 && rowNumber <= 3) {
            var characterID = worksheet.getCell('A' + rowNumber).value;
            var characterName = worksheet.getCell('B' + rowNumber).value;
            var filename = characterName + "_" + characterID + "_List.xlsx";
            console.log("filename" + ":" + filename);

            var character = new comicTimelLine(filename);
            character.getCharacterJSON();

            require('deasync').loopWhile(function () {
                return !global.isProcessRunning;
            });
            global.isProcessRunning = false;
        }

    });
}

function comicTimelLine(filename) {
    this.filename = filename;
    this.characterBook = excelXlsx.readFile("data/comics/" + this.filename);
    this.characterSheet = this.characterBook.Sheets[this.characterBook.SheetNames[0]];

}
//Get All characters from marvel api
comicTimelLine.prototype.getCharacterJSON = function () {
    computeTimeLine(this.characterSheet);
    global.isProcessRunning = true;
}

function computeTimeLine(characterBook) {
    for (z in characterBook) {
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
        if (z[0] === 'Q') {
            if (row != 1) {
                var comicDate = JSON.stringify(characterBook[z].v);
                var name_cell = 'A' + row;
                var name = JSON.stringify(characterBook[name_cell].v);
                console.log(name + ":" + comicDate + ":");
            }
        }
    }
    return "JSON---";
}

module.exports = comicTimelLine;