import * as THREE from 'https://unpkg.com/three@0.151.3/build/three.module.js';

export class Weapon {

    constructor(camera){
        // console.log("Camara recibida en Weapon:", camera);
        this.camera = camera;
        this.idleTexture = new THREE.TextureLoader().load("../assets/arma1.png", () => {console.log("Weapon")});
        this.fireTexture = new THREE.TextureLoader().load("../assets/arma2.png", () => {console.log("Fire")});
        this.punchTexture = new THREE.TextureLoader().load("../assets/arma3.png", () => {console.log("Punch")});

        const geometry = new THREE.PlaneGeometry(1,1);

        const material = new THREE.MeshBasicMaterial({
                map: this.idleTexture,
                side: THREE.DoubleSide,
                transparent: true,
            });
            
        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.frustumCulled = false;
        this.mesh.renderOrder = 999;

        this.mesh.position.set(0,-0.65,-1.5);

        this.mesh.scale.set(1,1,1);

        // this.mesh.rotation.y = Math.PI;

        this.camera.add(this.mesh);

    }

    fire () {
        this.mesh.material.map = this.fireTexture;
        this.mesh.material.needsUpdate = true;

        setTimeout(() => {
            this.mesh.material.map = this.idleTexture;
            this.mesh.material.needsUpdate = true;
        }, 150);
    }

    punch(){
        this.mesh.material.map = this.punchTexture;
        this.mesh.material.needsUpdate = true;
        setTimeout(() => {
            this.mesh.material.map = this.idleTexture;
            this.mesh.material.needsUpdate = true;
        }, 250);
    }
    
}