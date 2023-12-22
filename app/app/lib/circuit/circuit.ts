import { CircuitValue, getReceipt, getTx, addToCallback } from "@axiom-crypto/client";
export const inputs = {
  blockNumber: 9610835,
  txIdx: 6,
  logIdx: 3
};
export type CircuitInputType = typeof inputs;
export interface CircuitInputs extends CircuitInputType { }
export interface CircuitValueInputs {
  blockNumber: CircuitValue;
  txIdx: CircuitValue;
  logIdx: CircuitValue;
}
export const circuit = async ({ blockNumber, txIdx, logIdx }: CircuitValueInputs) => {
  const eventSchema =
    "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

  // specify and fetch the data you want Axiom to verify
  let receipt = getReceipt(blockNumber, txIdx);
  let receiptLog = receipt.log(logIdx); //get the log at index 3

  // get the topic at index 0 (event schema)
  let swapSchema = await receiptLog.topic(0, eventSchema);

  // get the topic at index 2
  let swapTo = await receiptLog.topic(2, eventSchema);

  // get the block number for receipt
  let blockNum = await receipt.blockNumber();

  // get the `to` field of the transaction
  let tx = getTx(blockNumber, txIdx);
  let txTo = await tx.to();

  addToCallback(swapSchema);
  addToCallback(swapTo);
  addToCallback(blockNum);
  addToCallback(txTo);
};
