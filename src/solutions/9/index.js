const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const internal = require("stream");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parseDirection = (dir) => {
  return {
    L: { x: -1, y: 0 },
    R: { x: 1, y: 0 },
    U: { x: 0, y: -1 },
    D: { x: 0, y: 1 },
  }[dir];
};

const parse = (input) => {
  const commands = input.split("\n").map((line) => {
    const [dir, value] = line.split(" ");
    const direction = parseDirection(dir);
    const distance = parseInt(value, 10);
    return { direction, distance };
  });
  return commands;
};

const key = ({ x, y }) => `${x},${y}`;

const moveTail = (head, tail) => {
  if (head.x === tail.x && Math.abs(head.y - tail.y) >= 2) {
    // Move only y
    tail.y += (head.y - tail.y) / Math.abs(head.y - tail.y);
  } else if (head.y === tail.y && Math.abs(head.x - tail.x) >= 2) {
    // Move only x
    tail.x += (head.x - tail.x) / Math.abs(head.x - tail.x);
  } else if (Math.abs(head.x - tail.x) + Math.abs(head.y - tail.y) >= 3) {
    // Move diagonally
    tail.x += (head.x - tail.x) / Math.abs(head.x - tail.x);
    tail.y += (head.y - tail.y) / Math.abs(head.y - tail.y);
  }
};

const applyMove = (direction, rope) => {
  const head = rope[0];
  head.x += direction.x;
  head.y += direction.y;

  for (let i = 1; i < rope.length; i++) {
    moveTail(rope[i - 1], rope[i]);
  }
};

const part1 = async () => {
  const input = await readInput();
  const commands = parse(input);
  const rope = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  let visited = new Set();
  for (let command of commands) {
    for (let i = 0; i < command.distance; i++) {
      applyMove(command.direction, rope);

      visited.add(key(rope[rope.length - 1]));
    }
  }
  return visited.size;
};

const part2 = async () => {
  const input = await readInput();
  const commands = parse(input);
  const rope = _.range(10).map(() => ({ x: 0, y: 0 }));
  let visited = new Set();
  for (let command of commands) {
    for (let i = 0; i < command.distance; i++) {
      applyMove(command.direction, rope);

      visited.add(key(rope[rope.length - 1]));
    }
  }
  return visited.size;
};

part1().then(console.log).then(part2).then(console.log);
