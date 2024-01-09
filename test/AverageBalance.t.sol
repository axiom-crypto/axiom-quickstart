// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AxiomTest} from "./AxiomTest.sol";
import {AverageBalance} from "../src/AverageBalance.sol";
import {IAxiomV2Query} from "axiom-v2-contracts/contracts/interfaces/query/IAxiomV2Query.sol";

contract AverageBalanceTest is AxiomTest {
    AverageBalance public averageBalance;
    address public axiomV2QueryMock = 0xf15cc7B983749686Cd1eCca656C3D3E46407DC1f;
    bytes32 querySchema;
    uint64 sourceChainId = 5;

    function setUp() public {
        vm.createSelectFork("goerli");
        vm.makePersistent(axiomV2QueryMock);
        querySchema = _axiomCompile("app/axiom/average.circuit.ts", "goerli");
        averageBalance = new AverageBalance(axiomV2QueryMock, sourceChainId, querySchema);
    }

    function test_axiomSendQuery() public {
        _axiomProve("app/axiom/average.circuit.ts", "goerli", sourceChainId);
        _axiomQuery("goerli", address(averageBalance), sourceChainId);

        // Read args from sendQuery.json
        string memory sendQueryJson = vm.readFile("app/axiom/data/query.json");
        bytes memory sendQueryCalldata = vm.parseJsonBytes(sendQueryJson, ".calldata");
        // suggested payment value, in wei
        uint256 value = vm.parseJsonUint(sendQueryJson, ".value");

        (bool success,) = axiomV2QueryMock.call{value: value}(sendQueryCalldata);
        require(success);
    }

    function test_axiomFulfillQuery() public {
        test_axiomSendQuery();
        // testAxiomSendQuery already proved the client circuit on input.json
        // Now we read the outputs from output.json
        string memory runOutput = vm.readFile("app/axiom/data/output.json");
        bytes memory computeResults = vm.parseJson(runOutput, ".computeResults");
        bytes32[] memory axiomResults = abi.decode(computeResults, (bytes32[]));

        // WARNING: Without true Axiom fulfillment, the Ethereum data used in the client circuit is UNVERIFIED.

        address caller = msg.sender; // this is who initiated the query
        // For this test we will prank the AxiomV2Query fulfillment by pranking the callback with the axiomResults.
        // In production, this call will be done by the AxiomV2Query contract AFTER the query has been fulfilled and validated.
        vm.prank(axiomV2QueryMock);
        string memory sendQueryJson = vm.readFile("app/axiom/data/sendQuery.json");
        uint256 queryId = vm.parseJsonUint(sendQueryJson, ".queryId");
        bytes memory extraData = ""; // no extraData in this example

        averageBalance.axiomV2Callback(sourceChainId, caller, querySchema, queryId, axiomResults, extraData);
    }
}
