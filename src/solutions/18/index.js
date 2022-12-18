const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { trim } = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [x, y, z] = line.split(",").map((x) => parseInt(_.trim(x), 10));
    return [x, y, z];
  });
};

const SIDES = [
  [-1, 0, 0],
  [1, 0, 0],
  [0, -1, 0],
  [0, 1, 0],
  [0, 0, -1],
  [0, 0, 1],
];

const generateIndex = (cubes) => {
  const index = {};
  for (const [x, y, z] of cubes) {
    _.set(index, [x, y, z], true);
  }
  return index;
};

const surfaceArea = (cubes) => {
  const index = generateIndex(cubes);
  return _.flatMap(cubes, ([x, y, z]) =>
    SIDES.map(([dx, dy, dz]) => _.get(index, [x + dx, y + dy, z + dz])),
  ).filter((x) => x == null).length;
};

const part1 = async () => {
  const input = await readInput();
  const cubes = parse(input);
  return surfaceArea(cubes);
};

const key = ([x, y, z]) => `${x},${y},${z}`;

const part2 = async () => {
  const input = await readInput();
  const cubes = parse(input);

  const boundingBox = [
    [_.min(cubes.map(([x]) => x)) - 1, _.max(cubes.map(([x]) => x)) + 1],
    [_.min(cubes.map(([, y]) => y)) - 1, _.max(cubes.map(([, y]) => y)) + 1],
    [
      _.min(cubes.map(([, , z]) => z)) - 1,
      _.max(cubes.map(([, , z]) => z)) + 1,
    ],
  ];

  const index = generateIndex(cubes);
  const visited = {};
  const starting = [boundingBox[0][0], boundingBox[1][0], boundingBox[2][0]];
  _.set(visited, starting, true);

  const open = [starting];
  while (open.length > 0) {
    const [nx, ny, nz] = open.shift();

    for (const [dx, dy, dz] of SIDES) {
      const [x, y, z] = [nx + dx, ny + dy, nz + dz];
      if (
        x < boundingBox[0][0] ||
        x > boundingBox[0][1] ||
        y < boundingBox[1][0] ||
        y > boundingBox[1][1] ||
        z < boundingBox[2][0] ||
        z > boundingBox[2][1]
      ) {
        continue;
      }

      if (_.get(visited, [x, y, z])) {
        continue;
      }

      if (_.get(index, [x, y, z])) {
        continue;
      }

      open.push([x, y, z]);
      _.set(visited, [x, y, z], true);
    }
  }

  const completeCubes = [];

  for (let x = boundingBox[0][0]; x <= boundingBox[0][1]; x++) {
    for (let y = boundingBox[1][0]; y <= boundingBox[1][1]; y++) {
      for (let z = boundingBox[2][0]; z <= boundingBox[2][1]; z++) {
        if (!_.get(visited, [x, y, z])) {
          completeCubes.push([x, y, z]);
        }
      }
    }
  }

  return surfaceArea(completeCubes);
};

part1().then(console.log).then(part2).then(console.log);
