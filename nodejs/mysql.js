var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1111',
  database : 'opentutorials'
});
 
connection.connect();
 
connection.query('SELECT * FROM topic', function (error, results, fields) {
//   if (error) console.log('ERROR: ', error);
  console.log(results);
});
 
connection.end();