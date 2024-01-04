"use client";

import { useAxiomCircuit } from "@axiom-crypto/react";
import { CircuitInputs } from "../lib/circuit/circuit";
import { useEffect } from "react";
import LoadingAnimation from "./ui/LoadingAnimation";
// import ClaimAirdropClient from "./ClaimAirdropClient";

export default function BuildQuery({
  inputs,
  callbackAddress,
  callbackExtraData,
}: {
  inputs: CircuitInputs;
  callbackAddress: string;
  callbackExtraData: string;
}) {
  const {
    build,
    builtQuery,
    setParams,
    areParamsSet
  } = useAxiomCircuit();

  useEffect(() => {
    setParams(inputs, callbackAddress, callbackExtraData);
  }, [setParams, inputs, callbackAddress, callbackExtraData]);

  useEffect(() => {
    const buildQuery = async () => {
      if (!areParamsSet) {
        return;
      }
      await build();
    };
    buildQuery();
  }, [build, areParamsSet]);

  if (!builtQuery) {
    return (
      <div className="flex flex-row items-center font-mono gap-2">
        {"Building Query"} <LoadingAnimation />
      </div>
    );
  }
}
