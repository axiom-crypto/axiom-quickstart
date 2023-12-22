"use client";

import { useEffect, useState } from "react";
import { AxiomCircuitProvider } from "@axiom-crypto/react";
import circuitBuild from "./lib/circuit/build.json";
import { nonceIncrementor } from "../../axiom/circuit";

export default function AxiomProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <AxiomCircuitProvider
      circuit={nonceIncrementor}
      build={circuitBuild}
      providerUri={process.env.NEXT_PUBLIC_ALCHEMY_URI_GOERLI as string}
      chainId={5}
      mock={true}
    >
      {mounted && children}
    </AxiomCircuitProvider>
  );
}
