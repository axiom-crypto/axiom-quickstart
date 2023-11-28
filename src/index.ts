import {
  Axiom,
  AxiomConfig,
} from '@axiom-crypto/core';
import type { QueryBuilder } from '@axiom-crypto/core/query/queryBuilder';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const config: AxiomConfig = {
  providerUri: process.env.PROVIDER_URI_GOERLI || 'http://localhost:8545',
  version: "v1",
  chainId: 5,
  mock: true,
};
const ax = new Axiom(config);

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI_GOERLI as string);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

async function buildQuery(): Promise<QueryBuilder> {
  const queryData = [
    {
      blockNumber: 9335357,
      address: "0x4Fb202140c5319106F15706b1A69E441c9536306",
      slot: "0x1f5f6074f4419ff8032f6dd23e65794ca104b323667b66be5a0c73fd6ba2857e",
    }, {
      blockNumber: 9335466,
      address: "0x4Fb202140c5319106F15706b1A69E441c9536306",
      slot: "0xe162aef9009a7c65cb8d0c7992b1086de24c2a149b9b0d3db4ed7e64df46fa0f",
    }, {
      blockNumber: 9335492,
      address: "0x4Fb202140c5319106F15706b1A69E441c9536306",
      slot: (Math.floor(Math.random()*2**53)).toString(),
    }
  ];
  const qb = ax.newQueryBuilder();
  await qb.append(queryData[0]);
  await qb.append(queryData[1]);
  await qb.append(queryData[2]);
  return qb;
}

async function submitQuery(qb: QueryBuilder) {
  const { keccakQueryResponse, queryHash, query } = await qb.build();
  // Create instance of the axiomV1Query contract - later we'll call methods from this contract
  const axiomV1Query = new ethers.Contract(
    ax.getAxiomQueryAddress() as string,
    ax.getAxiomQueryAbi(),
    wallet
  );

  // Create an on-chain transaction encoding this query using the sendQuery function in the AxiomV1Query contract
  const txResult = await axiomV1Query.sendQuery(
    keccakQueryResponse,
    await wallet.getAddress(),
    query,
    {
      value: ethers.parseEther("0.01"), // Goerli payment amount
    }
  );
  const txReceipt = await txResult.wait();
  console.log("sendQuery Receipt", txReceipt);

  console.log("Waiting for proof to be generated. This may take a few minutes...")
  // Listen for the QueryFulfilled event emitted by the Axiom contract indicating the proof has been generated
  axiomV1Query.on("QueryFulfilled", async (keccakQueryResponse, _payment, _prover) => {
    console.log("Proof generated!")
  });
}

async function main() {
  const qb = await buildQuery();
  await submitQuery(qb);
}
main();
