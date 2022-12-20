const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { slice } = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => input.split("\n").map((line) => parseInt(line, 10));

const move = (list, index, amount) => {
  const without = [...list.slice(0, index), ...list.slice(index + 1)];
  const newIndex = (index + amount) % without.length;
  return [
    ...without.slice(0, newIndex),
    list[index],
    ...without.slice(newIndex),
  ];
};

const part1 = async () => {
  const input = await readInput();
  let list = parse(input).map((value, pos) => ({ value, pos }));

  for (let i = 0; i < list.length; i++) {
    const index = list.findIndex(({ pos }) => pos === i);
    list = move(list, index, list[index].value);
  }

  const zeroIndex = list.findIndex(({ value }) => value === 0);
  return (
    list[(zeroIndex + 1000) % list.length].value +
    list[(zeroIndex + 2000) % list.length].value +
    list[(zeroIndex + 3000) % list.length].value
  );
};

const part2 = async () => {
  const input = await readInput();
  let list = parse(input).map((value, pos) => ({
    value: value * 811589153,
    pos,
  }));

  for (let t = 0; t < 10; t++) {
    for (let i = 0; i < list.length; i++) {
      const index = list.findIndex(({ pos }) => pos === i);
      list = move(list, index, list[index].value);
    }
  }

  const zeroIndex = list.findIndex(({ value }) => value === 0);
  return (
    list[(zeroIndex + 1000) % list.length].value +
    list[(zeroIndex + 2000) % list.length].value +
    list[(zeroIndex + 3000) % list.length].value
  );
};

part1().then(console.log).then(part2).then(console.log);
