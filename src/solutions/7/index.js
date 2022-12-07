const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const _ = require("lodash");

const readFile = promisify(fs.readFile);

const readInput = async () => readFile(path.join(__dirname, "input"), "utf-8");

const parse = (input) => {
  const lines = input.split("\n");

  const context = { i: 0 };
  const visit = () => {
    const fileTree = { type: "directory", size: 0, contents: {} };
    while (context.i < lines.length) {
      const line = lines[context.i];

      context.i++;

      if (line === "$ cd ..") {
        return fileTree;
      }

      const cdMatch = /^\$ cd (.*)$/.exec(line);
      if (cdMatch != null) {
        const [, child] = cdMatch;
        fileTree.contents[child] = visit();
        fileTree.size += fileTree.contents[child].size;
        continue;
      }

      const dirMatch = /^dir (.*)$/.exec(line);
      if (dirMatch != null) {
        continue;
      }

      const fileMatch = /^(\d+) (.*)$/.exec(line);
      if (fileMatch != null) {
        const [, fileSizeStr, fileName] = fileMatch;
        const fileSize = parseInt(fileSizeStr, 10);
        fileTree.contents[fileName] = { type: "file", size: fileSize };
        fileTree.size += fileSize;
        continue;
      }
    }
    return fileTree;
  };

  return visit();
};

const part1 = async () => {
  const input = await readInput();
  const fileTree = parse(input);

  let total = 0;
  const visit = (node) => {
    if (node.type === "directory") {
      if (node.size <= 100000) {
        total += node.size;
      }
      Object.values(node.contents).forEach(visit);
    }
  };

  visit(fileTree);

  return total;
};

const part2 = async () => {
  const input = await readInput();
  const fileTree = parse(input);

  const diskUsed = fileTree.size;
  const availableSpace = 70000000 - diskUsed;
  const spaceToFree = 30000000 - availableSpace;

  let smallestSize = Number.MAX_SAFE_INTEGER;
  const visit = (node) => {
    if (node.type === "directory") {
      if (node.size >= spaceToFree) {
        if (node.size < smallestSize) {
          smallestSize = node.size;
        }
        Object.values(node.contents).forEach(visit);
      }
    }
  };
  visit(fileTree);
  return smallestSize;
};

part1().then(console.log).then(part2).then(console.log);
