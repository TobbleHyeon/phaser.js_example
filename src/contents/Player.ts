import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "dude");

        // Initialize physics and animations
        this.scene.physics.world.enable(this);
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        this.setGravityY(700);
        this.scene.add.existing(this);
        this.initAnimations();
    }

    initAnimations() {
        this.scene.anims.create({
            key: "left",
            frames: this.scene.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20,
        });

        this.scene.anims.create({
            key: "right",
            frames: this.scene.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1,
        });
    }

    setCursors() {
        this.cursors = this.scene.input.keyboard?.createCursorKeys();
    }

    update() {
        if (this.cursors && this.body) {
            if (this.cursors.left.isDown) {
                this.setVelocityX(-160);
                this.anims.play("left", true);
            } else if (this.cursors.right.isDown) {
                this.setVelocityX(160);
                this.anims.play("right", true);
            } else {
                this.setVelocityX(0);
                this.anims.play("turn");
            }

            if (this.cursors.up.isDown && this.body.touching.down) {
                this.setVelocityY(-550);
            }
        }
    }
}
