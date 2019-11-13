const fs = require('fs');

const macro = require('./macro.js');
const parser = require('./parser.js');

function assemble(path) {
  const subassemble = function (path) {
    // load and parse
    const circuit = parser.parse(path);

    // handle macros
    var counter = circuit.wires;
    var gates = [];
    for (let i = 0; i < circuit.gate.length; i++) {
      // case 1: plain gate
      var plainGates = ['AND', 'OR', 'INV'];
      if (plainGates.indexOf(circuit.gate[i].type) > -1) {
        gates.push(circuit.gate[i]);
        continue;
      }

      let parsed;
      if (circuit.gate[i].type.endsWith('.casm')) {
        // case 2: nested macro
        parsed = assemble(circuit.gate[i].type);
      } else {
        // case 3: simple gate file
        parsed = parser.parse(circuit.gate[i].type);
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

    return circuit;
  };

  const circuit = subassemble(path);
  macro.removeGaps(circuit);
  return circuit;
}

// Retreive Circuits
var path = process.argv[2];
const circuit = assemble(path);

console.log(circuit);
console.log(JSON.stringify(circuit, 2, 2));
console.log(parser.stringify(circuit, process.argv[3] == null ? null : 'circuits/' + process.argv[3]));

module.exports.assemble = assemble;
