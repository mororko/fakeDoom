import * as THREE from 'https://unpkg.com/three@0.151.3/build/three.module.js';
import {Player} from "./player.js";
import { createFloor } from './floor.js';
import { Weapon } from './weapon.js';
import { spawnEnemies, updateEnemies, Enemy } from './enemy.js'
import { updateHUD} from './hud.js'
import { createMapFromGrid } from './walls.js';
import { generateDoomMap, getRandomPlayerStart, getOpenCells  } from './mapGrid.js';
import { spawnPickups, updatePickups, spawnPickupAt  } from './pickups.js';
import { createPortal } from './portal.js';


const GRAVITY = 0.0098;
let scene, camera, renderer;
let keys = {}
let player, weapon;
let pickups;
let walls=[];
let wallBoxes = [];
const cellSize = 3;
const wallHeight = 7;
let shotSound, punchSound, hitSound
let killCount = 0;
let enemies = [];
let mapGridGlobal;


function initGame() {

    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Camara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.rotation.order = "YXZ"; // Control e FPS
    scene.add(camera);

    //luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Renderizado
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("gameCanvas"),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    createFloor(scene, 50,50,5, './assets/floor.png');

    const mapGrid = generateDoomMap(40, 40, 10);
    console.log("Grid generado: ", mapGrid);
    mapGridGlobal = mapGrid;
    walls = createMapFromGrid(scene, mapGrid, cellSize, wallHeight, './assets/wall.jpg');
    wallBoxes = walls.filter(wall => !wall.userData.isDoor).map(wall => new THREE.Box3().setFromObject(wall));

    
    
    // Jugador
    player = new Player();
    const playerStart = getRandomPlayerStart(mapGrid, cellSize);
    player.position.set(playerStart.x, playerStart.y, playerStart.z);

    weapon = new Weapon(camera);

    // Generar enemigos y pickups usando solo las celdas abiertas
    enemies = spawnEnemies(scene, mapGrid, cellSize, 1);
    pickups = spawnPickups(scene, mapGrid, cellSize, 0);

    //Sonido
    const listener = new THREE.AudioListener();
    camera.add(listener);

    //Agregar efecto de sonido
    shotSound = new THREE.Audio(listener);
    punchSound = new THREE.Audio(listener);
    hitSound = new THREE.Audio(listener);


    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('sound/shot.mp3', (buffer)=> {
        shotSound.setBuffer(buffer);
        shotSound.setVolume(0.3);
    });

    audioLoader.load('sound/punch.mp3', (buffer)=> {
        punchSound.setBuffer(buffer);
        punchSound.setVolume(0.3);
    });

    audioLoader.load('sound/hit.mp3', (buffer)=> {
        hitSound.setBuffer(buffer);
        hitSound.setVolume(0.3);
    });


    // Musica
    const backgroundSound = new THREE.Audio(listener);
    audioLoader.load('sound/music.mp3', (buffer) => {
        backgroundSound.setBuffer(buffer);
        backgroundSound.loop = true;
        backgroundSound.setVolume(0.9);
        backgroundSound.play();
    });




    // Evento de teclas
    window.addEventListener("keydown", (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Redimensionar la ventana
    window.addEventListener("resize", onWindowResize);

    // Quitamos el menu del boton derecho del raton
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    //Configurar el raton
    document.addEventListener("mousedown", (event) => {
        const canvas = document.getElementById("gameCanvas");
        if (document.pointerLockElement !== canvas){
            canvas.requestPointerLock();
        }else{
            if (event.button === 0) {
                shoot();
            } else if (event.button === 2) {
                punch();
            }
        }
    });
    document.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement === document.getElementById("gameCanvas")) {
            player.updateRotation(event.movementX, event.movementY);
        }
    });

    // Posicion de la camara segun el jugador
    camera.position.copy(player.position);

    updateHUD(player);

    setInterval(spawnEnemy, 1000);
    //Iniciar el buble de animacion
    animate();

}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function shoot() {
    if (player.ammo <= 0) return; // No se puede disparar sin munición
    player.ammo--;
    updateHUD(player); // Actualiza la munición en el HUD
    weapon.fire();
    if(shotSound.isPlaying){
        shotSound.stop();
    }
    shotSound.play();
  
    // Definir el origen y la dirección del disparo.
    // Usamos la posición del jugador y la dirección de la cámara.
    const origin = player.position.clone();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), player.rotationX);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotationY);
    direction.normalize();
  
    const raycaster = new THREE.Raycaster(origin, direction, 0, 8);
  
    // Filtrar solo a los enemigos vivos
    const liveEnemies = enemies.filter((enemy) => enemy.isAlive).map((enemy) => enemy.mesh);
    const intersects = raycaster.intersectObjects(liveEnemies, false);
  
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      // Buscar el enemigo correspondiente
      const enemyHit = enemies.find((enemy) => enemy.mesh === hitMesh);
      if (enemyHit) {
        enemyHit.hit(1);
        if (!enemyHit.isAlive) {
          scene.remove(enemyHit.mesh);
          killCount++;
          updateKillCounter();
        //   console.log("Enemigo muerto");
          if (Math.random() < 0.5){
            const type = Math.random() < 0.5 ? "health" : "ammo";
            const newPickup = spawnPickupAt(scene, enemyHit.mesh.position.clone(), type, cellSize);
            // console.log("Se ha generado un pickup de", type, "en", newPickup.position);
            if (type === "health") {
                pickups.healthPickups.push(newPickup);
            } else if (type === "ammo") {
                pickups.ammoPickups.push(newPickup);
            }
        }
        // console.log("Pickups actuales:", pickups);
        }
      }
    }
  }



  function punch() {
    weapon.punch();
    punchSound.play();
  
    const origin = player.position.clone();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyAxisAngle(new THREE.Vector3(1, 0, 0), player.rotationX);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotationY);
    direction.normalize();
  
    // Rango efectivo del puñetazo: 2 unidades (ajústalo según tu escala)
    const raycaster = new THREE.Raycaster(origin, direction, 0, 3);
    const liveEnemies = enemies.filter((enemy) => enemy.isAlive).map((enemy) => enemy.mesh);
    const intersects = raycaster.intersectObjects(liveEnemies, false);
  
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const enemyHit = enemies.find((enemy) => enemy.mesh === hitMesh);
      if (enemyHit) {
        enemyHit.hit(2); // Supongamos que el puñetazo causa 2 de daño
        if (!enemyHit.isAlive) {
          scene.remove(enemyHit.mesh);
          killCount++;
          updateKillCounter();
          // Generar pickup con la misma probabilidad, por ejemplo, 50%
          if (Math.random() < 0.5) {
            const type = Math.random() < 0.5 ? "health" : "ammo";
            const newPickup = spawnPickupAt(scene, enemyHit.mesh.position.clone(), type, cellSize);
            if (type === "health") {
              pickups.healthPickups.push(newPickup);
            } else {
              pickups.ammoPickups.push(newPickup);
            }
          }
        }
      }
    }
  }
  

