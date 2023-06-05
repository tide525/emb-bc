import * as Phaser from 'phaser';

export default class Result extends Phaser.Scene {
    score: number;

    constructor() {
        super('result');
    }

    init(data: { score: number }) {
        this.score = 100 / (1 + Math.exp(-3 * data.score / 10000));
    }

    preload() {
        this.load.image('best', 'assets/result_best.png');
        this.load.image('worst', 'assets/result_worst.png');
        this.load.image('default', 'assets/result_default.png');

        this.load.audio('best', 'assets/result_best.mp3');
        this.load.audio('worst', 'assets/result_default.mp3');
        this.load.audio('default', 'assets/result_default.mp3');

        this.load.audio('title', 'assets/start.mp3');

        this.sound.setVolume(0.5);
    }

    create() {
        this.cameras.main.setBackgroundColor('#eeeeee');

        const models = [
            { name: 'ティーファイブ', score: 90.0, color: 'black' },
            { name: 'アルバート', score: 89.0, color: 'black' },
            { name: 'ロベルタ', score: 88.0, color: 'black' },
        ];

        const model = { name: 'バート', score: this.score, color: '#e65f57' };
        models.push(model);

        models.sort((a, b) => b.score - a.score);  // スコア降順

        const rankX = 240;
        const nameX = 320;
        const scoreX = 600;
        const headerY = 80;

        this.add.rectangle(400, 80, 400, 40, 0x2b5283);

        const headerConfig = { color: 'white' };

        this.add.text(rankX, headerY, 'ランク', headerConfig).setOrigin(1, 0.5);
        this.add.text(nameX, headerY, 'モデル', headerConfig).setOrigin(0, 0.5);
        this.add.text(scoreX, headerY, 'スコア', headerConfig).setOrigin(1, 0.5);

        for (let i = 0; i < models.length; i++) {
            const model = models[i];

            const modelRank = i + 1;
            const modelName = model.name + 'ちゃん';
            const modelScore = model.score.toFixed(2);

            const modelY = headerY + 40 * (i + 1);
            const modelConfig = { color: model.color };

            this.add.text(rankX, modelY, modelRank.toString(), modelConfig).setOrigin(1, 0.5);
            this.add.text(nameX, modelY, modelName, modelConfig).setOrigin(0, 0.5);
            this.add.text(scoreX, modelY, modelScore, modelConfig).setOrigin(1, 0.5);
        }

        const charX = 120;
        const charY = 200;
        const rank = models.indexOf(model) + 1;

        switch (rank) {
            case 1:
                this.add.image(charX, charY, 'best');
                this.add.text(80, 120, 'ソータ！', {
                    fontSize: 'large',
                    fontStyle: 'bold',
                    color: '#e65f57'
                }).setOrigin(0.5);
                break;
            case models.length:
                this.add.image(charX, charY, 'worst');
                break;
            default:
                this.add.image(charX, charY, 'default');
                break;
        }

        this.sound.add('best');
        this.sound.add('worst');
        this.sound.add('default');

        switch (rank) {
            case 1:
                this.sound.play('best');
                break;
            case models.length:
                this.sound.play('worst');
                break;
            default:
                this.sound.play('default');
                break;
        }

        this.sound.add('title');

        this.time.addEvent({
            delay: 2000,
            callback: this.returnHandler,
            callbackScope: this
        });
    }

    update() { }

    returnHandler() {
        const returnText = this.add.text(320, 320, 'タイトルに戻る', {
            fontSize: '2em',
            color: '#2b5283'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: returnText,
            alpha: 0,
            duration: 1000,
            ease: 'Stepped',
            repeat: -1,
            repeatDelay: 1000,
        });

        this.input.manager.enabled = true;
        this.input.once('pointerdown', function () {
            this.sound.play('title');
            this.scene.start('title');
        }, this);
    }
}
