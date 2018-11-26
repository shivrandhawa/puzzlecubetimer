
const port = process.env.PORT || 8000;
var mongojs = require("mongojs");

var db = mongojs('mongodb://shiv:master1@ds055525.mlab.com:55525/puzzlecubedb', ['score'])

// db.times.insert({ username: "guest", score: "00 : 14 . 791" });
var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

app.post('/api/times/landing', (req, res) => {

    var token = req.headers['authorization'];
    var userid = req.headers['userid'];
    console.log("userid " + userid + " token:  " + token);
    if (!userid || !token) {
        console.log("Authorization or userid problem (headers)");
        res.status(403)
        res.send("invalid headers");

    }
    else {
        if (token != "tzznk") {
            res.send("invalid authorization token");
            res.status(403);
        } else {
            try {
                db.times.find({ bbid: userid }, function (err, docs) {
                    var jsonObj = {
                        "request": {
                            "href": "puzzlecubeurl/api/times/",
                            "userid": userid,
                            "token": token
                        },
                        "landingData": [
                            {
                                "name": "Puzzle Cube Timer",
                                "img-url": "url",
                                "link": "www.puzzle.com",
                                "data": [
                                    "Best Time: 00 : 11 . 111"
                                ]
                            }
                        ]
                    };
                    res.status(200).json(jsonObj);
                });
            } catch (err) {
                var jsonObj = {
                    "request": {
                        "href": "puzzlecubeurl/api/times/",
                        "userid": "default user",
                        "token": "tzznk"
                    },
                    "LandingData": [
                        {
                            "name": "Puzzle Cube Timer",
                            "img-url": "url",
                            "link": "www.puzzle.com",
                            "data": [
                                "Best Time: 00 : 123 . 456"
                            ]
                        }
                    ]
                };
            }
        }
    }
});


app.post('/api/times', (req, res) => {

    var token = req.headers['authorization'];
    var userid = req.headers['userid'];
    console.log("userid " + userid + " token:  " + token);
    if (!userid || !token) {
        console.log("Authorization or userid problem (headers)");
        res.status(403)
        res.send("invalid headers");

    }
    else {
        if (token != "tzznk") {
            res.status(403);
            res.send("invalid authorization token");
        } else {
            try {
                db.times.find({ bbid: userid }, function (err, docs) {
                    var jsonObj = {
                        "request": {
                            "href": "puzzlecubeurl/api/times/",
                            "userid": userid,
                            "token": token
                        },
                        "landingData": [
                            {
                                "name": "Puzzle Cube Timer",
                                "img-url": "url",
                                "link": "www.puzzle.com",
                                "data": [
                                    "Best Time: 00 : 11 . 111"
                                ]
                            }
                        ]
                    };
                    res.status(200).json(jsonObj);
                });
            } catch (err) {
                res.status(422).json(jsonObj);
            }
        }
    }
});

app.use('/client', express.static(__dirname + '/client'));
server.listen(port, () => {
    console.log("App is running on port " + port);
});





////////////////////
// connection code//
////////////////////

var SOCKET_LIST = {}
var PLAYERS = {};

var isUsernameTaken = (data, cb) => {
    db.times.find({ username: data.username }, function (err, res) {
        if (res.length > 0)
            cb(true);
        else
            cb(false);
    });
}

var addUser = (data, cb) => {
    db.times.insert({ username: data.username, password: data.password }, function (err, res) {
        if (res.length > 0)
            cb(true);
        else
            cb(false);
    });
};
var isValidPass = (data, cb) => {
    db.times.find({ username: data.username, password: data.password }, function (err, res) {
        if (res.length > 0)
            cb(true);
        else
            cb(false);
    });
}


var Player = id => {
    var self = {
        time: 0,
        id: id,
        name: "un_named"
    }
    return self;
}

Player.list = {};
Player.connect = (socket) => {
    var player = Player(socket.id);
}


var io = require('socket.io')(server, {});

io.sockets.on('connection', socket => {
    console.log("socket connection");
    socket.id = Math.random();
    PLAYERS[socket.id] = socket;

    socket.on('signin', (data) => {
        isValidPass(data, function (res) {
            if (res) {
                Player.connect(socket);
                socket.emit('signin-res', { success: true });

            } else {
                socket.emit('signin-res', { success: false });

            }
        });
    });
    socket.on('signup', (data) => {
        isUsernameTaken(data, function (res) {
            if (res) {
                socket.emit('signup-res', { success: false });
            } else {
                addUser(data, function () {
                    socket.emit('signup-res', { success: true });

                })
            }
        })
    });



    var player = Player(socket.id);
    PLAYERS[socket.id] = player;

    socket.on('catch_this', (data) => {
        console.log("caught it:  " + data);
        player.time = data;


    });

    socket.on('disconnect', () => {
        delete SOCKET_LIST[socket.id];
        delete PLAYERS[socket.id];

    })
    socket.on('sendMsg', (data) => {
        var sender = "id:" + (" " + socket.id);
        console.log('====================================');
        console.log(data);
        console.log('====================================');
        for (var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('displayMsg', sender + ' - ' + data)
        }
    });
});

//TODO: here video 3 .
setInterval(() => {
    var pack = []
    for (var i in PLAYERS) {
        var player = PLAYERS[i];
        pack.push({
            time: player.time

        });
        /*  console.log('====================================');
         console.log(player.time + "    " + player.id);
         console.log('===================================='); */
    }
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack)

    }

}, 1000 / 25);