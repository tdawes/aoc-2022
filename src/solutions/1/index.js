const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n").map((line) => _.trim(line));
  let elf = { food: [], total: 0 };
  const elves = [];
  for (const line of lines) {
    if (line.length == 0) {
      elves.push(elf);
      elf = { food: [], total: 0 };
    } else {
      const item = parseInt(line, 10);
      elf.food.push(item);
      elf.total += item;
    }
  }
  return elves;
};

const part1 = async () => {
  const input = await readInput();
  const elves = parse(input);
  return _.maxBy(elves, "total").total;
};

const part2 = async () => {
  const input = await readInput();
  const elves = parse(input);
  const sorted = _.orderBy(elves, "total", ["desc"]);
  return _.sumBy(sorted.slice(0, 3), "total");
};

part1().then(console.log).then(part2).then(console.log);
