require("dotenv").config();
var inquirer = require("inquirer");
var prompt = inquirer.createPromptModule();

var password = process.env.password; //Save a .env (no preceding name) in folder containing "password = ****", include in .gitignore
var mysql = require("mysql");
var connection = mysql.createConnection(
	{
	host: "localhost", 
	port: 3306,
	user: "root",
	password: password,
	database: "bamazon_db"
});

var start = function() {

//Connect to database
connection.connect(function(err) {
	if (err) throw err;
});

 prompt([{
    name: "menu",
    type: "rawlist",
    message: "Please select the screen you would like to view: ",
    choices: ["Available Items", "View Low Inventory", "Add to Inventory", "Add New Item"]
  }]).then(function(answer) {
    // based on their answer, either call the bid or the post functions

    if (answer.menu.toLowerCase() === "available items") {
    	connection.query("SELECT * FROM product", function(err, res) {
		if(err) throw err;

		console.log("******************************All Items**********************************************************");
		
		for(var i = 0; i < res.length; i++) {
			console.log("Item : "+res[i].item_id+" | Item Desc : "+res[i].item_desc+" | Department : "+res[i].dept+" | Price : "+res[i].price+" | In-stock : "+res[i].oh);	
			}

		console.log("*************************************************************************************************");

		});
    }

    else if (answer.menu.toLowerCase() === "view low inventory") {
    	var low = 5;
		connection.query("SELECT * FROM product", function(err, res) {
		if(err) throw err; 
		console.log("***************************Low Inventory Items****************************************************");
		
		for (var i = 0; i < res.length; i++)  {
			if(parseInt(res[i].oh) < low) {
				console.log("Item : "+res[i].item_id+" | Item Desc : "+res[i].item_desc+" | Department : "+res[i].dept+" | Price : "+res[i].price+" | In-stock : "+res[i].oh);	
				}
			}
			console.log("**************************************************************************************************");
		});
		}

	else if (answer.menu.toLowerCase() === "add to inventory") {
		addOH();	
		}

	else if (answer.menu.toLowerCase() === "add new item") {
		addItem();
		}

	else {
		console.log("Invalid menu selection! Please start over.");
		}
	});
};

var addOH = function () {
	prompt ([
	{
		type: "input",
		message: "What item ID would you like to add inventory to?",
		name: "addID"
	},
	{
		type: "input",
		message: "How many units of inventory would you like to add?",
		name: "addOH"
	}
	]).then(function(answer){
		connection.query("SELECT * FROM product WHERE item_id ="+answer.addID, function(err, res) {
			if(parseInt(res[0].oh) > 0) {
				var added = (parseInt(res[0].oh) + parseInt(answer.addOH));
				connection.query("UPDATE product SET ? WHERE ?", [{oh: added}, {item_id: answer.addID}], function(err, res){
					console.log("You have added "+answer.addOH+" units of inventory! You now have a total of "+added+" on hand of item "+answer.addID);
				})
				}
			else {
				console.log("Invalid quantity! Please start over.");
				}
			});
		});
};

var addItem = function () {
	prompt ([
	{	
		type: "input",
		message: "What is the new item's ID number?",
		name: "newID"
	},
	{
		type: "input",
		message: "What is the new item's description?",
		name: "newDesc"
	},
	{
		type: "input",
		message: "What department does this item go in?",
		name: "newDept"
	},
	{
		type: "input",
		message: "What is the selling price of this item?",
		name: "newPrice"
	},
	{
		type: "input",
		message: "What is the starting inventory level of this item?",
		name: "newOH"
	}
	]).then(function (answer){
		connection.query("INSERT INTO product SET ?", 
	{
		item_id: parseInt(answer.newID),
		item_desc: answer.newDesc, 
		dept: answer.newDept,
		price: parseFloat(answer.newPrice),
		oh: parseInt(answer.newOH)

	}, function(err, res){
		console.log("New item " + answer.newID +" added!")
		});
	})
};

start();


































