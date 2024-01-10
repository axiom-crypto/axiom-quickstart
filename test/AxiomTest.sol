// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import { IAxiomV2Query } from "axiom-v2-contracts/contracts/interfaces/query/IAxiomV2Query.sol";

abstract contract AxiomTest is Test {
    function _axiomCompile(string memory circuitPath, string memory urlOrAlias)
        internal
        returns (bytes32 querySchema)
    {
        string[] memory cli = new string[](13);
        cli[0] = "npx";
        cli[1] = "axiom";
        cli[2] = "circuit";
        cli[3] = "compile";
        cli[4] = circuitPath;
        cli[5] = "--provider";
        cli[6] = vm.rpcUrl(urlOrAlias);
        cli[7] = "--input";
        cli[8] = "app/axiom/data/input.json";
        cli[9] = "--output";
        cli[10] = "app/axiom/data/compiled.json";
        cli[11] = "--function";
        cli[12] = "circuit";
        vm.ffi(cli);

        string memory artifact = vm.readFile("app/axiom/data/compiled.json");
        querySchema = bytes32(vm.parseJson(artifact, ".querySchema"));
    }

    function _axiomProve(
        string memory circuitPath,
        string memory urlOrAlias,
        uint64 sourceChainId,
        IAxiomV2Query.AxiomV2FeeData memory feeData
    ) internal returns (bytes memory output) {
        string[] memory cli = new string[](18);
        cli[0] = "npx";
        cli[1] = "axiom";
        cli[2] = "circuit";
        cli[3] = "prove";
        cli[4] = circuitPath;
        cli[5] = "--mock";
        cli[6] = "--sourceChainId";
        cli[7] = vm.toString(sourceChainId);
        cli[8] = "--compiled";
        cli[9] = "app/axiom/data/compiled.json";
        cli[10] = "--provider";
        cli[11] = vm.rpcUrl(urlOrAlias);
        cli[12] = "--input";
        cli[13] = "app/axiom/data/input.json";
        cli[14] = "--output";
        cli[15] = "app/axiom/data/output.json";
        cli[16] = "--function";
        cli[17] = "circuit";
        output = vm.ffi(cli);
    }

    function _axiomQuery(string memory urlOrAlias, address callback, uint64 sourceChainId)
        internal
        returns (bytes memory output)
    {
        string[] memory cli = new string[](23);
        cli[0] = "npx";
        cli[1] = "axiom";
        cli[2] = "circuit";
        cli[3] = "query-params";
        cli[4] = vm.toString(callback); // the callback target address
        cli[5] = "--mock";
        cli[6] = "--sourceChainId";
        cli[7] = vm.toString(sourceChainId);
        cli[8] = "--refundAddress";
        cli[9] = vm.toString(msg.sender);
        cli[10] = "--callbackExtraData";
        cli[11] = "0x"; // no extraData in this example
        cli[12] = "--maxFeePerGas";
        cli[13] = "0";
        cli[14] = "--callbackGasLimit";
        cli[15] = "0";
        cli[16] = "true";
        cli[17] = "--provider";
        cli[18] = vm.rpcUrl(urlOrAlias);
        cli[19] = "--input";
        cli[20] = "app/axiom/data/output.json";
        cli[21] = "--output";
        cli[22] = "app/axiom/data/query.json";
        output = vm.ffi(cli);
    }
}
