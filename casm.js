'use strict';

const pathlib = require('path');
const fs = require('fs');

const macro = require('./macro.js');
const parser = require('./parser.js');

function assemble(circuit, currentDir) {
  currentDir = currentDir == null ? '' : currentDir;

  // handle macros
  let gates = [];
  let parsedGates = [];
  for (let i = 0; i < circuit.gate.length; i++) {
    // case 1: plain gate
    let plainGates = ['AND', 'XOR', 'INV'];
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

    parsedGates.push({ 'parsed': parsed, 'index': i });
  }

  //calculate the total amount of intermediate wires inside nested circuits
  let intermediateWires = 0
  for (let i = 0; i < parsedGates.length; i++) {
    let parsed = parsedGates[i].parsed;
    intermediateWires += (parsed.wires - parsed.inputs.length - parsed.outputs.length);
  }
  // find circuit outputs in inputs/outputs of gates and shift them 
  // to the very end of the new wires range
  const outputRange = [];
  for (let i = circuit.wires - circuit.outputs.length; i < circuit.wires; i++) {
    outputRange.push(i);
  }
  for (let i = 0; i < circuit.gate.length; i++) {
    const inputs = circuit.gate[i].inputs;
    for (let j = 0; j < inputs.length; j++) {
      if (outputRange.indexOf(inputs[j]) > -1) {
        circuit.gate[i].inputs[j] = inputs[j] + intermediateWires;
      }
    }
    const outputs = circuit.gate[i].outputs;
    for (let k = 0; k < outputs.length; k++) {
      if (outputRange.indexOf(outputs[k]) > -1) {
        circuit.gate[i].outputs[k] = outputs[k] + intermediateWires;
      }
    }
  }

  // shift all nested circuits' intermediate wires to the new offset
  // not touching the plain gates - they remain at their offsets
  var offset = circuit.wires - circuit.outputs.length; // start where circuit outputs originally were
  for (let i = 0; i < parsedGates.length; i++) {
    const parsed = parsedGates[i].parsed;
    const idx = parsedGates[i].index;
    const shiftBy = offset - circuit.gate[idx].inputs.length;
    const result = macro.renameAndDump(circuit.gate[idx], parsed, shiftBy);
    gates.splice(idx, 0, result.gate);
    offset += (result.wires - result.inputs.length - result.outputs.length);
  }

  // flatten gates
  circuit.gate = [].concat.apply([], gates);

  // update meta data
  circuit.gates = circuit.gate.length;
  circuit.wires = circuit.wires + intermediateWires;
  circuit.outputs = circuit.outputs.map(i => i + intermediateWires);

  //check if any gaps exist
  const real = {};
  for (let g of circuit.gate) {
    for (let w of g.inputs.concat(g.outputs)) {
      real[w] = true;
    }
  }
  for (let i = 0; i < circuit.wires; i++) {
    if (!real[i]) {
      console.log('gap at position:', i);
      throw ('Error: gap detected');
    }
  }
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