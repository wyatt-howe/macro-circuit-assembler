'use strict';

const pathlib = require('path');
const fs = require('fs');

const macro = require('./macro.js');
const parser = require('./parser.js');

function assemble(circuit, currentDir) {
  currentDir = currentDir == null ? '' : currentDir;

  // handle macros
  let counter = circuit.wires;
  let gates = [];
  for (let i = 0; i < circuit.gate.length; i++) {
    // case 1: plain gate
    let plainGates = ['AND', 'OR', 'INV'];
    if (plainGates.indexOf(circuit.gate[i].type) > -1) {
      gates.push(circuit.gate[i]);
      continue;
    }

    let parsed;
    const nestedpath = pathlib.isAbsolute(circuit.gate[i].type) ? circuit.gate[i].type : pathlib.join(currentDir, circuit.gate[i].type);
    if (circuit.gate[i].type.endsWith('.casm')) {
      // case 2: nested macro
      parsed = assemble(parser.parse(fs.readFileSync(nestedpath, 'utf8')), pathlib.dirname(nestedpath));
    } else {
      // case 3: simple gate file
      parsed = parser.parse(fs.readFileSync(nestedpath, 'utf8'));
    }

    const result = macro.renameAndDump(circuit.gate[i], parsed, counter);
    gates = gates.concat(result.gate);
    counter += result.wires;
  }
  circuit.gate = gates;

  // update meta data
  circuit.gates = circuit.gate.length;

  const newOutputs = circuit.outputs.map(i => i + counter);
  circuit.wires = Math.max.apply(null, newOutputs) + 1;
  macro.renameOutputs(circuit.outputs, newOutputs, circuit.gate);
  circuit.outputs = newOutputs;

  macro.removeGaps(circuit);

  return circuit;
}

function parseAndAssemble(inputPath) {
  const inputCircuit = parser.parse(fs.readFileSync(inputPath, 'utf8'));
  const assembledCircuit = assemble(inputCircuit, pathlib.dirname(inputPath));
  return parser.stringify(assembledCircuit);
}

// Read command line args if run as a node.js application
if (require.main === module) {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  const assembledString = parseAndAssemble(inputPath);

  if (outputPath) {
    fs.writeFileSync(outputPath, assembledString);
  } else {
    console.log(assembledString);
  }
}

module.exports = {
  parse: parser.parse,
  assemble: assemble,
  parseAndAssemble: parseAndAssemble,
  stringify: parser.stringify
};