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
        // Use axiom cli to prove the client circuit on given input.json and read the axiom results from the run output
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
    }

    function testAxiomFulfillQuery() public {
        testAxiomSendQuery();

        string memory runOutput = vm.readFile("data/output.json");
        bytes memory computeResults = vm.parseJson(runOutput, ".computeResults");
        bytes32[] memory axiomResults = abi.decode(computeResults, (bytes32[]));

        // Without true Axiom fulfillment, the Ethereum data used in the client circuit is UNVERIFIED.

        address caller = msg.sender; // this is who initiated the query
        // For this test we will prank the AxiomV2Query fulfillment by pranking the callback with the axiomResults.
        // In production, this call will be done by the AxiomV2Query contract
        vm.prank(axiomV2QueryMock);
        uint256 queryId = 0; // TMP
        bytes memory extraData = ""; // TMP
        axiomNonceInc.axiomV2Callback(sourceChainId, caller, querySchema, queryId, axiomResults, extraData);
    }
}
