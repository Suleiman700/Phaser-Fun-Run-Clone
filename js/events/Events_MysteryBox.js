
import {config} from '../config/config.js';
import Events_Player from './Events_Player.js';
import UI_InGameButtons from '../ui/UI_InGameButtons.js';
import MysteryBox from '../mystery-box/MysteryBox.js';

export default class Events_MysteryBox {

    constructor(_scene) {
        this.scene = _scene
        this.mysteryBoxIns = new MysteryBox()
    }

    event_collideWithMysteryBox(_playerIns, _mysteryBoxObject) {
        if (config.debug.events.mysteryBox.state) {
            console.log('[Events_MysteryBox] triggered: event_collideWithMysteryBox()')
        }

        // Pick random mystery box item
        const randomItemData = this.mysteryBoxIns.pickRandomItem()
        this.scene.events.Events_Player.event_pickupMysteryBoxItem(randomItemData)

        // Destroy mystery box
        _mysteryBoxObject.destroy()

        // Draw picked mystery box item
        this.scene.ui.UI_InGameButtons.setPickedMysteryBoxItemImage(randomItemData.imagePath)
    }
}
