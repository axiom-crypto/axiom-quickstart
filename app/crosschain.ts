import { AxiomCrosschain, BridgeType, UserInput } from '@axiom-crypto/client';
import { circuit, CircuitInputs } from "./axiom/average.circuit";
import { chainIdToPathname } from "./utils";
import dotenv from "dotenv";
dotenv.config();

// Inputs to the circuit
import inputs from './axiom/data/inputs.json';

// Compiled circuit file after running:
//   `npx axiom circuit compile app/axiom/average.circuit.ts`
import compiledCircuit from "./axiom/data/compiled.json";

const SOURCE_CHAIN_ID = "11155111";
const TARGET_CHAIN_ID = "84532";
const SOURCE_RPC_URL = process.env[`RPC_URL_${SOURCE_CHAIN_ID}`];
const TARGET_RPC_URL = process.env[`RPC_URL_${TARGET_CHAIN_ID}`];

if (!SOURCE_RPC_URL || !TARGET_RPC_URL) {
  console.error(`RPC URLs must be provided for env vars \`RPC_URL_${SOURCE_CHAIN_ID}\` and \`RPC_URL_${TARGET_CHAIN_ID}\`.`);
  process.exit(1);
}

const axiomMain = async (input: UserInput<CircuitInputs>) => {
  const axiom = new AxiomCrosschain({
    circuit,
    compiledCircuit,
    source: {
      chainId: SOURCE_CHAIN_ID,
      rpcUrl: SOURCE_RPC_URL,
    },
    target: {
      chainId: TARGET_CHAIN_ID,
      rpcUrl: TARGET_RPC_URL,
      privateKey: process.env[`PRIVATE_KEY_${TARGET_CHAIN_ID}`] as string,
    },
    bridgeType: BridgeType.BlockhashOracle,
    callback: {
      target: "0x4A4e2D8f3fBb3525aD61db7Fc843c9bf097c362e",
    },
  });
  await axiom.init();
  const args = await axiom.prove(input);
  console.log("ZK proof generated successfully.");

  if (!process.env[`PRIVATE_KEY_${TARGET_CHAIN_ID}`]) {
    console.log(`No private key provided for env var \`PRIVATE_KEY_${TARGET_CHAIN_ID}\`: Query will not be sent to the blockchain.`);
    return;
  }

  console.log("Sending Query to Axiom on-chain...");
  const receipt = await axiom.sendQuery();
  console.log("Transaction receipt:", receipt);
  console.log(`View your Query on Axiom Explorer: https://explorer.axiom.xyz/v2/${chainIdToPathname(TARGET_CHAIN_ID)}/${chainIdToPathname(SOURCE_CHAIN_ID)}/query/${args.queryId}`);
};

axiomMain(inputs);
