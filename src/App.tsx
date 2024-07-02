import { useEffect, useRef } from "react";
import "./App.css";
import Phaser from "phaser";

function App() {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        class MyScene extends Phaser.Scene {
            platforms: Phaser.Physics.Arcade.StaticGroup | null;
            player: Phaser.Physics.Arcade.Sprite | null;
            cursors: Phaser.Types.Input.Keyboard.CursorKeys | null;
            stars: Phaser.Physics.Arcade.Group | null;
            bombs: Phaser.Physics.Arcade.Group | null;
            score: number;
            scoreText: Phaser.GameObjects.Text | null;
            gameOver: boolean;

            constructor() {
                super({ key: "myScene" });
                this.platforms = null;
                this.player = null;
                this.cursors = null;
                this.stars = null;
                this.bombs = null;
                this.score = 0;
                this.scoreText = null;
                this.gameOver = false;
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

                this.player = this.physics.add.sprite(100, 450, "dude");
                this.player.setBounce(0.2);
                this.player.setCollideWorldBounds(true);
                this.player.setGravityY(700);
                this.physics.add.collider(this.player, this.platforms);

                this.anims.create({
                    key: "left",
                    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
                    frameRate: 10,
                    repeat: -1,
                });

                this.anims.create({
                    key: "turn",
                    frames: [{ key: "dude", frame: 4 }],
                    frameRate: 20,
                });

                this.anims.create({
                    key: "right",
                    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
                    frameRate: 10,
                    repeat: -1,
                });

                if (this.input.keyboard) {
                    this.cursors = this.input.keyboard.createCursorKeys();
                }

                this.stars = this.physics.add.group({
                    key: "star",
                    repeat: 11,
                    setXY: { x: 12, y: 0, stepX: 70 },
                });

                this.stars.children.iterate((child) => {
                    const star = child as Phaser.Physics.Arcade.Sprite;
                    star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                    return false;
                });

                this.physics.add.collider(this.stars, this.platforms);
                this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

                this.bombs = this.physics.add.group();
                this.physics.add.collider(this.bombs, this.platforms);
                this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

                this.scoreText = this.add.text(16, 16, "별 따먹은 점수: 0", {
                    fontSize: "32px",
                    color: "#623",
                    fontStyle: "bold",
                });
            }

            update() {
                if (this.player && this.player.body && !this.gameOver) {
                    if (this.cursors && this.cursors.left.isDown) {
                        this.player.setVelocityX(-160);
                        this.player.anims.play("left", true);
                    } else if (this.cursors && this.cursors.right.isDown) {
                        this.player.setVelocityX(160);
                        this.player.anims.play("right", true);
                    } else {
                        this.player.setVelocityX(0);
                        this.player.anims.play("turn");
                    }

                    if (this.cursors && this.cursors.up.isDown && this.player.body.touching.down) {
                        this.player.setVelocityY(-650);
                    }
                }
            }

            collectStar(player: Phaser.GameObjects.GameObject, star: Phaser.GameObjects.GameObject) {
                const p = player as Phaser.Physics.Arcade.Sprite;
                const s = star as Phaser.Physics.Arcade.Sprite;
                s.disableBody(true, true);

                this.score += 10;
                this.scoreText?.setText("별 따먹은 점수: " + this.score);

                if (this.stars?.countActive(true) === 0) {
                    this.stars.children.iterate((child) => {
                        const star = child as Phaser.Physics.Arcade.Sprite;
                        star.enableBody(true, Phaser.Math.Between(0, 800), 0, true, true);
                        return false;
                    });

                    const x = p.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
                    const bomb = this.bombs!.create(x, 16, "bomb") as Phaser.Physics.Arcade.Sprite;
                    bomb.setBounce(1);
                    bomb.setCollideWorldBounds(true);
                    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
                }
            }

            hitBomb(player: Phaser.GameObjects.GameObject, bomb: Phaser.GameObjects.GameObject) {
                const p = player as Phaser.Physics.Arcade.Sprite;
                const b = bomb as Phaser.Physics.Arcade.Sprite;

                this.physics.pause();

                p.setTint(0xff0000);

                p.anims.play("turn");

                this.gameOver = true;

                const gameOverText = this.add.text(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY,
                    "와 이거도 몬하네",
                    {
                        fontSize: "64px",
                        color: "#ff0000",
                    }
                );
                gameOverText.setOrigin(0.5, 0.5);
            }
        }

        if (!gameRef.current) {
            const config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                physics: {
                    default: "arcade",
                    arcade: {
                        gravity: { x: 0, y: 300 },
                        debug: false,
                    },
                },
                scene: MyScene,
                parent: "phaser-container",
            };

            gameRef.current = new Phaser.Game(config);
        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <>
            <div id='phaser-container' />
            <p className='read-the-docs'>내가 만든 쿠키~</p>
        </>
    );
}

export default App;
