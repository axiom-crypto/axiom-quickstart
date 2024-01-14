source .env
forge create src/AverageBalance.sol:AverageBalance --private-key $PRIVATE_KEY_SEPOLIA --rpc-url $PRIVATE_KEY_SEPOLIA --verify --etherscan-api-key $ETHERSCAN_API_KEY --constructor-args "0x56A380e544606ad713A8A19BAc1903aa7C2017FF" "11155111" "0x3d4d7523c3fb08a6640a015642802651a4a0179c1c42d913ed802bd0e3defc12"
