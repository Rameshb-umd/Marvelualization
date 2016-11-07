var Characters = require('./characters.js');
var CharactersComic = require('./CharactersComic.js');
var characters = new Characters();

//Get All Characters
//characters.getALLCharacters();

//Get List of All Comics
/*var characters = ["1010705", "1009626", "1009327"];
for (var i = 0; i < characters.length; i++) {
    var comics = new CharactersComic(characters[i]);
    comics.getListofComics();
}*/

var XLSX = require('xlsx');
var workbook = XLSX.readFile('data/marvel_characters_list.xlsx');
var first_sheet_name = workbook.SheetNames[0];
var characters_wk = workbook.Sheets[first_sheet_name];
for (var i = 2; i <= 21; i++) {
    var characterID = characters_wk["A" + i].v;
    var characterName = characters_wk["B" + i].v;
    //console.log(characterID + ":" + characterName);
    var comics = new CharactersComic(characterID, characterName);
    comics.getListofComics();
}