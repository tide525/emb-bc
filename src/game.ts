import * as Phaser from 'phaser';

const TOKENS = ['の', '、', '。', 'に', 'は', 'を', 'が', 'と', 'で', '年', '・', '（', '）', 'さ', 'して', 'した', ' いる', 'する', 'も', '「', '」', '月', 'から', 'れた', '日', 'こと', 'し', 'である', 'れて', 'や', '２', '１', 'いた', 'ある', '『', '』', 'れる', 'など', '３', '−', '', 'この', 'ない', 'ため', '日本', '人', '”', 'より', '４', 'れ', '第', 'いう', '者', 'その', 'なった', 'もの', 'へ', '後', 'まで', ' また', '市', 'なる', '５', '中', '６', '一', '同', '県', 'これ', '１０', '７', '内', '８', 'なって', 'おり', 'よる', '９', '大学', 'つ', '大', '国', 'よって', '時', '１２', 'であった', 'か', '家', '駅', 'ように', 'ら', '現在', '的な', '本', '１１', '軍', '上', '：', '化', 'であり', '的に', 'なり', '放送', '名', '性', 'ず', '部', '回', '目', '町', '時代', 'それ', 'なかった', 'おいて', '世界', '代', '線', '間', '戦', 'でも', 'られる', 'あり', '会', '場合', '行わ', '二', 'ついて', '所', 'その後', '東京', '前', '多く', '州', 'だった', '地', 'あった', 'なく', 'しかし', 'い', 'られた', '号', '数', 'できる', '的', '作品', '彼', '選手', '他', '｜', '使用', '機', '昭和', '語', 'られて', '郡', '位', '研究', '当時', '存在', '新', '元', 'アメリカ', '長', '側', '三', '活動', '映画', '初', '学校', ' 社', '等', '１５', '，', '全', '下', '番組', '呼ば', '東', '区', '２０', '会社', '出身', 'および', '／', '車', '約', 'のみ', '代表', '形', '権', 'なお', 'テレビ', '西', '系', '発売', '型', '以下', '地域', '法', '開発', '１４', '歳', '作', '１３', '１６', '中心', 'チーム', 'たち', '北', '分', 'られ', '館', '鉄道', 'おける', '時間', '以降', '３０', 'ドイツ', '小', '出場', '一部', '南', '用', 'さらに', '！', '発表', '度', '試合', '平成', '＝', 'だ', '高', '学', '賞', '局', '登場', '大会', '版', ' 開始', '（）', '次', 'フランス', '川', '際', '点', '式', '関係', '曲', '参加', '記録', '体', 'よう な', '所属', '％', '多い', '利用', 'ｍ', 'でき', 'だけ', '世', '．', '１８', '１７', 'シリーズ', ' 明治', '以上', '事', 'ゲーム', '見', 'お', '力', '##な', 'な', '音楽', 'せ', 'シーズン', '開催', '##子', 'リーグ', '島', 'ともに', 'にて', '各', '級', '国際', 'いった', '監督', '氏', 'イギリス', ' 山', '両', '世紀', '問題', '村', '２０１０', '旧', '対して', '優勝', '知ら', '都市', '１９', '行う', '金', '場', '道', '一般', '中国', '物', '出演', '設置', 'ので', 'せる', '持つ', '地方', '事業', '社会', '卒業', '戦争', '共に', '官', '委員']

const NUM_EPOCHS = 3;
const EPOCH_SECONDS = 5;

const MAX_LOSS = 10;

const TOKEN_ALIVE_SECONDS = 1;
const TOKEN_BUFFER_SECONDS = 0.1;
const TOKEN_DEAD_SECONDS = 0.5;

const NUM_TOKENS_PER_EPOCH = 10;

export default class Game extends Phaser.Scene {
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

            const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
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
