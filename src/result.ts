import * as Phaser from 'phaser';

import Model from './model';

function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
}

export default class Result extends Phaser.Scene {
    bert: Model;

    models: Model[];

    constructor() {
        super('result');
    }

    init(data: { score: number }) {
        const score = sigmoid(3 * data.score / 10000) * 100;

        this.bert = new Model('バート', score, '#e65f57');
    }

    preload() {
        this.load.image('best', './assets/result_best.png');
        this.load.image('worst', './assets/result_worst.png');
        this.load.image('default', './assets/result_default.png');

        this.load.audio('best', './assets/result_best.mp3');
        this.load.audio('worst', './assets/result_default.mp3');
        this.load.audio('default', './assets/result_default.mp3');

        this.load.audio('title', './assets/start.mp3');

        this.sound.setVolume(0.5);
    }

    create() {
        this.cameras.main.setBackgroundColor('#eeeeee');

        this.models = [];
        this.models.push(new Model('ティーファイブ', 90.0, 'black'));
        this.models.push(new Model('アルバート', 89.0, 'black'));
        this.models.push(new Model('ロベルタ', 88.0, 'black'));

        this.models.push(this.bert);

        this.models.sort((a, b) => b.score - a.score);  // スコア降順

        this.createBoard();

        this.createChar();
        
        this.sound.add('title');

        this.time.addEvent({
            delay: 2000,
            callback: this.returnHandler,
            callbackScope: this
        });
    }

    update() {}

    createBoard() {
        const rowWidth = 400;
        const rowHeight = 40;

        this.add.rectangle(400, 80, rowWidth, rowHeight, 0x2b5283);

        const rankX = 240;
        const nameX = 320;
        const scoreX = 600;
        const headerY = 80;

        const headerConfig = { color: 'white' };

        this.add.text(rankX, headerY, 'ランク', headerConfig).setOrigin(1, 0.5);
        this.add.text(nameX, headerY, 'モデル', headerConfig).setOrigin(0, 0.5);
        this.add.text(scoreX, headerY, 'スコア', headerConfig).setOrigin(1, 0.5);

        for (let i = 0; i < this.models.length; i++) {
            const model = this.models[i];

            const modelRank = (i + 1).toString();
            const modelName = model.name + 'ちゃん';
            const modelScore = model.score.toFixed(2);

            const modelY = headerY + rowHeight * (i + 1);
            const modelConfig = { color: model.color };

            this.add.text(rankX, modelY, modelRank, modelConfig).setOrigin(1, 0.5);
            this.add.text(nameX, modelY, modelName, modelConfig).setOrigin(0, 0.5);
            this.add.text(scoreX, modelY, modelScore, modelConfig).setOrigin(1, 0.5);
        }
    }

    createChar() {
        const charX = 120;
        const charY = 200;

        const rank = this.models.indexOf(this.bert) + 1;

        switch (rank) {
            case 1:
                this.add.image(charX, charY, 'best');

                this.add.text(80, 120, 'ソータ！', {
                    fontSize: 'large',
                    fontStyle: 'bold',
                    color: '#e65f57'
                }).setOrigin(0.5);

                this.sound.add('best');
                this.sound.play('best');
                break;

            case this.models.length:
                this.add.image(charX, charY, 'worst');

                this.sound.add('worst');
                this.sound.play('worst');
                break;

            default:
                this.add.image(charX, charY, 'default');

                this.sound.add('default');
                this.sound.play('default');
                break;
        }
    }

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
