
import {config} from '../config/config.js';
import UI_InGameButtons from '../ui/UI_InGameButtons.js';

export default class Events_Controls {

    constructor(_scene) {
        this.scene = _scene
    }

    usePickedItem() {
        // Get player picked mystery box item
        const pickedItemData = this.scene.player.mysteryBox.pickedItemData

        // Spawn item
        if (pickedItemData) {
            const coords = {
                x: this.scene.player.sprite.x + 50,
                y: this.scene.player.sprite.y,
            }
            this.scene.items.inGameItems.spawnItem(pickedItemData, coords)
        }

        // Remove used mystery box item
        if (config.mysteryBox.removeItemAfterUsage.state) {
            this.scene.ui.UI_InGameButtons.clearPickedMysteryBoxItemImage()
            this.scene.player.removeUsedMysteryBoxItem()
        }

    }

}
