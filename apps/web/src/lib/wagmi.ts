'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, arbitrum, base, optimism } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'TostUp.fun',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [mainnet, sepolia, arbitrum, base, optimism],
  ssr: true,
});

