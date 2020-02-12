# macro-circuit-assembler

Expand a macro-circuit into standard Bristol format

## Running

The circuit assembler is located in `casm.js` and accepts two parameters like follows.
```shell
node casm.js </path/to/macro.casm> <path/to/output-circuit.txt>
```

For example, to assemble the 8-bit AND circuit, run:
```shell
node casm.js example/and8.casm output.txt
```

You can also run the assembler inside your node application:
```javascript
const casm = require('casm');
console.log(casm.parseAndAssemble('path/to/macro.casm'));
```

Custom workflows are supported by using lower level functions. For example, to
assemble a macro description that is currently in memory as text or as a circuit object:
```javascript
const macroText = '...';

const inputCircuitObject = casm.parse(macroText);
const assembledCircuitObject = casm.assemble(inputCircuitObject, 'working/dir');
const assembledCircuitText = casm.stringify(assembledCircuitObject);

// if the macroText referes to other files (either macro or circuit)
// for example 'circuit/some/circuit.txt', the assembler will look for these
// circuit under 'working/dir', for example 'working/dir/circuit/some/circuit.txt'
// unless the nested file path is absolute.
// working directory defaults to the current working directory if it is not provided.
```


## Capabilities

### Syntax

Macro format extends the bristol fashion.

The file must start with the following header:
```as3
<number of gates> <number of wires>
<number of inputs> <size of each input> ...
<number of outputs> <size of each output> ...
```

Following this header, every line defines a gate, which itself
can be another circuit, macro, or plain gate.

```as3
<number of input wires> <number of output wires> <input wire 1> ... <output wire 1> ... <gate type>
```

For example
```as3
3 12
8 1
1 2
4 1 0 1 2 3 8 ../circuits/and4.txt
4 1 4 5 6 7 9 /home/casm/circuits/and4.casm
2 1 8 9 10 AND
1 1 10 11 INV
```

Plain gate can have type `AND`, `XOR`, or `INV`, while nested circuits and macros
can be defined by using their file path as type, which must end with either `.txt` or `.casm` respectively.

Relative paths are resolved relative to the directory in which the macro is stored. Absolute paths are also
allowed.

### Directives

Macro format provides the following directives, which can be used wherever wire numbers are appropriate:
```as3
[start:end]  // wires numbered start to end
[start:end:increment]  // incremental numbered wires
[start|>multiplicity]  // multiple wires from a starting id
```

For example `[10|>5]` represents `10 11 12 13 14` and `[2:10:2]` gives `2 4 6 8 10`.  Using a negative increment is also legal.  For example `[end:start:-1]` reverses a range of inputs.

Line comments are supported and marked by hashes "#". 

### Applications

Boolean circuit definitions are useful in multi-party computation applications such as [JIGG](https://github.com/multiparty/jigg) and [SCALE-MAMBA](https://github.com/KULeuven-COSIC/SCALE-MAMBA/tree/master/Circuits/Bristol).
