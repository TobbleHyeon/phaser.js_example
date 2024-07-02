import Phaser from "phaser";
import Player from "./Player";

export default class MyScene extends Phaser.Scene {
    platforms: Phaser.Physics.Arcade.StaticGroup;
    player: Player;

    constructor() {
        super({ key: "myScene" });
        this.platforms = null!;
        this.player = null!;
    }

    preload() {
        this.load.image("sky", "assets/sky.png");
        this.load.image("ground", "assets/platform.png");
        this.load.image("star", "assets/star.png");
        this.load.image("bomb", "assets/bomb.png");
        this.load.spritesheet("dude", "assets/dude.png", { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.add.image(400, 300, "sky");

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, "ground").setScale(2).refreshBody();
        this.platforms.create(600, 400, "ground");
        this.platforms.create(100, 250, "ground");
        this.platforms.create(750, 220, "ground");

        this.player = new Player(this, 100, 450);
        this.physics.add.collider(this.player, this.platforms);

        // Set cursors after player is added to the scene
        this.player.setCursors();
    }

    update() {
        this.player.update();
    }
}
