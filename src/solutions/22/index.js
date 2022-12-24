const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parseMap = (input) => {
  const lines = input
    .split("\n")
    .map((line) =>
      line.split("").map((c) => (c === "." ? true : c === "#" ? false : null)),
    );

  const maxWidth = _.max(lines.map((line) => line.length));
  return lines.map((line) => [
    ...line,
    ..._.range(0, maxWidth - line.length).map(() => null),
  ]);
};

const parseCommands = (input) => {
  let current = "";
  const commands = [];
  for (const c of input.split("")) {
    if (/\d/.test(c)) {
      current = current + c;
    } else {
      commands.push({ type: "move", distance: parseInt(current, 10) });
      current = "";

      commands.push({ type: "turn", clockwise: c === "R" });
    }
  }

  if (current.length > 0) {
    commands.push({ type: "move", distance: parseInt(current, 10) });
  }

  return commands;
};

const parse = (input) => {
  const [map, commands] = input.split("\n\n");
  return { map: parseMap(map), commands: parseCommands(commands) };
};

const DIRECTIONS = {
  RIGHT: { x: 1, y: 0 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  UP: { x: 0, y: -1 },
};

const CLOCKWISE = {
  RIGHT: "DOWN",
  DOWN: "LEFT",
  LEFT: "UP",
  UP: "RIGHT",
};

const ANTICLOCKWISE = {
  RIGHT: "UP",
  DOWN: "RIGHT",
  LEFT: "DOWN",
  UP: "LEFT",
};

const DIRECTION_SCORES = {
  RIGHT: 0,
  DOWN: 1,
  LEFT: 2,
  UP: 3,
};

const score = ({ position, direction }) => {
  return (
    1000 * (position.y + 1) + 4 * (position.x + 1) + DIRECTION_SCORES[direction]
  );
};

const normalize = (map, pos) => {
  const y = (pos.y + map.length) % map.length;
  const x = (pos.x + map[y].length) % map[y].length;
  return { x, y };
};

const findNextDirect = (map, pos, direction) => {
  let current = pos;
  while (true) {
    const next = normalize(map, {
      x: current.x + DIRECTIONS[direction].x,
      y: current.y + DIRECTIONS[direction].y,
    });
    if (map[next.y][next.x] === true) {
      return { position: next, direction: direction };
    } else if (map[next.y][next.x] === false) {
      return null;
    } else {
      current = next;
    }
  }
};

const connectDirect = (map) => {
  const newMap = [];
  for (let y = 0; y < map.length; y++) {
    const row = [];
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === null || map[y][x] === false) {
        row.push(null);
      } else {
        row.push({
          x,
          y,
          UP: findNextDirect(map, { x, y }, "UP"),
          RIGHT: findNextDirect(map, { x, y }, "RIGHT"),
          DOWN: findNextDirect(map, { x, y }, "DOWN"),
          LEFT: findNextDirect(map, { x, y }, "LEFT"),
        });
      }
    }
    newMap.push(row);
  }
  return newMap;
};

const applyCommand = (map, { position, direction }, command, path = []) => {
  if (command.type === "move") {
    let current = { position, direction };
    for (let i = 0; i < command.distance; i++) {
      const cell = map[current.position.y][current.position.x];
      if (cell[current.direction] != null) {
        current = cell[current.direction];
        path.push(current);
      } else {
        break;
      }
    }
    return current;
  } else {
    return {
      position,
      direction: command.clockwise
        ? CLOCKWISE[direction]
        : ANTICLOCKWISE[direction],
    };
  }
};

const part1 = async () => {
  const input = await readInput();
  const { map, commands } = parse(input);

  const connectedMap = connectDirect(map);

  let player = {
    position: { x: map[0].findIndex((c) => c != null), y: 0 },
    direction: "RIGHT",
  };
  for (const command of commands) {
    player = applyCommand(connectedMap, player, command);
  }

  return score(player);
};

const connectCube = (map) => {
  const newMap = [];
  for (let y = 0; y < map.length; y++) {
    const row = [];
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === null || map[y][x] === false) {
        row.push(null);
      } else {
        row.push({
          x,
          y,
          UP: findNextCube(map, { x, y }, "UP"),
          RIGHT: findNextCube(map, { x, y }, "RIGHT"),
          DOWN: findNextCube(map, { x, y }, "DOWN"),
          LEFT: findNextCube(map, { x, y }, "LEFT"),
        });
      }
    }
    newMap.push(row);
  }
  return newMap;
};

