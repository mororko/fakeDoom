import * as THREE from 'https://unpkg.com/three@0.151.3/build/three.module.js';
import { getOpenCells } from './mapGrid.js'; // Ajusta la ruta según tu estructura



export class Enemy {

    constructor() {
        this.texture = new THREE.TextureLoader().load('../assets/enemigo.png', () => {
            console.log('Enemy loaded');
        });

        const geometry = new THREE.PlaneGeometry(2,3);

        const material = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true,
            side: THREE.DoubleSide,
            color: 0xffffff
        });

        this.mesh = new THREE.Mesh(geometry, material);

        const x = (Math.random() - 0.5)*100;
        const z = (Math.random() - 0.5)*100;
        this.mesh.position.set(x, 1.5, z);

        // Impactos y muerte
        this.health = 3;
        this.isAlive = true;

    }


    hit(damage = 1) {

    //restamos salud
    this.health -= damage;

    //Mostramos el flash rojo
        this.mesh.material.color.set(0xff0000);
        setTimeout(() => {
            this.mesh.material.color.set(0xffffff);
        },150);

        if (this.health <= 0){
            this.isAlive = false;
            
        }
    }


// src/enemy.js (fragmento modificado)
    update(player) {
        if (!this.isAlive) return;
    
        // Calcular el vector horizontal desde el enemigo hasta el jugador (ignorando Y)
        const horizontalDirection = new THREE.Vector3().subVectors(player.position, this.mesh.position);
        horizontalDirection.y = 0; // Ignorar la diferencia vertical
        const currentDistance = horizontalDirection.length();
        const minDistance = 2.0; // Distancia mínima permitida
    
        // Si el enemigo está más lejos que la distancia mínima, se mueve hacia el jugador
        if (currentDistance > minDistance) {
        horizontalDirection.normalize();
        const speed = 0.03;
        // Si al moverse, se acerca más allá de la distancia mínima, se clampa
        const moveStep = horizontalDirection.multiplyScalar(speed);
        if (currentDistance - moveStep.length() < minDistance) {
            // Coloca al enemigo exactamente a minDistance del jugador
            horizontalDirection.normalize();
            this.mesh.position.x = player.position.x - horizontalDirection.x * minDistance;
            this.mesh.position.z = player.position.z - horizontalDirection.z * minDistance;
        } else {
            this.mesh.position.add(moveStep);
        }
        } else {
        // Si ya está muy cerca, se mantiene a la distancia mínima
        horizontalDirection.normalize();
        this.mesh.position.x = player.position.x - horizontalDirection.x * minDistance;
        this.mesh.position.z = player.position.z - horizontalDirection.z * minDistance;
        }
    
        // Hacer que el enemigo mire al jugador
        this.mesh.lookAt(player.position);
    }

}


export function spawnEnemies(scene, grid, cellSize, enemyCount = 8) {
  if (!grid) {
    console.error("spawnEnemies: grid es undefined");
    return [];
  }
  const openCells = getOpenCells(grid);
  if (openCells.length === 0) return [];
  
  const enemies = [];
  for (let i = 0; i < enemyCount; i++) {
    const cell = openCells[Math.floor(Math.random() * openCells.length)];
    const posX = cell.col * cellSize + cellSize / 2;
    const posZ = cell.row * cellSize + cellSize / 2;
    const enemy = new Enemy(); // Suponiendo que ya tienes la clase Enemy definida
    enemy.mesh.position.set(posX, 1, posZ);
    enemies.push(enemy);
    scene.add(enemy.mesh);
  }
  return enemies;
}


export function updateEnemies(enemies, player, updateHUDCallback) {
    const touchDistance = 2.5; // Distancia a la que se considera "colisión"
    enemies.forEach((enemy) => {
      enemy.update(player);


      if (enemy.isAlive) {
          const distance = enemy.mesh.position.distanceTo(player.position);
          if (distance < touchDistance) {
            player.health -= 0.1;
            if (player.health < 0) player.health = 0;
            if (updateHUDCallback) updateHUDCallback();
          }
        }
    });
}

