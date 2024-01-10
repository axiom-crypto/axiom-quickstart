// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { AxiomTest } from "@axiom-v2-client/test/AxiomTest.sol";
import { IAxiomV2Query } from "@axiom-v2-client/interfaces/IAxiomV2Query.sol";

import { AverageBalance } from "../src/AverageBalance.sol";

contract AverageBalanceTest is AxiomTest {
    address public axiomV2QueryAddress = 0xD4E7469fdB3cAe2C85db4dacD44cb974757CbeD9;
    IAxiomV2Query public axiomV2QueryMock;

    AverageBalance public averageBalance;

    bytes32 public querySchema;
    uint64 public sourceChainId;

    string public circuitPath;
    string public urlOrAlias;

    function setUp() public {
        circuitPath = "app/axiom/average.circuit.ts";
        urlOrAlias = "sepolia";
        sourceChainId = 11_155_111;

        vm.createSelectFork(urlOrAlias, 5_057_320);
        vm.makePersistent(axiomV2QueryAddress);
        axiomV2QueryMock = IAxiomV2Query(axiomV2QueryAddress);

        querySchema = _axiomCompile(circuitPath, urlOrAlias);
        averageBalance = new AverageBalance(axiomV2QueryAddress, sourceChainId, querySchema);
    }

    function test_axiomSendQuery() public {
        IAxiomV2Query.AxiomV2FeeData memory feeData = IAxiomV2Query.AxiomV2FeeData({
            maxFeePerGas: 25 gwei,
            callbackGasLimit: 1_000_000,
            overrideAxiomQueryFee: 0
        });
        AxiomTest.AxiomSendQueryArgs memory args =
            _axiomSendQuery(circuitPath, urlOrAlias, address(averageBalance), sourceChainId, feeData);

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
        IAxiomV2Query.AxiomV2FeeData memory feeData = IAxiomV2Query.AxiomV2FeeData({
            maxFeePerGas: 25 gwei,
            callbackGasLimit: 1_000_000,
            overrideAxiomQueryFee: 0
        });
        AxiomTest.AxiomFulfillCallbackArgs memory args =
            _axiomFulfillCallback(circuitPath, urlOrAlias, address(averageBalance), sourceChainId, feeData, msg.sender);

        vm.prank(axiomV2QueryAddress);
        averageBalance.axiomV2Callback(
            args.sourceChainId, args.caller, args.querySchema, args.queryId, args.axiomResults, args.extraData
        );
    }
}
