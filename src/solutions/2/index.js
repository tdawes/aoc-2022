const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const FIRST_MAPPING = {
  A: "ROCK",
  B: "PAPER",
  C: "SCISSORS",
};

const SECOND_MAPPING = {
  X: "ROCK",
  Y: "PAPER",
  Z: "SCISSORS",
};

const THIRD_MAPPING = {
  X: "LOSE",
  Y: "DRAW",
  Z: "WIN",
};

const parse = (input) => {
  const lines = input.split("\n").map((line) => _.trim(line));
  return lines.map((line) => {
    const parts = line.split(" ");
    return {
      opponent: FIRST_MAPPING[parts[0]],
      you: SECOND_MAPPING[parts[1]],
      outcome: THIRD_MAPPING[parts[1]],
    };
  });
};

const GAME = {
  ROCK: "SCISSORS",
  SCISSORS: "PAPER",
  PAPER: "ROCK",
};

const calculateOutcome = ({ you, opponent }) => {
  if (GAME[you] == opponent) {
    return "WIN";
  } else if (you == opponent) {
    return "DRAW";
  } else {
    return "LOSE";
  }
};

const score = ({ you, outcome }) => {
  const roundScore = {
    WIN: 6,
    DRAW: 3,
    LOSE: 0,
  }[outcome];

  const choiceScore = {
    ROCK: 1,
    PAPER: 2,
    SCISSORS: 3,
  }[you];

  return roundScore + choiceScore;
};

const part1 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  const rounds = parsed.map((round) => ({
    ...round,
    outcome: calculateOutcome(round),
  }));
  return _.sum(rounds.map(score));
};

const calculateInput = ({ opponent, outcome }) => {
  if (outcome == "WIN") {
    return _.invert(GAME)[opponent];
  } else if (outcome == "DRAW") {
    return opponent;
  } else {
    return GAME[opponent];
  }
};

const part2 = async () => {
  const input = await readInput();
  const parsed = parse(input);
  const rounds = parsed.map((round) => ({
    ...round,
    you: calculateInput(round),
  }));
  return _.sum(rounds.map(score));
};

part1().then(console.log).then(part2).then(console.log);
