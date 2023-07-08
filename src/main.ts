import Title from "./title";
import Game from "./game";
import Result from "./result";

const config = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#ffffff',
    width: 640,
    height: 360,
    scene: [Title, Game, Result]
};

const game = new Phaser.Game(config);
