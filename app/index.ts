import dotenv from "dotenv";
dotenv.config();
import { CircuitInputs, circuit } from "./axiom/average.circuit";
import { ethers } from "ethers";
import { AxiomCircuit } from "@axiom-crypto/client/js";

// Compiled circuit file after running `npx axiom compile app/axiom/average.circuit.ts`
import buildJson from "./axiom/data/build.json";

// TMP: until we expose abi in AxiomCircuit
import axiomV2QueryJson from "./axiom/abi/AxiomV2Query.json";

const axiomMain = async () => {
  const axiomCircuit = new AxiomCircuit({
    provider: process.env.PROVIDER_URI_SEPOLIA as string,
    f: circuit,
    inputSchema: `{
      "blockNumber": "CircuitValue",
      "address": "CircuitValue"
    }`,
    chainId: "11155111", // Sepolia
    mock: false,
  });
  const defaultInputs = {
    blockNumber: 5000000,
    address: "0xEaa455e4291742eC362Bc21a8C46E5F2b5ed4701"
  };
  // const artifact = await axiomCircuit.compile(defaultInputs);

  // Instead of compiling, you can load from a saved artifact:
  await axiomCircuit.loadSaved({ config: buildJson.config, vk: buildJson.vk });
  await axiomCircuit.run(defaultInputs);
  console.log("Ran circuit:", axiomCircuit);

  const provider = new ethers.JsonRpcProvider(
    process.env.PROVIDER_URI_SEPOLIA as string,
  );
  const signer = new ethers.Wallet(
    process.env.PRIVATE_KEY_SEPOLIA as string,
    provider,
  );

  const axiomV2QueryAddr = "0x8ec7b212a983b1ebbfacfd69794ef179da1db0e0";
  const deployedCallbackAddr = "0x752056074aceabac231801cbfa68900744eebc98";
  const senderAddress = await signer.getAddress();

  const sendQueryArgs = await axiomCircuit.getSendQueryArgs({
    callbackAddress: deployedCallbackAddr,
    callbackExtraData: ethers.toBeHex("0x00", 32),
    callerAddress: senderAddress,
    options: { 
      maxFeePerGas: "50000000000",
      refundee: senderAddress 
    },
  });

  console.log("SendQuery args:", sendQueryArgs);

  const axiomV2QueryMock = new ethers.Contract(
    axiomV2QueryAddr,
    axiomV2QueryJson.abi,
    signer,
  );


  console.log(
    "Sending a Query to AxiomV2QueryMock with payment amount (wei):",
    sendQueryArgs.value,
  );

  const tx = await axiomV2QueryMock.sendQuery(...sendQueryArgs.args, { value: sendQueryArgs.value });
  const receipt: ethers.ContractTransactionReceipt = await tx.wait();
  console.log("Transaction receipt:", receipt);

  console.log(
    "View your Query on Axiom Explorer (currently not implemented for Sepolia):",
    `https://explorer.axiom.xyz/v2/sepolia/mock/query/${sendQueryArgs.queryId}`,
  );
};

axiomMain();
