
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
                    .image(x, y, _itemData.name, {
                        restitution: 0,
                        friction: 10,
                        density: 0.0001,
                        shape: "circle",
                    })
                    .setScale(0.08)
                    .setVelocityX(20)

                // Register saw sensors
                this.scene.unsubscribeCelebrate = this.scene.matterCollision.addOnCollideStart({
                    objectA: saw,
                    objectB: this.scene.sensors.jumpSensor,
                    callback: () => {
                        console.log('saw jump')
                        saw.setVelocityY(-10)
                        saw.setVelocityX(10)
                    },
                    context: this,
                });
                break
        }
    }
}
