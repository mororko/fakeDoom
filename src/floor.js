// src/floor.js
import * as THREE from 'https://unpkg.com/three@0.151.3/build/three.module.js';


export function createFloor(scene, cols, rows, cellSize, texturePath) {
  const floorWidth = cols * cellSize;
  const floorDepth = rows * cellSize;
  const textureLoader = new THREE.TextureLoader();
  const floorTexture = textureLoader.load(texturePath);
  
  // Configuramos la textura para que se repita en función del tamaño del suelo.
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  // Por ejemplo, repetimos 10 veces a lo ancho y 10 veces a lo profundo; ajusta según necesites.
  floorTexture.repeat.set(floorWidth / 10, floorDepth / 10);
  
  const geometry = new THREE.PlaneGeometry(floorWidth, floorDepth);
  const material = new THREE.MeshPhongMaterial({ map: floorTexture, side: THREE.DoubleSide });
  const floor = new THREE.Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2;
  // Centrar el suelo en el mundo (si tu grid empieza en 0,0,0, desplazarlo)
  floor.position.set(floorWidth / 2, 0, floorDepth / 2);
  
  scene.add(floor);
  return floor;
}
