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
  available: "See available products.",
  purchase: "Purchase a product.",
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
 
  function displayAvailable() {
   console.table(availableProducts);

  }

  function getProducts() {

    connection.query("SELECT * FROM products", function (err, res) {
      availableProducts = [];
      for (let i in res) {
        availableProducts.push(new Product(res[i].item_name, res[i].department_name, res[i].price, res[i].stock_quantity));
      }

    });

  }
  function purchase(item, quantity, price) {
    console.log(`You spent $${(price * quantity).toFixed(2)}`)
    connection.query(`UPDATE products SET stock_quantity = stock_quantity - ${quantity}, product_sales = product_sales + ${Math.round(price * quantity)} WHERE item_name = "${item}"`, function (err, res) {
      if (err) throw err;
      console.log(res.message);
      getProducts();
      update();
    });
  }

  function buyProduct() {
    //First Prompt
    displayAvailable();
    inquirer.prompt([
      {
        type: "input",
        message: "Enter the index of the item you want to buy:",
        name: "select",
        validate: function (input) {
          if (input === "") {
            return false;
          } else
            if (/^[0-9]*$/gm.test(input)) {
              if(Object.keys(availableProducts).includes(input)){
                return true;
              }else{
                console.log("\nInvalid index. Available: " + Object.keys(availableProducts) 
                );
                return false;
              }
             
            } else {
              console.log("\nPlease enter a number.");
              return false;
            }
          }
      },
      {
        message: "How many?",
        name: "quantity",
        validate: function (input) {
          if (input === "") {
            return false;
          } else
            if (/^[0-9]*$/gm.test(input)) {
              return true;
            } else {
              console.log("\nPlease enter a number.");
              return false;
            }
        }
        //First Prompt's then
      }]).then(function (user) {
        console.log("2. You chose " + user.quantity + " " + availableProducts[user.select].item_name);
       
        
        connection.query(`SELECT stock_quantity, price FROM products WHERE item_name = "${availableProducts[user.select].item_name}"`, function (err, res) {
          if (err) throw err;


          if (res[0].stock_quantity <= 0) {
            console.log(`There is no ${availableProducts[user.select].item_name} available.`);
            inquirer.prompt([{
              type: "list",
              message: "What would you like to do?",
              choices: ["Pick a different product.", "Start over.", "Quit."],
              name: "check"
              //second Prompt's then
            }]).then(function (answer) {
              switch (answer.check) {
                case "Pick a different product.":
                  buyProduct();
                  break;
                case "Start over.":
                  update();
                  break;
                  case "Quit.":
                  quit();
                  break;
                default:
                  console.log("Defaulted");
                  update();
                  break;
              }
            });
          } else
            if (res[0].stock_quantity < user.quantity) {
              console.log(`There's only ${res[0].stock_quantity} available.`);
              //End First Prompt
              //Second Promt
              inquirer.prompt([{
                type: "list",
                message: "What would you like to do?",
                choices: ["Purchase all.", "Pick a different product.", "Start over.", "Quit."],
                name: "check"
                //second Prompt's then
              }]).then(function (answer) {
                switch (answer.check) {
                  case "Purchase all.":
                    purchase(availableProducts[user.select].item_name, res[0].stock_quantity, res[0].price);

                    break;
                  case "Pick a different product.":
                    buyProduct();
                    break;
                  case "Start over.":
                    update();
                    break;
                    case "Quit.":
                    quit();
                    break;
                  default:
                    console.log("Defaulted");
                    update();
                    break;
                }
              });
            } else {
              purchase(availableProducts[user.select].item_name, user.quantity, res[0].price);
            }
        });

      }).catch(function (err) {
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


    }]).then(function (user) { 
      console.log("1. You chose " + user.select);
      switch (user.select) {
        case menu.available:
          displayAvailable();
          update();
          break;
        case menu.purchase:
          buyProduct();
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
    console.clear();
    console.log("Thank you for shopping with");
    logo.display();
    process.exit();
  }

  getProducts();
  update();
}






