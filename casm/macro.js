const parser = require('./parser.js');

function renameAndDump(macro, counter) {
  const circuit = parser.parse('circuits/' + macro.type);
  for (var i = 0; i < circuit.gate.length; i++) {
    var gate = circuit.gate[i];
    gate.inputs = rename(macro, counter, circuit, gate.inputs);
    gate.outputs = rename(macro, counter, circuit, gate.outputs);
  }
  return circuit;
}

function rename(macro, counter, circuit, wires) {
  for (var i = 0; i < wires.length; i++) {
    const wire = wires[i];
    const inputIndex = circuit.inputs.indexOf(wire);
    const outputIndex = circuit.outputs.indexOf(wire);
    if (inputIndex > -1) {
      wires[i] = macro.inputs[inputIndex];
    } else if (outputIndex > -1) {
      wires[i] = macro.outputs[outputIndex];
    } else {
      wires[i] = wire + counter;
    }
  }
  return wires;
}

function renameOutputs(currentOutputs, newOutputs, gates) {
  for (var i = 0; i < gates.length; i++) {
    const gate = gates[i];
    rename({inputs: [], outputs: newOutputs}, 0, {outputs: currentOutputs, inputs: []}, gate.inputs);
    rename({inputs: [], outputs: newOutputs}, 0, {outputs: currentOutputs, inputs: []}, gate.outputs);
  }
}

function evalDirectives(circuit) {
  
}

module.exports = {
  renameAndDump: renameAndDump,
  renameOutputs: renameOutputs,
  evalDirectives: evalDirectives
};
