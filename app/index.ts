
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
    chainId: "84532",  // Base Sepolia
    provider: process.env.PROVIDER_URI_84532 as string,
    privateKey: process.env.PRIVATE_KEY_84532 as string,
    callback: {
      target: "0x3b49DE82B86d677C072Dcc7ED47bcA9F20f0CF46",
    },
    options: {
      maxFeePerGas: "10000000",
      callbackGasLimit: 100000,
      overrideAxiomQueryFee: "60000000000000000", // 30000000000000000, 3000000000
    }
  });
  await axiom.init();
  const args = await axiom.prove(input);
  console.log("ZK proof generated successfully.", args.args);

  if (!process.env.PRIVATE_KEY_SEPOLIA) {
    console.log("No private key provided: Query will not be sent to the blockchain.");
    return;
  }

  console.log("Sending Query to Axiom on-chain...");
  const receipt = await axiom.sendQuery();
  console.log("Transaction receipt:", receipt);
  console.log(`View your Query on Axiom Explorer: https://explorer.axiom.xyz/v2/base-sepolia/query/${args.queryId}`);
  console.log(`View your Query on localhost: http://localhost:3000/v2/base-sepolia/query/${args.queryId}`);
};

axiomMain(inputs);
