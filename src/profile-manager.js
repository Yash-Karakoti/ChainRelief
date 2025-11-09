/**
 * ProfileManager - User Profile and Donation Tracking
 * Manages user profile, donation history, wallet balances, and statistics
 */
export class ProfileManager {
  constructor(walletManager, sideShiftClient) {
    this.walletManager = walletManager;
    this.sideShiftClient = sideShiftClient;
    this.userDonations = [];
    this.userStats = {
      totalDonations: 0,
      totalUSDValue: 0,
      campaignsSupported: new Set(),
      livesImpacted: 0
    };
  }

  /**
   * Initialize profile section
   */
  async initialize() {
    console.log('Initializing Profile Manager...');
    this.loadUserData();
    this.setupEventListeners();
  }

  /**
   * Load user data from localStorage
   */
  loadUserData() {
    const savedDonations = localStorage.getItem('chainrelief_donations');
    if (savedDonations) {
      this.userDonations = JSON.parse(savedDonations);
      this.calculateStats();
    }
  }

  /**
   * Save user data to localStorage
   */
  saveUserData() {
    localStorage.setItem('chainrelief_donations', JSON.stringify(this.userDonations));
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Profile tab navigation
    const profileTab = document.getElementById('profile-tab');
    if (profileTab) {
      profileTab.addEventListener('click', () => this.showProfile());
    }

    // Refresh balance button
    const refreshBtn = document.getElementById('refresh-balance');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshBalances());
    }

    // Export donations button
    const exportBtn = document.getElementById('export-donations');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportDonations());
    }
  }

  /**
   * Show user profile
   */
  async showProfile() {
    console.log('Showing user profile...');
    
    // Hide other sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.add('hidden');
    });

    // Show profile section
    const profileSection = document.getElementById('profile-section');
    if (profileSection) {
      profileSection.classList.remove('hidden');
    }

    // Update profile data
    await this.updateProfile();
  }

  /**
   * Update profile with latest data
   */
  async updateProfile() {
    if (!this.walletManager.isConnected()) {
      this.showConnectWalletPrompt();
      return;
    }

    await this.updateWalletInfo();
    await this.updateBalances();
    this.updateDonationHistory();
    this.updateStatistics();
  }

  /**
   * Update wallet information
   */
  async updateWalletInfo() {
    const address = this.walletManager.getAddress();
    const network = this.walletManager.getNetwork();

    document.getElementById('profile-wallet-address').textContent = 
      `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    
    document.getElementById('profile-network').textContent = network || 'Unknown';

    // Add copy functionality
    const copyBtn = document.getElementById('copy-address-btn');
    if (copyBtn) {
      copyBtn.onclick = () => this.copyAddress(address);
    }
  }

  /**
   * Update wallet balances
   */
  async updateBalances() {
    const balancesContainer = document.getElementById('wallet-balances');
    if (!balancesContainer) return;

    balancesContainer.innerHTML = '<div class="loading">Loading balances...</div>';

    try {
      // Get ETH balance
      const ethBalance = await this.walletManager.getBalance();
      
      // Get token balances (mock for now - will integrate with actual tokens)
      const tokens = [
        { symbol: 'ETH', balance: ethBalance, usdValue: ethBalance * 2000 },
        { symbol: 'USDC', balance: 0, usdValue: 0 },
        { symbol: 'USDT', balance: 0, usdValue: 0 }
      ];

      balancesContainer.innerHTML = tokens.map(token => `
        <div class="balance-item">
          <div class="balance-info">
            <span class="token-symbol">${token.symbol}</span>
            <span class="token-balance">${parseFloat(token.balance).toFixed(4)}</span>
          </div>
          <div class="balance-usd">
            $${token.usdValue.toFixed(2)} USD
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading balances:', error);
      balancesContainer.innerHTML = '<div class="error">Failed to load balances</div>';
    }
  }

  /**
   * Update donation history
   */
  updateDonationHistory() {
    const historyContainer = document.getElementById('donation-history');
    if (!historyContainer) return;

    if (this.userDonations.length === 0) {
      historyContainer.innerHTML = `
        <div class="empty-state">
          <p>No donations yet</p>
          <small>Your donation history will appear here</small>
        </div>
      `;
      return;
    }

    historyContainer.innerHTML = this.userDonations
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(donation => `
        <div class="donation-item">
          <div class="donation-header">
            <span class="donation-campaign">${donation.campaign}</span>
            <span class="donation-date">${this.formatDate(donation.timestamp)}</span>
          </div>
          <div class="donation-details">
            <div class="donation-amount">
              <span class="amount">${donation.amount} ${donation.asset}</span>
              <span class="usd-value">≈ $${donation.usdValue.toFixed(2)}</span>
            </div>
            <div class="donation-status ${donation.status}">
              ${this.getStatusIcon(donation.status)} ${donation.status}
            </div>
          </div>
          ${donation.txHash ? `
            <div class="donation-tx">
              <a href="https://etherscan.io/tx/${donation.txHash}" target="_blank" rel="noopener">
                View Transaction →
              </a>
            </div>
          ` : ''}
        </div>
      `).join('');
  }

  /**
   * Update user statistics
   */
  updateStatistics() {
    this.calculateStats();

    document.getElementById('total-donations').textContent = this.userStats.totalDonations;
    document.getElementById('total-usd-donated').textContent = 
      `$${this.userStats.totalUSDValue.toFixed(2)}`;
    document.getElementById('campaigns-supported').textContent = 
      this.userStats.campaignsSupported.size;
    document.getElementById('lives-impacted').textContent = 
      this.userStats.livesImpacted;
  }

  /**
   * Calculate user statistics
   */
  calculateStats() {
    this.userStats = {
      totalDonations: this.userDonations.length,
      totalUSDValue: this.userDonations.reduce((sum, d) => sum + d.usdValue, 0),
      campaignsSupported: new Set(this.userDonations.map(d => d.campaignId)),
      livesImpacted: Math.floor(this.userDonations.reduce((sum, d) => sum + d.usdValue, 0) / 100)
    };
  }

  /**
   * Add donation to history
   */
  addDonation(donation) {
    const donationRecord = {
      id: Date.now(),
      timestamp: Date.now(),
      campaign: donation.campaign,
      campaignId: donation.campaignId,
      amount: donation.amount,
      asset: donation.asset,
      usdValue: donation.usdValue,
      status: donation.status || 'completed',
      txHash: donation.txHash || null,
      impactMetrics: {
        livesImpacted: Math.floor(donation.usdValue / 100),
        mealsProvided: Math.floor(donation.usdValue / 5)
      }
    };

    this.userDonations.unshift(donationRecord);
    this.saveUserData();
    this.calculateStats();
  }

  /**
   * Refresh balances
   */
  async refreshBalances() {
    const refreshBtn = document.getElementById('refresh-balance');
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Refreshing...';
    }

    await this.updateBalances();

    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.textContent = 'Refresh';
    }
  }

  /**
   * Export donations to CSV
   */
  exportDonations() {
    if (this.userDonations.length === 0) {
      alert('No donations to export');
      return;
    }

    const csv = [
      ['Date', 'Campaign', 'Amount', 'Asset', 'USD Value', 'Status', 'Transaction Hash'],
      ...this.userDonations.map(d => [
        new Date(d.timestamp).toISOString(),
        d.campaign,
        d.amount,
        d.asset,
        d.usdValue.toFixed(2),
        d.status,
        d.txHash || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chainrelief-donations-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Copy address to clipboard
   */
  copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
      const copyBtn = document.getElementById('copy-address-btn');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    });
  }

  /**
   * Show connect wallet prompt
   */
  showConnectWalletPrompt() {
    const profileSection = document.getElementById('profile-section');
    if (profileSection) {
      profileSection.innerHTML = `
        <div class="connect-prompt">
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to view your profile and donation history</p>
          <button id="connect-wallet-profile" class="btn btn-primary">
            Connect Wallet
          </button>
        </div>
      `;

      document.getElementById('connect-wallet-profile').addEventListener('click', () => {
        this.walletManager.connect();
      });
    }
  }

  /**
   * Format date
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Get status icon
   */
  getStatusIcon(status) {
    const icons = {
      completed: '✅',
      pending: '⏳',
      failed: '❌',
      processing: '🔄'
    };
    return icons[status] || '•';
  }

  /**
   * Get profile HTML template
   */
  getProfileHTML() {
    return `
      <div id="profile-section" class="section hidden">
        <div class="profile-container">
          <!-- Profile Header -->
          <div class="profile-header">
            <div class="profile-avatar">
              <div class="avatar-placeholder">👤</div>
            </div>
            <div class="profile-info">
              <h2>My Profile</h2>
              <div class="wallet-info">
                <span id="profile-wallet-address">Not Connected</span>
                <button id="copy-address-btn" class="btn-icon">📋</button>
              </div>
              <div class="network-badge">
                <span id="profile-network">-</span>
              </div>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-value" id="total-donations">0</div>
                <div class="stat-label">Total Donations</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💵</div>
              <div class="stat-content">
                <div class="stat-value" id="total-usd-donated">$0.00</div>
                <div class="stat-label">Total Donated</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-value" id="campaigns-supported">0</div>
                <div class="stat-label">Campaigns Supported</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">❤️</div>
              <div class="stat-content">
                <div class="stat-value" id="lives-impacted">0</div>
                <div class="stat-label">Lives Impacted</div>
              </div>
            </div>
          </div>

          <!-- Wallet Balances -->
          <div class="profile-section-card">
            <div class="section-header">
              <h3>Wallet Balances</h3>
              <button id="refresh-balance" class="btn-secondary">Refresh</button>
            </div>
            <div id="wallet-balances" class="balances-list">
              <!-- Balances will be populated here -->
            </div>
          </div>

          <!-- Donation History -->
          <div class="profile-section-card">
            <div class="section-header">
              <h3>Donation History</h3>
              <button id="export-donations" class="btn-secondary">Export CSV</button>
            </div>
            <div id="donation-history" class="donation-list">
              <!-- Donation history will be populated here -->
            </div>
          </div>

          <!-- Impact Summary -->
          <div class="profile-section-card">
            <h3>Your Impact</h3>
            <div class="impact-summary">
              <div class="impact-item">
                <span class="impact-icon">🍽️</span>
                <span class="impact-text">
                  <strong id="meals-provided">0</strong> meals provided
                </span>
              </div>
              <div class="impact-item">
                <span class="impact-icon">🏠</span>
                <span class="impact-text">
                  <strong id="families-helped">0</strong> families helped
                </span>
              </div>
              <div class="impact-item">
                <span class="impact-icon">💊</span>
                <span class="impact-text">
                  <strong id="medical-supplies">0</strong> medical supplies
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

