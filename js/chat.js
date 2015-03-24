var CHATMODULE = CHATMODULE || {};

CHATMODULE.socket = io.connect("10.202.23.60:8080");

CHATMODULE.init = function () {
    CHATMODULE.createEmitters();
    $("#enter-button").on('click', function () {
        CHATMODULE.socket.emit('chatentered', {
            'message': $("#input-area").val(),
            'userName': CANVAS.userName
        });
        console.log("CHAT EMITED");
        $("#display-area").append("<p>Me: " + $("#input-area").val() + "</p>");
        $("#input-area").val("");
    });
};

CHATMODULE.createEmitters = function () {
    CHATMODULE.socket.on('newchat', function (data) {
        $("#display-area").append(data.userName + ": " + data.message);
    });
};
