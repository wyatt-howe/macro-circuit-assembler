const fs = require('fs');

function parse(path) {
  const text = typeof(path) === "object" ? path : fs.readFileSync(path, 'utf8');

  var circuit = {
    wires: 0, gates: 0,
    inputs: [], outputs: [],
    gate: []
  };

  const bristol = text.split('\n').map(function (line) {
    return line.split(' ');
  });

  circuit.gates = +bristol[0][0];
  circuit.wires = +bristol[0][1];

  for (var i = 0; i < bristol[1][1]; i++) {
    circuit.inputs.push(i);
  }

  for (i = circuit.wires - bristol[2][1]; i < circuit.wires; i++) {
    circuit.outputs.push(i);
  }

  for (i = 0; i < circuit.gates; i++) {
    var args = bristol[i+3];

    var gate = {inputs: [], outputs: [], type: args[3+(+args[0])]};
    for (var j = 0; j < parseInt(args[0]); j++) {
      gate.inputs.push(+args[2+j]);
    }
    for (var j = 0; j < parseInt(args[1]); j++) {
      gate.outputs.push(+args[2+(+args[0])+j]);
    }
    circuit.gate.push(gate);
  }

  return circuit;
}

function stringify(circuit, path) {
  var bristol = [];

  // Encode header information and gates
  bristol[0] = [circuit.gates, circuit.wires];
  bristol[1] = [2, circuit.inputs.length/2];  // 1 input per party
  bristol[2] = [1, circuit.outputs.length];  // 1 output

  for (var i = 0; i < circuit.gate.length; i++) {
    const gate = circuit.gate[i];

    bristol[i+3] = [
      gate.inputs.length,
      gate.outputs.length,
      ...gate.inputs,
      ...gate.outputs,
      gate.type
    ];
  }

  // Stringify
  var text = bristol.map(line => line.join(' ')).join('\n');

  if (typeof(path) === 'string') {
    fs.writeFile(path, text, new Function());
  }
  return text;
}

module.exports = {
  parse: parse,
  stringify: stringify
};
