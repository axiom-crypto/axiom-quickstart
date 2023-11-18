import { JsonRpcProvider } from "ethers";
import {
  CircuitConfig,
  CircuitScaffold,
  Halo2LibWasm,
  getHalo2LibWasm,
} from "@axiom-crypto/core/halo2-js/web";
import { AxiomCircuitRunner } from "@axiom-crypto/core/halo2-js";
import { CircuitInputs, circuit } from "./circuit";
import { convertToBytes, convertToBytes32 } from "../utils";
import { DataSubquery } from "@axiom-crypto/core";
import { expose } from "comlink";

export class AxiomCircuit extends CircuitScaffold {
  provider: JsonRpcProvider;
  halo2Lib!: Halo2LibWasm;
  subqueries?: DataSubquery[];

  constructor(provider: string) {
    super({ shouldTime: true });
    this.provider = new JsonRpcProvider(provider);
    this.config = circuit.config;
  }

  async setup(numThreads: number) {
    await super.setup(numThreads);
    this.halo2Lib = getHalo2LibWasm(this.halo2wasm);
  }

  async run(
    inputs: string,
  ): Promise<{
    subqueries: DataSubquery[];
    resultLen: number;
    vkey: string[];
    computeProof: string;
  } | null> {
    let circuitInputs: CircuitInputs;
    try {
      circuitInputs = JSON.parse(inputs);
    } catch (error) {
      console.error(error);
      return null;
    }

    this.newCircuitFromConfig();
    this.timeStart("Witness generation");
    const { orderedDataQuery, results } = await AxiomCircuitRunner(
      this.halo2wasm,
      this.halo2Lib,
      this.config,
      this.provider,
    ).build(circuit.circuit, circuitInputs as any);
    const { numUserInstances } = await AxiomCircuitRunner(
      this.halo2wasm,
      this.halo2Lib,
      this.config,
      this.provider,
    ).run(circuit.circuit, circuitInputs as any, results);
    this.timeEnd("Witness generation");
    this.prove();
    const vkey = this.getVkey();
    const computeProof = this.getComputeProof(numUserInstances);

    return {
      subqueries: orderedDataQuery,
      resultLen: numUserInstances / 2,
      vkey,
      computeProof,
    };
  }

  async newCircuitFromConfig() {
    super.newCircuitFromConfig(this.config);
    await this.loadParamsAndVk(new Uint8Array(circuit.vk));
  }

  getComputeProof(numInstances: number) {
    if (!this.proof) throw new Error("No proof generated");
    let proofString = "";
    const instances = this.getInstances();
    for (let i = 0; i < numInstances / 2; i++) {
      const instanceHi = BigInt(instances[2 * i]);
      const instanceLo = BigInt(instances[2 * i + 1]);
      const instance = instanceHi * BigInt(2 ** 128) + instanceLo;
      const instanceString = instance.toString(16).padStart(64, "0");
      proofString += instanceString;
    }
    proofString += convertToBytes(this.proof);
    return "0x" + proofString;
  }

  getSubqueries() {
    return this.subqueries;
  }

  getVkey(): string[] {
    const vkey = this.halo2wasm.getPartialVk();
    return convertToBytes32(vkey);
  }
}

expose(AxiomCircuit);
