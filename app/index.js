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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const average_circuit_1 = require("./axiom/average.circuit");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_1 = require("@axiom-crypto/client");
// Compiled circuit file after running:
//   `npx axiom circuit compile app/axiom/average.circuit.ts`
const compiled_json_1 = __importDefault(require("./axiom/data/compiled.json"));
const exampleInput = {
    blockNumber: 5000000,
    address: "0xEaa455e4291742eC362Bc21a8C46E5F2b5ed4701",
};
const axiomMain = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const axiom = new client_1.Axiom({
        circuit: average_circuit_1.circuit,
        compiledCircuit: compiled_json_1.default,
        inputSchema: {
            blockNumber: "uint32",
            address: "address",
        },
        chainId: "11155111",
        provider: process.env.PROVIDER_URI_SEPOLIA,
        privateKey: process.env.PRIVATE_KEY_SEPOLIA,
        mock: false,
    });
    yield axiom.init();
    const args = yield axiom.prove(input);
    const receipt = yield axiom.sendQuery(args);
    console.log("Transaction receipt:", receipt);
});
axiomMain(exampleInput);
