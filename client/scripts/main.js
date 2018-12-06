var socket = io();
//signin variables
var signDiv = document.getElementById('signDiv');
var usernameText = document.getElementById('signin_username');
var passwordText = document.getElementById('signin_password');
var signinBtn = document.getElementById('signIn');
var signupBtn = document.getElementById('signUp');
var timerDiv = document.getElementById('timerDiv');
var signin_BB = document.getElementById('signinBB');
let loggedIn = badgeBookTokenHandler.isBadgeBookUserLoggedIn();

if (loggedIn) {
    var bb_pack = {
        bb_name: badgeBookTokenHandler.getCurrentUserClaims().name,
        bb_id: badgeBookTokenHandler.getCurrentUserClaims().userId
    }
    socket.emit('bb_signin', bb_pack)
    signDiv.style.display = 'none'
    timerDiv.style.display = 'inline-block';
}

signin_BB.onclick = () => {
    badgeBookTokenHandler.loginWithBadgeBook();

}

//timer variables
var timer = document.getElementById('timer');
var toggleBtn = document.getElementById('toggle');
var resetBtn = document.getElementById('reset');
var watch = new Stopwatch(timer);


function start() {
    watch.start();
}

function stop() {
    toggleBtn.textContent = 'Start';
    watch.stop();
}

var send_time = data => {
    var curr_time = timer.innerText;

    socket.emit('catch_this', curr_time);
}

socket.on('displayMsg', d => {
    chatText.innerHTML += '<div>' + d + '</div>';
})

document.body.onkeyup = function (e) {
    keysPressed = [];
    keysPressed[e.keyCode] = e.type == 'keydown';
    if (e.keyCode == 68) {
        watch.isOn ? stop() : start();
    }
}