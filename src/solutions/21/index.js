const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const OPS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
};

const parse = (input) => {
  const lines = input.split("\n");
  return _.keyBy(
    lines.map((line) => {
      const [, name, formula] = /^(\w+): (.*)$/.exec(line);
      if (/^(-?\d+)$/.test(formula)) {
        return { name, value: parseInt(formula, 10) };
      } else {
        const [, first, op, second] = /^(\w+) ([+*/-]) (\w+)$/.exec(formula);
        return { name, first, second, op: OPS[op] };
      }
    }),
    (monkey) => monkey.name,
  );
};

const calculate = (monkeys, name) => {
  const monkey = monkeys[name];
  if ("value" in monkey) {
    return monkey.value;
  } else {
    const first = calculate(monkeys, monkey.first);
    const second = calculate(monkeys, monkey.second);
    if (first == null || second == null) {
      return null;
    }
    monkey.value = monkey.op(first, second);
    return monkey.value;
  }
};

const getTargetFirst = (op, second, target) => {
  if (op === OPS["+"]) {
    return target - second;
  } else if (op === OPS["-"]) {
    return target + second;
  } else if (op === OPS["*"]) {
    return target / second;
  } else if (op === OPS["/"]) {
    return target * second;
  }
};

const getTargetSecond = (op, first, target) => {
  if (op === OPS["+"]) {
    return target - first;
  } else if (op === OPS["-"]) {
    return first - target;
  } else if (op === OPS["*"]) {
    return target / first;
  } else if (op === OPS["/"]) {
    return first / target;
  }
};

const calculateInput = (monkeys, name, target) => {
  const monkey = monkeys[name];
  if ("value" in monkey && monkey.value === null) {
    return target;
  }
  const first = calculate(monkeys, monkey.first);
  const second = calculate(monkeys, monkey.second);
  if (first == null) {
    const newTarget = getTargetFirst(monkey.op, second, target);
    return calculateInput(monkeys, monkey.first, newTarget);
  } else if (second == null) {
    const newTarget = getTargetSecond(monkey.op, first, target);
    return calculateInput(monkeys, monkey.second, newTarget);
  }
};

const part1 = async () => {
  const input = await readInput();
  const monkeys = parse(input);
  return calculate(monkeys, "root");
};

const part2 = async () => {
  const input = await readInput();
  const monkeys = parse(input);
  monkeys.root.op = OPS["-"];
  monkeys.humn.value = null;
  return calculateInput(monkeys, "root", 0);
};

part1().then(console.log).then(part2).then(console.log);
