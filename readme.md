# AxiomV1 Quickstart

 > ℹ️**NOTE**: This is a quickstart guide for AxiomV1. For the quickstart using the latest version of Axiom, see the [main branch of axiom-quickstart](https://github.com/axiom-crypto/axiom-quickstart).

## Introduction

This starter repo is a guide to get you started making your first [Axiom](https://axiom.xyz) V1 query as quickly as possible. To learn more about Axiom, check out the V1 developer docs at [docs.axiom.xyz](https://docs-v1.axiom.xyz) or join our developer [Telegram](https://t.me/axiom_discuss).

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

## Run

To run the project, use the following command:

```bash
ts-node src/index.ts
```
