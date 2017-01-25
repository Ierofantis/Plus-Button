var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var sword = require("./models/signup");
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/game", function (error){
	
	if (error) console.error(error);
	else console.log("mongo connected")

});

app.get('/', function(req, res){
	res.render('login');
});

app.get('/players', function(req, res){
    var emails = req.body.username;
    var password = req.body.password;
    sword.find()
    .sort({ createdAt: "descending" })
    .exec(function(err, user) {

        if (err) return next(err);
        console.log(user);
        res.render("players.ejs", { user: user });
    }); 
});

app.get('/players/:emails/', function(req, res){
   //var emails = req.params.username;
    var password = req.body.password;
    sword.find({}, function(err, user) {

        if (err) return next(err);
        console.log(req.params);
        res.render("war.ejs", { user: user });
    }); 
});

app.post('/login', function(req, res){
	var emails = req.body.username;
    var password = req.body.password;	
	
	 var s = new sword({emails: emails, password: password });
     s.save(function(err, newUser) {
     if (err) return next(err);         
     console.log(newUser);
     res.redirect('players');
   });
});

app.get('/error', function(req, res){	
	res.render('error');
});

app.post('/defend', function(req, res){
	var name = req.body.usrs;
	console.log(name)
	res.redirect('defend/'+ name+'');
});

app.get('/defend/:name', function(req, res){
	var name = req.params.name
	res.render('defend', {name:name});
});

var numClients = 0;
io.on('connection', function(socket){   

   numClients++;
   io.emit('stats', { numClients: numClients });   
   console.log('Connected clients:', numClients);   	
     
    socket.on('disconnect', function() {
        numClients--;
        io.emit('stats', { numClients: numClients });
        console.log('Connected clients:', numClients);
    });
  
	socket.on('counts', function(c){
    io.emit('counts', c);
    console.log(c)
  });
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
