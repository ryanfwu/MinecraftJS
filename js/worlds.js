document.getElementById("seed").value = Math.round(Math.random()*65535)+1;
document.getElementById("play").onclick = function() {
    var seed = document.getElementById("seed").value;
    if (seed > 65535 || seed < 1) {
        alert("Please enter an integer between 1 and 65535 inclusive for the seed.");
    }
    else {
        window.location.href = "./singleplayer?seed=" + seed;
    }
}
