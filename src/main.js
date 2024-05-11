// Annie McKay
// Created: 4/24/2024
// Phaser: 3.70.0
//
// shooter
//
// An example of basic game mechanics

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 1500,
    height: 800,
    backgroundColor: '#4488aa',
    scene: [shooter]
}

const game = new Phaser.Game(config);