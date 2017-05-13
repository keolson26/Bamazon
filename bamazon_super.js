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
	connection.connect(function(err) {
	if (err) throw err;
	});

 prompt([{
    name: "menu",
    type: "rawlist",
    message: "Please select the screen you would like to view: ",
    choices: ["View sales by department", "Create new department"]
  }]).then(function(answer) {

  	if(answer.menu.toLowerCase() === "view sales by department") {
  		dispDept();
  		}
  	else {
		deptCreate();  		
  	}

  });

var dispDept = function() {

	console.log("*************************************************************************************************");
	connection.query("SELECT * FROM departments", function(err, res) {
  			if(err) throw err;
 			
  			for(var i = 0; i < res.length; i++) {
  				console.log("Dept # : "+res[i].dept_id+" | Dept Desc : "+res[i].dept_name+" | Total Sales : $"+res[i].total_sales);	
			}	
			console.log("*************************************************************************************************");
  		});
  	
	};

var deptCreate = function () {
	prompt([{
			type: "input",
			message: "Please provide the name of the new department:",
			name: "newDept"
		},
		{
			type: "input",
			message: "Please provide the department ID number:",
			name: "newID"
		},
		{
			type: "input",
			message: "Please provide the overhead costs associated with this department:",
			name: "newOverhead"
		}
		]). then(function(answer) {
			connection.query("INSERT INTO departments SET ?", 
				{
					dept_id: answer.newID, 
					dept_name: answer.newDept, 
					costs: answer.newOverhead, 
					total_sales: 0
				}), function(err, res) {
				if(err) throw err;

				console.log("New department "+answer.newDept+" created!");
				};
			});
	};
};

start();