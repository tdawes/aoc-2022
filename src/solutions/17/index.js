const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { has } = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => input.split("");

const LINE_SHAPE = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
];
const X_SHAPE = [
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [1, 2],
];
const L_SHAPE = [
  [0, 0],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
];
const I_SHAPE = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
];
const SQUARE_SHAPE = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
];

const SHAPES = [LINE_SHAPE, X_SHAPE, L_SHAPE, I_SHAPE, SQUARE_SHAPE];

const tryMove = (tower, shape, position) => {
  for (const [sx, sy] of shape) {
    const [x, y] = [sx + position.x, sy + position.y];
    if (x < 0 || x >= 7) {
      return false;
    }
    if (y < 0) {
      return false;
    }
    if (_.get(tower, [x, y])) {
      return false;
    }
  }
  return true;
};

const commitShape = (tower, shape, position) => {
  for (const [sx, sy] of shape) {
    const [x, y] = [sx + position.x, sy + position.y];
    _.set(tower, [x, y], true);
  }
};

const printTower = (tower, towerHeight) => {
  for (let y = towerHeight + 2; y >= 0; y--) {
    const line = ["|"];
    for (let x = 0; x < 7; x++) {
      if (_.get(tower, [x, y])) {
        line.push("#");
      } else {
        line.push(".");
      }
    }
    line.push("|");
    console.log(line.join(""));
  }
  console.log("---------");
  console.log("");
};

const createHash = (tower, towerHeight, n, shapeIndex, commandIndex) => {
  const hash = [];
  for (let i = 0; i < n; i++) {
    const y = towerHeight - i;
    for (let x = 0; x < 7; x++) {
      hash.push(_.get(tower, [x, y]) ? "#" : ".");
    }
  }
  hash.push(shapeIndex);
  hash.push(commandIndex);
  return hash.join("");
};

const play = (commands, numTurns) => {
  let turn = 0;
  let commandIndex = 0;
  let towerHeight = -1;
  const hashDepth = 40;
  const tower = {};

  const seen = {};

  const heights = {};

  while (turn < numTurns) {
    const hash = createHash(
      tower,
      towerHeight,
      hashDepth,
      turn % SHAPES.length,
      commandIndex % commands.length,
    );
    const previous = seen[hash];
    if (previous != null && (numTurns - turn) % (turn - previous) == 0) {
      const loopSize = turn - previous;

      const numTurnsRemaining = numTurns - turn;
      const numLoops = Math.floor(numTurnsRemaining / loopSize);

      const towerSize = towerHeight - heights[previous] + 1;

      towerHeight += towerSize * numLoops;
      turn += loopSize * numLoops;

      const remainingTurns = numTurns - turn;
      towerHeight += heights[previous + remainingTurns] - heights[previous];

      return towerHeight + 1;
    } else {
      seen[hash] = turn;
    }

    const shape = SHAPES[turn % SHAPES.length];
    const shapePosition = { x: 2, y: towerHeight + 4 };
    while (true) {
      // console.log("HERE", turn);
      const command = commands[commandIndex % commands.length];
      commandIndex++;
      if (command == "<") {
        const canMove = tryMove(tower, shape, {
          x: shapePosition.x - 1,
          y: shapePosition.y,
        });
        if (canMove) {
          shapePosition.x -= 1;
        }
      } else {
        const canMove = tryMove(tower, shape, {
          x: shapePosition.x + 1,
          y: shapePosition.y,
        });

        if (canMove) {
          shapePosition.x += 1;
        }
      }

      const canMoveDown = tryMove(tower, shape, {
        x: shapePosition.x,
        y: shapePosition.y - 1,
      });
      if (canMoveDown) {
        shapePosition.y -= 1;
      } else {
        commitShape(tower, shape, shapePosition);
        towerHeight = Math.max(
          towerHeight,
          _.max(shape.map(([, sy]) => sy + shapePosition.y)),
        );
        break;
      }
    }
    heights[turn] = towerHeight;
    turn++;
    // console.log(heights);
  }
  return towerHeight + 1;
};

const part1 = async () => {
  const input = await readInput();
  const commands = parse(input);
  return play(commands, 2022);
};

const part2 = async () => {
  const input = await readInput();
  const commands = parse(input);
  return play(commands, 1000000000000);
};

part1().then(console.log).then(part2).then(console.log);
