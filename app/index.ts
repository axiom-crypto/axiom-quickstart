
import { circuit, CircuitInputs } from "./axiom/average.circuit";
import dotenv from "dotenv";
dotenv.config();
import { Axiom, UserInput } from '@axiom-crypto/client';

// Inputs to the circuit
import inputs from './axiom/data/inputs.json';

// Compiled circuit file after running:
//   `npx axiom circuit compile app/axiom/average.circuit.ts`
import compiledCircuit from "./axiom/data/compiled.json";

const CHAIN_ID = "11155111";

if (!process.env[`RPC_URL_${CHAIN_ID}`]) {
  console.error(`No provider URI provided for env var \`RPC_URL_${CHAIN_ID}\`.`);
  process.exit(1);
}

const axiomMain = async (input: UserInput<CircuitInputs>) => {
  const axiom = new Axiom({
    circuit: circuit,
    compiledCircuit: compiledCircuit,
    chainId: CHAIN_ID,  // Sepolia
    provider: process.env[`RPC_URL_${CHAIN_ID}`] as string,
    privateKey: process.env[`PRIVATE_KEY_${CHAIN_ID}`] as string,
    callback: {
      target: "0x4A4e2D8f3fBb3525aD61db7Fc843c9bf097c362e",
    },
  });
  await axiom.init();
  const args = await axiom.prove(input);
  console.log("ZK proof generated successfully.");

  if (!process.env[`PRIVATE_KEY_${CHAIN_ID}`]) {
    console.log(`No private key provided for env var \`PRIVATE_KEY_${CHAIN_ID}\`: Query will not be sent to the blockchain.`);
    return;
  }

  console.log("Sending Query to Axiom on-chain...");
  const receipt = await axiom.sendQuery();
  console.log("Transaction receipt:", receipt);
  console.log(`View your Query on Axiom Explorer: https://explorer.axiom.xyz/v2/sepolia/query/${args.queryId}`);
};

axiomMain(inputs);
