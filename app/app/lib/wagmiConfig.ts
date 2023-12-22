// import { Constants } from "@/shared/constants";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { goerli } from "viem/chains";

const projectId = '593fdf609de09de3e21e5570cc61d8d3'

const metadata = {
  name: 'Autonomous Airdrop',
  description: 'Autonomous Airdrop Example',
  url: 'https://autonomous-airdrop-example.vercel.app/',
  icons: ['']
}

const chains = [goerli]

export const config = defaultWagmiConfig({ chains, projectId, metadata })

createWeb3Modal({ wagmiConfig: config, projectId, chains })