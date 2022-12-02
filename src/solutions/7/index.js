const fs = require("fs");
const { promisify } = require("util");
const path = require("path");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {};

const part1 = async () => {
  const input = await readInput();
  const parsed = parse(input);
};

const part2 = async () => {
  const input = await readInput();
  const parsed = parse(input);
};

part1().then(console.log).then(part2).then(console.log);
