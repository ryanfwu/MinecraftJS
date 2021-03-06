
var canvas = document.getElementById('canvas');
var engine = new BABYLON.Engine(canvas, true);
var walkplaying = false;

var url = document.location.href,
    params = url.split('?')[1].split('&'),
    data = {}, tmp;
for (var i = 0, l = params.length; i < l; i++) {
     tmp = params[i].split('=');
     data[tmp[0]] = tmp[1];
}

var seed = data.seed;
var pn = new Perlin(seed);
console.log("[LOG] Creating world with seed " + seed);

var perlinGenerate = function(x, z) {
    var terrainGeneration = (Math.round (pn.noise(x, z, 0) * 63)) + 1;
    console.log("[LOG] Perlin noise generated with data " + terrainGeneration);
    return terrainGeneration;
};

var generateChunk = function(chunkx, chunky) {
    var chunk = [chunkx, chunky];
    for (var x = 1; x <= 16; x++) {
        for (var z = 1; z <= 16; z++) {
            var noiseGeneration = perlinGenerate(x + 16*chunkx, z + 16*chunky);
            for (var y = 1; y <= 64; y++) {
                if (y <= noiseGeneration) {
                    chunk.push(2);
                }
                else {
                    chunk.push(0);
                }
            }
        }
    }
    console.log("[LOG] Chunk created with data " + chunk);
    return chunk;
};

