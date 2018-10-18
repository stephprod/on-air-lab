let mysql = require('mysql')
//database link to the CI (integration continue)
let connection = mysql.createConnection({
	host	 : '127.0.0.1',
	port	 : '3306',
	user	 : 'root',
	password : '',
	database : 'starlife'
})

module.exports = connection  