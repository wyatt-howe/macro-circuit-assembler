const fs = require('fs');

const macro = require('./macro.js');
const parser = require('./parser.js');

// Retreive Circuits
var path = 'macros/' + process.argv[2];
path = fs.existsSync(path) ? path : process.argv[2];

// load and parse
const circuit = parser.parse(path);

// handle macros
var counter = circuit.wires;
var gates = [];
for (i = 0; i < circuit.gate.length; i++) {
  var plainGates = ['AND', 'OR', 'INV'];
  if (plainGates.indexOf(circuit.gate[i].type) > -1) {
    gates.push(circuit.gate[i]);
    continue;
  }

  const result = macro.renameAndDump(circuit.gate[i], counter);
  gates = gates.concat(result.gate);
  counter += result.wires;
}
circuit.gate = gates;

// update meta data
circuit.gates = circuit.gate.length;

const newOutputs = circuit.outputs.map(i => i + counter);
circuit.wires = newOutputs.reduce(Math.max, 0) + 1;
macro.renameOutputs(circuit.outputs, newOutputs, circuit.gate);
circuit.outputs = newOutputs;

console.log(circuit);
console.log(JSON.stringify(circuit, 2, 2));
console.log(parser.stringify(circuit, process.argv[3] == null ? null : 'circuits/' + process.argv[3]));
