const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");
  return lines.map((line) => {
    const parts = line.split(" ");
    switch (parts[0]) {
      case "noop":
        return { command: "noop", wait: 0 };
      case "addx":
        return { command: "addx", value: parseInt(parts[1], 10), wait: 1 };
    }
  });
};

const part1 = async () => {
  const input = await readInput();
  const commands = parse(input);

  let cycle = 0;
  let commandIndex = 0;

  const scores = [];
  const importantCycles = [20, 60, 100, 140, 180, 220];
  const memory = { x: 1 };

  const processCommand = (command) => {
    if (command.command === "noop") {
      // Do nothing
    } else if (command.command === "addx") {
      memory.x += command.value;
    }
  };

  while (true) {
    cycle += 1;

    if (importantCycles.includes(cycle)) {
      scores.push(cycle * memory.x);
    }

    const command = commands[commandIndex];
    if (command.wait > 0) {
      command.wait -= 1;
    } else {
      processCommand(command);
      commandIndex += 1;
    }

    if (cycle === Math.max(...importantCycles)) {
      break;
    }
  }

  return _.sum(scores);
};

const part2 = async () => {
  const input = await readInput();
  const commands = parse(input);

  let cycle = 0;
  let commandIndex = 0;

  const display = [];
  let line = [];
  const memory = { x: 1 };

  const processCommand = (command) => {
    if (command.command === "noop") {
      // Do nothing
    } else if (command.command === "addx") {
      memory.x += command.value;
    }
  };

  while (true) {
    cycle += 1;

    if (Math.abs(memory.x - ((cycle - 1) % 40)) <= 1) {
      line.push("#");
    } else {
      line.push(".");
    }

    if (cycle % 40 === 0) {
      display.push(line.join(""));
      line = [];
    }

    const command = commands[commandIndex];
    if (command.wait > 0) {
      command.wait -= 1;
    } else {
      processCommand(command);
      commandIndex += 1;
    }

    if (cycle === 240) {
      break;
    }
  }

  return display.join("\n");
};

part1().then(console.log).then(part2).then(console.log);
