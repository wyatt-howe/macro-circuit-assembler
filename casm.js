const fs = require('fs');

// Retreive Circuit
var path = 'macros/' + process.argv[2];
path = fs.existsSync(path)? path : process.argv[2];
const text = fs.readFileSync(path, 'utf8');

console.log(text);

// Load to JIGG circuit object

var circuit = {
  wires: 0, gates: 0,
  input: [], output: [],
  gate: []
};

const bristol = text.split('\n').map(function (line) {
  return line.split(' ');
});

circuit.gates = +bristol[0][0];
circuit.wires = +bristol[0][1];

for (var i = 1; i <= bristol[1][1]; i++) {
  circuit.input.push(i);
}

for (i = 1 + circuit.wires - bristol[2][1]; i <= circuit.wires; i++) {
  circuit.output.push(i);
}

for (i = 0; i < circuit.gates; i++) {
  var args = bristol[i+3];

  var gate = {};
  gate.wirein = [1+(+args[2])];
  if (parseInt(args[0]) === 2) {
    gate.wirein.push(1+(+args[3]));
  }
  gate.wireout = 1+(+args[2+(+args[0])]);
  gate.type = args[3+(+args[0])];

  circuit.gate.push(gate);
}

console.log(circuit);
console.log(JSON.stringify(circuit));

while (true) {}
