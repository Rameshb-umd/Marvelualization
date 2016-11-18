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

//Create Header for the Xceel Sheet
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
            ];

}

//Scarp characters infor for each url
function scrapCharacterInfo(worksheet) {
    var worksheet = workbook.getWorksheet(1);
    createHeader(worksheet);

    console.log("Each Row Get Marvel Data");
    worksheet.eachRow(function (row, rowNumber) {
        var url = row.getCell(8).value;
        if (rowNumber > 1 && url != "" && url != "undefined" && url != null) {
            var character = row.getCell(2).value;
            var result = characterDetails(url, character);
            if (result.get("message") == "success") {
                worksheet.getCell('J' + rowNumber).value = result.get("Universe");
                worksheet.getCell('K' + rowNumber).value = result.get("Real Name");
                worksheet.getCell('L' + rowNumber).value = result.get("Aliases");
                worksheet.getCell('M' + rowNumber).value = result.get("Identity");
                worksheet.getCell('N' + rowNumber).value = result.get("Citizenship");
                worksheet.getCell('O' + rowNumber).value = result.get("Place of Birth");
                worksheet.getCell('P' + rowNumber).value = result.get("First Appearance");
                worksheet.getCell('Q' + rowNumber).value = result.get("Origin");
                worksheet.getCell('R' + rowNumber).value = result.get("Groups");
                worksheet.getCell('S' + rowNumber).value = result.get("Height");
                worksheet.getCell('T' + rowNumber).value = result.get("Weight");
                worksheet.getCell('U' + rowNumber).value = result.get("Eyes");
                worksheet.getCell('V' + rowNumber).value = result.get("Hair");
                row.commit();
            }
        }
    });

    console.log("Write Marvel Data back to excel sheet");

    workbook.xlsx.writeFile("data/marvel_characters_list.xlsx")
        .then(function () {
            console.log("done");
        });
}

//Parse Character Details from HTML
function characterDetails(url, character) {

    console.log("Scrapping for character:" + character);
    var detailedInfo = new HashMap();
    var res = request('GET', url);
    if (res.statusCode == 200) {
        detailedInfo.set("message", "success");
        var $ = cheerio.load(res.getBody());
        //Main details
        $('div#powerbox > p').each(function (index) {
            var title = $(this).find("b").text();
            var value = $(this).text();
            value = replaceall(title, "", value);
            value = value.replace(/\n/g, " ");
            detailedInfo.set(title, value);
            //console.log(title + ":" + unescape(value));
        });

        var groupAfflications = $('div#char-affiliation-content').text();
        detailedInfo.set("Groups", groupAfflications);
        //console.log(groupAfflications);

        //Phyicall Attributes
        $('div#char-physicals-content > p').each(function (index) {
            var title = $(this).find("b").text();
            var value = $(this).text();
            value = replaceall(title, "", value);
            value = value.replace(/\n/g, " ");
            detailedInfo.set(title, value);
            //console.log(title + ":" + unescape(value));
        });
    } else {
        detailedInfo.set("message", "error");
        console.log("Scrapping failed for character:" + character);

    }
    return detailedInfo;
}