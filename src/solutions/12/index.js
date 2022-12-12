const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const alphabet = "abcdefghijklmnopqrstuvwxyz";

const parse = (input) => {
  const lines = input.split("\n");
  let start = null;
  let end = null;
  const map = lines.map((line, y) => {
    const chars = line.split("");
    return chars.map((c, x) => {
      if (c === "S") {
        start = { x, y };
        return alphabet.indexOf("a");
      } else if (c === "E") {
        end = { x, y };
        return alphabet.indexOf("z");
      } else {
        return alphabet.indexOf(c);
      }
    });
  });
  return { map, start, end };
};

const distance = (from, to) =>
  Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

const key = ({ x, y }) => `${x},${y}`;
const fromKey = (str) => {
  const [x, y] = str.split(",").map((x) => parseInt(x, 10));
  return { x, y };
};

const descend = (p, map) =>
  [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
    .map(([dx, dy]) => ({ x: p.x + dx, y: p.y + dy }))
    .filter(
      ({ x, y }) => 0 <= y && y < map.length && 0 <= x && x < map[y].length,
    )
    .filter(({ x, y }) => map[y][x] >= map[p.y][p.x] - 1);

const climb = (p, map) =>
  [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
    .map(([dx, dy]) => ({ x: p.x + dx, y: p.y + dy }))
    .filter(
      ({ x, y }) => 0 <= y && y < map.length && 0 <= x && x < map[y].length,
    )
    .filter(({ x, y }) => map[y][x] <= map[p.y][p.x] + 1);

const aStar = (map, start, ends, getNeighbours) => {
  if (!Array.isArray(ends)) {
    ends = [ends];
  }
  const open = new Set([key(start)]);

  const gScore = { [key(start)]: 0 };
  const fScore = {
    [key(start)]: _.min(ends.map((end) => distance(start, end))),
  };

  while (open.size > 0) {
    const current = _.minBy(
      Array.from(open).map(fromKey),
      (p) => fScore[key(p)],
    );
    if (ends.some((end) => current.x === end.x && current.y === end.y)) {
      return gScore[key(current)];
    }

    open.delete(key(current));
    for (const n of getNeighbours(current, map)) {
      const newGScore = gScore[key(current)] + 1;
      if (newGScore < (gScore[key(n)] != null ? gScore[key(n)] : Infinity)) {
        gScore[key(n)] = newGScore;
        fScore[key(n)] = newGScore + _.min(ends.map((end) => distance(n, end)));
        if (!open.has(key(n))) {
          open.add(key(n));
        }
      }
    }
  }
};

const part1 = async () => {
  const input = await readInput();
  const { map, start, end } = parse(input);
  return aStar(map, start, end, climb);
};

const part2 = async () => {
  const input = await readInput();
  const { map, end } = parse(input);
  const possibleStarts = _.flatten(
    _.range(0, map.length).map((y) =>
      _.range(0, map[y].length).map((x) => ({ x, y })),
    ),
  ).filter(({ x, y }) => map[y][x] === 0);
  return aStar(map, end, possibleStarts, descend);
};

part1().then(console.log).then(part2).then(console.log);
