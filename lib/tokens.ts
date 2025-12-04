import { avalancheFuji, avalanche } from "wagmi/chains";

export const TOKENS = {
  [avalancheFuji.id]: [
    { symbol: "USDC", address: "0x5425890298aed601595a70AB815c96711a31Bc65", decimals: 6 }, // Circle USDC on Fuji
    { symbol: "WAVAX", address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c", decimals: 18 }
  ],
  [avalanche.id]: [
    { symbol: "USDC", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    { symbol: "WAVAX", address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 18 }
  ]
};

