const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  const winds = [];
  const map = [];
  lines.forEach((line, y) => {
    const cells = line.split("");
    const row = [];
    cells.forEach((cell, x) => {
      if (cell === "#") {
        row.push(false);
      } else {
        if (cell === "^") {
          winds.push({ position: { x, y }, direction: { x: 0, y: -1 } });
        } else if (cell === "<") {
          winds.push({ position: { x, y }, direction: { x: -1, y: 0 } });
        } else if (cell === ">") {
          winds.push({ position: { x, y }, direction: { x: 1, y: 0 } });
        } else if (cell === "v") {
          winds.push({ position: { x, y }, direction: { x: 0, y: 1 } });
        }
        row.push(true);
      }
    });
    map.push(row);
  });
  return {
    map,
    winds,
  };
};

const normalize = (p, maxP) => {
  const l = maxP - 2;
  return ((((p - 1) % l) + l) % l) + 1;
};

const windPosition = (map, wind, t) => {
  let x = wind.position.x + t * wind.direction.x;
  let y = wind.position.y + t * wind.direction.y;

  if (normalize(y, map.length) < 0) {
    console.log(wind, t, x, y, normalize(y, map.length));
  }
  y = normalize(y, map.length);
  x = normalize(x, map[y].length);

  return { x, y };
};

const hash = (pos, t) => {
  return [pos.x, pos.y, t].join("-");
};

const key = ({ x, y }) => [x, y].join("-");

const fromKey = (key) => {
  const [x, y] = key.split("-").map((x) => parseInt(x, 10));
  return { x, y };
};

const moves = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: 0, y: 0 },
];

const distance = (from, to) =>
  Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

const aStar = (map, from, to, winds, startingTime = 0) => {
  const open = new Set([key(from)]);

  const gScore = { [key(from)]: startingTime };
  const fScore = {
    [key(from)]: distance(from, to),
  };

  while (open.size > 0) {
    const position = _.minBy(
      Array.from(open).map(fromKey),
      (position) => fScore[key(position)],
    );
    const t = gScore[key(position)];
    if (position.x === to.x && position.y === to.y) {
      return t;
    }
    console.log(position, t);
    open.delete(key(position));
    for (const move of moves) {
      const targetPos = { x: position.x + move.x, y: position.y + move.y };
      console.log("Considering target", targetPos);

      if (
        targetPos.y < 0 ||
        targetPos.y >= map.length ||
        targetPos.x < 0 ||
        targetPos.x >= map[targetPos.y].length
      ) {
        console.log("Off map");
        continue;
      } else if (map[targetPos.y][targetPos.x] === false) {
        console.log("Wall");
        continue;
      } else if (
        winds.some((wind) =>
          _.isEqual(targetPos, windPosition(map, wind, t + 1)),
        )
      ) {
        console.log("Wind");
        continue;
      }
      console.log(targetPos);
      const newGScore = gScore[key(position)] + 1;
      if (
        newGScore <
        (gScore[key(targetPos)] != null ? gScore[key(targetPos)] : Infinity)
      ) {
        gScore[key(targetPos)] = newGScore;
        fScore[key(targetPos)] = newGScore + distance(targetPos, to);
        if (!open.has(key(targetPos))) {
          open.add(key(targetPos));
        }
      }
    }
  }
};

const navigate = (map, from, to, winds, startingTime = 0) => {
  const queue = [{ pos: from, t: startingTime }];
  const visited = new Set();
  let seen = {};

  while (queue.length > 0) {
    const next = queue.shift();
    if (!seen[next.t]) {
      console.log("Looking", next.t, "deep");
      seen[next.t] = true;
    }

    for (const move of moves) {
      const targetPos = { x: next.pos.x + move.x, y: next.pos.y + move.y };

      if (targetPos.x === to.x && targetPos.y === to.y) {
        return next.t + 1;
      } else if (
        targetPos.y < 0 ||
        targetPos.y >= map.length ||
        targetPos.x < 0 ||
        targetPos.x >= map[targetPos.y].length
      ) {
        continue;
      } else if (map[targetPos.y][targetPos.x] === false) {
        continue;
      } else if (visited.has(hash(targetPos, next.t + 1))) {
        continue;
      } else if (
        winds.some((wind) =>
          _.isEqual(targetPos, windPosition(map, wind, next.t + 1)),
        )
      ) {
        continue;
      } else {
        visited.add(hash(targetPos, next.t + 1));
        queue.push({ pos: targetPos, t: next.t + 1 });
      }
    }
  }
};

const part1 = async () => {
  const input = await readInput();
  const { winds, map } = parse(input);
  const start = { x: 1, y: 0 };
  const end = { x: map[0].length - 2, y: map.length - 1 };
  return navigate(map, start, end, winds);
};

const part2 = async () => {
  const input = await readInput();
  const { winds, map } = parse(input);
  const start = { x: 1, y: 0 };
  const end = { x: map[0].length - 2, y: map.length - 1 };
  // const firstTrip = navigate(map, start, end, winds);
  const firstTrip = 247;
  console.log("Completed first trip after", firstTrip);
  const secondTrip = 465;
  // const secondTrip = navigate(map, end, start, winds, firstTrip);
  console.log("Completed second trip after", secondTrip);
  return navigate(map, start, end, winds, secondTrip);
};

// part1().then(console.log).then(part2).then(console.log);
part2().then(console.log);
