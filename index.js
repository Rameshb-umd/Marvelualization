var Characters = require('./characters.js');
var CharactersComic = require('./CharactersComic.js');
var characters = new Characters();

//Get All Characters
characters.getALLCharacters();

//Get List of All Comics
var characters = ["1010705", "1009626", "1009327"];
for (var i = 0; i < characters.length; i++) {
    var comics = new CharactersComic(characters[i]);
    comics.getListofComics();
}