import {
  sum,
  sub,
  mul,
  div,
  checkLessThan,
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

// The function name `circuit` is searched for by default by our Axiom CLI; if you decide to 
// change the function name, you'll also need to ensure that you also pass the Axiom CLI flag 
// `-f <circuitFunctionName>` for it to work
export const circuit = async (inputs: CircuitInputs) => {
  // Number of samples to take. Note that this must be a constant value and NOT an input because the size of 
  // the circuit must be known at compile time.
  const samples = 8; 

  // Number of blocks between each sample.
  const spacing = 900;

  // Validate that the block number is greater than the number of samples times the spacing
  if (inputs.blockNumber.value() <= (samples * spacing)) {
    throw new Error("Block number must be greater than the number of samples times the spacing");
  }

  // Perform the block number validation in the circuit as well
  checkLessThan(mul(samples, spacing), inputs.blockNumber);

  // Creates a length-8 array of block numbers to sample from, starting from input blockNumber and 
  // decreasing by the `spacing` size.
  const blockNumbers = Array.from(
    {length: samples}, 
    (_: any, i: number) => sub(inputs.blockNumber, (spacing * i))
  );

  // Get all balances for the given address at the block numbers we are sampling from
  let balances = [] as CircuitValue256[];
  for (const blockNumber of blockNumbers) {
    const balance = await getAccount(blockNumber, inputs.address).balance();
    balances.push(balance); 
  }

  // Calculate the total
  const total = sum(balances.map((balance: CircuitValue256) => balance.value()));

  // Divide by the number of samples to get the average value
  const average = div(total, samples);

  // We call `addToCallback` on all values that we would like to be passed to our contract after the circuit has
  // been proven in ZK. The values can then be handled by our contract once the prover calls the callback function.
  addToCallback(inputs.blockNumber);
  addToCallback(inputs.address);
  addToCallback(average);
};