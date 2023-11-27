source .env
forge create src/AxiomNonceIncrementor.sol:AxiomNonceIncrementor --private-key $PRIVATE_KEY_GOERLI --rpc-url $PROVIDER_URI_GOERLI --verify --etherscan-api-key $ETHERSCAN_API_KEY --constructor-args "0xf15cc7B983749686Cd1eCca656C3D3E46407DC1f" "5" "0xc0eaeb40da1061d7cf6fe49af6f441bc6de0bbac8537cb06998977e03a4766b3"
