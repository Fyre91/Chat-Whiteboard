var app = require('http').createServer(handler);
var io = require('socket.io').listen(app, {log: false}),
    fs = require('fs'),
    path = require('path');

var clientsConnected = [];
function contentType(ext) {
    var ct;
    switch (ext) {
    case '.html':
        ct = 'text/html';
        break;
    case '.css':
        ct = 'text/css';
        break;
    case '.js':
        ct = 'text/javascript';
        break;
    default:
        ct = 'text/plain';
        break;
    }
    return {'Content-Type': ct};
}

function handler(request, response) {
    var index = "/index.html";
    var filepath = '.' + (request.url == '/' ? index : request.url),
        fileExt = path.extname(filepath);
        
    fs.readFile(filepath, function (err, html) {
        if (err) {
            response.writeHead(500);
            return response.end("Error loading index.html");
        }
        response.writeHead(200, contentType(fileExt));
        response.write(html);
        response.end();
    });
}

io.on('connection', function (socket) {
    console.log("Connection Established");

    socket.on('mousemove', function (data) {
        clientsConnected.push(data.userName);
        data.allClients = clientsConnected;
        //console.log("EMITTING");
        socket.broadcast.emit('moving', data);
    });

    socket.on('chatentered', function (data) {
        console.log("CHAT ENTERED");
        socket.broadcast.emit('newchat', data);
    });

});

app.listen(8080);
