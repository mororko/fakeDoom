import * as THREE from 'https://unpkg.com/three@0.151.3/build/three.module.js';


export class Player {
    constructor(){
        // Propiedades basicas
        this.position = new THREE.Vector3(0,2,5);
        this.velocityY = 0;
        this.isOnGround = true;
        this.speed = 0.1;
        this.health = 100;
        this.ammo = 50;

        //Propiedades para la camara
        this.rotationX = 0; //arriba/abajo
        this.rotationY = 0; //derecha/izquierda
    }

    update(keys, gravity) {
        // Movimiento lateral
        const forward = new THREE.Vector3(
            -Math.sin(this.rotationY),
            0,
            -Math.cos(this.rotationY)
        ).normalize();


        const right = new THREE.Vector3(
            -Math.sin(this.rotationY + Math.PI / 2),
            0,
            -Math.cos(this.rotationY + Math.PI / 2)
        ).normalize();

        // Movimiento W,A,S,D
        if (keys["w"]) {
            this.position.add(forward.clone().multiplyScalar(this.speed));
        }
        if (keys["s"]) {
            this.position.add(forward.clone().multiplyScalar(-this.speed));
        }
        if (keys["a"]) {
            this.position.add(right.clone().multiplyScalar(this.speed));
        }
        if (keys["d"]) {
            this.position.add(right.clone().multiplyScalar(-this.speed));
        }

        // Salto
        if (keys[" "] && this.isOnGround) {
            this.velocityY = 0.2;
            this.isOnGround = false;
        }


        // gravedad
        this.velocityY -= gravity;
        this.position.y += this.velocityY;

        // Suelo
        if (this.position.y < 2) {
            this.position.y = 2;
            this.velocityY = 0;
            this.isOnGround = true;
        }




    }

    updateRotation(deltaX, deltaY) {
        this.rotationY -= deltaX * 0.002;
        this.rotationX -= deltaY * 0.002;

        // Evitar 360º
        this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationX));
    }


}