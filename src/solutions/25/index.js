const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  return lines.map((line) =>
    line.split("").map(
      (c) =>
        ({
          2: 2,
          1: 1,
          0: 0,
          "-": -1,
          "=": -2,
        }[c]),
    ),
  );
};

const toDecimal = (num) => {
  if (num.length === 0) {
    return 0;
  }
  const tail = num[num.length - 1];
  const head = num.slice(0, num.length - 1);
  return tail + 5 * toDecimal(head);
};

const toSnafu = (num) => {
  if (num === 0) {
    return [];
  }
  let tail = num % 5;
  let offset = 0;
  if (tail >= 3) {
    tail -= 5;
    offset += 1;
  }

  const remainder = Math.floor(num / 5) + offset;

  return [
    ...toSnafu(remainder),
    {
      2: "2",
      1: "1",
      0: "0",
      [-1]: "-",
      [-2]: "=",
    }[tail],
  ];
};

const part1 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  const decimal = parsed.map(toDecimal);
  const sum = _.sum(decimal);
  return toSnafu(sum).join("");
};

const part2 = async () => {
  const input = await readInput();
  const parsed = parse(input);
};

part1().then(console.log).then(part2).then(console.log);
