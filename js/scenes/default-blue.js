
export const scene_defaultBlue = {
    name: 'Default Blue',
    sceneFile: '../assets/tilemaps/long_level.json',
    objects: {
        mysteryBox: {
            scale: 0.1,
            static: true,
            collisionCategory: 1,
        },
    },
    inGameItems: {
        saw: {
            lifetime: 5000,
            velocityX: 10,
            velocityY: -10,
        }
    },
    sensors: {
        jumpSensor: {
            velocityY: -10,
            velocityX: 10
        },
    },
    sounds: {
        playerJump: {
            filePath: '../assets/sounds/cartoon-jump.mp3',
        },
        springBounce: {
            filePath: '../assets/sounds/spring-bounce.mp3',
        },
    },
}
