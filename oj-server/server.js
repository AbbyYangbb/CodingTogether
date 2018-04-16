var express = require('express');
var app = express();
var restRouter = require("./routes/rest");
var indexRouter = require("./routes/index");
var path = require("path");
var dbConnect = require("./mongoDBConfig");
var http = require('http');

var socketIO = require('socket.io');
var io = socketIO();
var SocketServices = require('./services/socketServices.js')(io);

app.use(express.static(path.join(__dirname, '../public')));
app.use('/', indexRouter);
app.use("/api/v1", restRouter);

app.use('/', function(req, res) {
    //send index.html to start client side
    res.sendFile('index.html', {
        root: path.join(__dirname, '../public/')
    });
});

/*app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
})*/

// Create a new server
var server = http.createServer(app);
io.attach(server);
server.listen(3000);
server.on('error', onError);
server.on('listening', onListening);

// The new two functions def below:
function onError(error) {
    console.log(error);
    throw (error);
}

function onListening(error) {
    var addr = server.address();
    var bind = typeof addr === 'string'
    ?  'pipe' + addr
    :  'port' + addr.port;
    console.log("Listening On 3000");
}
