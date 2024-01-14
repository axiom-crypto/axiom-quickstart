import {
  sum,
  div,
  addToCallback,
  CircuitValue,
  CircuitValue256,
  constant,
  witness,
  getAccount,
} from "@axiom-crypto/client";

/// For type safety, define the input types to your circuit here.
/// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself.
export interface CircuitInputs {
  blockNumber: CircuitValue;
  address: CircuitValue;
}

// Example inputs that the circuit will use for testing
export const inputs = {
  blockNumber: 5000000,
  address: "0xEaa455e4291742eC362Bc21a8C46E5F2b5ed4701"
}

export const circuit = async ({
  blockNumber,
  address,
}: CircuitInputs) => {
  // Number of samples to take. Note that this must be a constant value and NOT an input because the size of the circuit 
  // must be known at compile time.
  const samples = 8; 

  // Number of blocks between each sample.
  const spacing = 900;

  // Validate that the block number is greater than the number of samples times the spacing
  if (blockNumber.value() <= (samples * spacing)) {
    throw new Error("Block number must be greater than the number of samples times the spacing");
  }

  // Create an array of block numbers to sample from
  const blockNumbers = Array.from(
    {length: samples}, 
    (_: any, i: number) => blockNumber.number() - (spacing * i)
  );

  // Get all balances for the given address at the block numbers we are sampling from
  const balances = await Promise.all(
    // Call `getAccount` for each sample block number concurrently
    blockNumbers.map(
      (sampleBlockNum: number) => getAccount(sampleBlockNum, address).balance()
    )
  );

  // Calculate the total
  const total = sum(balances.map((balance: CircuitValue256) => balance.value()));

  // Divide by the number of samples to get the average value
  const average = div(total, samples);

  // We call `addToCallback` on all values that we would like to be passed to our contract after the circuit has
  // been proven in ZK. The values can then be handled by our contract once the prover calls the callback function.
  addToCallback(blockNumber);
  addToCallback(address);
  addToCallback(average);
};
