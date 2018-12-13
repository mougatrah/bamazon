var mysql = require("mysql");
var inquirer = require("inquirer");
var Product = require("./product.js");
require('dotenv').config();



console.log("Welcome to ");
console.log("  ____          __  __          ______ ____  _   _ ");
console.log(" |  _ \\   /\\   |  \\/  |   /\\   |___  // __ \\| \\ | |");
console.log(" | |_) | /  \\  | \\  / |  /  \\     / /| |  | |  \\| |");
console.log(" |  _ < / /\\ \\ | |\\/| | / /\\ \\   / / | |  | | . ` |");
console.log(" | |_) / ____ \\| |  | |/ ____ \\ / /__| |__| | |\\  |");
console.log(" |____/_/    \\_\\_|  |_/_/    \\_|_____|\\____/|_| \\_|");

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "password",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;

  start();
});
var menu = {
  available: "See available products.",
  purchase: "Purchase a product.",
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

  function displayAvailabe() {
    console.table(availableProducts);
    update();
  }

  function getProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
      for (let i in res) {
        availableProducts.push(new Product(res[i].item_name, res[i].department_name, res[i].price, res[i].stock_quantity));
      }
    });
   
  }

  function buyProduct() {
    var array = availableChoices() ? availableChoices() : [];
    inquirer.prompt([{
      type: "list",
      message: "Select a product to buy:",
      name: "select",
      choices: array.length ? array : ["NOTHING!!!"],
      pageSize: 100

    }]).then(function (user) {
      console.log("You chose " + user.select);
     
         getProducts();
         update();
       

   
    }).catch(function(err){
      console.log("UH OH!!!!");
      console.log(err);
      
    });

  }

  function update() {

    inquirer.prompt([{
      type: "list",
      message: "How may we assist you today?",
      name: "select",
      choices: menu.array(),
      pageSize: 100

    }]).then(function (user) {
      console.log("You chose " + user.select);
      switch (user.select) {
        case menu.available:
          displayAvailabe();
          break;
        case menu.purchase:
          buyProduct();
          break;
        default:
          console.log("We have failed to communicate.");
          update();
          break;
      }
    });

  }
  getProducts();
  update();
}






