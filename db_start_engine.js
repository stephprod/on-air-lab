let mysql = require('mysql')
//database link to the CI (intégration continue)
let connection = mysql.createConnection({
	host	 : '127.0.0.1',
	port	 : '3306',
	user	 : 'root',
	password : 'administrateur',
	database : 'starlife'
})

module.exports = connection
