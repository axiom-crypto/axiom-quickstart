// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { AxiomTest, AxiomVm } from "@axiom-crypto/v2-periphery/test/AxiomTest.sol";
import { IAxiomV2Query } from "@axiom-crypto/v2-periphery/interfaces/query/IAxiomV2Query.sol";

import { AverageBalance } from "../src/AverageBalance.sol";

contract AverageBalanceTest is AxiomTest {
    AverageBalance public averageBalance;

    function setUp() public {
        _createSelectForkAndSetupAxiom("sepolia", 5_103_100);

        inputPath = "app/axiom/data/inputs.json";
        querySchema = axiomVm.compile("app/axiom/average.circuit.ts", inputPath);
        averageBalance = new AverageBalance(axiomV2QueryAddress, uint64(block.chainid), querySchema);
    }

    function test_axiomSendQuery() public {
        AxiomVm.AxiomSendQueryArgs memory args =
            axiomVm.sendQueryArgs(inputPath, address(averageBalance), callbackExtraData, feeData);

        axiomV2Query.sendQuery{ value: args.value }(
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
        AxiomVm.AxiomFulfillCallbackArgs memory args =
            axiomVm.fulfillCallbackArgs(inputPath, address(averageBalance), callbackExtraData, feeData, msg.sender);
        axiomVm.prankCallback(args);
    }
}
