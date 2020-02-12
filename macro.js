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

function removeGaps(circuit) {
  const real = {};
  for (let g of circuit.gate) {
    for (let w of g.inputs.concat(g.outputs)) {
      real[w] = true;
    }
  }

  const rename = {};
  let first_gap = null;
  for (let i = 0; i < circuit.wires; i++) {
    if (real[i]) {
      if (first_gap != null) {
        rename[i] = first_gap;
        first_gap++;
      }
    } else if (first_gap == null) {
      first_gap = i;
    }
  }

  circuit.wires = first_gap;
  for (let g of circuit.gate) {
    for (let i = 0; i < g.inputs.length; i++) {
      if (rename[g.inputs[i]] != null) {
        g.inputs[i] = rename[g.inputs[i]];
      }
    }
    for (let i = 0; i < g.outputs.length; i++) {
      if (rename[g.outputs[i]] != null) {
        g.outputs[i] = rename[g.outputs[i]];
      }
    }
  }
}

module.exports = {
  renameAndDump: renameAndDump,
  renameOutputs: renameOutputs,
  removeGaps: removeGaps
};
