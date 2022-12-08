const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) =>
  input.split("\n").map((line) => line.split("").map((x) => parseInt(x, 10)));

const isTreeVisibleFromEdge = (trees, x, y) => {
  return (
    _.range(0, x).every((i) => trees[y][i] < trees[y][x]) ||
    _.range(x + 1, trees[y].length).every((i) => trees[y][i] < trees[y][x]) ||
    _.range(0, y).every((j) => trees[j][x] < trees[y][x]) ||
    _.range(y + 1, trees.length).every((j) => trees[j][x] < trees[y][x])
  );
};

const countVisibleTrees = (trees, x, y) => {
  let left = 0;
  for (let i = x - 1; i >= 0; i--) {
    left++;
    if (trees[y][i] >= trees[y][x]) {
      break;
    }
  }

  let right = 0;
  for (let i = x + 1; i < trees[y].length; i++) {
    right++;
    if (trees[y][i] >= trees[y][x]) {
      break;
    }
  }

  let up = 0;
  for (let j = y - 1; j >= 0; j--) {
    up++;
    if (trees[j][x] >= trees[y][x]) {
      break;
    }
  }

  let down = 0;
  for (let j = y + 1; j < trees.length; j++) {
    down++;
    if (trees[j][x] >= trees[y][x]) {
      break;
    }
  }

  return left * right * up * down;
};

const part1 = async () => {
  const input = await readInput();
  const trees = parse(input);

  let count = 0;
  for (let y = 0; y < trees.length; y++) {
    for (let x = 0; x < trees[y].length; x++) {
      if (isTreeVisibleFromEdge(trees, x, y)) {
        count++;
      }
    }
  }
  return count;
};

const part2 = async () => {
  const input = await readInput();
  const trees = parse(input);
  let maxScore = 0;
  for (let y = 0; y < trees.length; y++) {
    for (let x = 0; x < trees[y].length; x++) {
      const score = countVisibleTrees(trees, x, y);
      if (score > maxScore) {
        maxScore = score;
      }
    }
  }
  return maxScore;
};

part1().then(console.log).then(part2).then(console.log);
