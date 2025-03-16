// src/portal.js
import * as THREE from 'https://unpkg.com/three@0.151.3/build/three.module.js';

export function createPortal(scene, position, cellSize, duration = 300) {
  const textureLoader = new THREE.TextureLoader();
  const portalTexture = textureLoader.load('./assets/portal.png');
  const material = new THREE.SpriteMaterial({ 
    map: portalTexture, 
    transparent: true 
  });
  const portalSprite = new THREE.Sprite(material);
  
  // Ajusta la escala del portal en función del cellSize (por ejemplo, ocupa la celda)
  portalSprite.scale.set(cellSize, cellSize, 1);
  portalSprite.position.copy(position);
  
  scene.add(portalSprite);
  
  // Remover el portal después del tiempo indicado (por defecto, 1500 ms)
  setTimeout(() => {
    scene.remove(portalSprite);
  }, duration);
  
  return portalSprite;
}