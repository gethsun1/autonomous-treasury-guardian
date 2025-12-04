import axios from 'axios';

export const agentApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:3001',
});

export const fetchAgentAnalysis = async (snapshot: Record<string, unknown>) => {
  const response = await agentApi.post('/analyze', snapshot);
  return response.data;
};

