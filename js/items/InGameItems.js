
export default class InGameItems {
    constructor(_scene) {
        this.scene = _scene
    }

    /**
     * Spawn item in game
     * @param _itemData {object}
     * @param _coords {object} E.g. {x, y}
     */
    spawnItem(_itemData, _coords) {
        const x = _coords.x // this.scene.player.sprite.x + 50
        const y = _coords.y // this.scene.player.sprite.y

        switch (_itemData.name) {
            case 'saw':
                const saw = this.scene.matter.add
                    .sprite(x, y, _itemData.name)
                    .setCircle(50, { restitution: 0, friction: 0, density: 0.01 })
                    .setScale(0.1)
                    .setVelocityX(20);

                // Register saw sensors
                this.scene.unsubscribeCelebrate = this.scene.matterCollision.addOnCollideStart({
                    objectA: saw,
                    objectB: this.scene.sensors.jumpSensor.sensor,
                    callback: () => {
                        console.log('spawned saw hit jump sensor')
                        saw.setVelocityY(this.scene.levelConfig.inGameItems.saw.velocityY)
                        saw.setVelocityX(this.scene.levelConfig.inGameItems.saw.velocityX)
                        this.scene.sensors.jumpSensor.trigger()
                    },
                    context: this,
                });

                // Set up a timer to periodically adjust the velocity (e.g., every frame)
                const velocityUpdateInterval = 16; // Adjust as needed
                const velocityUpdateIntervalId = setInterval(() => {
                    // Update the saw's velocity to maintain the desired x-velocity
                    saw.setVelocityX(this.scene.levelConfig.inGameItems.saw.velocityX); // Adjust the x-velocity as needed
                }, velocityUpdateInterval);

                // Destroy object at lifetime
                setTimeout(() => {
                    clearInterval(velocityUpdateIntervalId);
                    saw.destroy()
                }, this.scene.levelConfig.inGameItems.saw.lifetime)

                break
        }
    }
}
