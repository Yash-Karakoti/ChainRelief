// ChainRelief Configuration
// SideShift API Integration Settings

export const config = {
  // SideShift API Configuration
  sideshift: {
    apiKey: '58efadb407867cef740246ddc1d9a882',
    secret: '58efadb407867cef740246ddc1d9a882',
    baseURL: 'https://sideshift.ai/api/v2',
    affiliateId: '7FD5vfMtV',
    enableRealAPI: true
  },
  
  // Application Configuration
  app: {
    name: 'ChainRelief',
    version: '1.0.0',
    environment: 'production'
  },
  
  // Network Configuration
  network: {
    defaultChainId: 1,
    supportedChains: [1, 137, 56, 43114] // Ethereum, Polygon, BSC, Avalanche
  },
  
  // Commission Settings
  commission: {
    rate: 0.005, // 0.5%
    affiliateId: '7FD5vfMtV'
  },
  
  // Feature Flags
  features: {
    enableRealAPI: true,
    enableTestnet: false,
    enableAnalytics: true
  }
};

// Export individual configs for easy access
export const sideshiftConfig = config.sideshift;
export const appConfig = config.app;
export const networkConfig = config.network;
export const commissionConfig = config.commission;
export const featureFlags = config.features;
