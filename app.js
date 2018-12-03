const dotenv = require('dotenv').config();
const log = require('log4js').getLogger();
log.level = process.env.LOG_LEVEL;

const attachBadgeBookUserToSocket = require('./server/badgebook-token-handler');

const port = process.env.PORT || 8000;
var mongojs = require("mongojs");

var db = mongojs('mongodb://shiv:master1@ds055525.mlab.com:55525/puzzlecubedb', ['score'])

// db.times.insert({ username: "guest", score: "00 : 14 . 791" });
var express = require('express');
var app = express();
var server = require('http').Server(app);

app.use(express.static('client'));

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
        if (token != "pzzlc") { //TODO: Puzzle's cube token here
            res.send("invalid authorization token");
            res.status(403);
        } else {
            try {
                db.times.find({ bbid: userid }, function (err, docs) {
                    let temp_doc = docs[0]
                    var temp_score = "00 : 123 . 456"
                    if (temp_doc == undefined) {
                        score = "00 : 123 . 456";

                    } else {
                        score = docs[0].score;
                    }
                    var jsonObj = {
                        "request": {
                            "href": "https://puzzlecubetimer.herokuapp.com/api/times/landing/",
                            "userid": userid,
                            "token": token
                        },
                        "landingData": [
                            {
                                "name": "Puzzle Cube Timer",
                                "img-url": "https://lh4.ggpht.com/mfM7IDaCX4XVS-wiXh7cbTGs56B1-oyU1e1AaXycaR1pqjObAIjeX9UZN30Wpn5btvc=w300",
                                "link": "https://puzzlecubetimer.herokuapp.com/",
                                "data": [
                                    "Solved in: " + score
                                ]
                            }
                        ]
                    };
                    res.status(200).json(jsonObj);
                });
            } catch (err) {
                var jsonObj = {
                    "request": {
                        "href": "https://puzzlecubetimer.herokuapp.com/api/times/landing/",
                        "userid": "default user",
                        "token": "pzzlc" //TODO: puzzle cube timer
                    },
                    "landingData": [
                        {
                            "name": "Puzzle Cube Timer",
                            "img-url": "https://lh4.ggpht.com/mfM7IDaCX4XVS-wiXh7cbTGs56B1-oyU1e1AaXycaR1pqjObAIjeX9UZN30Wpn5btvc=w300",
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
        if (token != "pzzlc") { //TODO: Puzzle's cube token here
            res.send("invalid authorization token");
            res.status(403);
        } else {
            try {
                db.times.find({ bbid: userid }, function (err, docs) {
                    let temp_doc = docs[0]
                    var temp_score = "00 : 123 . 456"
                    if (temp_doc == undefined) {
                        score = "00 : 123 . 456";

                    } else {
                        score = docs[0].score;
                    }
                    var jsonObj = {
                        "request": {
                            "href": "https://puzzlecubetimer.herokuapp.com/api/times/",
                            "userid": userid,
                            "token": token
                        },
                        "badgeData": [
                            {
                                "text": "most recent time: " + score,
                                "img-url": "https://lh4.ggpht.com/mfM7IDaCX4XVS-wiXh7cbTGs56B1-oyU1e1AaXycaR1pqjObAIjeX9UZN30Wpn5btvc=w300",
                                "link": "https://puzzlecubetimer.herokuapp.com",
                            }
                        ]
                    };
                    res.status(200).json(jsonObj);
                });
            } catch (err) {
                var jsonObj = {
                    "request": {
                        "href": "https://puzzlecubetimer.herokuapp.com/api/times/",
                        "userid": "default user",
                        "token": "pzzlc"
                    },
                    "badgeData": [
                        {
                            "text": "Most recent time: " + score,
                            "img-url": "https://lh4.ggpht.com/mfM7IDaCX4XVS-wiXh7cbTGs56B1-oyU1e1AaXycaR1pqjObAIjeX9UZN30Wpn5btvc=w300",
                            "link": "https://puzzlecubetimer.herokuapp.com",
                        }
                    ]
                };
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
        name: "un_named",
        badgeid: "N/A"
    }
    return self;
}

Player.list = {};
Player.connect = (socket) => {
    var player = Player(socket.id);
}


var io = require('socket.io')(server, {});

io.sockets.on('connection', async socket => {
    console.log("socket connection");
    socket.id = Math.random();
    console.log();
    PLAYERS[socket.id] = socket;

    // Try to get, validate, set up, and validate badgebook user.
    try {
        await attachBadgeBookUserToSocket(socket);
        if (socket.isValidBadgeBookUser) {
            Player.connect(socket);
            socket.emit('signin-res', { success: true });
        }
    } catch (err) {
        log.trace(`No badgebook user found`);
    }

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
        let bid = PLAYERS[socket.id].badgeid;

        db.times.update({ bbid: bid }, { $set: { score: data } });



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
    socket.on('bb_signin', data => {
        console.log(data.bb_name + ".." + data.bb_id);

        var fname;
        try {
            db.times.find({ bbid: data.bb_id }, function (err, docs) {
                if (docs.length > 0) {
                    fname = docs[0].username
                    console.log(docs[0].username);

                    // Player.list[socket.id].name = data.bb_name;
                    Player.connect(socket);
                    PLAYERS[socket.id].badgeid = data.bb_id
                    console.log(PLAYERS[socket.id].badgeid);

                } else {
                    console.log('=================ss===================');

                    db.times.insert({ bbid: data.bb_id, username: data.bb_name, score: 0 })
                    Player.connect(socket);
                    console.log("adding new player to database, name: " + data.bb_name);

                }
                for (var i in SOCKET_LIST) {
                    SOCKET_LIST[i].emit('displayMsg', " " + data.bb_name + " joined");
                    SOCKET_LIST[i].emit("add_player", data.bb_name);

                }
            });
        } catch (err) {
            //TODO: handle error
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