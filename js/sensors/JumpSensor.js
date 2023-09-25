
export default class JumpSensor {
    constructor(_scene) {
        this.scene = _scene

        this.rect = this.scene.map.findObject("Sensors", (obj) => obj.name === "jump");
        this.sensor = this.scene.matter.add.rectangle(
            this.rect.x + this.rect.width / 2,
            this.rect.y + this.rect.height / 2,
            this.rect.width,
            this.rect.height,
            {
                isSensor: true, // It shouldn't physically interact with other bodies
                isStatic: true, // It shouldn't move
            }
        );
    }

    /**
     * Trigger jump sensor
     * @param _objectA {object} E.g. this.player.sprite or saw ... etc
     */
    trigger(_objectA) {
        this.scene.sounds.springBounce.play()
    }

}
