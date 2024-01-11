// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { AxiomTest } from "@axiom-v2-client/test/AxiomTest.sol";
import { IAxiomV2Query } from "@axiom-v2-client/interfaces/query/IAxiomV2Query.sol";

import { AverageBalance } from "../src/AverageBalance.sol";

contract AverageBalanceTest is AxiomTest {
    AverageBalance public averageBalance;

    function setUp() public {
        circuitPath = "src/average.circuit.ts";
        urlOrAlias = "sepolia";
        sourceChainId = 11_155_111;

        vm.createSelectFork(urlOrAlias, 5_057_320);
        vm.makePersistent(axiomV2QueryAddress);
        axiomV2QueryMock = IAxiomV2Query(axiomV2QueryAddress);

        querySchema = _axiomCompile(circuitPath, urlOrAlias);
        averageBalance = new AverageBalance(axiomV2QueryAddress, sourceChainId, querySchema);
    }

    function test_axiomSendQuery() public {
        AxiomTest.AxiomSendQueryArgs memory args = _axiomSendQuery(
            circuitPath, inputPath, urlOrAlias, address(averageBalance), callbackExtraData, sourceChainId, feeData
        );

        uint256 queryId = axiomV2QueryMock.sendQuery{ value: args.value }(
            args.sourceChainId,
            args.dataQueryHash,
            args.computeQuery,
            args.callback,
            args.feeData,
            args.userSalt,
            args.refundee,
            args.dataQuery
        );
    }

    function test_axiomCallback() public {
        AxiomTest.AxiomFulfillCallbackArgs memory args = _axiomFulfillCallback(
            circuitPath,
            inputPath,
            urlOrAlias,
            address(averageBalance),
            callbackExtraData,
            sourceChainId,
            feeData,
            msg.sender
        );
        _axiomPrankCallback(args);
    }
}
