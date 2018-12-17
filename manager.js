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
    sales: "View Product Sales by Department",
    dept: "Add New Department",
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

    function displayLow() {

        connection.query('SELECT * FROM products', function (err, res) {
            if (err) throw err;
            var arr = [];
            for (let i in res) {
                if (res[i].stock_quantity < 5) {
                    arr.push(res[i]);
                }
            }
            console.table(arr);
            update();
        })

    }
    var availableDepts = [];

    function getDepts() {
        connection.query(`SELECT DISTINCT department_name FROM departments`, function (err, res) {
            if (err) throw err;
            availableDepts = [];
            for (let i in res) {
                availableDepts.push(res[i].department_name);
            }
        });
    }

    function getProducts() {

        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
            availableProducts = [];
            for (let i in res) {
                availableProducts.push(new Product(res[i].item_name, res[i].department_name, res[i].price, res[i].stock_quantity));
            }

        });

    }

    function stock() {
        displayAvailable();
        inquirer.prompt([
            {
                type: "input",
                message: "Enter the index of the item you want to stock:",
                name: "select",
                validate: function (input) {
                    if (input === "") {
                        return false;
                    } else
                        if (/^[0-9]*$/gm.test(input)) {
                            if (Object.keys(availableProducts).includes(input)) {
                                return true;
                            } else {
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
                message: "Add how many?",
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
                console.log(`Adding ${user.quantity} to ${availableProducts[user.select].item_name}'s stock.`);
                connection.query(`UPDATE products SET stock_quantity = stock_quantity + ${user.quantity} WHERE item_name = "${availableProducts[user.select].item_name}"`, function (err, res) {
                    if (err) throw err;
                    console.log(res.message);
                    getProducts();
                    update();
                });

            })
    }

    function addDept() {

        inquirer.prompt([
            {
                name: "name",
                message: "What is the department name?",
            },
            {
                name: "cost",
                message: "What is the department's over head cost?",
                validate: function (input) {
                    if (input === "") {
                        return false;
                    } else
                        if (/^[+]?(\d+(\.\d+)?|(\.\d+)|(\d+\.))(e[+-]?\d+)?$/.test(input)) {

                            return true;


                        } else {
                            console.log("\nPlease enter a number.");
                            return false;
                        }
                }
            }]).then(function (user) {
                console.log(`Adding ${user.name} to departments with a ${user.cost} over head cost.`)
                connection.query(`INSERT INTO departments (department_name, over_head_costs)
            VALUES ("${user.name}",${user.cost})`, function (err, res) {
                        if (err) throw err;
                        console.log("Success!");
                        getDepts();
                        update();
                    });

            });
    }

    function addItem() {
        inquirer.prompt([
            {
                name: "name",
                message: "What is the product name?",
            },
            {
                type: "list",
                name: "dept",
                message: "What is the product's department name?",
                choices: availableDepts
            },
            {
                name: "price",
                message: "What is the product's price?",
                validate: function (input) {
                    if (input === "") {
                        return false;
                    } else
                        if (/^[+]?(\d+(\.\d+)?|(\.\d+)|(\d+\.))(e[+-]?\d+)?$/.test(input)) {
                            if (parseFloat(input) > 99 || parseFloat(input) < 0) {
                                console.log("Must be 0 or more and less than 100.");
                                return false;
                            } else {
                                return true;
                            }

                        } else {
                            console.log("\nPlease enter a number.");
                            return false;
                        }
                }
            },
            {
                name: "quantity",
                message: "How many in stock?",
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
            }]).then(function (user) {
                console.log(`Adding ${user.quantity} ${user.name}(s) to the ${user.dept} department at $${user.price}...`)
                connection.query(`INSERT INTO Products (item_name, department_name, price, stock_quantity)
            VALUES ("${user.name}","${user.dept}", ${user.price}, ${user.quantity})`, function (err, res) {
                        if (err) throw err;
                        console.log("Success!");
                        getProducts();
                        update();
                    });

            });
    }

    function displaySales() {
        connection.query(`SELECT department_name, SUM(product_sales)
        from products
        group by department_name;`, function (err, res) {
                if (err) throw err;

                var final = [];
                var productDepts = res;
                connection.query(`SELECT * FROM departments;`, (err, res) => {
                    var match = false;

                    for(let dept in res){
                        var match = false;
                        for(let row in productDepts){
                            if(productDepts[row].department_name === res[dept].department_name){
                                match = true;
                                final.push({
                                    "department_id": res[dept].department_id,
                                    "department_name": res[dept].department_name,
                                    "over_head_costs": res[dept].over_head_costs,
                                    "product_sales": productDepts[row]["SUM(product_sales)"],
                                    "total_profit": parseInt(productDepts[row]["SUM(product_sales)"]) - parseInt(res[dept].over_head_costs)
                                });
                            }
                        }
                        if(!match){
                            final.push({
                                "department_id": res[dept].department_id,
                                "department_name": res[dept].department_name,
                                "over_head_costs": res[dept].over_head_costs,
                                "product_sales": 0,
                                "total_profit": 0 - res[dept].over_head_costs
                            });
                        }





                    }
                    // for (let i in res) {
                    //     match = false;
                    //     for (let a in arr) {
                    //         if (arr[a].department_name == res[i].department_name) {
                    //             match = true;
                                
                    //         }
                    //     }
                    //     if (!match) {
                    //         final.push({
                    //             "department_id": res[i].department_id,
                    //             "department_name": res[i].department_name,
                    //             "over_head_costs": res[i].over_head_costs,
                    //             "product_sales": 0,
                    //             "total_profit": 0
                    //         })
                    //     }
                    // }
                    console.table(final);
                    update();
                });



            })

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

                    break;
                case menu.stock:
                    stock();
                    break;
                case menu.add:
                    addItem();
                    break;
                case menu.sales:
                    displaySales();
                    break;
                case menu.dept:
                    addDept();
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

    function quit() {
        connection.end();
        console.clear();
        console.log("Thanks for using");
        logo.display();
        process.exit();
    }

    getProducts();
    getDepts();
    update();

}