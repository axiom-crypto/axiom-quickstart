// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";

import { IAxiomV2Query } from "axiom-v2-contracts/contracts/interfaces/query/IAxiomV2Query.sol";

abstract contract AxiomTest is Test {
    struct AxiomSendQueryArgs {
        uint64 sourceChainId;
        bytes32 dataQueryHash;
        IAxiomV2Query.AxiomV2ComputeQuery computeQuery;
        IAxiomV2Query.AxiomV2Callback callback;
        IAxiomV2Query.AxiomV2FeeData feeData;
        bytes32 userSalt;
        address refundee;
        bytes dataQuery;
        uint256 value;
    }

    struct AxiomFulfillCallbackArgs {
        uint64 sourceChainId;
        address caller;
        bytes32 querySchema;
        uint256 queryId;
        bytes32[] axiomResults;
        bytes extraData;
    }

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

    function _axiomProve(string memory circuitPath, string memory urlOrAlias, uint64 sourceChainId)
        internal
        returns (bytes memory output)
    {
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

    function _axiomQueryParams(
        string memory urlOrAlias,
        address callback,
        uint64 sourceChainId,
        IAxiomV2Query.AxiomV2FeeData memory feeData
    ) internal {
        string[] memory cli = new string[](22);
        cli[0] = "npx";
        cli[1] = "axiom";
        cli[2] = "circuit";
        cli[3] = "query-params";
        cli[4] = vm.toString(callback); // the callback target address
        cli[5] = "--sourceChainId";
        cli[6] = vm.toString(sourceChainId);
        cli[7] = "--refundAddress";
        cli[8] = vm.toString(msg.sender);
        cli[9] = "--callbackExtraData";
        cli[10] = "0x"; // no extraData in this example
        cli[11] = "--maxFeePerGas";
        cli[12] = vm.toString(feeData.maxFeePerGas);
        cli[13] = "--callbackGasLimit";
        cli[14] = vm.toString(feeData.callbackGasLimit);
        cli[15] = "--provider";
        cli[16] = vm.rpcUrl(urlOrAlias);
        cli[17] = "--input";
        cli[18] = "app/axiom/data/output.json";
        cli[19] = "--output";
        cli[20] = "app/axiom/data/query.json";
        cli[21] = "--calldata";
        vm.ffi(cli);
    }

    function _axiomSendQuery(
        string memory circuitPath,
        string memory urlOrAlias,
        address callback,
        uint64 sourceChainId,
        IAxiomV2Query.AxiomV2FeeData memory feeData
    ) internal returns (AxiomSendQueryArgs memory args) {
        _axiomProve(circuitPath, urlOrAlias, sourceChainId);
        _axiomQueryParams(urlOrAlias, callback, sourceChainId, feeData);
        string memory filePath = "app/axiom/data/query.json";
        bytes memory calldataBytes = abi.decode(vm.parseJson(vm.readFile(filePath), ".calldata"), (bytes));

        // use of `this` is necessary to convert memory to calldata and allow slicing
        args = this._parseSendQueryArgs(calldataBytes);
        args.value = vm.parseJsonUint(vm.readFile(filePath), ".value");
    }

    function _axiomFulfillCallback(
        string memory circuitPath,
        string memory urlOrAlias,
        address callback,
        uint64 sourceChainId,
        IAxiomV2Query.AxiomV2FeeData memory feeData,
        address caller
    ) internal returns (AxiomFulfillCallbackArgs memory args) {
        _axiomProve(circuitPath, urlOrAlias, sourceChainId);
        _axiomQueryParams(urlOrAlias, callback, sourceChainId, feeData);

        AxiomSendQueryArgs memory sendQueryArgs = this._parseSendQueryArgs(
            abi.decode(vm.parseJson(vm.readFile("app/axiom/data/query.json"), ".calldata"), (bytes))
        );
        args = AxiomFulfillCallbackArgs({
            sourceChainId: sourceChainId,
            caller: caller,
            querySchema: abi.decode(vm.parseJson(vm.readFile("app/axiom/data/compiled.json"), ".querySchema"), (bytes32)),
            queryId: vm.parseJsonUint(vm.readFile("app/axiom/data/query.json"), ".queryId"),
            axiomResults: abi.decode(
                vm.parseJson(vm.readFile("app/axiom/data/output.json"), ".computeResults"), (bytes32[])
                ),
            extraData: sendQueryArgs.callback.extraData
        });
    }

    function _parseSendQueryArgs(bytes calldata calldataBytes) public returns (AxiomSendQueryArgs memory args) {
        (
            uint64 sourceChainId,
            bytes32 dataQueryHash,
            IAxiomV2Query.AxiomV2ComputeQuery memory computeQuery,
            IAxiomV2Query.AxiomV2Callback memory callback,
            IAxiomV2Query.AxiomV2FeeData memory feeData,
            bytes32 userSalt,
            address refundee,
            bytes memory dataQuery
        ) = abi.decode(
            calldataBytes[4:],
            (
                uint64,
                bytes32,
                IAxiomV2Query.AxiomV2ComputeQuery,
                IAxiomV2Query.AxiomV2Callback,
                IAxiomV2Query.AxiomV2FeeData,
                bytes32,
                address,
                bytes
            )
        );
        args = AxiomSendQueryArgs({
            sourceChainId: sourceChainId,
            dataQueryHash: dataQueryHash,
            computeQuery: computeQuery,
            callback: callback,
            feeData: feeData,
            userSalt: userSalt,
            refundee: refundee,
            dataQuery: dataQuery,
            value: 0
        });
    }
}
