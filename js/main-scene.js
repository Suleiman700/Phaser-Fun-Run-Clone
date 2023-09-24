import Player from "./player.js";
import createRotatingPlatform from "./create-rotating-platform.js";
import {scene_defaultBlue} from './scenes/default-blue.js';
import MysteryBox from './mystery-box/MysteryBox.js';
import Events_Player from './events/Events_Player.js';
import Events_MysteryBox from './events/Events_MysteryBox.js';
import Events_Controls from './events/Events_Controls.js';
import UI_InGameButtons from './ui/UI_InGameButtons.js';
import InGameItems from './items/InGameItems.js';

const MysteryBoxIns = new MysteryBox()


export default class MainScene extends Phaser.Scene {
    preload() {
        const level = scene_defaultBlue

        this.load.tilemapTiledJSON("map", level.sceneFile);
        this.load.image(
            "kenney-tileset-64px-extruded",
            "../assets/tilesets/kenney-tileset-64px-extruded.png"
        );

        // Load effects
        this.load.spritesheet('kaboom', '../assets/tilesets/effects/kaboom.png', {
            frameWidth: 64,
            frameHeight: 64
        });


        this.load.image("wooden-plank", "../assets/images/wooden-plank.png");
        this.load.image("saw", "../assets/images/items/saw.png");
        this.load.image("block", "../assets/images/block.png");
        this.load.image("coin", "../assets/images/items/coin.png");
        this.load.image("mysteryBox", "../assets/images/mystery-box.png");

        this.load.spritesheet(
            "player",
            "../assets/spritesheets/0x72-industrial-player-32px-extruded.png",
            {
                frameWidth: 32,
                frameHeight: 32,
                margin: 1,
                spacing: 2,
            }
        );

        this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json");
    }

