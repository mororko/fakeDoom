import * as THREE from 'https://unpkg.com/three@0.151.3/build/three.module.js';

export function createWall(scene, gridX, gridZ, cellSize, wallHeight, texturePath = null, isDoor = false) {
  let material;
  if (!isDoor && texturePath) {
    const textureLoader = new THREE.TextureLoader();
    const wallTexture = textureLoader.load(texturePath);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(1, 1);
    material = new THREE.MeshPhongMaterial({ map: wallTexture });
  } else {
    // Material para puertas o si no se proporciona textura: color gris
      material = new THREE.MeshPhongMaterial({
      // color: 0x808080,
      transparent: true,
      opacity: 0,  // 20% opaco, 80% transparente
      depthWrite: false
    });
  }

  const geometry = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(
    gridX * cellSize + cellSize / 2,
    wallHeight / 2,
    gridZ * cellSize + cellSize / 2
  );
  
  // Si es puerta, marcamos el objeto para no considerarlo en las colisiones
  if (isDoor) {
    wall.userData.isDoor = true;
  } 
  
  scene.add(wall);
  return wall;
}

export function createMapFromGrid(scene, grid, cellSize, wallHeight, texturePath = null) {
  const walls = [];
  for (let z = 0; z < grid.length; z++) {
    for (let x = 0; x < grid[z].length; x++) {
      if (grid[z][x] === 1 || grid[z][x] === 2) {
        const isDoor = grid[z][x] === 2;
        const wall = createWall(scene, x, z, cellSize, wallHeight, texturePath, isDoor);
        walls.push(wall);
      }
    }
  }
  return walls;
}