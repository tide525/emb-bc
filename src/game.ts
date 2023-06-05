import * as Phaser from 'phaser';

const TOKENS = ['の', '、', '。', 'に', 'は', 'を', 'が', 'と', 'で', '年', '・', '（', '）', 'さ', 'して', 'した', ' いる', 'する', 'も', '「', '」', '月', 'から', 'れた', '日', 'こと', 'し', 'である', 'れて', 'や', '２', '１', 'いた', 'ある', '『', '』', 'れる', 'など', '３', '−', '', 'この', 'ない', 'ため', '日本', '人', '”', 'より', '４', 'れ', '第', 'いう', '者', 'その', 'なった', 'もの', 'へ', '後', 'まで', ' また', '市', 'なる', '５', '中', '６', '一', '同', '県', 'これ', '１０', '７', '内', '８', 'なって', 'おり', 'よる', '９', '大学', 'つ', '大', '国', 'よって', '時', '１２', 'であった', 'か', '家', '駅', 'ように', 'ら', '現在', '的な', '本', '１１', '軍', '上', '：', '化', 'であり', '的に', 'なり', '放送', '名', '性', 'ず', '部', '回', '目', '町', '時代', 'それ', 'なかった', 'おいて', '世界', '代', '線', '間', '戦', 'でも', 'られる', 'あり', '会', '場合', '行わ', '二', 'ついて', '所', 'その後', '東京', '前', '多く', '州', 'だった', '地', 'あった', 'なく', 'しかし', 'い', 'られた', '号', '数', 'できる', '的', '作品', '彼', '選手', '他', '｜', '使用', '機', '昭和', '語', 'られて', '郡', '位', '研究', '当時', '存在', '新', '元', 'アメリカ', '長', '側', '三', '活動', '映画', '初', '学校', ' 社', '等', '１５', '，', '全', '下', '番組', '呼ば', '東', '区', '２０', '会社', '出身', 'および', '／', '車', '約', 'のみ', '代表', '形', '権', 'なお', 'テレビ', '西', '系', '発売', '型', '以下', '地域', '法', '開発', '１４', '歳', '作', '１３', '１６', '中心', 'チーム', 'たち', '北', '分', 'られ', '館', '鉄道', 'おける', '時間', '以降', '３０', 'ドイツ', '小', '出場', '一部', '南', '用', 'さらに', '！', '発表', '度', '試合', '平成', '＝', 'だ', '高', '学', '賞', '局', '登場', '大会', '版', ' 開始', '（）', '次', 'フランス', '川', '際', '点', '式', '関係', '曲', '参加', '記録', '体', 'よう な', '所属', '％', '多い', '利用', 'ｍ', 'でき', 'だけ', '世', '．', '１８', '１７', 'シリーズ', ' 明治', '以上', '事', 'ゲーム', '見', 'お', '力', '##な', 'な', '音楽', 'せ', 'シーズン', '開催', '##子', 'リーグ', '島', 'ともに', 'にて', '各', '級', '国際', 'いった', '監督', '氏', 'イギリス', ' 山', '両', '世紀', '問題', '村', '２０１０', '旧', '対して', '優勝', '知ら', '都市', '１９', '行う', '金', '場', '道', '一般', '中国', '物', '出演', '設置', 'ので', 'せる', '持つ', '地方', '事業', '社会', '卒業', '戦争', '共に', '官', '委員']

export default class Game extends Phaser.Scene {
    numEpochs = 3;
    epochSeconds = 5;
    totalEpochSecond = this.numEpochs * this.epochSeconds;

    maxLoss = 10.0;

    epoch: number;

    hiddenScore: number;
    loss: number;

    tokenSeconds: number;
    tokenBufferSeconds: number;

    barWidth: number;
    barHeight: number;

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
        this.epoch = 0;

        this.hiddenScore = 0;
        this.loss = this.maxLoss;
    
