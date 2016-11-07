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
            "\t" + "title_2" + "\n";
        this.writeStream.write(header);
    } else {
        console.log('Some other error: ', err.code);
    }
    this.findMatch();
}

ComputeCharactersEdges.prototype.findMatch = function () {
    for (z in this.characters_wk_1) {
        /* all keys that do not begin with "!" correspond to cell addresses */
        if (z[0] === '!') continue;
        if (z[0] === 'E') {
            var title = JSON.stringify(this.characters_wk_1[z].v);
            //console.log("Outer");
            for (a in this.characters_wk_2) {
                //console.log("in");
                if (a[0] === '!') continue;
                if (a[0] === 'E') {
                    var title_2 = JSON.stringify(this.characters_wk_2[a].v);
                    //console.log("" + title + ";" + title_2);
                    if (title_2.trim() != 'Title') {
                        if (title === title_2) {
                            var row = this.characterName_1 +
                                "\t" + this.characterId_1 +
                                "\t" + this.characterName_2 +
                                "\t" + this.characterId_2 +
                                "\t" + title +
                                "\t" + title_2 + "\n";
                            fs.appendFile(this.commonComics, row);
                            //console.log("Found Match");
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

var edges = new ComputeCharactersEdges("1009159", "Archangel", "1009175", "Beast");
edges.compute();