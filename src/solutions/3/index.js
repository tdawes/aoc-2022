const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  const groups = [];
  let currentGroup = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const chars = line.split("");
    const first = chars.slice(0, chars.length / 2);
    const second = chars.slice(chars.length / 2);
    const bag = {
      total: _.countBy(chars),
      first: _.countBy(first),
      second: _.countBy(second),
    };
    currentGroup.push(bag);
    if (i % 3 == 2) {
      groups.push(currentGroup);
      currentGroup = [];
    }
  }
  return groups;
};

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const isUpper = (x) => x.toUpperCase() == x;

const score = (letter) =>
  isUpper(letter)
    ? 27 + ALPHABET.indexOf(letter.toLowerCase())
    : 1 + ALPHABET.indexOf(letter);

const part1 = async () => {
  const input = await readInput();
  const groups = parse(input);
  const common = _.flatten(groups).map(
    ({ first, second }) =>
      _.intersection(Object.keys(first), Object.keys(second))[0],
  );
  return _.sumBy(common, score);
};

const part2 = async () => {
  const input = await readInput();
  const groups = parse(input);
  const badges = groups.map(
    (group) => _.intersection(...group.map((bag) => Object.keys(bag.total)))[0],
  );
  return _.sumBy(badges, score);
};

part1().then(console.log).then(part2).then(console.log);
