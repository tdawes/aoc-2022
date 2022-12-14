const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  const coords = lines.map((line) =>
    line
      .split(" -> ")
      .map((coord) => coord.split(",").map((x) => parseInt(x, 10))),
  );
  const maxY = _.max(_.flatMap(coords, (path) => path.map(([, y]) => y)));

  const map = {};
  for (const path of coords) {
    for (let i = 1; i < path.length; i++) {
      const start = path[i - 1];
      const end = path[i];
      for (
        let x = Math.min(start[0], end[0]);
        x <= Math.max(start[0], end[0]);
        x++
      ) {
        for (
          let y = Math.min(start[1], end[1]);
          y <= Math.max(start[1], end[1]);
          y++
        ) {
          _.set(map, [x, y], "#");
        }
      }
    }
  }

  return { map, height: maxY };
};

const findSettle = (cavern, [x, y]) => {
  if (!cavern.floor && y > cavern.height) {
    return true;
  }
  if (
    (cavern.floor && y >= cavern.height + 2) ||
    _.get(cavern.map, [x, y]) != null
  ) {
    return false;
  }
  return (
    findSettle(cavern, [x, y + 1]) ||
    findSettle(cavern, [x - 1, y + 1]) ||
    findSettle(cavern, [x + 1, y + 1]) || [x, y]
  );
};

const print = (cavern) => {
  const minX = _.min(
    _.flatMap(
      Object.values(cavern).map((row) =>
        Object.keys(row).map((x) => parseInt(x, 10)),
      ),
    ),
  );
  const maxX = _.max(
    _.flatMap(
      Object.values(cavern).map((row) =>
        Object.keys(row).map((x) => parseInt(x, 10)),
      ),
    ),
  );
  for (let y = 0; y <= cavern.height + 2; y++) {
    if (y == cavern.height + 2 && cavern.floor) {
      console.log(
        _.range(minX, maxX + 1)
          .map(() => "-")
          .join(""),
      );
    } else {
      const line = [];
      for (let x = minX; x <= maxX; x++) {
        line.push(_.get(cavern.map, [x, y]) || " ");
      }
      console.log(line.join(""));
    }
  }
};

const part1 = async () => {
  const input = await readInput();
  const cavern = parse(input);
  let count = 0;
  while (true) {
    const newSand = findSettle(cavern, [500, 0]);
    if (newSand === true) {
      break;
    }
    _.set(cavern.map, newSand, ".");
    count++;
  }
  return count;
};

const part2 = async () => {
  const input = await readInput();
  const cavern = parse(input);
  cavern.floor = true;
  let count = 0;
  while (true) {
    const newSand = findSettle(cavern, [500, 0], true);
    if (newSand === false) {
      break;
    }
    _.set(cavern.map, newSand, ".");
    count++;
  }
  return count;
};

part1().then(console.log).then(part2).then(console.log);
