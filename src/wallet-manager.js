export class WalletManager {
  constructor() {
    this.wallet = null;
    this.address = null;
    this.balance = null;
    this.chainId = null;
    this.isConnected = false;
  }

  async connectWallet() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      this.address = accounts[0];
      this.wallet = window.ethereum;
      this.isConnected = true;

      // Get chain ID and balance
      await this.updateChainInfo();
      await this.updateBalance();

      // Listen for account changes
      this.wallet.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.address = accounts[0];
          this.updateBalance();
        }
      });

      // Listen for chain changes
      this.wallet.on('chainChanged', () => {
        this.updateChainInfo();
        this.updateBalance();
      });

      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }

  async updateChainInfo() {
    if (!this.wallet) return;

    try {
      this.chainId = await this.wallet.request({ method: 'eth_chainId' });
    } catch (error) {
      console.error('Failed to get chain ID:', error);
    }
  }

  async updateBalance() {
    if (!this.address || !this.wallet) return;

    try {
      const balance = await this.wallet.request({
        method: 'eth_getBalance',
        params: [this.address, 'latest']
      });

      // Convert from wei to ETH
      this.balance = parseInt(balance, 16) / Math.pow(10, 18);
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  }

  async getAssetBalance(assetId) {
    // For demo purposes, return a mock balance
    // In production, this would query the actual token balance
    const mockBalances = {
      'ETH': this.balance || 0,
      'BTC': 0.5,
      'USDC': 1000,
      'USDT': 500,
      'DAI': 250
    };

    return mockBalances[assetId] || 0;
  }

  getAddress() {
    return this.address;
  }

  getShortAddress() {
    if (!this.address) return '';
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }

  getBalance() {
    return this.balance ? this.balance.toFixed(4) : '0.0000';
  }

  getChainId() {
    return this.chainId;
  }

  isWalletConnected() {
    return this.isConnected;
  }

  disconnect() {
    this.wallet = null;
    this.address = null;
    this.balance = null;
    this.chainId = null;
    this.isConnected = false;
  }

  async switchChain(targetChainId) {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      await this.wallet.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      });
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    }
  }

  async sendTransaction(transaction) {
    if (!this.wallet || !this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const txHash = await this.wallet.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });

      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  async signMessage(message) {
    if (!this.wallet || !this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.wallet.request({
        method: 'personal_sign',
        params: [message, this.address]
      });

      return signature;
    } catch (error) {
      console.error('Message signing failed:', error);
      throw error;
    }
  }

  // Get supported chains for ChainRelief
  getSupportedChains() {
    return [
      {
        chainId: '0x1',
        name: 'Ethereum',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.infura.io/v3/',
        blockExplorer: 'https://etherscan.io'
      },
      {
        chainId: '0x89',
        name: 'Polygon',
        symbol: 'MATIC',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorer: 'https://polygonscan.com'
      },
      {
        chainId: '0x38',
        name: 'BNB Smart Chain',
        symbol: 'BNB',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        blockExplorer: 'https://bscscan.com'
      },
      {
        chainId: '0xa86a',
        name: 'Avalanche',
        symbol: 'AVAX',
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        blockExplorer: 'https://snowtrace.io'
      }
    ];
  }

  // Check if current chain is supported
  isChainSupported() {
    const supportedChains = this.getSupportedChains();
    return supportedChains.some(chain => chain.chainId === this.chainId);
  }

  // Get optimal chain for donations based on gas fees
  getOptimalChain() {
    // In production, this would analyze real-time gas fees
    // For demo, return Polygon as it typically has lower fees
    return {
      chainId: '0x89',
      name: 'Polygon',
      reason: 'Lowest gas fees'
    };
  }
}
