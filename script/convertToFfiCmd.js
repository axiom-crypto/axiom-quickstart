// Usage: node script/convertToFfiCmd.js "npx axiom circuit --ouput data.json --provider vm.rpcUrl('goerli')" <optional varName>

const args = process.argv[2].split(" ");
let varName = "cli"

if (process.argv[3] !== undefined) {
  varName = process.argv[3]
}

const lines = args.map((line, i) => {
  return `${varName}[${i}] = "${line}";`;
});

const script = `
string[] memory ${varName} = new string[](${args.length});
${lines.join("\n")}
bytes memory res = vm.ffi(${varName});
`;

console.log(script);