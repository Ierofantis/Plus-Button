var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var sword = require("./models/signup");
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(expressSession({secret:'bla2'}));
app.use(cookieParser('bla2'));

mongoose.connect("mongodb://localhost/gamess", function (error){	
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
        console.log(req.session.user);
        res.render("players.ejs", { user: user });
    }); 
});

app.get('/players/:emails/', function(req, res){
  
    var password = req.body.password;
    sword.find({}, function(err, user) {
        if (err) return next(err);       
        res.render("main.ejs", { user: user });
    }); 
});

app.post('/login', function(req, res){
	var emails = req.body.username;
  var password = req.body.password;	

	 var s = new sword({emails: emails, password: password });     

     s.save(function(err, newUser) {
     req.session.user = emails
     if (err) return next(err);         
     console.log(req.session.user);    
    res.redirect('/defend/' + emails + '');
   });
});

app.post('/log', function(req, res){
  var emails = req.params.username;
  var password = req.body.password; 
  if (req.session.user)
  return res.redirect('/defend/' + emails + '');
});

app.get('/error', function(req, res){	
	res.render('error');
});

app.get("/defend/:emails", function(req, res, next) {

    var emails = req.params.emails; 
     req.session.user = emails               
    console.log('req.body',req.params);

    sword.findOne({ emails:emails }, function(err, user) {  
    if (err) return next(err);
    console.log(user);
    res.render("defend.ejs", { user: user });
  });
});

var numClients = 0;

io.on('connection', function(socket){
console.log(`${socket.id} connected.`)
  // each socket can be in only one room in addition to its socket.id room
  var currentRoom = 'default'
  socket.join(currentRoom)

  socket.on('move to room', function moveToRoom (newRoom) {
    socket.leave(currentRoom)
    socket.join(newRoom)
    currentRoom = newRoom
    socket.emit('message', {
      sender: '***SERVER***',
      content: `You moved to room ${newRoom}`
    })
  })

  socket.on('message', function onReceiveMessage (message) {
    socket.to(currentRoom).emit('message', {
      sender: socket.id,
      content: message
    })
    console.log(`Relayed "${message}" from ${socket.id} to #${currentRoom}`)
  })

  socket.on('disconnect', function onDisconnect (socket) {
    console.log(`${socket.id} disconnected.`)
  })

   numClients++;

   io.emit('stats', { numClients: numClients });   
   console.log('Connected clients:', numClients);   	
     
    socket.on('disconnect', function() {
        numClients--;
        io.emit('stats', { numClients: numClients });
        console.log('Connected clients:', numClients);
    });
  
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
