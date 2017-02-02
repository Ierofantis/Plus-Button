var express = require('express');
var app = express();
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

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(expressSession({ secret: 'bla2' }));
app.use(cookieParser('bla2'));

mongoose.connect("mongodb://localhost/blablas", function(error) {

    if (error) console.error(error);
    else console.log("mongo connected")
});

app.get('/', function(req, res) {
    res.render('login');
});

app.get('/players', function(req, res) {
    var emails = req.body.username;
    var password = req.body.password;
    var sess = req.session.user;

    sword.find()
        .sort({ createdAt: "descending" })
        .exec(function(err, user) {

            if (err) return next(err);
            res.render("players.ejs", { user: user, sess: sess });
        });
});

app.get('/players/:emails/', function(req, res) {

    var password = req.body.password;
    sword.find({}, function(err, user) {

        if (err) return next(err);
        res.render("main.ejs", { user: user });
    });
});

app.post('/login', function(req, res) {
    var emails = req.body.username;
    var password = req.body.password;

    var s = new sword({ emails: emails, password: password });

    s.save(function(err, newUser) {

        req.session.user = emails;

        if (err)
            return next(err);

        res.redirect('/defend/' + emails + '');
    });
});

app.post('/log', function(req, res) {
    var emails = req.session.user;

    if (req.session.user) {
        sword.findOne({ emails: emails }, function(err, user) {

            if (err)
                return next(err);

            if (user)
                return res.redirect('/defend/' + emails + '');
        });
    }
});

app.get('/error', function(req, res) {
    res.render('error');
});

app.get("/defend/:emails", function(req, res, next) {

    var emails = req.params.emails;
    req.session.user = emails;

    sword.findOne({ emails: emails }, function(err, user) {

        if (err) return next(err);
        res.render("defend.ejs", { user: user });
    });
});

var numClients = 0;
var rooms = [];

io.on('connection', function(socket) {
    console.log(`${socket.id} connected.`);
    // each socket can be in only one room in addition to its socket.id room
    var currentRoom = 'default';
    socket.join(currentRoom);

    socket.on('move to room', function moveToRoom(newRoom) {

        socket.leave(currentRoom);
        socket.join(newRoom);

        currentRoom = newRoom;
        rooms.push(newRoom)        
   
       function countInArray(array, value) {
        var count = 0;
        var index = array.indexOf(value);
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                count++;
            }
            if(count>2){
              socket.leave(newRoom);
              array.splice(index, 1);
              console.log('sorry')
            }
        }       
    }      

     countInArray(rooms, newRoom)
     console.log(rooms)

        socket.emit('message', {
            sender: '***SERVER***',
            content: `You moved to room ${newRoom}`
        })
    })

    socket.on('message', function onReceiveMessage(message) {
        socket.to(currentRoom).emit('message', {
            sender: socket.id,
            content: message
        })
        console.log(`Relayed "${message}" from ${socket.id} to #${currentRoom}`)
    })

    socket.on('disconnect', function onDisconnect(socket) {
        console.log(`${socket.id} disconnected.`)
    })

    socket.on('chat message', function(s) {
        io.emit('chat message', s);

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

http.listen(3000, function() {
    console.log('listening on *:3000');
});
