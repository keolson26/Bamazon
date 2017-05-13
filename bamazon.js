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

//Display all available items to buy
connection.query("SELECT * FROM product", function(err, res) {
	if(err) throw err;
	console.log("*************************************************************************************************");
	for(var i = 0; i < res.length; i++) {
			console.log("Item : "+res[i].item_id+" | Item Desc : "+res[i].item_desc+" | Department : "+res[i].dept+" | Price : "+res[i].price+" | In-stock : "+res[i].oh);	
		}
	console.log("*************************************************************************************************");
	});
};


var selectItems = function() {

//Get user input on purchase
prompt ([
	{
		type: "input",
		message: "What is the item ID of the product you wish to purchase?",
		name: "buyID"
	},
	{
		type: "input",
		message: "How many of this item do you wish to purchase?",
		name: "buyQTY"
	}
]).then(
	//Determine if desired quantity is available
	function (answer) {
		connection.query("SELECT * FROM product WHERE item_id ="+answer.buyID, function(err, res) {
			if(parseInt(res[0].oh) > answer.buyQTY) {
				console.log("Item in-stock. Added to cart!");
				//Update on hand QTY
				var ohNew = parseInt(res[0].oh) - answer.buyQTY;
				connection.query("UPDATE product SET ? WHERE ?", [{oh: ohNew}, {item_id: answer.buyID}], function(err, res){});
				//Update revenue by item
				var revenue = answer.buyQTY * res[0].price;
				
				connection.query("UPDATE product SET ? WHERE ?", [{sales: revenue}, {item_id: answer.buyID}], function(err, res){});	
				//Update department revenue
				var deptFind = connection.query("SELECT dept FROM product WHERE ?", [{item_id: answer.buyID}],function(err, res) {});
				var startRevenue = connection.query("SELECT total_sales FROM departments WHERE ?", [{dept_name: deptFind}], function(err, res) {});
				var newRevenue = startRevenue + revenue;
				connection.query("UPDATE departments SET ? WHERE ?", [{total_sales: newRevenue}, {dept_name: deptFind}], function(err, res) {});
			}
			else {
				console.log("Not enough in-stock. Please come back later!");
				}
			});
		});
};



start();
selectItems();