var createScene = function(terrain) {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.529, 0.808, 0.922);
    scene.gravity = new BABYLON.Vector3(0, -9.81 / engine.getFps().toFixed(), 0);
    scene.collisionsEnabled = true;

    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(8, 150, 8), scene);
    light.intensity = 0.5;
    light.radius = 16;

    var camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(8, 70, 8), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    camera.checkCollisions = true;
    camera.attachControl(canvas,true);
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);
    camera.sensibility = 0.01;
    camera.inertia = 0;
    camera.speed = 0.75;

    var light2 = new BABYLON.PointLight("light", new BABYLON.Vector3(8, 70, 8), scene);
    light2.intensity = 0.5;
    light2.radius = 32;

    light2.parent = camera;

    window.addEventListener("keyup", jumpCheck, false);
    function jumpCheck(event) {
        if (event.keyCode == 32) {
            var originaly = camera.position.y;
            while (camera.position.y <= originaly + 3) {
                camera.position.y += 0.1;
            }
        }
    }

    var faceUV = new Array(6);
    for (var i = 0; i < 6; i++) {
        faceUV[i] = new BABYLON.Vector4(i / 6, 0, (i + 1) / 6, 1);
    }

    var stoneTexture = new BABYLON.Texture("./assets/textures/stone.png", scene);
    var stoneMaterial = new BABYLON.StandardMaterial("stone", scene);
    stoneMaterial.diffuseTexture = stoneTexture;

    var grassTexture = new BABYLON.Texture("./assets/textures/grass_block.png", scene);
    var grassMaterial = new BABYLON.StandardMaterial("grass", scene);
    grassMaterial.diffuseTexture = grassTexture;

    var dirtTexture = new BABYLON.Texture("./assets/textures/dirt.png", scene);
    var dirtMaterial = new BABYLON.StandardMaterial("dirt", scene);
    dirtMaterial.diffuseTexture = dirtTexture;

    var cobblestoneTexture = new BABYLON.Texture("./assets/textures/cobblestone.png", scene);
    var cobblestoneMaterial = new BABYLON.StandardMaterial("cobblestone", scene);
    cobblestoneMaterial.diffuseTexture = cobblestoneTexture;

    var planksTexture = new BABYLON.Texture("./assets/textures/planks.png", scene);
    var planksMaterial = new BABYLON.StandardMaterial("planks", scene);
    planksMaterial.diffuseTexture = planksTexture;

    var logTexture = new BABYLON.Texture("./assets/textures/log.png", scene);
    var logMaterial = new BABYLON.StandardMaterial("log", scene);
    logTexture.diffuseTexture = logTexture;

    var bedrockTexture = new BABYLON.Texture("./assets/textures/bedrock.png", scene);
    var bedrockMaterial = new BABYLON.StandardMaterial("bedrock", scene);
    bedrockTexture.diffuseTexture = bedrockTexture;

    var renderdistance = 2;

    for (var i = 0; i < terrain.length; i++) {
        var chunkx = terrain[i][0];
        var chunkz = terrain[i][1];
        var camerax = Math.floor(camera.position.x / 16);
        var cameraz = Math.floor(camera.position.z / 16);

        if ((Math.abs(chunkx - camerax) < renderdistance) && (Math.abs(chunkz - cameraz) < renderdistance)) {
            for (var x = 1; x <= 16; x++) {
                for (var z = 1; z <= 16; z++) {
                    for (var y = 1; y <= 64; y++) {
                        var blockid = terrain[1024 * (x - 1) + 64 * (z - 1) + y + 1]; // (y - 1) + 2 = y + 1 since first 2 in chunk are chunk coordinates
                        document.getElementById("loading").innerHTML = ("<p>Generating Terrain</p><p>" + (Math.ceil(blockid*100/((terrain.length)*16384))) + "%</p>");
                        if (!(((terrain[1024 * (x) + 64 * (z - 1) + y + 1] == 0) && (terrain[1024 * (x - 2) + 64 * (z - 1) + y + 1] == 0)) && ((terrain[1024 * (x - 1) + 64 * (z - 1) + y + 2] == 0 && terrain[1024 * (x - 1) + 64 * (z - 1) + y] == 0) && (terrain[1024 * (x - 1) + 64 * (z) + y + 1] == 0 && terrain[1024 * (x - 1) + 64 * (z - 2) + y + 1])))) {
                            if (blockid != 0) {
                                var block = BABYLON.MeshBuilder.CreateBox(("block-" + x + "-" + z + "-" + y), {size: 1, faceUV: faceUV, wrap: true}, scene);
                                block.position = new BABYLON.Vector3(x + 16 * chunkx, y, z + 16 * chunkz);
                                block.checkCollisions = true;
                            }

                            if (blockid == 0) {
                                console.log("[LOG] Air rendered at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                            else if (blockid == 1) {
                                block.material = stoneMaterial;
                                console.log("[LOG] Block rendered at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                            else if (blockid == 2) {
                                block.material = grassMaterial;
                                console.log("[LOG] Block rendered at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                            else if (blockid == 3) {
                                block.material = dirtMaterial;
                                console.log("[LOG] Block rendered at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                            else if (blockid == 4) {
                                block.material = cobblestoneMaterial;
                                console.log("[LOG] Block rendered at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                            else if (blockid == 5) {
                                block.material = planksMaterial;
                                console.log("[LOG] Block rendered at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                            else if (blockid == 6) {
                                block.material = logMaterial;
                                console.log("[LOG] Block rendered at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                            else if (blockid == 7) {
                                block.material = bedrockMaterial;
                                console.log("[LOG] Block rendered at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                            else {
                                block.material = grassMaterial;
                                console.log("[LOG] Unknown block ID " + blockid + " at " + x + " / " + y + " / " + z + " @ " + chunkx + " / " + chunkz);
                            }
                        }
                    }   
                }
            }
        }
        else {
            console.log("[LOG] Render skipped for chunk " + chunkx + " / " + chunkz + " @ " + camerax + " / " + cameraz);
        }
    }
    document.getElementById("loading").innerHTML = "";
    console.log("[LOG] Erased progress bar");

    var walk1 = new BABYLON.Sound("Walk1", "./assets/sounds/walk1.ogg", scene);
    var walk2 = new BABYLON.Sound("Walk2", "./assets/sounds/walk2.ogg", scene);
    var walk3 = new BABYLON.Sound("Walk3", "./assets/sounds/walk3.ogg", scene);
    var walk4 = new BABYLON.Sound("Walk4", "./assets/sounds/walk4.ogg", scene);
    var walk5 = new BABYLON.Sound("Walk5", "./assets/sounds/walk5.ogg", scene);
    var walk6 = new BABYLON.Sound("Walk6", "./assets/sounds/walk6.ogg", scene);

    window.addEventListener("keydown", function(event) {
        if ((event.keyCode == 87 || event.keyCode == 65) || (event.keyCode == 83 || event.keyCode == 68)) {
            if (walkplaying == false) {
                var walknumber = Math.floor(Math.random() * 6) + 1;
                switch (walknumber) {
                    case 1:
                        walk1.play();
                        break;
                    case 2:
                        walk2.play();
                        break;
                    case 3:
                        walk3.play();
                        break;
                    case 4:
                        walk4.play();
                        break;
                    case 5:
                        walk5.play();
                        break;
                    case 6:
                        walk6.play();
                        break;
                    default:
                        walk1.play();
                }
                walkplaying = true;
                setTimeout(function() {
                    walkplaying = false;
                }, 450);
            }
        }
    });

    var music = new BABYLON.Sound("Music", "./assets/sounds/music.mp3", scene, null, {loop: true, autoplay: true});
    music.play();

    return scene;
};

var terrain = [generateChunk(-1, -1), generateChunk(-1, 0), generateChunk(-1, 1)
             , generateChunk(0, -1), generateChunk(0, 0), generateChunk(0, 1)
             , generateChunk(1, -1), generateChunk(1, 0), generateChunk(1, 1)];

console.log("[LOG] Terrain generated with length " + terrain.length);
console.log(terrain);

var scene = createScene(terrain);

engine.runRenderLoop(function(){
    scene.render();
});

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
canvas.requestPointerLock();
