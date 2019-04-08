//=================================Setup Required Variables===============================

var mysql = require('mysql');
var inquirer = require('inquirer');

//=================================Connect to SQL database===============================

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "JBAccess1!",
    database: "bamazonDB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    startPrompt();
});

//=================================Inquirer introduction===============================

function startPrompt() {

    inquirer.prompt([{

        type: "confirm",
        name: "confirm",
        message: "Welcome to Bamazon! Would you like to view our inventory?",
        default: true

    }]).then(function(user) {
        if (user.confirm === true) {
            inventory();
        } else {
            console.log("Thank you! Come back soon!");
            connection.end()
        }
    });
}

//=================================Inventory===============================

function inventory() {

    // // instantiate
    // var table = new Table({
    //     head: ['ID', 'Item', 'Department', 'Price', 'Stock'],
    //     colWidths: [10, 30, 30, 30, 30]
    // });

    listInventory();

    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    function listInventory() {

        //Variable creation from DB connection

        connection.query("SELECT * FROM products", function(err, res) {

            console.log("");
            console.log("====================================================== Current Bamazon Inventory ======================================================");
            console.log("");
            console.table(res);            
            console.log("");
            continuePrompt();
        });
    }
}

//=================================Inquirer user purchase===============================

function continuePrompt() {

    inquirer.prompt([{

        type: "confirm",
        name: "continue",
        message: "Would you like to purchase an item?",
        default: true

    }]).then(function(user) {
        if (user.continue === true) {
            selectionPrompt();
        } else {
            console.log("Thank you! Come back soon!");
        }
    });
}

//=================================Item selection and Quantity desired===============================

function selectionPrompt() {

    inquirer.prompt([{

            type: "input",
            name: "inputId",
            message: "Please enter the ID number of the item you would like to purchase.",
        },
        {
            type: "input",
            name: "inputNumber",
            message: "How many units of this item would you like to purchase?",

        }
    ]).then(function(userPurchase) {
        console.log(userPurchase)
        //connect to database to find stock_quantity in database. If user quantity input is greater than stock, decline purchase.
        var inputId = userPurchase.inputNumber
        connection.query("SELECT * FROM products WHERE item_id= ?", [inputId], function(err, res) {
            if (err){
                console.log(err)
            }
            // for (var i = 0; i < res[0].stockQuantity.length; i++) {
                var newStock = userPurchase.inputNumber - res[0].stock_quantity;   
                var newStockedParsed = parseInt(newStock)
                 var itemId = userPurchase.inputId;
                connection.query('UPDATE products SET ? WHERE ?', [{ stock_quantity: newStockedParsed }, { item_id: itemId }], function (error, results) {
                    if (error) {
                      console.log("error from line 138",error)
                    }
                    console.log(results)
                    // TODO: add a console.log() to show the price of the order and success
                    // TODO: add another function purchaseAgain() asking if they would like to purchase again
                    //getProducts()
                  })
            
                // if (userPurchase.inputNumber > res[i].stock_quantity) {

                //     console.log("===================================================");
                //     console.log("Sorry! Not enough in stock. Please try again later.");
                //     console.log("===================================================");
                //     startPrompt();

                // } else {
                //     //list item information for user for confirm prompt
                //     console.log("===================================");
                //     console.log("Awesome! We can fulfull your order.");
                //     console.log("===================================");
                //     console.log("You've selected:");
                //     console.log("----------------");
                //     console.log("Item: " + res[i].product_name);
                //     console.log("Department: " + res[i].department_name);
                //     console.log("Price: " + res[i].price);
                //     console.log("Quantity: " + userPurchase.inputNumber);
                //     console.log("----------------");
                //     console.log("Total: " + res[i].price * userPurchase.inputNumber);
                //     console.log("===================================");

                //     var newStock = (res[i].stock_quantity - userPurchase.inputNumber);
                //     var purchaseId = (userPurchase.inputId);
                //     //console.log(newStock);
                //     confirmPrompt(newStock, purchaseId);
                // }
            // }
        });
    });
}

//=================================Confirm Purchase===============================

function confirmPrompt(newStock, purchaseId) {

    inquirer.prompt([{

        type: "confirm",
        name: "confirmPurchase",
        message: "Are you sure you would like to purchase this item and quantity?",
        default: true

    }]).then(function(userConfirm) {
        if (userConfirm.confirmPurchase === true) {

            //if user confirms purchase, update mysql database with new stock quantity by subtracting user quantity purchased.

            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newStock
            }, {
                item_id: purchaseId
            }], function(err, res) {});

            console.log("=================================");
            console.log("Transaction completed. Thank you.");
            console.log("=================================");
            startPrompt();
        } else {
            console.log("=================================");
            console.log("No worries. Maybe next time!");
            console.log("=================================");
            startPrompt();
        }
    });
}