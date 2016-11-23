var request = require('sync-request');
var replaceall = require("replaceall");
var Excel = require('exceljs');
var HashMap = require('hashmap');
var cheerio = require('cheerio');
var fs = require('fs');

//Create WorkBook
var workbook = new Excel.Workbook();
workbook.xlsx.readFile("data/marvel_characters_list.xlsx")
    .then(function (worksheet) {
        console.log("Open Excel Sheet");
        scrapCharacterInfo(worksheet);
    });

//Scarp characters infor for each url
function scrapCharacterInfo(worksheet) {
    var worksheet = workbook.getWorksheet(1);
    //createHeader(worksheet);
    var countries = new HashMap();
    console.log("Each Row Get Marvel Data");
    worksheet.eachRow(function (row, rowNumber) {
        var country = row.getCell(14).value;
        if (rowNumber > 1 && country != "" && country != "undefined" && country != null) {
            console.log(country + ":");
            if (countries.has(country)) {
                var count = parseInt(countries.get(country));
                countries.set(country, (count + 1));
            } else {
                countries.set(country, 1);
            }
        }
    });
    var country_keys = countries.keys();
    var c_length = country_keys.length;
    var country_map_file_name = "data/maplist.txt";
    var writeStream = fs.createWriteStream(country_map_file_name);
    for (var i = 0; i < c_length; i++) {
        var key = country_keys[i];
        var value = countries.get(key);
        //console.log(key + ":" + value);
        var row = key + "\n";
        writeStream.write(row);
    }
}