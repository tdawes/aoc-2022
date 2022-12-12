const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { countReset } = require("console");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parseMonkey = (input) => {
  const lines = input.split("\n").map((x) => x.trim());
  const number = parseInt(/^Monkey (\d+):$/.exec(lines[0])[1], 10);
  const items = lines[1]
    .split(": ")[1]
    .split(", ")
    .map((x) => parseInt(x, 10));
  const operationStr = /^Operation: new = (.*)$/.exec(lines[2])[1];
  const operation = (x) => eval(operationStr.replace(/old/g, "x"));
  const divisor = parseInt(/^Test: divisible by (\d+)$/.exec(lines[3])[1], 10);
  const ifTrue = parseInt(
    /^If true: throw to monkey (\d+)$/.exec(lines[4])[1],
    10,
  );
  const ifFalse = parseInt(
    /^If false: throw to monkey (\d+)$/.exec(lines[5])[1],
    10,
  );

  return { number, items, operation, divisor, ifTrue, ifFalse };
};

const parse = (input) => {
  const parts = input.split("\n\n");
  return parts.map(parseMonkey);
};

const part1 = async () => {
  const input = await readInput();
  const monkeys = parse(input);
  let counter = monkeys.reduce((acc, m, i) => ({ ...acc, [m.number]: 0 }), {});
  for (let i = 0; i < 20; i++) {
    for (const monkey of monkeys) {
      while (monkey.items.length > 0) {
        let item = monkey.items.shift();
        counter[monkey.number]++;
        item = monkey.operation(item);
        item = Math.floor(item / 3);
        if (item % monkey.divisor === 0) {
          monkeys[monkey.ifTrue].items.push(item);
        } else {
          monkeys[monkey.ifFalse].items.push(item);
        }
      }
    }
  }
  const sorted = Object.values(counter).sort((a, b) => b - a);
  return sorted[0] * sorted[1];
};

const part2 = async () => {
  const input = await readInput();
  const monkeys = parse(input);
  const lcm = monkeys.reduce((acc, m) => acc * m.divisor, 1);
  let counter = monkeys.reduce((acc, m, i) => ({ ...acc, [m.number]: 0 }), {});
  for (let i = 0; i < 10000; i++) {
    for (const monkey of monkeys) {
      while (monkey.items.length > 0) {
        let item = monkey.items.shift();
        counter[monkey.number]++;
        item = monkey.operation(item);
        item = item % lcm;
        if (item % monkey.divisor === 0) {
          monkeys[monkey.ifTrue].items.push(item);
        } else {
          monkeys[monkey.ifFalse].items.push(item);
        }
      }
    }
  }
  const sorted = Object.values(counter).sort((a, b) => b - a);
  return sorted[0] * sorted[1];
};

part1().then(console.log).then(part2).then(console.log);
