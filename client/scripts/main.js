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
    console.log('====================================');
    console.log(badgeBookTokenHandler.getCurrentUserClaims());
    console.log('====================================');
    socket.emit('bb_signin', bb_pack)
    signDiv.style.display = 'none'
    timerDiv.style.display = 'inline-block';
}

signin_BB.onclick = () => {
    badgeBookTokenHandler.loginWithBadgeBook();

}
var chatText = document.getElementById('chatText');
var chatInput = document.getElementById('chatInput');
var chatForm = document.getElementById('chatForm');

//emit a package called signin that has the value of username and password boxes
//TODO: change username to un   and change password to pass
signinBtn.onclick = () => {
    socket.emit('signin', {
        username: usernameText.value,
        password: passwordText.value
    })
}

signupBtn.onclick = () => {
    socket.emit('signup', {
        username: usernameText.value,
        password: passwordText.value
    })
}

socket.on('signin-res', (data) => {
    if (data.success) {
        signDiv.style.display = 'none'
        timerDiv.style.display = 'inline-block';
    } else
        alert("sign in failed ");
});
//alert  boxes.
socket.on('signup-res', (data) => {
    if (data.success) {
        alert('signup successful')
    } else
        alert('signup unsuccessful')
});

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
    console.log('====================================');
    console.log(d);
    console.log('====================================');
})
chatForm.onsubmit = e => {
    e.preventDefault();

}

document.body.onkeyup = function (e) {
    keysPressed = [];
    keysPressed[e.keyCode] = e.type == 'keydown';
    if (e.keyCode == 68) {
        watch.isOn ? stop() : start();
    }
}