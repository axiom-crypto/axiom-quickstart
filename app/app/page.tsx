"use client";

import React from 'react';
import Sidebar from './components/ui/Sidebar';
import InteractiveCodeDisplay from './components/InteractiveCodeDisplay';
import ConnectWallet from "./components/ui/ConnectWallet";
import BuildQuery from "./components/BuildQuery";
import { bytes32 } from "./lib/utils";
import { Link } from 'react-router-dom';

interface PageProps {
  params: Params;
  searchParams: SearchParams;
}

interface Params {
  slug: string;
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

const Home: React.FC<PageProps> = ({ searchParams }) => {
  const connected = searchParams?.connected as string ?? "";
  const blockNumber = searchParams?.blockNumber as string ?? "";

  // const circuit = useAxiomCircuit();

  const renderWalletButton = () => {
    return <ConnectWallet connected={connected} />;
  }

  //  This function is called when the button is clicked
   const handleClick = async () => {
    const inputs = {
      address: connected,
      blockNumber: 1,
    };
    <BuildQuery
          inputs={inputs}
          callbackAddress={connected}
          callbackExtraData={bytes32(connected)}
        />
  };

  const solutionCode1 = 
  `
  // Since the blockNumber is a variable input, let's add it to the results that will be sent to my callback function:
  addToCallback(blockNumber);
  addToCallback(address);

  const account = getAccount(blockNumber, address);
  // We add a subquery for the account nonce. Note you need to 'await'!
  const bigNonce = await account.nonce();
  // The default return value is 'CircuitValue256', but the nonce should always fit in 'uint128' so we can cast it:
  const nonce = bigNonce.toCircuitValue();

  // As an example of additional compute, we increment the nonce by 1
  const incNonce = add(nonce, constant(1));
  // We add the result to the callback
  addToCallback(incNonce);
  `;


  const solutionCode2 = `
    uint256 blockNumber = uint256(axiomResults[0]);
    address addr = address(uint160(uint256(axiomResults[1])));
    uint256 nonceInc = uint256(axiomResults[2]);

    blockToAddrToNonceInc[blockNumber][addr] = nonceInc;

    emit NonceIncrementStored(blockNumber, addr, nonceInc);
  `;
  return (
    
    <div className="flex min-h-screen bg-gray-100">
            {/* <Sidebar /> */}
            <div className="flex-1 p-8">

    <h1 className="text-2xl font-bold mb-4">Axiom dApp Interactive Tutorial</h1>
    <p className="mt-4">
            In this interactive tutorial, we will build a dApp that <span>[change description]</span>. 
      The average value that we end up with can be used in a number of ways. For example:
      <ol className="list-decimal ml-4">
        <li>Gating access to a protocol</li>
        <li >Allowing a user to mint an NFT</li>
        <li >Giving a user an airdrop</li>
        <li >Updating smart contract parameters</li>
        <li >Autonomous governance</li>
        <li >Your imagination is the limit!</li>
      </ol>
    </p>
    <p>To get started, follow the steps below:</p>
    <ol>
      <li>
        Write a description of a circuit using JavaScript<br />
        We need to describe the circuit that we’d like to build. The circuit will simply generate a proof 
        of the user’s nonce and a specific block number. The template for the circuit that you’ll be writing 
        is located in axiom/circuit.ts.<br />
        <InteractiveCodeDisplay solutionCode={solutionCode1} />
      </li>
      <li>
        Compile the circuit<br />
        A default input to the circuit exists in data/inputs/defaultInput.json, which will be used when the 
        circuit is compiled. Before compiling the circuit, please export enter a JSON-RPC provider URI 
        (from an RPC provider such as <a href="https://www.quicknode.com" target="_blank" rel="noopener noreferrer">QuickNode</a>, <a href="https://www.infura.io/" target="_blank" rel="noopener noreferrer">Alchemy</a>, <a href="https://www.alchemy.com/" target="_blank" rel="noopener noreferrer">Infura</a>, etc. starts with https://):<br />
        <code>export PROVIDER_URI_GOERLI=&lt;your provider URI&gt;</code><br />
        To compile the circuit, run the following command in this project’s root directory in the same terminal window 
        with which you exported the provider URI above:<br />
        <code>npx axiom compile axiom/circuit.ts --function nonceIncrementor --inputs data/inputs/defaultInput.json --provider $PROVIDER_URI_GOERLI</code>
      </li>
      <li>
        Fill out the callback function in the smart contract template<br />
        The smart contract template located in src/CounterIncrementor.sol contains a callback function 
        _axiomV2Callback that will handle the results from the callback and increment a counter if the value 
        is greater than some number.<br />
        <InteractiveCodeDisplay solutionCode={solutionCode2} />
      </li>
      <li>
        {renderWalletButton()}
        Sending a Query<br />
        Now that this Next.js dApp includes the Axiom circuit file, we can go ahead 
        and have the user connect their wallet, which will then pass their address as an input to the circuit. The user’s browser generates a local client-side proof, which we send as an on-chain Query to the Axiom ZK prover to aggregate into a ZK proof that can be verified on-chain. We ask the user to submit 0.0205 ETH with their Query, which covers the cost of the proving and the callback.<br />
        <button onClick={handleClick}>Generate and Send Proof on Goerli</button>
      </li>
      <li>
        See status of a Query<br />
        The status of any Query can be seen in Axiom Explorer. 
      </li>
      <li>
        What’s next<br />
        Now that this is complete, we will want to deploy a contract on-chain that handles the callback. Please see the examples-v2 repository for additional examples.
      </li>
    </ol>
  </div>
  </div>

  )
}
export default Home;
