const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [sensorX, sensorY, beaconX, beaconY] =
      /^Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)$/
        .exec(line)
        .slice(1)
        .map((x) => parseInt(x, 10));
    const sensor = { x: sensorX, y: sensorY };
    const beacon = { x: beaconX, y: beaconY };
    return {
      sensor,
      beacon,
      distance: d(sensor, beacon),
    };
  });
};

const d = (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

const intersects = ([x1, x2], [x3, x4]) => {
  const merged = merge([x1, x2], [x3, x4]);
  return merged[1] - merged[0] <= x2 - x1 + (x4 - x3);
};

const merge = ([x1, x2], [x3, x4]) => [Math.min(x1, x3), Math.max(x2, x4)];

const intersection = ([x1, x2], [x3, x4]) => [
  Math.max(x1, x3),
  Math.min(x2, x4),
];

const mergeIntervals = (intervals) => {
  const merged = [];
  const sorted = _.sortBy(intervals, [0, 1]);
  let current = sorted[0];
  for (let i = 1; i < intervals.length; i++) {
    const other = sorted[i];
    if (intersects(current, other)) {
      const merged = merge(current, other);
      current = merged;
    } else {
      merged.push(current);
      current = other;
    }
  }
  merged.push(current);

  return merged;
};

const part1 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  const row = 2000000;
  const intervals = [];
  for (let { sensor, beacon, distance } of parsed) {
    if (distance > Math.abs(sensor.y - row)) {
      const interval = [
        sensor.x - (distance - Math.abs(sensor.y - row)),
        sensor.x + (distance - Math.abs(sensor.y - row)),
      ];
      intervals.push(interval);
    }
  }
  const merged = mergeIntervals(intervals);
  return (
    _.sum(merged.map(([x1, x2]) => x2 - x1 + 1)) -
    _.uniqBy(
      parsed.filter(({ beacon }) => beacon.y === row),
      ({ beacon }) => `${beacon.x},${beacon.y}`,
    ).length
  );
};

const crop = (intervals, range) => {
  return intervals
    .map((interval) => {
      if (intersects(interval, range)) {
        return intersection(interval, range);
      } else {
        return null;
      }
    })
    .filter((x) => x != null);
};

const tuningFrequency = (x, y) => 4000000 * x + y;

const findGap = (intervals) => intervals[0][1] + 1;

const part2 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  for (let row = 0; row < 4000000; row++) {
    const intervals = [];
    for (let { sensor, beacon, distance } of parsed) {
      if (distance > Math.abs(sensor.y - row)) {
        const interval = [
          sensor.x - (distance - Math.abs(sensor.y - row)),
          sensor.x + (distance - Math.abs(sensor.y - row)),
        ];
        intervals.push(interval);
      }
    }
    const merged = mergeIntervals(intervals);
    const cropped = crop(merged, [0, 4000000]);
    if (cropped.length > 1) {
      return tuningFrequency(findGap(cropped), row);
    }
  }
};

part1().then(console.log).then(part2).then(console.log);
