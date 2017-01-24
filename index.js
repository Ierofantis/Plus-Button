var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/', function(req, res){
	res.render('index');
});

app.get('/main', function(req, res){
	res.render('main');
});

io.on('connection', function(socket){

	console.log('a user connected');

	socket.on('counts', function(c){
    io.emit('counts' ,c);
    console.log(c)
  });
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
