import * as THREE from 'https://unpkg.com/three@0.151.3/build/three.module.js';
import { getOpenCells } from './mapGrid.js';
export function spawnPickups(scene, grid, cellSize, pickupCount = 8) {
  const openCells = getOpenCells(grid);
  const healthPickups = [];
  const ammoPickups = [];
  
  // Dividir la cantidad de pickups en dos: salud y munición
  const healthCount = Math.floor(pickupCount / 2);
  const ammoCount = pickupCount - healthCount;
  
  // Para salud: usar una geometría proporcional a cellSize = 3
  for (let i = 0; i < healthCount; i++) {
    const cell = openCells[Math.floor(Math.random() * openCells.length)];
    const posX = cell.col * cellSize + cellSize / 2;
    const posZ = cell.row * cellSize + cellSize / 2;
    const geometry = new THREE.BoxGeometry(cellSize / 2, cellSize / 4, cellSize / 2); // 1.5, 0.75, 1.5
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const pickup = new THREE.Mesh(geometry, material);
    // Ubicarlo en el centro de la celda; ajustar la altura para que quede sobre el suelo
    pickup.position.set(posX, cellSize / 8, posZ); // cellSize/8 = 0.375
    healthPickups.push(pickup);
    scene.add(pickup);
  }
  
  for (let i = 0; i < ammoCount; i++) {
    const cell = openCells[Math.floor(Math.random() * openCells.length)];
    const posX = cell.col * cellSize + cellSize / 2;
    const posZ = cell.row * cellSize + cellSize / 2;
    const geometry = new THREE.BoxGeometry(cellSize / 2, cellSize / 4, cellSize / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const pickup = new THREE.Mesh(geometry, material);
    pickup.position.set(posX, cellSize / 8, posZ);
    ammoPickups.push(pickup);
    scene.add(pickup);
  }
  
  return { healthPickups, ammoPickups };
}

export function updatePickups(pickups, player, scene, updateHUDCallback) {
  if (!pickups) {
    console.error("updatePickups: pickups es undefined.");
    return;
  }
  
  // Ajusta el rango según cellSize. Con cellSize 3, quizás 1.0 o 1.5 es adecuado.
  const pickupRange = 2;
  
  // Actualizar pickups de salud
  for (let i = 0; i < pickups.healthPickups.length; i++) {
    const pickup = pickups.healthPickups[i];
    const dist = player.position.distanceTo(pickup.position);
    // console.log("Distancia pickup salud:", dist);
    if (dist < pickupRange) {
      player.health = Math.min(player.health + 20, 100);
      scene.remove(pickup);
      pickups.healthPickups.splice(i, 1);
      i--;
      if (updateHUDCallback) updateHUDCallback();
    }
  }
  
  // Actualizar pickups de munición
  for (let j = 0; j < pickups.ammoPickups.length; j++) {
    const pickup = pickups.ammoPickups[j];
    const dist = player.position.distanceTo(pickup.position);
    // console.log("Distancia pickup ammo:", dist);
    if (dist < pickupRange) {
      player.ammo = Math.min(player.ammo + 10, 50);
      scene.remove(pickup);
      pickups.ammoPickups.splice(j, 1);
      j--;
      if (updateHUDCallback) updateHUDCallback();
    }
  }
}
export function spawnPickupAt(scene, pos, type, cellSize) {
  // Definir la ruta de la imagen según el tipo:
  const texturePath = type === "health" ? 'assets/health.png' : 'assets/ammo.png';
  
  // Cargar la textura
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(texturePath);
  
  // Crear el material para el sprite
  const material = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true 
  });
  
  // Crear el sprite
  const sprite = new THREE.Sprite(material);
  
  // Ajustar la escala del sprite para que se vea bien; por ejemplo, un poco más pequeño que la celda
  sprite.scale.set(cellSize *0.5 , cellSize * 0.5, 1);
  
  // Posicionar el sprite en la posición dada; puedes ajustar la altura si es necesario
  // sprite.center.set(0.5,0);
  sprite.position.copy(pos);
  // Aseguramos que el sprite quede a una altura adecuada (por ejemplo, a la altura del suelo más un poco)
  sprite.position.y = 1;
  
  // Al ser un sprite, automáticamente se orienta hacia la cámara.
  scene.add(sprite);
  return sprite;
}