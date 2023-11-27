// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {AxiomNonceIncrementor} from "../src/AxiomNonceIncrementor.sol";
import {IAxiomV2Query} from "axiom-v2-contracts/contracts/interfaces/query/IAxiomV2Query.sol";

contract AxiomNonceIncrementorTest is Test {
    AxiomNonceIncrementor public axiomNonceInc;
    address public axiomV2QueryMock = 0xf15cc7B983749686Cd1eCca656C3D3E46407DC1f;
    bytes32 querySchema;
    uint64 sourceChainId = 5;

    function setUp() public {
        vm.createSelectFork("goerli");
        vm.makePersistent(axiomV2QueryMock);

        // Use axiom cli to compile circuit and read the query schema from build artifacts
        string[] memory cli = new string[](10);
        cli[0] = "npx";
        cli[1] = "axiom";
        cli[2] = "compile";
        cli[3] = "axiom/circuit.ts";
        cli[4] = "--function";
        cli[5] = "nonceIncrementor";
        cli[6] = "--inputs";
        cli[7] = "data/inputs/defaultInput.json";
        cli[8] = "--provider";
        cli[9] = vm.rpcUrl("goerli");
        vm.ffi(cli);

        string memory artifact = vm.readFile("data/build.json");
        querySchema = bytes32(vm.parseJson(artifact, ".querySchema"));
        emit log_named_bytes32("querySchema", querySchema);

        axiomNonceInc = new AxiomNonceIncrementor(axiomV2QueryMock, sourceChainId, querySchema);
    }

    function testAxiomSendQuery() public {
        // Use axiom cli to prove the client circuit on given input.json
        string[] memory cli = new string[](10);
        cli[0] = "npx";
        cli[1] = "axiom";
        cli[2] = "run";
        cli[3] = "axiom/circuit.ts";
        cli[4] = "--function";
        cli[5] = "nonceIncrementor";
        cli[6] = "--inputs";
        cli[7] = "data/inputs/input.json";
        cli[8] = "--provider";
        cli[9] = vm.rpcUrl("goerli");
        vm.ffi(cli);

        // Generate args for sendQuery
        string[] memory args = new string[](8);
        args[0] = "npx";
        args[1] = "axiom";
        args[2] = "sendQuery";
        args[3] = "--calldata";
        args[4] = "--provider";
        args[5] = vm.rpcUrl("goerli");
        args[6] = "--refundAddress";
        args[7] = vm.toString(msg.sender);
        vm.ffi(args);

        // Read args from sendQuery.json
        string memory sendQueryJson = vm.readFile("data/sendQuery.json");
        bytes memory sendQueryCalldata = vm.parseJsonBytes(sendQueryJson, ".calldata");
        // suggested payment value, in wei
        uint256 value = vm.parseJsonUint(sendQueryJson, ".value");

        (bool success,) = axiomV2QueryMock.call{value: value}(sendQueryCalldata);
        require(success);
    }

    function testAxiomFulfillQuery() public {
        testAxiomSendQuery();
        // testAxiomSendQuery already proved the client circuit on input.json
        // Now we read the outputs from output.json
        string memory runOutput = vm.readFile("data/output.json");
        bytes memory computeResults = vm.parseJson(runOutput, ".computeResults");
        bytes32[] memory axiomResults = abi.decode(computeResults, (bytes32[]));

        // WARNING: Without true Axiom fulfillment, the Ethereum data used in the client circuit is UNVERIFIED.

        address caller = msg.sender; // this is who initiated the query
        // For this test we will prank the AxiomV2Query fulfillment by pranking the callback with the axiomResults.
        // In production, this call will be done by the AxiomV2Query contract AFTER the query has been fulfilled and validated.
        vm.prank(axiomV2QueryMock);
        string memory sendQueryJson = vm.readFile("data/sendQuery.json");
        uint256 queryId = vm.parseJsonUint(sendQueryJson, ".queryId");
        bytes memory extraData = ""; // no extraData in this example

        axiomNonceInc.axiomV2Callback(sourceChainId, caller, querySchema, queryId, axiomResults, extraData);
    }
}
