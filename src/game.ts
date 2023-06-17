import * as Phaser from 'phaser';

const NUM_EPOCHS = 3;
const EPOCH_SECONDS = 5;

const MAX_LOSS = 10;

const TOKEN_ALIVE_SECONDS = 1;
const TOKEN_BUFFER_SECONDS = 0.1;
const TOKEN_DEAD_SECONDS = 0.5;

const NUM_TOKENS_PER_EPOCH = 10;

export default class Game extends Phaser.Scene {
    tokens: string[];

    epoch: number;

    hiddenScore: number;
    loss: number;

    maxBarWidth: number;

    bar: Phaser.GameObjects.Rectangle;

    percentText: Phaser.GameObjects.Text;
    epochText: Phaser.GameObjects.Text;
    secondText: Phaser.GameObjects.Text;

    lossText: Phaser.GameObjects.Text;

    epochEvent: Phaser.Time.TimerEvent;

    constructor() {
        super('game');
    }

    preload() {
        this.load.spritesheet('study', 'assets/study.png', {
            frameWidth: 160,
            frameHeight: 160,
        });

        this.load.audio('click', 'assets/click.mp3');

        this.sound.setVolume(0.5);
    }

    create() {
        fetch('assets/vocab.txt')
            .then(response => response.text())
            .then(text => {
                const allTokens = text.split(/\r?\n/);
                this.tokens = allTokens.slice(5);
            })

        this.epoch = 0;

        this.hiddenScore = 0;
        this.loss = MAX_LOSS;

        this.cameras.main.setBackgroundColor('#efefef');

        this.anims.create({
            key: 'study',
            frames: this.anims.generateFrameNumbers('study', { frames: [0, 1] }),
            frameRate: 2,
            repeat: -1
        });
        this.add.sprite(320, 280, 'study').play('study');

        this.sound.add('click');

        this.createBar();

        // ロス
        this.lossText = this.add.text(40, 360 - 40, '', {
            color: 'black'
        }).setOrigin(0, 0.5);

        // イベント
        this.events.on('startEpoch', this.epochHandler, this);
        this.events.emit('startEpoch');
    }

    update() {
        this.lossText.setText('バリデーションロス: ' + this.loss.toFixed(2));

        this.bar.setSize(this.maxBarWidth * this.epoch / NUM_EPOCHS, this.bar.height);

        this.percentText.setText(Math.floor(this.epoch / NUM_EPOCHS * 100) + '%');
        this.epochText.setText(this.epoch + '/' + NUM_EPOCHS);

        const second = Math.floor(this.epochEvent.getElapsed() / 1000);

        const elapsedSecond = this.epoch * EPOCH_SECONDS + second;
        const leftSecond = NUM_EPOCHS * EPOCH_SECONDS - elapsedSecond;

        this.secondText.setText(
            elapsedSecond.toString().padStart(2, '0')
            + '<' + leftSecond.toString().padStart(2, '0')
        );
    }

    /**
     * バーの表示
     */
    createBar() {
        this.maxBarWidth = 240;

        const barX = 320 - this.maxBarWidth / 2;
        const barY = 40;

        this.bar = this.add.rectangle(barX, barY, 0, 20, 0).setOrigin(0, 0.5);

        const barTextLeftX = 40;
        const barTextRightX = 160;
        const barTextConfig = { color: 'black' };

        this.add.text(barTextLeftX, barY, 'エポック', barTextConfig).setOrigin(0, 0.5);
        this.percentText = this.add.text(barTextRightX, barY, '', barTextConfig).setOrigin(1, 0.5);
        this.epochText = this.add.text(640 - barTextRightX, barY, '', barTextConfig).setOrigin(0, 0.5);
        this.secondText = this.add.text(640 - barTextLeftX, barY, '', barTextConfig).setOrigin(1, 0.5);
    }

    /**
     * エポックの開始
     */
    epochHandler() {
        this.epochEvent = this.time.addEvent({
            delay: EPOCH_SECONDS * 1000,
            callback: this.epochCallback,
            callbackScope: this,
        });

        for (let i = 0; i < NUM_TOKENS_PER_EPOCH; i++) {
            const appearSeconds = Phaser.Math.FloatBetween(
                0 + TOKEN_BUFFER_SECONDS,
                EPOCH_SECONDS - (TOKEN_ALIVE_SECONDS + TOKEN_BUFFER_SECONDS)
            );

            this.time.addEvent({
                delay: Math.floor(appearSeconds * 1000),
                callback: this.tokenHandler,
                callbackScope: this,
            });
        }
    }

    /**
     * エポックが終わったとき
     */
    epochCallback() {
        console.log(this.hiddenScore);
        if (this.epoch < 2) {
            this.epoch += 1;
            this.events.emit('startEpoch');
        }
        else {
            this.events.off('startEpoch', this.epochHandler);
            this.scene.start('result', { score: this.hiddenScore });
        }
    }

    /**
     * トークンの処理
     */
    tokenHandler() {
        const x = Phaser.Math.Between(80, 560);
        const y = Phaser.Math.Between(80, 200);

        const tokenText = this.add.text(x, y, '[MASK]', {
            fontSize: '2em',
            color: '#2b5283'
        }).setOrigin(0.5);

        tokenText.setInteractive();

        // 時間切れ
        const disappearEvent = this.time.addEvent({
            delay: TOKEN_ALIVE_SECONDS * 1000,
            callback: function () {
                tokenText.setVisible(false);
            },
            callbackScope: this
        });

        // クリック
        tokenText.on('pointerdown', function () {
            this.sound.play('click');

            // 残り時間をスコアとして加算
            this.hiddenScore += Math.floor(
                TOKEN_ALIVE_SECONDS * 1000 - disappearEvent.getElapsed()
            );
            
            tokenText.removeInteractive();
            disappearEvent.remove(false);

            // クリックの確率に、線形で増加する密度関数を仮定
            // このとき、スコアの平均は最大値の1/3
            const avgHiddenScore = TOKEN_ALIVE_SECONDS * 1000 / 3;
            const sumAvgHiddenScore = avgHiddenScore * NUM_TOKENS_PER_EPOCH * NUM_EPOCHS;
            this.loss = MAX_LOSS * Math.exp(-2 * this.hiddenScore / sumAvgHiddenScore);  // 適当にスケール

            const token = this.tokens[Math.floor(Math.random() * this.tokens.length)];
            tokenText.setText(token)

            this.time.addEvent({
                delay: TOKEN_DEAD_SECONDS * 1000,
                callback: function () {
                    tokenText.setVisible(false);
                },
                callbackScope: this
            });
        }, this);
    }
}
