import * as Phaser from 'phaser';
import Model from './model';

const RESULT_CASES = ['best', 'worst', 'default'];

function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
}

export default class Result extends Phaser.Scene {
    models: Model[];
    bertModel: Model;

    constructor() {
        super('result');
    }

    init(data: { score: number }) {
        const score = sigmoid(3 * data.score / 10000) * 100;
        this.bertModel = new Model('バート', score, '#e65f57');
    }

    preload() {
        RESULT_CASES.forEach(resultCase => {
            this.load.image(resultCase, `./assets/result_${resultCase}.png`);
            this.load.audio(resultCase, `./assets/result_${resultCase}.mp3`);
        });

        this.load.audio('title', './assets/start.mp3');

        this.sound.setVolume(0.5);
    }

    create() {
        this.cameras.main.setBackgroundColor('#eeeeee');

        this.models = [];
        this.models.push(new Model('ティーファイブ', 90.0, 'black'));
        this.models.push(new Model('アルバート', 89.0, 'black'));
        this.models.push(new Model('ロベルタ', 88.0, 'black'));

        this.models.push(this.bertModel);
        this.models.sort((a, b) => b.score - a.score);  // スコア降順

        this.drawBoard();

        this.drawChar();
        
        this.time.addEvent({
            delay: 2000,
            callback: this.returnHandler,
            callbackScope: this
        });
    }

    update() {}

    drawBoard() {
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

        this.models.forEach(model => {
            const rank = this.models.indexOf(model) + 1;
            const name = model.name;
            const score = model.score;

            const modelY = headerY + rowHeight * rank;
            const modelConfig = { color: model.color };

            this.add.text(rankX, modelY, rank.toString(), modelConfig).setOrigin(1, 0.5);
            this.add.text(nameX, modelY, name + 'ちゃん', modelConfig).setOrigin(0, 0.5);
            this.add.text(scoreX, modelY, score.toFixed(2), modelConfig).setOrigin(1, 0.5);
        });
    }

    /**
     * キャラを描画
     */
    drawChar() {
        const charX = 120;
        const charY = 200;

        const rank = this.models.indexOf(this.bertModel) + 1;

        let key = '';
        switch (rank) {
            case 1:  // ソータ
                key = 'best';
                this.add.text(80, 120, 'ソータ！', {
                    fontSize: 'large',
                    fontStyle: 'bold',
                    color: '#e65f57'
                }).setOrigin(0.5);
                break;
            case this.models.length:  // 最下位
                key = 'worst';
                break;
            default:
                key = 'default';
                break;
        }

        this.add.image(charX, charY, key);
        this.sound.add(key);
        this.sound.play(key);
    }

    /**
     * クリックでタイトルに戻る
     */
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

        this.sound.add('title');

        this.input.manager.enabled = true;
        this.input.once('pointerdown', function () {
            this.sound.play('title');
            this.scene.start('title');
        }, this);
    }
}
