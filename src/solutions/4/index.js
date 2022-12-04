const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parseSection = (part) => {
  const [start, end] = /^(\d+)-(\d+)$/
    .exec(part)
    .slice(1)
    .map((x) => parseInt(x, 10));
  return { start, end };
};

const parse = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [first, second] = line.split(",");
    return { first: parseSection(first), second: parseSection(second) };
  });
};

const isSubset = (first, second) =>
  first.start >= second.start && first.end <= second.end;

const isOverlap = (first, second) =>
  Math.max(first.end, second.end) - Math.min(first.start, second.start) <
  first.end - first.start + (second.end - second.start) + 1;

const part1 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  return parsed.filter(
    ({ first, second }) => isSubset(first, second) || isSubset(second, first),
  ).length;
};

const part2 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  return parsed.filter(({ first, second }) => isOverlap(first, second)).length;
};

part1().then(console.log).then(part2).then(console.log);
