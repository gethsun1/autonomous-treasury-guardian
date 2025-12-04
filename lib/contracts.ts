import TreasuryVaultABI from './abis/TreasuryVault.json';
import ActionExecutorABI from './abis/ActionExecutor.json';
import RiskParametersABI from './abis/RiskParameters.json';
import AgentAuthABI from './abis/AgentAuth.json';
import PermissionManagerABI from './abis/PermissionManager.json';
import MockSwapABI from './abis/MockSwap.json';

export const contracts = {
  treasuryVault: {
    address: (process.env.NEXT_PUBLIC_TREASURY_VAULT_ADDRESS as `0x${string}`) || "0x565435bAf0C6A9E06BE4e7F00fE08C95d36F247b",
    abi: TreasuryVaultABI.abi,
  },
  actionExecutor: {
    address: (process.env.NEXT_PUBLIC_ACTION_EXECUTOR_ADDRESS as `0x${string}`) || "0x4DabF129f9175a84D0E6caD48d14Be65bA5910F5",
    abi: ActionExecutorABI.abi,
  },
  riskParameters: {
    address: (process.env.NEXT_PUBLIC_RISK_PARAMETERS_ADDRESS as `0x${string}`) || "0xEC85cC46c6C514a6e05361f682c884d30d0cc9D3",
    abi: RiskParametersABI.abi,
  },
  agentAuth: {
    address: (process.env.NEXT_PUBLIC_AGENT_AUTH_ADDRESS as `0x${string}`) || "0xf6Cd6D7Ee5f2F879A872f559Ef8Db39d73a69f8e", 
    abi: AgentAuthABI.abi,
  },
  permissionManager: {
    address: (process.env.NEXT_PUBLIC_PERMISSION_MANAGER_ADDRESS as `0x${string}`) || "0x3905052fB9d1502B246442945Eb1DC9573Be4708",
    abi: PermissionManagerABI.abi,
  },
  mockSwap: {
    address: (process.env.NEXT_PUBLIC_MOCK_SWAP_ADDRESS as `0x${string}`) || "0x35A4E34953dC9720223607921891Fc67a857A84C",
    abi: MockSwapABI.abi,
  }
} as const;
