export function updateHUD(player) {
    console.log('updateHUD');

    const healthValue = document.getElementById('healthValue');
    if (healthValue) {
        healthValue.style.width = player.health + "%";
    }

    const ammoValue = document.getElementById('ammoValue');
    if (ammoValue) {
        const ammoPct = (player.ammo / 50) * 100;
        ammoValue.style.width = ammoPct + "%";
    }

}