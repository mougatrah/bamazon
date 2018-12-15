var mysql = require("mysql");
var inquirer = require("inquirer");
var Product = require("./product.js");
var logo = require("./logo.js");
require('dotenv').config();

console.log("Welcome to ");
logo.display();
var connection = mysql.createConnection({
    host: process.env.HOST || "localhost",

    port: process.env.PORT || 3306,

    user: process.env.USER || "root",

    password: process.env.PASSWORD || "password",
    database: process.env.DATABASE || "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;

    start();
});
var menu = {
    product: "View Products for Sale",
    low: "View Low Inventory",
    stock: "Add to Inventory",
    add: "Add New Product",
    quit: "Quit.",
    array: function () {
        var arr = [];
        for (let i in this) {
            if (typeof this[i] != "function") {
                arr.push(this[i]);
            }

        }
        return arr;

    }
}

function start() {
    var availableProducts = [];
    function availableChoices() {

        var array = [];
        for (let i in availableProducts) {
            array.push(availableProducts[i].item_name);
        }
        return array;
    }

    function displayAvailable() {
        console.table(availableProducts);

    }

    function displayLow(){
        var arr = [];
        for(let i in availableProducts){
            if(availableProducts[i].stock_quantity < 5){
                arr.push(availableProducts[i]);
            }
            
        }
        console.table(arr);
    }

    function getProducts() {

        connection.query("SELECT * FROM products", function (err, res) {
            availableProducts = [];
            for (let i in res) {
                availableProducts.push(new Product(res[i].id, res[i].item_name, res[i].department_name, res[i].price, res[i].stock_quantity));
            }

        });

    }

    function update() {

        inquirer.prompt([{
            type: "list",
            message: "How may we assist you today?",
            name: "select",
            choices: menu.array()
        }]).then(function (user) {
            switch (user.select) {
                case menu.product:
                    displayAvailable();
                    update();
                    break;
                case menu.low:
                    displayLow();
                    update();
                    break;
                case menu.stock:
                    break;
                case menu.add:
                    break;
                case menu.quit:
                    quit();
                    break;
                default:
                    console.log("We have failed to communicate.");
                    update();
                    break;
            }
        });

    }

    function quit(){
        connection.end();
        console.log("Thanks for using");
        logo.display();
        process.exit();
    }

    getProducts();
    update();

}