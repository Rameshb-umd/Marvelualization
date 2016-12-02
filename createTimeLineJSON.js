var request = require('sync-request');
var replaceall = require("replaceall");
var Excel = require('exceljs');
var HashMap = require('hashmap');
var cheerio = require('cheerio');
var fs = require('fs');
var excelXlsx = require('xlsx');
var jsonfile = require('jsonfile')

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
    var timeLineJSON = new Array();
    worksheet.eachRow(function (row, rowNumber) {
        if (rowNumber > 1 && rowNumber <= 51) {
            var characterID = worksheet.getCell('A' + rowNumber).value;
            var characterName = worksheet.getCell('B' + rowNumber).value;
            var filename = characterName + "_" + characterID + "_List.xlsx";
            console.log("filename" + ":" + filename);

            var character = new comicTimelLine(filename, characterName, characterID);
            var characterArray = character.getCharacterJSON();
            //console.log(" characterArray: " + JSON.stringify(characterArray));
            timeLineJSON.push(new timelineObject(characterName, characterArray));
            require('deasync').loopWhile(function () {
                return !global.isProcessRunning;
            });
            global.isProcessRunning = false;
        }

    });
    var file = 'data/JSON/TimeLine.json';
    jsonfile.writeFile(file, timeLineJSON, {
        spaces: 2
    }, function (err) {
        console.error(err);
    });
}

function comicTimelLine(filename, characterName, characterID) {
    this.filename = filename;
    this.characterName = characterName;
    this.characterID = characterID;
    this.characterBook = excelXlsx.readFile("data/comics/" + this.filename);
    this.characterSheet = this.characterBook.Sheets[this.characterBook.SheetNames[0]];

}
//Get All characters from marvel api
comicTimelLine.prototype.getCharacterJSON = function () {
    var characterArray = computeTimeLine(this.characterSheet, this.characterName, this.characterID);
    global.isProcessRunning = true;
    return characterArray;
}

function computeTimeLine(characterBook, characterName, characterID) {
    var yearObject = new HashMap();
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
                var parsedDate = comicDate.substring(1, 11);
                var parsedYear = parsedDate.substring(0, 4);
                if ((parsedDate.charAt(0) == "-")) {
                    //Do nothing
                } else {
                    if (yearObject.has(parsedYear)) {
                        var dateArray = yearObject.get(parsedYear);
                        dateArray.push(parsedDate);
                        yearObject.set(parsedYear, dateArray);
                    } else {
                        var dateArray = new Array();
                        dateArray.push(parsedDate);
                        yearObject.set(parsedYear, dateArray);
                    }
                    // console.log(name + ":" + parsedDate);
                }
            }
        }
    }

    var characterArray = new Array();
    yearObject.forEach(function (value, key) {
        //console.log(key + " : " + JSON.stringify(value));
        var endYear = key;
        var endDateArray = value;
        var currentYear = parseInt(key) - 1;
        while (yearObject.has(currentYear + "")) {
            endYear = currentYear;
            endDateArray = yearObject.get(endYear + "");
            yearObject.remove(currentYear + "");
            currentYear = currentYear - 1;
        }
        //console.log("StartYear" + endYear + ":EndYear" + key);
        var dateArray = value;
        if (endYear == key) {
            var eachObject = new CharacterTimeLineObject(characterName, dateArray[dateArray.length - 1], endDateArray[0], characterID);
        } else {
            var eachObject = new CharacterTimeLineObject(characterName, endDateArray[0], dateArray[dateArray.length - 1], characterID);
        }
        //console.log("StartDate :" + endDateArray[0] + ": EndDate :" + dateArray[dateArray.length - 1]);
        characterArray.push(eachObject);
    });
    console.log("====================================")
    return characterArray;
}

module.exports = comicTimelLine;

function CharacterTimeLineObject(name, startDate, endDate, characterId) {
    this.name = name;
    this.start = startDate;
    this.end = endDate;
    this.characterId = characterId;
}

function timelineObject(name, data) {
    this.name = name;
    this.data = data;
}