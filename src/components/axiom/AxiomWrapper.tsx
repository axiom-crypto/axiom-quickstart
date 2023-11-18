"use client";

import { useEffect, useState } from "react";
import { AxiomCircuitProvider } from "@/components/axiom/AxiomCircuitProvider";

export default function AxiomWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mock = (process.env.NEXT_PUBLIC_MOCK ?? "true").toLowerCase() === "true";
  const providerUri = `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`;

  return (
    <AxiomCircuitProvider
      providerUri={providerUri}
      chainId={5}
      mock={mock}>
      {mounted && children}
    </AxiomCircuitProvider>
  );
}
