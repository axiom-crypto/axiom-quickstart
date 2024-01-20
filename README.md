# Axiom Quickstart

## Introduction

This starter repo is a guide to get you started making your first [Axiom](https://axiom.xyz) query as quickly as possible using the [Axiom SDK](https://github.com/axiom-crypto/axiom-sdk-client) and [Axiom smart contract client](https://github.com/axiom-crypto/axiom-v2-periphery). To learn more about Axiom, check out the developer docs at [docs.axiom.xyz](https://docs.axiom.xyz) or join our developer [Telegram](https://t.me/axiom_discuss).

A guide on how to use this repository is available in the [Axiom Docs: Quickstart](https://docs.axiom.xyz/introduction/quickstart).

## Installation

This repo contains both Foundry and Javascript packages. To install, run:

```bash
forge install
pnpm install     # or `npm install` or `yarn install`
```

For installation instructions for Foundry or a Javascript package manager (`npm`, `yarn`, or `pnpm`), see [Package Manager Installation](#package-manager-installation).

Copy `.env.example` to `.env` and fill in your JSON-RPC provider URL. If you'd like to send transactions from a local hot wallet on testnet also add a Sepolia private key.

> ⚠️ **WARNING**: Never use your mainnet private key on a testnet! If you use this option, make sure you are not using the same account on mainnet.

## Test

To run Foundry tests that simulate the Axiom integration flow, run

```bash
forge test -vvvv
```

## Send a Query on-chain

To send a Query on Sepolia testnet (requires `PRIVATE_KEY_SEPOLIA` in `.env` file), run

```bash
npx tsx app/index.ts 
```

## CLI Cheatsheet

```bash
# compile
npx axiom circuit compile app/axiom/average.circuit.ts --provider $PROVIDER_URI_SEPOLIA

# prove
npx axiom circuit prove app/axiom/average.circuit.ts --sourceChainId 11155111 --provider $PROVIDER_URI_SEPOLIA

# get parameters to send a query to Axiom using sendQuery
npx axiom circuit query-params <callback contract address> --refundAddress <your Sepolia wallet address> --sourceChainId 11155111 --provider $PROVIDER_URI_SEPOLIA
```

## Package Manager Installation

Install `npm` or `yarn` or `pnpm`:

```bash
# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc  # or `source ~/.zshrc` on newer macs

# Install latest LTS node
nvm install --lts

# Install pnpm
npm install -g pnpm
pnpm setup
source ~/.bashrc  # or `source ~/.zshrc` on newer macs
```

Install [Foundry](https://book.getfoundry.sh/getting-started/installation). The recommended way to do this is using Foundryup:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```
