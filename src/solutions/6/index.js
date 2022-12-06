const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => input.split("");

const findFirstUnique = (list, n) => {
  const buffer = [];
  for (let i = 0; i < list.length; i++) {
    if (buffer.length < n) {
      buffer.push(list[i]);
    } else {
      buffer.push(list[i]);
      buffer.shift();
      if (_.uniq(buffer).length === n) {
        return i + 1;
      }
    }
  }
};

const part1 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  return findFirstUnique(parsed, 4);
};

const part2 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  return findFirstUnique(parsed, 14);
};

part1().then(console.log).then(part2).then(console.log);
