var request = require('sync-request');
var replaceall = require("replaceall");
var Excel = require('exceljs');
var HashMap = require('hashmap');
var cheerio = require('cheerio');
var fs = require('fs');
var countriesMap = new HashMap();
var locationTypeMap = new HashMap();
var jsonfile = require('jsonfile');

//Create WorkBook

var map_workbook = new Excel.Workbook();
var char_workbook = new Excel.Workbook();

//Main Method to be called
function dataCleanup() {
    map_workbook.xlsx.readFile("data/Country_Map.xlsx")
        .then(function (worksheet) {
            console.log("Open Excel Sheet");
            getCountryMap(worksheet);
            ModifyCharactersData();
        });
}

//Create the origin and origin map Type from excel
function getCountryMap(worksheet) {
    var worksheet = map_workbook.getWorksheet(1);
    console.log("Each Row Get Marvel Data");
    worksheet.eachRow(function (row, rowNumber) {
        var country = row.getCell(1).value;
        if (rowNumber > 1 && country != "" && country != "undefined" && country != null) {
            countriesMap.set(country, row.getCell(2).value);
            locationTypeMap.set(country, row.getCell(3).value);
        }
    });
}

//Open the exceel and add new columns
function ModifyCharactersData() {
    char_workbook.xlsx.readFile("data/marvel_characters_list.xlsx")
        .then(function (worksheet) {
            console.log("Open Excel Sheet");
            createCountryColumns(worksheet);
        });
}

//create new column values
function createCountryColumns(worksheet) {
    var worksheet = char_workbook.getWorksheet(1);
    createHeader(worksheet);

    console.log("Each Row Get Marvel Data");
    var nodeListArray = new Array();
    worksheet.eachRow(function (row, rowNumber) {
        var citizenship = row.getCell(14).value;
        if (rowNumber > 1 && citizenship != "" && citizenship != "undefined" && citizenship != null) {
            var location = countriesMap.get(citizenship);
            var locationType = locationTypeMap.get(citizenship);
            worksheet.getCell('W' + rowNumber).value = location;
            worksheet.getCell('X' + rowNumber).value = locationType;
            var nodeObject = new nodeListJson(worksheet.getCell('B' + rowNumber).value,
                worksheet.getCell('A' + rowNumber).value,
                worksheet.getCell('O' + rowNumber).value,
                location,
                locationType);
            nodeListArray.push(nodeObject);
            row.commit();
        }
    });

    var file = 'data/JSON/geoLocatedCharacters.json';
    jsonfile.writeFile(file, nodeListArray, {
        spaces: 2
    }, function (err) {
        console.error(err);
    });


    console.log("Write Marvel Data back to excel sheet");
    char_workbook.xlsx.writeFile("data/marvel_characters_list.xlsx")
        .then(function () {
            console.log("done");
        });
}

//Create Header for the exceel Sheet
function createHeader(worksheet) {
    console.log("Creating Header");
    worksheet.columns = [
        {
            header: 'Character_ID',
            key: 'Character_ID'
        }, {
            header: 'Character_Name',
            key: 'Character_Name'
        },
        {
            header: 'Comics_Count',
            key: 'Comics_Count'
        }, {
            header: 'Series_Count',
            key: 'Series_Count'
        },
        {
            header: 'Stories_Count',
            key: 'Stories_Count'
                },
        {
            header: 'Events_Count',
            key: 'Events_Count'
                },
        {
            header: 'Detail_Link',
            key: 'Detail_Link'
                },
        {
            header: 'Wiki_Link',
            key: 'Wiki_Link'
                },
        {
            header: 'Comic_link',
            key: 'Comic_link'
                },
        {
            header: 'Universe',
            key: 'Universe'
                },
        {
            header: 'Real_Name',
            key: 'Real_Name'
                },
        {
            header: 'Aliases',
            key: 'Aliases'
                },
        {
            header: 'Identity',
            key: 'Identity'
                },
        {
            header: 'Citizenship',
            key: 'Citizenship'
                },
        {
            header: 'Place_of_Birth',
            key: 'Place_of_Birth'
                },
        {
            header: 'First_Appearance',
            key: 'First_Appearance'
                },
        {
            header: 'Origin',
            key: 'Origin'
                },
        {
            header: 'Groups',
            key: 'Groups'
                },
        {
            header: 'Height',
            key: 'Height'
                },
        {
            header: 'Weight',
            key: 'Weight'
                },
        {
            header: 'Eyes',
            key: 'Eyes'
                },
        {
            header: 'Hair',
            key: 'Hair'
                },
        {
            header: 'Location',
            key: 'Location'
                },
        {
            header: 'Location Type',
            key: 'Location_Type'
                },
            ];

}

function nodeListJson(name, id, city, location, locationType) {
    this.name = name;
    this.id = id;
    this.city = city;
    this.location = location;
    this.locationType = locationType;
}

//Calling the main method
dataCleanup(); //Calling function