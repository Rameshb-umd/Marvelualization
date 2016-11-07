if (typeof require !== 'undefined') XLSX = require('xlsx');
var workbook = XLSX.readFile('data/comics/SpiderManvsHulk.xlsx');

var spiderMan = workbook.Sheets["Sheet1"];
var hulk = workbook.Sheets["Sheet2"];

var fs = require('fs');
var characters_filename = "data/merged_title.xls";
var writeStream = fs.createWriteStream(characters_filename);

for (z in spiderMan) {
    /* all keys that do not begin with "!" correspond to cell addresses */
    if (z[0] === '!') continue;
    if (z[0] === 'B') {
        //console.log("!" + z + "=" + JSON.stringify(spiderMan[z].v));
        var Spiderman_title = JSON.stringify(spiderMan[z].v);
        for (a in hulk) {

            if (a[0] === '!') continue;
            if (a[0] === 'B') {
                //console.log("!" + a + "=" + JSON.stringify(hulk[a].v));
                var hulk_title = JSON.stringify(hulk[a].v);
                //console.log(Spiderman_title + ":Spiderman: " + hulk_title + ":Hulk");
                if (Spiderman_title === hulk_title) {
                    var row = Spiderman_title +
                        "\t" + hulk_title +
                        "\t" + "Spider Man" +
                        "\t" + "Hulk" + "\n";
                    writeStream.write(row);
                    console.log("Found Match");
                }
            }

        }

    }
}