const _findNextCube = (position, direction) => {
  if (
    position.x >= 50 &&
    position.x < 100 &&
    position.y === 0 &&
    direction === "UP"
  ) {
    // A1 -> F2
    return { position: { x: 0, y: 150 + position.x - 50 }, direction: "RIGHT" };
  } else if (
    position.x >= 100 &&
    position.x < 150 &&
    position.y === 0 &&
    direction === "UP"
  ) {
    // B1 -> F4
    return { position: { x: position.x - 100, y: 199 }, direction: "UP" };
  } else if (
    position.x === 50 &&
    position.y >= 0 &&
    position.y < 50 &&
    direction === "LEFT"
  ) {
    // A2 -> D2
    return {
      position: { x: 0, y: 100 + (49 - position.y) },
      direction: "RIGHT",
    };
  } else if (
    position.x === 149 &&
    position.y >= 0 &&
    position.y < 50 &&
    direction === "RIGHT"
  ) {
    // B3 -> E3
    return {
      position: { x: 99, y: 100 + (49 - position.y) },
      direction: "LEFT",
    };
  } else if (
    position.x >= 100 &&
    position.x < 150 &&
    position.y === 49 &&
    direction === "DOWN"
  ) {
    // B4 -> C3
    return {
      position: { x: 99, y: 50 + (position.x - 100) },
      direction: "LEFT",
    };
  } else if (
    position.x === 50 &&
    position.y >= 50 &&
    position.y < 100 &&
    direction === "LEFT"
  ) {
    // C2 -> D1
    return {
      position: { x: position.y - 50, y: 100 },
      direction: "DOWN",
    };
  } else if (
    position.x === 99 &&
    position.y >= 50 &&
    position.y < 100 &&
    direction === "RIGHT"
  ) {
    // C3 -> B4
    return {
      position: { x: 100 + (position.y - 50), y: 49 },
      direction: "UP",
    };
  } else if (
    position.x >= 0 &&
    position.x < 50 &&
    position.y === 100 &&
    direction === "UP"
  ) {
    // D1 -> C2
    return {
      position: { x: 50, y: 50 + position.x },
      direction: "RIGHT",
    };
  } else if (
    position.x === 0 &&
    position.y >= 100 &&
    position.y < 150 &&
    direction === "LEFT"
  ) {
    // D2 -> A2

    return {
      position: { x: 50, y: 49 - (position.y - 100) },
      direction: "RIGHT",
    };
  } else if (
    position.x === 99 &&
    position.y >= 100 &&
    position.y < 150 &&
    direction === "RIGHT"
  ) {
    // E3 -> B3
    return {
      position: { x: 149, y: 49 - (position.y - 100) },
      direction: "LEFT",
    };
  } else if (
    position.x >= 50 &&
    position.x < 100 &&
    position.y === 149 &&
    direction === "DOWN"
  ) {
    // E4 -> F3
    return {
      position: { x: 49, y: 150 + (position.x - 50) },
      direction: "LEFT",
    };
  } else if (
    position.x === 0 &&
    position.y >= 150 &&
    position.y < 200 &&
    direction === "LEFT"
  ) {
    // F2 -> A1
    return {
      position: { x: 50 + (position.y - 150), y: 0 },
      direction: "DOWN",
    };
  } else if (
    position.x === 49 &&
    position.y >= 150 &&
    position.y < 200 &&
    direction === "RIGHT"
  ) {
    // F3 -> E4
    return {
      position: { x: 50 + (position.y - 150), y: 149 },
      direction: "UP",
    };
  } else if (
    position.x >= 0 &&
    position.x < 50 &&
    position.y === 199 &&
    direction === "DOWN"
  ) {
    // F4 -> B1
    return {
      position: { x: 100 + position.x, y: 0 },
      direction: "DOWN",
    };
  } else {
    return {
      position: {
        x: position.x + DIRECTIONS[direction].x,
        y: position.y + DIRECTIONS[direction].y,
      },
      direction,
    };
  }
};

const findNextCube = (map, position, direction) => {
  const next = _findNextCube(position, direction);
  if (map[next.position.y][next.position.x] === true) {
    return next;
  } else {
    return null;
  }
};

/*
  |-----|-----|-----|
  |     |  1  |  1  |
  |     | 2A3 | 2B3 |
  |     |  4  |  4  |
  |-----|-----|-----|
  |     |  1  |     |
  |     | 2C3 |     |
  |     |  4  |     |
  |-----|-----|-----|
  |  1  |  1  |     |
  | 2D3 | 2E3 |     |
  |  4  |  4  |     |
  |-----|-----|-----|
  |  1  |     |     |
  | 2F3 |     |     |
  |  4  |     |     |
  |-----|-----|-----|
  

  A1 = F2
  A2 = D2
  A3 = B2 X
  A4 = C1 X
  B1 = F4
  B2 = A3 X
  B3 = E3
  B4 = C3
  C1 = A4 X
  C2 = D1
  C3 = B4
  C4 = E1 X
  D1 = C2
  D2 = A2
  D3 = E2 X
  D4 = F1 X
  E1 = C4 X
  E2 = D3 X
  E3 = B3
  E4 = F3
  F1 = D4 X 
  F2 = A1
  F3 = E4
  F4 = B1

*/

const print = (map, player, path = []) => {
  for (let y = 0; y < map.length; y++) {
    const line = [];
    for (let x = 0; x < map[y].length; x++) {
      if (x === player.position.x && y === player.position.y) {
        line.push(
          `\x1b[31m${
            player.direction === "RIGHT"
              ? ">"
              : player.direction === "UP"
              ? "^"
              : player.direction === "LEFT"
              ? "<"
              : "V"
          }\x1b[0m`,
        );
      } else if (
        path.some(({ position }) => position.x === x && position.y === y)
      ) {
        line.push("X");
      } else if (map[y][x] === null) {
        line.push(" ");
      } else if (map[y][x] === true) {
        line.push(".");
      } else {
        line.push("#");
      }
    }
    console.log(line.join(""));
  }
};

const part2 = async () => {
  const input = await readInput();
  let { map, commands } = parse(input);

  // // Remove walls for testing
  // map = map.map((line) => line.map((line) => (line === null ? null : true)));

  const connectedMap = connectCube(map);

  let player = {
    position: { x: map[0].findIndex((c) => c != null), y: 0 },
    direction: "RIGHT",
  };
  const path = [player];

  for (const command of commands) {
    player = applyCommand(connectedMap, player, command, path);
  }

  return score(player);
};

part1().then(console.log).then(part2).then(console.log);
