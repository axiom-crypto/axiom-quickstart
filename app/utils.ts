export const chainIdToPathname = (chainId: string) => {
  switch (chainId) {
    case "1":
      return "mainnet";
    case "11155111":
      return "sepolia";
    case "84532":
      return "base-sepolia";
    default:
      throw new Error("Invalid chain ID");
  }
}
