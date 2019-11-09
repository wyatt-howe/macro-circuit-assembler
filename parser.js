const fs = require('fs');

function range(start, end, increment) {
  const result = [];
  const b = start <= end;
  for (let i = start; b ? i <= end : i >= end; i+=increment) {
    result.push(i);
  }
  return result;
}

function parse(path) {
  const text = typeof(path) === "object" ? path : fs.readFileSync(path, 'utf8');

  var circuit = {
    wires: 0, gates: 0,
    inputs: [], outputs: [],
    gate: []
  };

  const bristol = text.split('\n').map(function (line) {
    const i = line.indexOf('#');
    if (i > -1) {
      line = line.substring(0, i-1);
    }
    line = line.trim();
    if (line.length === 0) {
      return [];
    }

    line = line.split(' ').filter(function (word) {
      return word.length > 0
    });

    for (let j = 0; j < line.length; j++) {
      const word = line[j];
      const i1 = word.indexOf('[');
      const i2 = word.indexOf(']');
      if (i1 < i2 && i1 > -1 && i2 > -1) {
        let range_ = word.substring(i1+1, i2);
        if (range_.indexOf(':') > -1) {
          range_ = range_.split(':');
          range_ = range(+range_[0], +range_[1], +range_[2] || 1);
          line = line.splice(0, j).concat(range_, line.slice(1))
          j += range_.length - 1;
        } else if (range_.indexOf('|>') > -1) {
          range_ = range_.split('|>');
          range_ = range(+range_[0], +range_[0] + +range_[1] - 1, 1);
          line = line.splice(0, j).concat(range_, line.slice(1))
          j += range_.length - 1;
        }
      }
    }

    return line;
  }).filter(function (line) {
    return line.length > 0;
  });

  circuit.wires = +bristol[0][1];
  for (var i = 0; i < (bristol[1][0] * bristol[1][1]); i++) {
    circuit.inputs.push(i);
  }

  for (i = 0; i < bristol.length-3; i++) {
    var args = bristol[i+3];

    var gate = {inputs: [], outputs: [], type: args[2+(+args[0])+(+args[1])]};
    for (var j = 0; j < parseInt(args[0]); j++) {
      gate.inputs.push(+args[2+j]);
    }
    for (var j = 0; j < parseInt(args[1]); j++) {
      gate.outputs.push(+args[2+(+args[0])+j]);
    }
    circuit.gate.push(gate);
  }

  circuit.gates = circuit.gate.length;
  for (i = circuit.wires - (bristol[2][0] * bristol[2][1]); i < circuit.wires; i++) {
    circuit.outputs.push(i);
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
