# Axiom Quickstart

## Introduction

This starter repo is a guide to get you started making your first [Axiom](https://axiom.xyz) query as quickly as possible using the [Axiom SDK](https://github.com/axiom-crypto/axiom-sdk-client) and [Axiom smart contract client](https://github.com/axiom-crypto/axiom-v2-client). To learn more about Axiom, check out the developer docs at [docs.axiom.xyz](https://docs.axiom.xyz) or join our developer [Telegram](https://t.me/axiom_discuss).

A guide on how to use this repository is available in the [Axiom Docs: Quickstart](https://docs.axiom.xyz/introduction/quickstart).

## Installation

This repo contains both Foundry and Javascript packages.  To install, run:
```bash
forge install
pnpm install     # or `npm install` or `yarn install`
```
For installation instructions for Foundry or a Javascript package manager (`npm`, `yarn`, or `pnpm`), see [Package Manager Installation](#package-manager-installation). 


Copy `.env.example` to `.env` and fill in with your provider URL (and optionally Goerli private key).
You can export your Goerli private key in Metamask by going to "Account Details" and then "Export Private Key".

> ⚠️ **WARNING**: Never use your mainnet private key on a testnet! You should never use a private key for an account you have on both mainnet and a testnet.

## Test

To run Foundry tests that simulate the Axiom integration flow, run

```bash
forge test -vvvv
```

## CLI Cheatsheet

```bash
# compile
npx axiom circuit compile app/axiom/average.circuit.ts --function circuit --inputs app/axiom/data/inputs/input.json --outputs app/axiom/data/compiled.json --provider $PROVIDER_URI_SEPOLIA
# prove
npx axiom circuit prove app/axiom/average.circuit.ts --function circuit --compiled app/axiom/data/complied.json --inputs app/axiom/data/inputs/input.json --outputs app/axiom/data/output.json --sourceChainId 11155111 --provider $PROVIDER_URI_SEPOLIA
# get parameters to send a query to Axiom using sendQuery 
npx axiom circuit query-params <callback contract address> --sourceChainId 11155111 --refundAddress <your Goerli wallet address> --proven app/axiom/data/output.json --outputs app/axiom/data/query.json --provider $PROVIDER_URI_SEPOLIA
```

## Package Manager Installation

Install `npm` or `yarn` or `pnpm`:

```bash
# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
# Install latest LTS node
nvm install --lts
# Install pnpm
npm install -g pnpm
pnpm setup
source ~/.bashrc
```
Install [Foundry](https://book.getfoundry.sh/getting-started/installation). The recommended way to do this is using Foundryup:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```