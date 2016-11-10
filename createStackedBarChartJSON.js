if (typeof require !== 'undefined') XLSX = require('xlsx');
var fs = require('fs');
var HashMap = require('hashmap');
var jsonfile = require('jsonfile')

function CreateStackedBarChartJSON() {
    this.workbook_CA = XLSX.readFile('data/comics/Captain America_1009220_List_cleaned.xlsx');
    this.workbook_IR = XLSX.readFile('data/comics/Captain America_1009220_List_cleaned.xlsx');
    this.captain_america = this.workbook_CA.Sheets[this.workbook_CA.SheetNames[0]];
    this.iron_man = this.workbook_IR.Sheets[this.workbook_IR.SheetNames[0]];
    this.year = new HashMap();
    this.priceValue = new HashMap();
}
CreateStackedBarChartJSON.prototype.createJSON = function () {
    this.createJSONObject(this.captain_america);
    //this.createJSONObject(this.iron_man);
    console.log("year: 2000" + JSON.stringify(this.year.get("2000")));
};
CreateStackedBarChartJSON.prototype.createJSONObject = function (workbook) {
    for (z in workbook) {
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
        if (z[0] === 'R') {
            if (row != 1) {
                var comic_year = JSON.stringify(workbook[z].v);
                var price_cell = 'H' + row;
                var print_price = JSON.stringify(workbook[price_cell].v);
                var comicid_cell = 'C' + row;
                var comicid = JSON.stringify(workbook[comicid_cell].v);
                var name_cell = 'A' + row;
                var name = JSON.stringify(workbook[name_cell].v);
                var comic_name = name + comicid;
                //console.log("print_price:" + print_price);
                if (parseFloat(print_price) > 0) {
                    var beginPrice = 0;
                    var endPrice = print_price;
                    if (this.priceValue.has(comic_year + ":" + name)) {
                        var total = this.priceValue.get(comic_year + ":" + name);
                        beginPrice = total;
                        endPrice = parseFloat(beginPrice) + parseFloat(print_price);
                        endPrice = endPrice.toFixed(2);
                        //console.log(name + ":" + comic_year + ":" + endPrice);
                        this.priceValue.set(comic_year + ":" + name, endPrice);
                    }
                    else {
                        this.priceValue.set(comic_year + ":" + name, endPrice);
                    }
                    var price_obj = new PriceObject(comic_name, name, beginPrice, endPrice);
                    if (this.year.has(comic_year)) {
                        var comic_array = this.year.get(comic_year);
                        comic_array.push(price_obj);
                        this.year.set(comic_year, comic_array);
                    }
                    else {
                        var comic_array = new Array();
                        comic_array.push(price_obj);
                        this.year.set(comic_year, comic_array);
                    }
                }
            }
        }
    }
};

function PriceObject(name, column, ybegin, yend) {
    this.name = name;
    this.column = column;
    this.ybegin = ybegin;
    this.yend = yend;
}
//Export into class
module.exports = CreateStackedBarChartJSON;
var barchart = new CreateStackedBarChartJSON();
barchart.createJSON();