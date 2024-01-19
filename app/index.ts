
import { circuit, CircuitInputs } from "./axiom/average.circuit";
import dotenv from "dotenv";
dotenv.config();
import { Axiom, UserInput } from '@axiom-crypto/client';

// Inputs to the circuit
import inputs from './axiom/data/inputs.json';

// Compiled circuit file after running:
//   `npx axiom circuit compile app/axiom/average.circuit.ts`
import compiledCircuit from "./axiom/data/compiled.json";

const axiomMain = async (input: UserInput<CircuitInputs>) => {
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
    mock: true,
    callback: {
      target: "0x4A4e2D8f3fBb3525aD61db7Fc843c9bf097c362e",
    },
  });
  await axiom.init();
  const args = await axiom.prove(input);
  console.log("ZK proof generated successfully.");

  if (!process.env.PRIVATE_KEY_SEPOLIA) {
    console.log("No private key provided: Query will not be sent to the blockchain.");
    return;
  }

  console.log("Sending Query to Axiom on-chain...");
  const receipt = await axiom.sendQuery(args);
  console.log("Transaction receipt:", receipt);
  console.log(`View your Query on Axiom Explorer: https://explorer.axiom.xyz/v2/sepolia/mock/query/${args.queryId}`);
};

axiomMain(inputs);
