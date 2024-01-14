"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.circuit = exports.inputs = void 0;
const client_1 = require("@axiom-crypto/client");
// Example inputs that the circuit will use for testing
exports.inputs = {
    blockNumber: 5000000,
    address: "0xEaa455e4291742eC362Bc21a8C46E5F2b5ed4701"
};
const circuit = ({ blockNumber, address, }) => __awaiter(void 0, void 0, void 0, function* () {
    // Number of samples to take. Note that this must be a constant value and NOT an input because the size of the circuit 
    // must be known at compile time.
    const samples = 8;
    // Number of blocks between each sample.
    const spacing = 900;
    // Validate that the block number is greater than the number of samples times the spacing
    if (blockNumber.value() <= (samples * spacing)) {
        throw new Error("Block number must be greater than the number of samples times the spacing");
    }
    // Create an array of block numbers to sample from
    const blockNumbers = Array.from({ length: samples }, (_, i) => blockNumber.number() - (spacing * i));
    // Get all balances for the given address at the block numbers we are sampling from
    const balances = yield Promise.all(
    // Call `getAccount` for each sample block number concurrently
    blockNumbers.map((sampleBlockNum) => (0, client_1.getAccount)(sampleBlockNum, address).balance()));
    // Calculate the total
    const total = (0, client_1.sum)(balances.map((balance) => balance.value()));
    // Divide by the number of samples to get the average value
    const average = (0, client_1.div)(total, samples);
    // We call `addToCallback` on all values that we would like to be passed to our contract after the circuit has
    // been proven in ZK. The values can then be handled by our contract once the prover calls the callback function.
    (0, client_1.addToCallback)(blockNumber);
    (0, client_1.addToCallback)(address);
    (0, client_1.addToCallback)(average);
});
exports.circuit = circuit;
