# Axiom Quickstart

## Introduction

This starter repo is a guide to get you started making your first [Axiom](https://axiom.xyz) query as quickly as possible using the [Axiom Client](https://github.com/axiom-crypto/axiom-client). To learn more about Axiom, check out the developer docs at [docs.axiom.xyz](https://docs.axiom.xyz) or join our developer [Telegram](https://t.me/axiom_discuss).

A guide on how to use this repository is available in the [Axiom Docs: Quickstart](https://docs.axiom.xyz/introduction/quickstart).

## Setup

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

To install this project's Typescript dependencies, run

```bash
pnpm install
```

Copy `.env.example` to `.env` and fill in with your provider URL (and optionally Goerli private key).
You can export your Goerli private key in Metamask by going to "Account Details" and then "Export Private Key".

> ⚠️ **WARNING**: Never use your mainnet private key on a testnet! You should never use a private key for an account you have on both mainnet and a testnet.

Install [Foundry](https://book.getfoundry.sh/getting-started/installation). The recommended way to do this is using Foundryup:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

To install this project's smart contract dependencies, run

```bash
foundry install
```

## Test

To run Foundry tests that simulate the Axiom integration flow, run

```bash
forge test -vvvv
```

## CLI Cheatsheet

```bash
# compile
npx axiom compile axiom/circuit.ts --function nonceIncrementor --inputs data/inputs/defaultInput.json --provider $PROVIDER_URI_GOERLI
# run
npx axiom run axiom/circuit.ts --function nonceIncrementor --inputs data/inputs/input.json --provider $PROVIDER_URI_GOERLI
# get sendQuery calldata
npx axiom sendQueryArgs <callback contract address> --calldata --sourceChainId 5 --refundAddress <your Goerli wallet address> --provider $PROVIDER_URI_GOERLI
```

## AxiomV1

If you are looking for the AxiomV1 Quickstart, it is now on the [v1 branch](https://github.com/axiom-crypto/axiom-quickstart/tree/v1).
