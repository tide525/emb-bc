import * as Phaser from 'phaser';

export default class Title extends Phaser.Scene {
    constructor() {
        super('title');
    }

    preload() {
        this.load.image('title', 'assets/result_default.png');

        this.load.audio('start', 'assets/start.mp3');

        this.sound.setVolume(0.5);
    }

    create() {
        this.cameras.main.setBackgroundColor('#eeeeee');

        this.add.image(320, 200, 'title');
        this.sound.add('start');

        this.add.text(320, 80, '埋め込め！バートちゃん', {
            fontSize: '2em',
            fontStyle: 'bold',
            color: 'black'
        }).setOrigin(0.5);

        const startingText = this.add.text(320, 320, 'クリックでスタート', {
            fontSize: '2em',
            color: '#2b5283'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startingText,
            alpha: 0,
            duration: 1000,
            ease: 'Stepped',
            repeat: -1,
            repeatDelay: 1000,
        });

        this.input.manager.enabled = true;

        this.input.once('pointerdown', function () {
            this.sound.play('start');
            this.scene.start('game');
        }, this);
    }
}
