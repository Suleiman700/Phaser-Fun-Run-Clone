import Events_Controls from '../events/Events_Controls.js';

export default class UI_InGameButtons {
    SELECTORS = {
        pickedItemImageSelector: '#picked-item-image'
    }

    constructor(_scene) {
        this.scene = _scene
    }

    /**
     * Set picked mystery box item image on UI
     * @param _imagePath {string} E.g. "../assets/images/items/saw.png"
     */
    setPickedMysteryBoxItemImage(_imagePath) {
        const element = document.querySelector(this.SELECTORS.pickedItemImageSelector)
        element.src = _imagePath;

        // Enable button
        element.style.cursor = 'pointer'

        element.addEventListener('click', () => {
            this.scene.events.Events_Controls.usePickedItem()
        })
    }

    clearPickedMysteryBoxItemImage() {
        const element = document.querySelector(this.SELECTORS.pickedItemImageSelector)
        element.src = '../assets/images/mystery-box.png';

        // Disable button
        element.style.cursor = 'auto'

        removeEventListener('click', element, true)
    }
}
