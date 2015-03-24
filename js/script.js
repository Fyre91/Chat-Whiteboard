var CANVAS = CANVAS || {};

/**
 * Loads all the initialization methods
 */
CANVAS.init = function () {
    CANVAS.username = null;
    CANVAS.initializeColorBox();
    CANVAS.addListeners();
};

/**
 * Creates the color picker option on login panel
 */
CANVAS.initializeColorBox = function () {
  var data = [
        {"colorName": "Black", "colorCode": "#000"},
        {"colorName": "White", "colorCode": "#FFF"},
        {"colorName": "Red", "colorCode": "#FF0000"},
        {"colorName": "Yellow", "colorCode": "#FFFF00"},
        {"colorName": "Green", "colorCode": "#00FF00"},
        {"colorName": "Blue", "colorCode": "#0000FF"},

    ];
    var template = $("#colorTemplate").html();
    var html = Mustache.render(template, data);
    $("#colorContainer").html(html);
};

/**
 * Adds all the required listeners 
 */
CANVAS.addListeners = function () {
    $("#submit-name").on('click', function () {
        if ($("#name").val() !== undefined && $("#name").val() !== null && $("#name").val() !== "") {
            CANVAS.userName = $("#name").val();
            CANVAS.strokeColor = $("#color-picker").val();
            CANVAS.initiateCanvas();
        }
    });

    $("#clear-canvas").on('click', CANVAS.clearCanvas);

    $(window).on('resize', function () {
        CANVAS.ctx.canvas.width = window.innerWidth * 0.5;
    });
};

/**
 * Initiates the canvas panel
 */
CANVAS.initiateCanvas = function () {
    $("#login-container").hide();
    $("#container").show();
    var url = "http://10.202.23.60:8080";

    var canvas = $("#paper");
    CANVAS.ctx = canvas[0].getContext('2d');

    CANVAS.ctx.canvas.width = window.innerWidth * 0.5;

    //Generate random id for the new user
    var userId = Math.round($.now() * Math.random()),
        drawing = false;

    var socket = io.connect(url);

    socket.on('connect', function () {
        console.log("CONNECTED");
    });


    var clients = {};

    //When mouse cursor is moving
    socket.on('moving', function (data) {
        //console.log("MOVING EMITTED");
        if (data.drawing && clients[data.userId]) {
            drawLine(clients[data.userId].x, clients[data.userId].y, data.x, data.y, CANVAS.strokeColor);
        }
        //Save the current data to the client
        clients[data.userId] = data;
        clients[data.userId].updated = $.now();
        //console.log(data);
    });

    var prev = {};
    canvas.on('mousedown', function (e) {
        e.preventDefault();
        drawing = true;
        var pos = getMousePos(document.getElementById("paper"), e);
        prev.x = pos.x;
        prev.y = pos.y;

    });

    $(document).on('mouseup mouseleave', function () {
        drawing = false;
    });

    var lastEmit = $.now();
    canvas.on('mousemove', function (e) {
        //console.log("MOUSE IS MOVING");
        if ($.now() - lastEmit >= 30) {
            var pos = getMousePos(document.getElementById("paper"), e);
            socket.emit('mousemove', {
                'x': pos.x,
                'y': pos.y,
                'drawing': drawing,
                'userId': userId,
                'userName': CANVAS.userName
            });
            //console.log("USERNAME : " + userName);
            //console.log("Socket event emitted ");
            lastEmit = $.now();
        }

        if (drawing) {
            var pos = getMousePos(document.getElementById("paper"), e);
            drawLine(prev.x, prev.y, pos.x, pos.y);
            prev.x = pos.x;
            prev.y = pos.y;
        }
    });

    //Draws the line from and to the given point
    function drawLine(fromX, fromY, toX, toY, strokeColor) {
        CANVAS.ctx.moveTo(fromX, fromY);
        CANVAS.ctx.lineTo(toX, toY);
        CANVAS.ctx.strokeStyle = strokeColor;
        CANVAS.ctx.stroke();
    }

    //Calculate relative position of the mouse
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }
};

CANVAS.clearCanvas = function () {
       CANVAS.ctx.clearRect(0, 0, $("#paper")[0].width, $("#paper")[0].height);
       CANVAS.ctx.beginPath();
};

$(function () {
   CANVAS.init();
   CHATMODULE.init();
});
