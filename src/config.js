// ChainRelief Configuration
// SideShift API Integration Settings

export const config = {
  // SideShift API Configuration
  sideshift: {
    apiKey: import.meta.env.VITE_SIDESHIFT_API_KEY || '',
    secret: import.meta.env.VITE_SIDESHIFT_SECRET || '',
    baseURL: import.meta.env.VITE_SIDESHIFT_BASE_URL || 'https://sideshift.ai/api/v2',
    affiliateId: import.meta.env.VITE_AFFILIATE_ID || '',
    enableRealAPI: import.meta.env.VITE_ENABLE_REAL_API === 'true' || false
  },
  
  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'ChainRelief',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'production'
  },
  
  // Network Configuration
  network: {
    defaultChainId: parseInt(import.meta.env.VITE_DEFAULT_CHAIN_ID) || 1,
    supportedChains: import.meta.env.VITE_SUPPORTED_CHAINS ? 
      import.meta.env.VITE_SUPPORTED_CHAINS.split(',').map(Number) : 
      [1, 137, 56, 43114] // Ethereum, Polygon, BSC, Avalanche
  },
  
  // Commission Settings
  commission: {
    rate: parseFloat(import.meta.env.VITE_COMMISSION_RATE) || 0.005, // 0.5%
    affiliateId: import.meta.env.VITE_AFFILIATE_ID || ''
  },
  
  // Feature Flags
  features: {
    enableRealAPI: import.meta.env.VITE_ENABLE_REAL_API === 'true' || true,
    enableTestnet: import.meta.env.VITE_ENABLE_TESTNET === 'true' || false,
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || true
  }
};

// Export individual configs for easy access
export const sideshiftConfig = config.sideshift;
export const appConfig = config.app;
export const networkConfig = config.network;
export const commissionConfig = config.commission;
export const featureFlags = config.features;
