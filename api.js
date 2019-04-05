/**************************************
 *******  CONFIG & DEPEDENCIES  *******
 *************************************/

/**** Listening on port ****/
const port = 8000;
const ip = "192.168.1.39";

/**** MongoDB URL ****/
const mongoDB = 'mongodb://omgprod:Babito91@ds213615.mlab.com:13615/babito';

/**** Const & Require ****/
const cors = require('cors');
const express = require("express");
const mongoose = require('mongoose');
const Rooms = require("./Schema/Rooms");
const bodyParser = require("body-parser");
const app = express();

/**** Loading CORS Dep, Body-Parser Dep ****/
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('files'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.enable('trust proxy');

/**** Connect to MongoDB + Node Promise ****/
mongoose.Promise = global.Promise;
mongoose.connect(mongoDB, {useNewUrlParser: true})
    .then(() => console.log('MongoDB = CONNECTED.'))
    .catch((err) => console.error(err));

/**************************************
 ***********  MAIN API ****************
 *************************************/

/**** CONSOLE LOG MOST INFOS FROM REQUEST ****/
app.use(function timeLog(req, res, next) {
    var utc = new Date();
    console.log(
        '*------------------------*' +
        '\n*  Time: ', utc.toLocaleTimeString() +
        '\n*  Function: ' + req.method +
        '\n*  URL: ' + req.originalUrl +
        '\n*  IP Client: ' + req.ip +
        '\n*------------------------*'
    );
    next();
});

/**** TEST To render with API ****/
app.get('/', (req, res) => {
    res.render('game');
});

/**** CREATE NEW ROOMS ****/
app.post('/new', (req, res) => {
    console.log(req.body);
    var room = new Rooms({
        name: req.body.name,
        description: req.body.description,
        capacity: req.body.capacity,
        equipment: [req.body.equipment],
        reservedFor: null,
        reserved: 0,
    });
    room.save(function (error) {
        if (error) {
            return res.status(400).send({
                Success: false,
                Message: 'une erreur est survenue.',
                Error: error,
            });
        } else {
            return res.status(200).send({
                Success: true,
                Method: req.method,
                Message: 'room créé',
                room

            });
        }
    });
});

/**** GET ALL ROOMS UNRESERVED ****/
app.get('/fetch', (req, res) => {
    Rooms.find({reserved: false})
        .exec(function (err, roomUnreserved) {
            if (err) {
                throw err
            } else {
                return res.status(200).send(
                    roomUnreserved
                );
            }
        });

});

/**** UPDATE RESERVED ROOM TO UNRESERVED****/
app.get('/verify', (req, res) => {
    Rooms.find({reserved: true})
        .exec(function (err, room) {
            if (err) {
                throw err
            } else {
                if (room.lenght !== 0) {
                    for (i = 0; i < room.length; i++) {
                        console.log('                     ')
                        console.log(JSON.stringify(room[i].reservedFor))
                        //console.log(room[i].reservedFor.getTime())
                        //console.log(Date.now())
                        if (room[i].reservedFor.getTime() <= Date.now()) {
                            console.log('Salle Vacante: ' + room[i]._id)
                            Rooms.findByIdAndUpdate(room[i]._id, {reserved: false}, function (err, roomChanged) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    res.status(200).send({
                                        RoomNowAvailable: roomChanged
                                    })
                                }
                            })
                        } else {
                            console.log('Salle toujours résérvé')
                        }
                    }
                }
            }
        })
});


/**** BOOK ONE ROOM  ****/
app.post('/update', (req, res) => {
    console.log(req.body[1].id)
    var query = {_id: req.body[0]._id}
    Rooms.findOneAndUpdate(query, {reserved: true, reservedFor: req.body[1].id}, function (err, room) {
        if (err) {
            console.log(err)
        } else {
            return res.status(200).send(
                room
            );
        }
    });
});

/**** UNBOOK ONE ROOM ****/
app.post('/unreserved', (req, res) => {
    var query = {_id: req.body[0]._id}
    Rooms.findOneAndUpdate(query, {reserved: false}, function (err, room) {
        if (err) {
            console.log(err)
        } else {
            return res.status(200).send(
                room
            );
        }
    });
});

/**** Port Listenner ****/
app.listen(port, ip, () => {
    console.log("Server = http://" + ip + ":" + port);
});

/**** Copyright ****/
console.log('..:: OMG-PROD 2019 ::..');
console.log('..:: NODE--EXPRESS ::..');