        this.tokenSeconds = 1;
        this.tokenBufferSeconds = 0.1;
        
        this.cameras.main.setBackgroundColor('#efefef');

        this.anims.create({
            key: 'study',
            frames: this.anims.generateFrameNumbers('study', { frames: [0, 1] }),
            frameRate: 2,
            repeat: -1
        });
        this.add.sprite(320, 280, 'study').play('study');

        this.sound.add('click');

        this.barWidth = 240;
        this.barHeight = 20;

        const barX = 320 - this.barWidth / 2;
        const barY = 40;

        this.bar = this.add.rectangle(barX, barY, 0, this.barHeight, 0).setOrigin(0, 0.5);

        const barTextLeftX = 40;
        const barTextRightX = 160;
        const barTextConfig = { color: 'black' };

        this.add.text(barTextLeftX, barY, 'エポック', barTextConfig).setOrigin(0, 0.5);
        this.percentText = this.add.text(barTextRightX, barY, '', barTextConfig).setOrigin(1, 0.5);
        this.epochText = this.add.text(640 - barTextRightX, barY, '', barTextConfig).setOrigin(0, 0.5);
        this.secondText = this.add.text(640 - barTextLeftX, barY, '', barTextConfig).setOrigin(1, 0.5);

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

        const second = Math.floor(this.epochEvent.getElapsed() / 1000);
        this.bar.setSize(this.barWidth * this.epoch / this.numEpochs, this.barHeight);

        this.percentText.setText(Math.floor(this.epoch / this.numEpochs * 100) + '%');
        this.epochText.setText(this.epoch + '/' + this.numEpochs);

        const totalSecond = second + this.epoch * this.epochSeconds;
        const leftSecond = this.totalEpochSecond - totalSecond;
        this.secondText.setText(totalSecond.toString().padStart(2, '0') + '<' + leftSecond.toString().padStart(2, '0'));
    }

    epochHandler() {
        this.epochEvent = this.time.addEvent({
            delay: this.epochSeconds * 1000,
            callback: this.epochCallback,
            callbackScope: this,
        });

        for (let i = 0; i < 10; i++) {
            const appearSeconds = Phaser.Math.FloatBetween(
                0 + this.tokenBufferSeconds,
                this.epochSeconds - (this.tokenSeconds + this.tokenBufferSeconds)
            );

            this.time.addEvent({
                delay: Math.floor(appearSeconds * 1000),
                callback: this.tokenHandler,
                callbackScope: this,
            });
        }
    }

    epochCallback() {
        if (this.epoch < 2) {
            this.epoch += 1;
            this.events.emit('startEpoch');
        }
        else {
            this.events.off('startEpoch', this.epochHandler);
            this.scene.start('sceneC', { score: this.hiddenScore });
        }
    }

    tokenHandler() {
        const x = Phaser.Math.Between(80, 560);
        const y = Phaser.Math.Between(80, 200);

        const text = this.add.text(x, y, '[MASK]', {
            fontSize: '2em',
            color: '#2b5283'
        }).setOrigin(0.5);
        text.setInteractive();

        const disappearEvent = this.time.addEvent({
            delay: this.tokenSeconds * 1000,
            callback: function () {
                text.setVisible(false);
            },
            callbackScope: this
        });

        text.on('pointerdown', function () {
            this.sound.play('click');

            this.hiddenScore += Math.floor(this.tokenSeconds * 1000 - disappearEvent.getElapsed());  // 平均333
            this.loss = this.maxLoss * Math.exp(-2 * this.hiddenScore / 10000);  // 平均の合計で正規化、適当にスケール

            text.removeInteractive();
            disappearEvent.remove(false);

            const token = TOKENS[Phaser.Math.Between(0, TOKENS.length - 1)];
            text.setText(token)

            this.time.addEvent({
                delay: 0.5 * 1000,
                callback: function () {
                    text.setVisible(false);
                },
                callbackScope: this
            });
        }, this);
    }
}
