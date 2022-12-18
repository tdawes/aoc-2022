const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");
const { sortedIndex } = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  const volcano = {
    valves: {},
    tunnels: {},
  };
  for (const line of lines) {
    const [key, flow, tunnels] =
      /^Valve (\w{2}) has flow rate=(\d+); tunnels? leads? to valves? (.*)$/
        .exec(line)
        .slice(1);
    volcano.valves[key] = parseInt(flow, 10);
    volcano.tunnels[key] = tunnels.split(", ");
  }
  return volcano;
};

const calculateRoute = (volcano, from, to) => {
  const queue = [{ p: from, path: [] }];
  const visited = new Set();
  while (queue.length > 0) {
    const next = queue.shift();
    visited.add(next.p);
    for (const neighbour of volcano.tunnels[next.p]) {
      if (neighbour === to) {
        return [...next.path, next.p, to];
      } else if (!visited.has(neighbour)) {
        queue.push({
          p: neighbour,
          path: [...next.path, next.p],
        });
      }
    }
  }
};

const condense = (volcano) => {
  volcano.routes = {};
  const nodes = Object.keys(volcano.valves);

  for (const node of nodes) {
    volcano.routes[node] = {};
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];

    for (let j = i + 1; j < nodes.length; j++) {
      const to = nodes[j];
      const route = calculateRoute(volcano, from, to);
      volcano.routes[from][to] = route;
      volcano.routes[to][from] = _.reverse([...route]);
    }
  }
};

const calculateScore = (volcano, remainingTimes) => {
  const sum = _.sum(
    Object.keys(remainingTimes).map(
      (valve) => volcano.valves[valve] * remainingTimes[valve],
    ),
  );
  return sum;
};

const findMaxFlow1 = (volcano, { current, open, time }) => {
  const nextSteps = Object.keys(volcano.routes[current]).filter(
    (target) =>
      open[target] == null &&
      volcano.valves[target] > 0 &&
      volcano.routes[current][target].length + 1 < time,
  );
  if (nextSteps.length === 0) {
    return calculateScore(volcano, open);
  } else {
    return _.max(
      nextSteps.map((target) =>
        findMaxFlow1(volcano, {
          current: target,
          open: {
            ...open,
            [target]: time - volcano.routes[current][target].length,
          },
          time: time - volcano.routes[current][target].length,
        }),
      ),
    );
  }
};

const findMaxFlow = (volcano, time) => {
  const context = { current: "AA", open: {}, time };
  return findMaxFlow1(volcano, context);
};

const part1 = async () => {
  const input = await readInput();
  const volcano = parse(input);
  condense(volcano);
  return findMaxFlow(volcano, 30);
};

const _getPossiblePartitions = (valves) => {
  if (valves.length === 0) {
    return [[[], []]];
  }
  const [first, ...rest] = valves;
  const subPartitions = _getPossiblePartitions(rest);
  return _.flatMap(subPartitions, ([left, right]) => [
    [[first, ...left], right],
    [left, [first, ...right]],
  ]);
};

const getPossiblePartitions = (valves) => {
  const [first, ...rest] = valves;
  const partitions = _getPossiblePartitions(rest);
  return partitions.map(([left, right]) => [[first, ...left], right]);
};

const subset = (volcano, valves) => {
  return {
    ...volcano,
    valves: _.mapValues(volcano.valves, (flowRate, valve) =>
      valves.includes(valve) ? flowRate : 0,
    ),
  };
};

const part2 = async () => {
  const input = await readInput();
  const volcano = parse(input);
  condense(volcano);
  const possiblePartitions = getPossiblePartitions(
    Object.keys(volcano.valves).filter((valve) => volcano.valves[valve] > 0),
  );
  console.log(possiblePartitions.length, "possible partitions");
  return _.max(
    possiblePartitions.map(([first, second], i) => {
      if (i % Math.floor(possiblePartitions.length / 10) == 0) {
        console.log(`${i / Math.floor(possiblePartitions.length / 10)}0% done`);
      }
      const volcano1 = subset(volcano, first);
      const volcano2 = subset(volcano, second);

      return findMaxFlow(volcano1, 26) + findMaxFlow(volcano2, 26);
    }),
  );

  // const context = {
  //   current: {
  //     me: { position: "AA", travelTime: 0 },
  //     elephant: { position: "AA", travelTime: 0 },
  //   },
  //   open: {},
  //   time: 26,
  // };
  // return findMaxFlow2(volcano, context);
};

part1().then(console.log).then(part2).then(console.log);
// part2().then(console.log);
