const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  const elves = [];
  lines.forEach((line, y) => {
    const cells = line.split("");
    cells.forEach((cell, x) => {
      if (cell === "#") {
        elves.push({ x, y });
      }
    });
  });
  return elves;
};

const score = (elves) => {
  const minX = _.min(elves.map((elf) => elf.x));
  const maxX = _.max(elves.map((elf) => elf.x));
  const minY = _.min(elves.map((elf) => elf.y));
  const maxY = _.max(elves.map((elf) => elf.y));
  return (maxY - minY + 1) * (maxX - minX + 1) - elves.length;
};

const RULES = [
  {
    check: [
      { x: 1, y: -1 },
      { x: 0, y: -1 },
      { x: -1, y: -1 },
    ],
    move: { x: 0, y: -1 },
  },
  {
    check: [
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
    ],
    move: { x: 0, y: 1 },
  },
  {
    check: [
      { x: -1, y: 1 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
    ],
    move: { x: -1, y: 0 },
  },
  {
    check: [
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 1, y: -1 },
    ],
    move: { x: 1, y: 0 },
  },
];

const iterate = (elves, round) => {
  const index = {};
  elves.forEach((elf) => {
    _.set(index, [elf.x, elf.y], true);
  });

  const targets = elves.map((elf) => {
    if (
      [
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 1 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ].every(({ x: dx, y: dy }) => !_.get(index, [elf.x + dx, elf.y + dy]))
    ) {
      return { elf, target: null };
    }

    for (let i = 0; i < RULES.length; i++) {
      const rule = RULES[(i + round) % RULES.length];
      if (
        rule.check.every(
          ({ x: dx, y: dy }) => !_.get(index, [elf.x + dx, elf.y + dy]),
        )
      ) {
        return {
          elf,
          target: { x: elf.x + rule.move.x, y: elf.y + rule.move.y },
        };
      }
    }
    return { elf, target: null };
  });

  const counts = {};
  targets.forEach(({ target }) => {
    if (target != null) {
      _.set(
        counts,
        [target.x, target.y],
        _.get(counts, [target.x, target.y], 0) + 1,
      );
    }
  });

  let didMove = false;
  const newElves = targets.map(({ elf, target }) => {
    if (target == null) {
      return elf;
    }
    if (_.get(counts, [target.x, target.y]) > 1) {
      return elf;
    } else {
      didMove = true;
      return target;
    }
  });

  return { elves: newElves, didMove };
};

const print = (elves) => {
  const minX = _.min(elves.map((elf) => elf.x));
  const maxX = _.max(elves.map((elf) => elf.x));
  const minY = _.min(elves.map((elf) => elf.y));
  const maxY = _.max(elves.map((elf) => elf.y));

  const index = {};
  elves.forEach((elf) => {
    _.set(index, [elf.x, elf.y], true);
  });

  console.log();

  for (let y = minY; y <= maxY; y++) {
    const line = [];
    for (let x = minX; x <= maxX; x++) {
      if (_.get(index, [x, y])) {
        line.push("#");
      } else {
        line.push(".");
      }
    }
    console.log(line.join(""));
  }
  console.log();
};

const part1 = async () => {
  const input = await readInput();
  let elves = parse(input);
  for (let i = 0; i < 10; i++) {
    elves = iterate(elves, i).elves;
    // print(elves);
  }
  return score(elves);
};

const part2 = async () => {
  const input = await readInput();
  let elves = parse(input);

  let i = 0;
  while (true) {
    const next = iterate(elves, i);
    if (!next.didMove) {
      return i + 1;
    }
    i++;
    elves = next.elves;
  }
};

part1().then(console.log).then(part2).then(console.log);
