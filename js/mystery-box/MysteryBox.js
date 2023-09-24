
import { mysteryboxItems } from './mysterybox-items.js';

export default class MysteryBox {
    constructor() {}

    /**
     * Pick random item from mystery box
     * @return {{imagePath: string, name: string}}
     */
    pickRandomItem() {
        const randomIndex = Math.floor(Math.random() * mysteryboxItems.length);
        return mysteryboxItems[randomIndex]
    }
}
