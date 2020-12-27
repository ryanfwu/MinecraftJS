document.getElementById("seed").value = Math.round(Math.random()*9223372036854775807)+1;
document.getElementById("play").onclick = function() {
    var seed = document.getElementById("seed").value;
    window.location.href = "./singleplayer?seed=" + seed;
}
