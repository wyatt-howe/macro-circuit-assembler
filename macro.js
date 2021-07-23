'use strict';

function renameAndDump(macroDescription, macroCircuit, counter) {
  for (let i = 0; i < macroCircuit.gate.length; i++) {
    let gate = macroCircuit.gate[i];
    gate.inputs = rename(macroDescription, counter, macroCircuit, gate.inputs);
    gate.outputs = rename(macroDescription, counter, macroCircuit, gate.outputs);
  }
  return macroCircuit;
}

function rename(macro, counter, circuit, wires) {
  for (let i = 0; i < wires.length; i++) {
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
  for (let i = 0; i < gates.length; i++) {
    const gate = gates[i];
    rename({inputs: [], outputs: newOutputs}, 0, {outputs: currentOutputs, inputs: []}, gate.inputs);
    rename({inputs: [], outputs: newOutputs}, 0, {outputs: currentOutputs, inputs: []}, gate.outputs);
  }
}

module.exports = {
  renameAndDump: renameAndDump,
  renameOutputs: renameOutputs
};
