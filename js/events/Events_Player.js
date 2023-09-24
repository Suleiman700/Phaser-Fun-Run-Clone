
import {config} from '../config/config.js';

export default class Events_Player {

    constructor(_scene) {
        this.scene = _scene
    }

    event_pickupMysteryBoxItem(_itemData) {
        if (config.debug.events.player.state) {
            console.log('[Events_Player] triggered: event_pickupMysteryBoxItem()')
        }

        this.scene.player.giveMysteryBoxItem(_itemData)
    }
}