    create() {

        const collisionCategoryPlayer = 1; // Use a unique category number (e.g., 1)
        const collisionCategoryMysteryBox = 2; // Use a unique category number (e.g., 2)

        const map = this.make.tilemap({key: "map"});
        const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
        const groundLayer = map.createLayer("Ground", tileset, 0, 0);
        const lavaLayer = map.createLayer("Lava", tileset, 0, 0);
        map.createLayer("Background", tileset, 0, 0);
        map.createLayer("Foreground", tileset, 0, 0).setDepth(10);





        // Set colliding tiles before converting the layer to Matter bodies
        groundLayer.setCollisionByProperty({collides: true});
        lavaLayer.setCollisionByProperty({collides: true});

        // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
        // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
        // rectangle body (similar to AP).
        this.matter.world.convertTilemapLayer(groundLayer);
        this.matter.world.convertTilemapLayer(lavaLayer);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // The spawn point is set using a point object inside of Tiled (within the "Spawn" object layer)
        const {x, y} = map.findObject("Spawn", (obj) => obj.name === "Spawn Point");
        this.player = new Player(this, x, y);
        // this.player.sprite.setCollisionCategory(1);

        // Events
        this.events.Events_Player = new Events_Player(this)
        this.events.Events_MysteryBox = new Events_MysteryBox(this)
        this.events.Events_Controls = new Events_Controls(this)
        this.ui = {
            UI_InGameButtons: new UI_InGameButtons(this)
        }
        this.items = {
            inGameItems: new InGameItems(this),
        }

        // Sensors
        const rectJump = map.findObject("Sensors", (obj) => obj.name === "jump");
        const jumpSensor = this.matter.add.rectangle(
            rectJump.x + rectJump.width / 2,
            rectJump.y + rectJump.height / 2,
            rectJump.width,
            rectJump.height,
            {
                isSensor: true, // It shouldn't physically interact with other bodies
                isStatic: true, // It shouldn't move
            }
        );
        this.sensors = {
            jumpSensor: jumpSensor
        }

        // Set up collision events with mystery box
        const mysteryBoxLayer = map.getObjectLayer('mysteryBoxLayer')['objects'];
        mysteryBoxLayer.forEach(object => {
            const mysteryBox = this.matter.add.image(object.x, object.y, "mysteryBox")
            mysteryBox.setStatic(true)
            mysteryBox.setScale(0.1)
            mysteryBox.setCollisionCategory(1);

            this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
                objectA: this.player.sprite,
                objectB: mysteryBox,
                callback: () => {
                    this.events.Events_MysteryBox.event_collideWithMysteryBox(this.player, mysteryBox)
                },
                context: this,
            });
        });

        this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
            objectA: this.player.sprite,
            objectB: jumpSensor,
            callback: () => {
                console.log('jump')
                this.player.sprite.setVelocityY(-20)
            },
            context: this,
        });

        // Smoothly follow the player
        this.cameras.main.startFollow(this.player.sprite, false, 0.5, 0.5);

        this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
            objectA: this.player.sprite,
            callback: this.onPlayerCollide,
            context: this,
        });


        const CoinLayer = map.getObjectLayer('coinLayer')['objects'];
        CoinLayer.forEach(object => {
            console.log(object.x, object.y)

            const saw = this.matter.add
                .image(object.x, object.y, "saw", {
                    restitution: 0,
                    friction: 10,
                    density: 0.0001,
                    shape: "circle",
                })
                .setScale(0.08)
                .setVelocityX(7);

            saw.setCollisionCategory(1); // Use a unique category number (e.g., 1)

            this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
                objectA: saw,
                objectB: jumpSensor,
                callback: () => {
                    console.log('saw jump')
                    saw.setVelocityY(-10)
                    saw.setVelocityX(10)
                },
                context: this,
            });

            // const coin = this.matter.add.image(object.x, object.y, "emoji");
            // coin.setStatic(true);
            // coin.setScale(50 / coin.width, 50 / coin.height);

            // Set up collision filtering for the coin
            // coin.setCollisionCategory(0); // Use a unique category number (e.g., 0)
            // coin.setCollidesWith([1]); // Disable collisions with category 1 (player category)
        });



        // Load up some crates from the "Crates" object layer created in Tiled
        map.getObjectLayer("Crates").objects.forEach((crateObject) => {
            const {x, y, width, height} = crateObject;

            // Tiled origin for coordinate system is (0, 1), but we want (0.5, 0.5)
            this.matter.add
                .image(x + width / 2, y - height / 2, "block")
                .setBody({shape: "rectangle", density: 0.001});
        });

        // Create platforms at the point locations in the "Platform Locations" layer created in Tiled
        map.getObjectLayer("Platform Locations").objects.forEach((point) => {
            createRotatingPlatform(this, point.x, point.y);
        });

        // Create a sensor at rectangle object created in Tiled (under the "Sensors" layer)
        const rect = map.findObject("Sensors", (obj) => obj.name === "Celebration");
        const celebrateSensor = this.matter.add.rectangle(
            rect.x + rect.width / 2,
            rect.y + rect.height / 2,
            rect.width,
            rect.height,
            {
                isSensor: true, // It shouldn't physically interact with other bodies
                isStatic: true, // It shouldn't move
            }
        );
        this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
            objectA: this.player.sprite,
            objectB: celebrateSensor,
            callback: this.onPlayerWin,
            context: this,
        });

        // Create a sensor at rectangle object created in Tiled (under the "Sensors" layer)
        const rect2 = map.findObject("Sensors", (obj) => obj.name === "explosion");
        const spawnSawSensor = this.matter.add.rectangle(
            rect2.x + rect2.width / 2,
            rect2.y + rect2.height / 2,
            rect2.width,
            rect2.height,
            {
                isSensor: true, // It shouldn't physically interact with other bodies
                isStatic: true, // It shouldn't move
            }
        );

        this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
            objectA: this.player.sprite,
            objectB: spawnSawSensor,
            callback: (_e) => {
                // const randomPickedItem = MysteryBoxIns.pickRandomItem()
                // console.log(randomPickedItem)
                // document.querySelector('#picked-item-image').src = randomPickedItem.imagePath;

                // Check if the player's sprite is defined and has a position
                // if (this.player.sprite && this.player.sprite.x !== undefined && this.player.sprite.y !== undefined) {
                //     // Create the 'kaboom' animation
                //     this.anims.create({
                //         key: 'kaboom-boom',
                //         frames: this.anims.generateFrameNumbers('kaboom', {
                //             start: 0,
                //             end: 7,
                //         }),
                //         repeat: 0,
                //         frameRate: 8
                //     });
                //
                //     // Create an image at the player's position to play the animation
                //     // const kaboom = this.add.image(this.player.sprite.x, this.player.sprite.y, 'kaboom');
                //     const kaboom = this.add.sprite(this.player.sprite.x, this.player.sprite.y, 'kaboom');
                //     kaboom.setScale(3); // Set the scale if needed
                //
                //     // Play the 'kaboom' animation if it exists
                //     if (kaboom.anims) {
                //         kaboom.anims.play('kaboom-boom');
                //
                //         // Remove the image when the animation completes
                //         kaboom.on('animationcomplete', () => {
                //             kaboom.destroy();
                //         });
                //     } else {
                //         console.error('Animation not found.');
                //     }
                // } else {
                //     console.error('Player sprite or position is undefined.');
                // }
            },
            context: this,
        });

        // this.unsubscribeCelebrate = this.matterCollision.addOnCollideStart({
        //     objectA: this.player.sprite,
        //     objectB: spawnSawSensor,
        //     callback: (_e) => {
        //         console.log(_e);
        //         // Set the 'src' attribute of the HTML 'img' element with the ID 'picked-item-image'
        //         document.querySelector('#picked-item-image').src = '../assets/images/items/saw.png';
        //         // // Assuming you have a reference to your sensor as 'spawnSawSensor'
        //         // const sensorX = spawnSawSensor.position.x;
        //         // const sensorY = spawnSawSensor.position.y;
        //         //
        //         // // Create the saw sprite
        //         // const saw = this.matter.add.image(sensorX, sensorY, 'saw');
        //         //
        //         // // Set the width and height
        //         // const newWidth = 50; // Replace with your desired width
        //         // const newHeight = 50; // Replace with your desired height
        //         //
        //         // saw.setScale(newWidth / saw.width, newHeight / saw.height);
        //         //
        //         // // Set the velocity of the saw (adjust the values as needed)
        //         // saw.setVelocityX(20);
        //         // saw.setVelocityY(5);
        //         //
        //         // // Set the desired lifetime for the saw object in milliseconds (e.g., 3000ms or 3 seconds)
        //         // const lifetime = 3000;
        //         //
        //         // // Create a timer to destroy the saw object after the specified lifetime
        //         // this.time.delayedCall(lifetime, () => {
        //         //   // This function will be called after the specified lifetime
        //         //   saw.destroy(); // Destroy the saw object
        //         // }, [], this);
        //         //
        //         // this.matterCollision.removeOnCollideStart({
        //         //   objectA: this.player.sprite,
        //         //   objectB: spawnSawSensor,
        //         // });
        //     },
        //     context: this,
        // });

        const help = this.add.text(16, 16, "Arrows/WASD to move the player.", {
            fontSize: "18px",
            padding: {x: 10, y: 5},
            backgroundColor: "#ffffff",
            fill: "#000000",
        });
        help.setScrollFactor(0).setDepth(1000);
    }

    onPlayerCollide({gameObjectB}) {
        if (!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) return;

        const tile = gameObjectB;

        // Check the tile property set in Tiled (you could also just check the index if you aren't using
        // Tiled in your game)
        if (tile.properties.isLethal) {
            // Unsubscribe from collision events so that this logic is run only once
            this.unsubscribePlayerCollide();

            this.player.freeze();
            const cam = this.cameras.main;
            cam.fade(250, 0, 0, 0);
            cam.once("camerafadeoutcomplete", () => this.scene.restart());
        }
    }

    onPlayerWin() {
        // Celebrate only once
        this.unsubscribeCelebrate();

        // Drop some heart-eye emojis, of course
        for (let i = 0; i < 35; i++) {
            const x = this.player.sprite.x + Phaser.Math.RND.integerInRange(-50, 50);
            const y = this.player.sprite.y - 150 + Phaser.Math.RND.integerInRange(-10, 10);
            this.matter.add
                .image(x, y, "emoji", "1f60d", {
                    restitution: 1,
                    friction: 0,
                    density: 0.0001,
                    shape: "circle",
                })
                .setScale(0.5);
        }
    }
}
