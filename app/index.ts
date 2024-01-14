
import { circuit, CircuitInputs } from "./axiom/average.circuit";
import dotenv from "dotenv";
dotenv.config();
import { Axiom } from '@axiom-crypto/client';
// Compiled circuit file after running:
//   `npx axiom circuit compile app/axiom/average.circuit.ts`
import compiledCircuit from "./axiom/data/compiled.json";

const exampleInput: any = {
  blockNumber: 5000000,
  address: "0xEaa455e4291742eC362Bc21a8C46E5F2b5ed4701",
};

const axiomMain = async (input: CircuitInputs) => {
  const axiom = new Axiom({
    circuit: circuit,
    compiledCircuit: compiledCircuit,
    inputSchema: {
      blockNumber: "uint32",
      address: "address",
    },
    chainId: "11155111",  // Sepolia
    provider: process.env.PROVIDER_URI_SEPOLIA as string,
    privateKey: process.env.PRIVATE_KEY_SEPOLIA as string,
    mock: false,
  });
  await axiom.init();

  const args = await axiom.prove(input);
  const receipt = await axiom.sendQuery(args);
  console.log("Transaction receipt:", receipt);
};

axiomMain(exampleInput);
