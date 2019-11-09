# macro-circuit-assembler
Expand a macro-circuit into standard Bristol format

## Running
The circuit assembler is located in `casm/casm.js` and accepts two parameters like follows.  Macros and circuits can be assembled from anywhere but default to their respective directories if not otherwise specified.
```shell
node casm/casm.js [macro/]<macro>.casm [[circuits/]<bristol>.txt]
```

For example, to assemble and save the 8-bit AND circuit, run:
```shell
node casm/casm.js and8.casm and8.txt
```

## Syntax
Macro format provides the following directives:

```as3
[start:end]  // wires numbered start to end
[start:end:increment]  // incremental numbered wires
[start|>multiplicity]  // multiple wires from a starting id
```

For example `[10|>5]` represents `10 11 12 13 14` and `[2:10:2]` gives `2 4 6 8 10`.  Using a negative increment is also legal.  For example `[end:start:-1]` reverses a range of inputs.  Line comments are supported and marked by hashes "#". 
