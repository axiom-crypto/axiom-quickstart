// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {AxiomV2Client} from "axiom-v2-contracts/contracts/client/AxiomV2Client.sol";

contract AxiomNonceIncrementor is AxiomV2Client {
    /// @dev The unique identifier of the circuit accepted by this contract.
    bytes32 immutable QUERY_SCHEMA;

    /// @dev The chain ID of the chain whose data the callback is expected to be called from.
    uint64 immutable SOURCE_CHAIN_ID;

    /// @dev blockToAddrToNonceInc[blockNumber][address] = (the nonce of account `address` at block number `blockNumber`) + 1
    mapping(uint256 => mapping(address => uint256)) public blockToAddrToNonceInc;

    /// @notice Emitted when Axiom fulfills a query with query schema `QUERY_SCHEMA` and hits a callback to this contract.
    /// @param blockNumber The block number the account's nonce was queried at.
    /// @param addr The address of the account whose nonce was queried.
    /// @param nonceInc The `nonce + 1` of the account at the queried block number. The computation of `nonce + 1` was done off-chain in a ZK proof, not in this contract.
    event NonceIncrementStored(uint256 blockNumber, address addr, uint256 nonceInc);

    /// @notice Construct a new AxiomNonceIncrementor contract.
    /// @param  _axiomV2QueryAddress The address of the AxiomV2Query contract.
    /// @param  _callbackSourceChainId The ID of the chain the query reads from.
    constructor(address _axiomV2QueryAddress, uint64 _callbackSourceChainId, bytes32 _querySchema)
        AxiomV2Client(_axiomV2QueryAddress)
    {
        QUERY_SCHEMA = _querySchema;
        SOURCE_CHAIN_ID = _callbackSourceChainId;
    }

    /// @inheritdoc AxiomV2Client
    function _validateAxiomV2Call(
        AxiomCallbackType, // callbackType,
        uint64 sourceChainId,
        address, // caller,
        bytes32 querySchema,
        uint256, // queryId,
        bytes calldata // extraData
    ) internal view override {
        require(sourceChainId == SOURCE_CHAIN_ID, "Source chain ID does not match");
        require(querySchema == QUERY_SCHEMA, "Invalid query schema");
    }

    /// @inheritdoc AxiomV2Client
    function _axiomV2Callback(
        uint64, // sourceChainId,
        address, // caller,
        bytes32, // querySchema,
        uint256, // queryId,
        bytes32[] calldata axiomResults,
        bytes calldata // extraData
    ) internal override {
        uint256 blockNumber = uint256(axiomResults[0]);
        address addr = address(uint160(uint256(axiomResults[1])));
        uint256 nonceInc = uint256(axiomResults[2]);

        blockToAddrToNonceInc[blockNumber][addr] = nonceInc;

        emit NonceIncrementStored(blockNumber, addr, nonceInc);
    }
}
