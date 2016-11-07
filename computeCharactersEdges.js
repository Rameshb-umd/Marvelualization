if (typeof require !== 'undefined') XLSX = require('xlsx');
var fs = require('fs');

function ComputeCharactersEdges(character_id_1, character_Name_1, character_id_2, character_Name_2) {
    this.characterId_1 = character_id_1;
    this.characterName_1 = character_Name_1;
    this.characterId_2 = character_id_2;
    this.characterName_2 = character_Name_2;
    this.workbook_1 = XLSX.readFile('data/comics/' + this.characterName_1 + '_' + this.characterId_1 + '_List.xlsx');
    this.workbook_2 = XLSX.readFile('data/comics/' + this.characterName_2 + '_' + this.characterId_2 + '_List.xlsx');
    this.commonComics = "data/collaboration/collaboration_title.xls";
    this.characters_wk_1;
    this.characters_wk_2;
    this.writeStream;
    this.resultFunction = (function (data) {
        // parenthesis are not necessary
        console.log("inside" + this.characterName_1);

        this.createFileAndHeader(data) // but might improve readability
    }).bind(this);
}

ComputeCharactersEdges.prototype.compute = function () {
    var first_sheet_name_1 = this.workbook_1.SheetNames[0];
    var first_sheet_name_2 = this.workbook_2.SheetNames[0];
    this.characters_wk_1 = this.workbook_1.Sheets[first_sheet_name_1];
    this.characters_wk_2 = this.workbook_2.Sheets[first_sheet_name_2];
    this.createFileifNotFound();

};

ComputeCharactersEdges.prototype.createFileifNotFound = function () {
    fs.stat(this.commonComics, this.resultFunction);
};

ComputeCharactersEdges.prototype.createFileAndHeader = function (err) {
    if (err == null) {
        console.log(" file found : " + this.commonComics);
    } else if (err.code == 'ENOENT') {
        console.log(" file not found : " + this.commonComics);
        this.writeStream = fs.createWriteStream(this.commonComics);
        var header = "source" +
            "\t" + "source_id" +
            "\t" + "target" +
            "\t" + "target_id" +
            "\t" + "title" +
            "\t" + "comic_id" +
            "\t" + "title_2" +
            "\t" + "comic_id_2" + "\n";
        this.writeStream.write(header);
    } else {
        console.log('Some other error: ', err.code);
    }
    this.findMatch();
}

ComputeCharactersEdges.prototype.findMatch = function () {

    for (z in this.characters_wk_1) {

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
        if (z[0] === 'E') {
            var title = JSON.stringify(this.characters_wk_1[z].v); //Title
            var comicCell = 'C' + row;
            var comic_id_1 = JSON.stringify(this.characters_wk_1[comicCell].v); //Comic_id

            if (row == 1) {
                //console.log("First Line" + title);// Some how title is printing
            } else {
                //console.log("Outer");
                for (a in this.characters_wk_2) {

                    var tt_2 = 0;
                    for (var j = 0; j < a.length; j++) {
                        if (!isNaN(a[j])) {
                            tt_2 = j;
                            break;
                        }
                    };
                    var col_2 = a.substring(0, tt_2);
                    var row_2 = parseInt(a.substring(tt_2));

                    if (a[0] === '!') continue;
                    if (a[0] === 'E') {

                        var title_2 = JSON.stringify(this.characters_wk_2[a].v); //Title
                        var comicCell_2 = 'C' + row_2;
                        var comic_id_2 = JSON.stringify(this.characters_wk_2[comicCell_2].v); //Comic_id
                        console.log(title + ":" + title_2);
                        if (title === title_2) {
                            var row = this.characterName_1 +
                                "\t" + this.characterId_1 +
                                "\t" + this.characterName_2 +
                                "\t" + this.characterId_2 +
                                "\t" + title +
                                "\t" + comic_id_1 +
                                "\t" + title_2 +
                                "\t" + comic_id_2 + "\n";
                            fs.appendFile(this.commonComics, row);
                        }

                    }
                }
            }
            //Inner For loop Ends
        }
        //Outer For loop Ends
    }
};

module.exports = ComputeCharactersEdges;