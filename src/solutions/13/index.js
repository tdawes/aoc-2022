const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const pairs = input.split("\n\n");
  return pairs.map((pair) => {
    const [first, second] = pair.split("\n");
    return {
      first: JSON.parse(first),
      second: JSON.parse(second),
    };
  });
};

const toArray = (numOrArray) =>
  Array.isArray(numOrArray) ? numOrArray : [numOrArray];

const compare = (first, second) => {
  if (!Array.isArray(first) && !Array.isArray(second)) {
    return first - second;
  } else if (Array.isArray(first) && Array.isArray(second)) {
    for (let i = 0; i < Math.min(first.length, second.length); i++) {
      const c = compare(first[i], second[i]);
      if (c !== 0) {
        return c;
      }
    }
    return first.length - second.length;
  } else {
    return compare(toArray(first), toArray(second));
  }
};

const inOrder = ({ first, second }) => compare(first, second) < 0;

const part1 = async () => {
  const input = await readInput();
  const pairs = parse(input);
  return _.sum(pairs.map((pair, index) => (inOrder(pair) ? index + 1 : 0)));
};

const part2 = async () => {
  const input = await readInput();
  const pairs = parse(input);
  const list = [
    ..._.flatten(pairs.map(({ first, second }) => [first, second])),
    [[2]],
    [[6]],
  ];
  list.sort(compare);
  return (
    (list.findIndex((a) => _.isEqual(a, [[2]])) + 1) *
    (list.findIndex((a) => _.isEqual(a, [[6]])) + 1)
  );
};

part1().then(console.log).then(part2).then(console.log);
