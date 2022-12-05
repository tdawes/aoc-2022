const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parseStacks = (input) => {
  const lines = input.split("\n").reverse();

  const numStacks = lines[0].split(/\s+/).filter((x) => x.length > 0).length;
  const crates = lines.slice(1);

  const stacks = _.range(0, numStacks).map(() => []);
  for (const line of crates) {
    stacks.forEach((stack, index) => {
      const crate = line[4 * index + 1];
      if (crate != null && crate.trim().length > 0) {
        stack.push(crate);
      }
    });
  }

  return stacks;
};

const parseCommands = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    const [count, from, to] = /^move (\d+) from (\d+) to (\d+)$/
      .exec(line)
      .slice(1)
      .map((x) => parseInt(x, 10));
    return { count, from: from - 1, to: to - 1 };
  });
};

const run = (stacks, commands, is9001 = false) => {
  for (const { count, from, to } of commands) {
    if (is9001) {
      stacks[to].push(
        ...stacks[from].splice(stacks[from].length - count, count),
      );
    } else {
      for (let i = 0; i < count; i++) {
        stacks[to].push(stacks[from].pop());
      }
    }
  }
  return stacks;
};

const parse = (input) => {
  const [stacksInput, commandsInput] = input.split("\n\n");

  const stacks = parseStacks(stacksInput);
  const commands = parseCommands(commandsInput);

  return { stacks, commands };
};

const part1 = async () => {
  const input = await readInput();
  const { stacks, commands } = parse(input);
  const output = run(stacks, commands);
  return output.map((stack) => stack.pop()).join("");
};

const part2 = async () => {
  const input = await readInput();
  const { stacks, commands } = parse(input);
  const output = run(stacks, commands, true);
  return output.map((stack) => stack.pop()).join("");
};

part1().then(console.log).then(part2).then(console.log);
