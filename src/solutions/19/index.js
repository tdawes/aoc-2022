const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [
      blueprint,
      oreRobotOreCost,
      clayRobotOreCost,
      obsidianRobotOreCost,
      obsidianRobotClayCost,
      geodeRobotOreCost,
      geodeRobotObsidianCost,
    ] = /^Blueprint (\d+): Each ore robot costs (\d+) ore. Each clay robot costs (\d) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian.$/
      .exec(line)
      .slice(1)
      .map((x) => parseInt(x, 10));
    return {
      id: blueprint,
      robots: {
        ore: {
          ore: oreRobotOreCost,
        },
        clay: {
          ore: clayRobotOreCost,
        },
        obsidian: {
          ore: obsidianRobotOreCost,
          clay: obsidianRobotClayCost,
        },
        geode: {
          ore: geodeRobotOreCost,
          obsidian: geodeRobotObsidianCost,
        },
      },
    };
  });
};

const memoize = (fn, key) => {
  const cache = {};
  return (...args) => {
    const k = key(...args);
    if (k in cache) {
      return cache[k];
    }
    const r = fn(...args);
    cache[k] = r;
    return r;
  };
};

const canAfford = (blueprint, type, inventory) =>
  Object.keys(blueprint.robots[type]).every(
    (resource) => inventory[resource] >= blueprint.robots[type][resource],
  );

const hash = (blueprint, context) =>
  [
    blueprint.id,
    context.time,
    context.inventory.ore,
    context.inventory.clay,
    context.inventory.obsidian,
    context.inventory.geode,
    context.robots.ore,
    context.robots.clay,
    context.robots.obsidian,
    context.robots.geode,
  ].join(":");

const buildRobot = (blueprint, newRobotType, context) => {
  const finalInventory = _.mapValues(
    context.inventory,
    (n, type) =>
      n + context.robots[type] - (blueprint.robots[newRobotType][type] || 0),
  );

  return {
    ...context,
    time: context.time - 1,
    inventory: finalInventory,
    robots: {
      ...context.robots,
      [newRobotType]: context.robots[newRobotType] + 1,
    },
  };
};

const doNothing = (context) => ({
  ...context,
  time: context.time - 1,
  inventory: _.mapValues(
    context.inventory,
    (n, type) => n + context.robots[type],
  ),
});

const theoreticalMax = (context) =>
  context.inventory.geode +
  context.robots.geode * context.time +
  (context.time * (context.time + 1)) / 2;

const maxRobotsNeeded = memoize(
  (blueprint, type) =>
    _.max(
      Object.keys(blueprint.robots).map(
        (robotType) => blueprint.robots[robotType][type] || 0,
      ),
    ),
  (blueprint, type) => `${blueprint.id}:${type}`,
);

const findMaxGeodes = (blueprint, time, allowSkip = false) => {
  const initialContext = {
    inventory: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
    robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    time,
  };
  const queue = [initialContext];
  const seen = {};

  let max = 0;

  while (queue.length > 0) {
    const context = queue.pop();

    const h = hash(blueprint, context);
    const hasSeen = seen[h];
    if (hasSeen) {
      continue;
    }

    seen[h] = true;

    if (context.time <= 0) {
      if (context.inventory.geode > max) {
        max = context.inventory.geode;
      }
      continue;
    }

    if (theoreticalMax(context) <= max) {
      continue;
    }

    if (canAfford(blueprint, "geode", context.inventory)) {
      queue.push(buildRobot(blueprint, "geode", context));
    } else {
      let canBuildAll = true;
      for (const type of ["ore", "clay", "obsidian"]) {
        if (context.robots[type] >= maxRobotsNeeded(blueprint, type)) {
          continue;
        } else if (canAfford(blueprint, type, context.inventory)) {
          queue.push(buildRobot(blueprint, type, context));
        } else {
          canBuildAll = false;
        }
      }
      if (!allowSkip || !canBuildAll) {
        queue.push(doNothing(context));
      }
    }
  }
  return max;
};

const part1 = async () => {
  const input = await readInput();
  const blueprints = parse(input);
  return _.sum(
    blueprints.map(
      (blueprint) =>
        blueprint.id * findMaxGeodes(blueprint, 24 /*blueprint.id !== 8*/),
    ),
  );
};

const part2 = async () => {
  const input = await readInput();
  const blueprints = parse(input);
  return (
    findMaxGeodes(blueprints[0], 32, true) *
    findMaxGeodes(blueprints[1], 32, true) *
    findMaxGeodes(blueprints[2], 32, true)
  );
};

part1().then(console.log).then(part2).then(console.log);