function showGameOver() {
    const modal = document.getElementById("gameOverModal");
    modal.style.display = "flex";
}

function checkCollision(position, boxes, collisionRadius = 1) {
    for (let box of boxes) {
      // Creamos una copia expandida del bounding box
      let expandedBox = box.clone();
      expandedBox.min.subScalar(collisionRadius);
      expandedBox.max.addScalar(collisionRadius);
      if (expandedBox.containsPoint(position)) {
        return true;
      }
    }
    return false;
  }


// Función para generar un único enemigo en una celda abierta
function spawnEnemy() {
    if (!mapGridGlobal) {
      console.error("spawnEnemy: mapGridGlobal es undefined");
      return;
    }
    const openCells = getOpenCells(mapGridGlobal);
    if (openCells.length === 0) return;
    
    const cell = openCells[Math.floor(Math.random() * openCells.length)];
    const posX = cell.col * cellSize + cellSize / 2;
    const posZ = cell.row * cellSize + cellSize / 2;
    // Ajustamos la altura: en este ejemplo, usamos 1 para el spawn del enemigo
    const spawnPosition = new THREE.Vector3(posX, 1, posZ);
    
    // Crear el portal en la posición de spawn. Duración de 1500 ms.
    createPortal(scene, spawnPosition, cellSize, 1500);
    
    // Después de 750 ms (la mitad de la duración del portal), crear el enemigo
    setTimeout(() => {
      const enemy = new Enemy();
      enemy.mesh.position.copy(spawnPosition);
      enemies.push(enemy);
      scene.add(enemy.mesh);
    }, 750);
  }


  function updateKillCounter() {
    const killCounterEl = document.getElementById("killCounter");
    if (killCounterEl) {
      killCounterEl.innerText = "Muertes: " + killCount;
    }
  }




function animate() {

    if (player.health <= 0){showGameOver();return;}
    requestAnimationFrame(animate);

    const prevPosition = player.position.clone();
    player.update(keys, GRAVITY);
    if (checkCollision(player.position, wallBoxes, 1)) {
        player.position.copy(prevPosition);
    }

    //posicion de la camara
    camera.position.copy(player.position);
    camera.rotation.set(player.rotationX, player.rotationY, 0, "YXZ");

    //Actualizamos los enemigos
    updateEnemies(enemies,player, () => {
        updateHUD(player);
        hitSound.play();
    }); // 

    //Actualizmos los picks
    updatePickups(pickups, player, scene, () => updateHUD(player));
    updateHUD(player);
    renderer.render(scene, camera);

}

export {initGame};

