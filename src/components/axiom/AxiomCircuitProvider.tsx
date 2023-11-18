"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Axiom,
  AxiomV2Callback,
  AxiomV2ComputeQuery,
  AxiomV2DataQuery,
  BuiltQueryV2,
  QueryV2,
} from "@axiom-crypto/core";
import { wrap, Remote } from "comlink";
import { AxiomCircuit } from "./worker";
import { CircuitInputs, circuit } from "./worker/circuit";

type AxiomCircuitContextType = {
  axiom: Axiom,
  setParams: (inputs: CircuitInputs, callback: AxiomV2Callback) => void,
  areParamsSet: boolean,
  build: () => Promise<{
    builtQuery: BuiltQueryV2,
    payment: string,
  } | null>,
  builtQuery: BuiltQueryV2 | null,
  payment: string | null,
  reset: () => void,
}

const AxiomCircuitContext = createContext<AxiomCircuitContextType | null>(null);

const useAxiomCircuit = (): AxiomCircuitContextType => {
  const context = useContext(AxiomCircuitContext);
  if (context === null) {
    throw new Error("useAxiomCircuit must be used within a AxiomCircuitProvider");
  }
  return context;
}

function AxiomCircuitProvider({
  providerUri,
  chainId,
  mock,
  children,
}: {
  providerUri: string,
  chainId?: number | string | BigInt,
  mock?: boolean,
  children: React.ReactNode,
}) {
  const [inputs, setInputs] = useState<CircuitInputs | null>(null);
  const [callback, setCallback] = useState<AxiomV2Callback | null>(null);
  const [builtQuery, setBuiltQuery] = useState<BuiltQueryV2 | null>(null);
  const [payment, setPayment] = useState<string | null>(null);

  const workerApi = useRef<Remote<AxiomCircuit>>();

  const axiom = new Axiom({
    providerUri: providerUri,
    version: "v2",
    chainId: chainId ?? 1,
    mock: mock ?? false,
  });

  const build = async (): Promise<{
    builtQuery: BuiltQueryV2,
    payment: string,
  } | null> => {
    if (!inputs || !callback) {
      console.warn("`inputs` or `callback` not set");
      return null;
    }
    if (builtQuery !== null) {
      return null;
    }
    const setupWorker = async () => {
      const worker = new Worker(new URL("./worker", import.meta.url), { type: "module" });
      const Halo2Circuit = wrap<typeof AxiomCircuit>(worker);
      workerApi.current = await new Halo2Circuit(providerUri);
      await workerApi.current.setup(window.navigator.hardwareConcurrency);
    }

    const generateQuery = async (): Promise<{
      builtQuery: BuiltQueryV2,
      payment: string,
    } | null> => {
      const runRes = await workerApi.current?.run(JSON.stringify(inputs));
      if (!runRes) {
        console.error("Unable to get Query parameters");
        return null;
      }
      const { subqueries, resultLen, vkey, computeProof } = runRes;

      const dataQuery: AxiomV2DataQuery = {
        sourceChainId: BigInt((chainId ?? 1).toString()).toString(),
        subqueries,
      }
      const computeQuery: AxiomV2ComputeQuery = {
        k: circuit.config.k,
        resultLen,
        vkey,
        computeProof,
      };

      const query = (axiom.query as QueryV2).new();
      query.setBuiltDataQuery(dataQuery)
      query.setComputeQuery(computeQuery);
      query.setCallback(callback);

      // Build the Query
      const built = await query.build();
      const pmt = await query.calculateFee();

      setBuiltQuery(built);
      setPayment(pmt)

      return {
        builtQuery: built,
        payment: pmt
      };
    }
    await setupWorker();
    return await generateQuery();
  }

  const reset = () => {
    setBuiltQuery(null);
    setPayment(null);
  }

  const setParams = useCallback((inputs: CircuitInputs, callback: AxiomV2Callback) => {
    setInputs(inputs);
    setCallback(callback);
  }, []);

  const areParamsSet = (inputs !== null && callback !== null);

  const contextValues = {
    axiom,
    setParams,
    areParamsSet,
    build,
    builtQuery,
    payment,
    reset,
  };

  return (
    <AxiomCircuitContext.Provider value={contextValues}>
      {children}
    </AxiomCircuitContext.Provider>
  )
}

export { useAxiomCircuit, AxiomCircuitProvider };
