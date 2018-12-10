var mysql = require("mysql");
 var inquirer = require("inquirer");
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

  connection.connect(function(err){
      if(err) throw err;

      start();
  });

  function start(){

    var availableProducts = [];
    connection.query("SELECT * FROM products", function(err, res){
       
        for(let i in res){
           availableProducts.push(`Name: ${res[i].item_name} \n\tPrice: $${res[i].price}\n\tStock: ${res[i].stock_quantity}`);
       }
        inquirer.prompt([{
            type: "list",
            message: "Select a product:",
            name:"select",
            choices: availableProducts.length > 0 ? availableProducts : ["Empty..."],
            pageSize: 100
            
        }]).then(function(user){
            console.log("You chose " + user.select);
            start();
        });
    

    });
    
  }
  if (process.platform === "win32") {
    require("readline")
      .createInterface({
        input: process.stdin,
        output: process.stdout
      })
      .on("SIGINT", function () {
        process.emit("SIGINT");
      });
  }
  
  process.on("SIGINT", function () {
    // graceful shutdown
    connection.end();
    process.exit();
  });