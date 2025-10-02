import { WalletManager } from './wallet-manager.js';
import { SideShiftAPI } from './sideshift-api.js';
import { DonationManager } from './donation-manager.js';
import { DashboardManager } from './dashboard-manager.js';
import { testSideShiftInBrowser, testQuoteGeneration } from './test-sideshift-browser.js';

export class ChainReliefApp {
  constructor() {
    this.walletManager = new WalletManager();
    this.sideShiftAPI = new SideShiftAPI();
    this.donationManager = new DonationManager();
    this.dashboardManager = new DashboardManager();
    
    this.isConnected = false;
    this.currentCampaign = null;
  }

  async init() {
    this.renderMainInterface();
    await this.initializeServices();
    this.setupEventListeners();
    this.loadActiveCampaigns();
  }

  renderMainInterface() {
    document.querySelector('#app').innerHTML = `
      <div class="chainrelief-app">
        <!-- Header -->
        <header class="app-header">
          <div class="header-content">
            <div class="logo-section">
              <h1 class="app-title">🚨 ChainRelief</h1>
              <p class="app-subtitle">Cross-Chain Disaster Funding Platform</p>
            </div>
            <div class="wallet-section">
              <button id="test-api" class="test-api-btn">
                Test API
              </button>
              <button id="connect-wallet" class="connect-wallet-btn">
                Connect Wallet
              </button>
              <div id="wallet-info" class="wallet-info hidden">
                <span id="wallet-address"></span>
                <span id="wallet-balance"></span>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <!-- Active Campaigns Section -->
          <section class="campaigns-section">
            <h2>Active Relief Campaigns</h2>
            <div id="campaigns-grid" class="campaigns-grid">
              <!-- Campaigns will be loaded here -->
            </div>
          </section>

          <!-- Donation Interface -->
          <section class="donation-section">
            <div class="donation-container">
              <h3>Make a Donation</h3>
              <div id="donation-form" class="donation-form">
                <div class="form-group">
                  <label for="campaign-select">Select Campaign:</label>
                  <select id="campaign-select" class="form-input">
                    <option value="">Choose a campaign...</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="asset-select">Donate Asset:</label>
                  <div class="asset-select-container">
                    <input type="text" id="asset-search" class="form-input asset-search" placeholder="Search for asset (e.g., Bitcoin, ETH, USDC)...">
                    <select id="asset-select" class="form-input asset-dropdown">
                      <option value="">Select asset...</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="donation-amount">Amount:</label>
                  <input type="number" id="donation-amount" class="form-input" placeholder="0.0" step="0.000001">
                  <div id="asset-balance" class="balance-info"></div>
                </div>
                
                <div class="form-group">
                  <label for="donation-address">Recipient Address:</label>
                  <input type="text" id="donation-address" class="form-input" placeholder="Your wallet address" readonly>
                </div>
                
                <button id="make-donation" class="donate-btn" disabled>
                  Make Donation
                </button>
              </div>
            </div>
          </section>

          <!-- Real-time Tracking -->
          <section class="tracking-section">
            <h3>Real-time Donation Tracking</h3>
            <div id="tracking-dashboard" class="tracking-dashboard">
              <div class="tracking-item">
                <span class="tracking-label">Total Donations:</span>
                <span id="total-donations" class="tracking-value">$0</span>
              </div>
              <div class="tracking-item">
                <span class="tracking-label">Active Campaigns:</span>
                <span id="active-campaigns" class="tracking-value">0</span>
              </div>
              <div class="tracking-item">
                <span class="tracking-label">Successful Swaps:</span>
                <span id="successful-swaps" class="tracking-value">0</span>
              </div>
              <div class="tracking-item">
                <span class="tracking-label">Chains Supported:</span>
                <span id="chains-supported" class="tracking-value">40+</span>
              </div>
            </div>
          </section>

          <!-- Impact Dashboard -->
          <section class="impact-section">
            <h3>Impact Dashboard</h3>
            <div id="impact-metrics" class="impact-metrics">
              <div class="metric-card">
                <h4>Funds Distributed</h4>
                <div class="metric-value">$0</div>
                <div class="metric-label">To Relief Organizations</div>
              </div>
              <div class="metric-card">
                <h4>Lives Impacted</h4>
                <div class="metric-value">0</div>
                <div class="metric-label">Through Direct Aid</div>
              </div>
              <div class="metric-card">
                <h4>Response Time</h4>
                <div class="metric-value">< 2 min</div>
                <div class="metric-label">Average Processing</div>
              </div>
            </div>
          </section>
        </main>

        <!-- Footer -->
        <footer class="app-footer">
          <p>Powered by SideShift.ai API | Built for humanitarian relief</p>
        </footer>
      </div>
    `;
  }

  async initializeServices() {
    try {
      // Initialize SideShift API
      await this.sideShiftAPI.init();
      
      // Load supported assets
      await this.loadSupportedAssets();
      
      // Show API status
      this.showAPISstatus();
      
      console.log('ChainRelief services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      this.showError('Failed to initialize application services');
    }
  }

  showAPISstatus() {
    const isRealAPI = this.sideShiftAPI.enableRealAPI;
    const affiliateId = this.sideShiftAPI.affiliateId;
    
    if (isRealAPI) {
      this.showSuccess(`🚀 Real SideShift API Connected! Affiliate ID: ${affiliateId}`);
      console.log(`💰 You'll earn 0.5% commission on all donations!`);
    } else {
      this.showError('⚠️ Using demo mode - add your SideShift credentials for real API');
    }
  }

  async testSideShiftAPI() {
    this.showLoading('Testing SideShift API connection...');
    
    try {
      console.log('🧪 Testing SideShift API...');
      
      // Test API connection
      const test1 = await testSideShiftInBrowser();
      
      if (test1.success) {
        this.showSuccess(`✅ SideShift API Connected! ${test1.data.depositMethods?.length || 0} assets available`);
        
        // Test quote generation
        this.showLoading('Testing quote generation...');
        const test2 = await testQuoteGeneration();
        
        if (test2.success) {
          this.showSuccess(`✅ Quote generation working! Rate: 1 ETH = ${test2.data.rate} USDC`);
          console.log('🎉 All SideShift API tests passed!');
        } else {
          this.showError(`Quote test failed: ${test2.error}`);
        }
      } else {
        this.showError(`API connection failed: ${test1.error}`);
        console.log('💡 App will use mock data for demo purposes');
      }
    } catch (error) {
      this.showError(`API test failed: ${error.message}`);
      console.error('API test error:', error);
    } finally {
      this.hideLoading();
    }
  }

  setupEventListeners() {
    // Test API button
    document.getElementById('test-api').addEventListener('click', () => {
      this.testSideShiftAPI();
    });

    // Wallet connection
    document.getElementById('connect-wallet').addEventListener('click', () => {
      this.handleWalletConnection();
    });

    // Donation form
    document.getElementById('make-donation').addEventListener('click', () => {
      this.handleDonation();
    });

    // Asset search
    document.getElementById('asset-search').addEventListener('input', (e) => {
      this.filterAssets(e.target.value);
    });

    // Asset selection
    document.getElementById('asset-select').addEventListener('change', (e) => {
      this.updateAssetBalance(e.target.value);
      this.updateAssetSearchDisplay(e.target.value);
    });

    // Campaign selection
    document.getElementById('campaign-select').addEventListener('change', (e) => {
      this.selectCampaign(e.target.value);
    });
  }

  async handleWalletConnection() {
    try {
      const connected = await this.walletManager.connectWallet();
      if (connected) {
        this.isConnected = true;
        this.updateWalletUI();
        this.enableDonationForm();
        this.showSuccess('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      this.showError('Failed to connect wallet');
    }
  }

  updateWalletUI() {
    const connectBtn = document.getElementById('connect-wallet');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    const walletBalance = document.getElementById('wallet-balance');

    if (this.isConnected) {
      connectBtn.textContent = 'Connected';
      connectBtn.classList.add('connected');
      
      walletAddress.textContent = this.walletManager.getShortAddress();
      walletBalance.textContent = `Balance: ${this.walletManager.getBalance()} ETH`;
      
      walletInfo.classList.remove('hidden');
    }
  }

  enableDonationForm() {
    document.getElementById('donation-address').value = this.walletManager.getAddress();
    document.getElementById('make-donation').disabled = false;
  }

  async loadSupportedAssets() {
    try {
      const assets = await this.sideShiftAPI.getSupportedAssets();
      const assetSelect = document.getElementById('asset-select');
      
      // Clear existing options
      assetSelect.innerHTML = '<option value="">Select asset...</option>';
      
      // Sort assets by name for better UX
      const sortedAssets = assets.sort((a, b) => a.name.localeCompare(b.name));
      
      // Group assets by network for better organization
      const groupedAssets = {};
      sortedAssets.forEach(asset => {
        const network = asset.network || 'Other';
        if (!groupedAssets[network]) {
          groupedAssets[network] = [];
        }
        groupedAssets[network].push(asset);
      });

      // Add grouped options
      Object.keys(groupedAssets).sort().forEach(network => {
        const groupOption = document.createElement('optgroup');
        groupOption.label = network.charAt(0).toUpperCase() + network.slice(1);
        
        groupedAssets[network].forEach(asset => {
          const option = document.createElement('option');
          option.value = asset.id;
          option.textContent = `${asset.name} (${asset.symbol})`;
          option.dataset.network = asset.network;
          option.dataset.symbol = asset.symbol;
          option.dataset.name = asset.name;
          groupOption.appendChild(option);
        });
        
        assetSelect.appendChild(groupOption);
      });

      console.log(`✅ Loaded ${assets.length} assets into dropdown`);
    } catch (error) {
      console.error('Failed to load supported assets:', error);
    }
  }

  loadActiveCampaigns() {
    const campaigns = [
      {
        id: 'hurricane-relief-2024',
        title: 'Hurricane Relief Fund 2024',
        description: 'Emergency aid for communities affected by recent hurricanes',
        target: 50000,
        raised: 12500,
        urgency: 'high',
        location: 'Caribbean & Gulf Coast'
      },
      {
        id: 'earthquake-response-asia',
        title: 'Asia Earthquake Response',
        description: 'Immediate medical aid and shelter for earthquake victims',
        target: 75000,
        raised: 32000,
        urgency: 'critical',
        location: 'Southeast Asia'
      },
      {
        id: 'flood-relief-europe',
        title: 'European Flood Relief',
        description: 'Supporting communities affected by severe flooding',
        target: 30000,
        raised: 18000,
        urgency: 'medium',
        location: 'Central Europe'
      }
    ];

    this.renderCampaigns(campaigns);
    this.populateCampaignSelect(campaigns);
  }

  renderCampaigns(campaigns) {
    const campaignsGrid = document.getElementById('campaigns-grid');
    
    campaignsGrid.innerHTML = campaigns.map(campaign => `
      <div class="campaign-card ${campaign.urgency}">
        <div class="campaign-header">
          <h4>${campaign.title}</h4>
          <span class="urgency-badge ${campaign.urgency}">${campaign.urgency.toUpperCase()}</span>
        </div>
        <p class="campaign-description">${campaign.description}</p>
        <div class="campaign-location">📍 ${campaign.location}</div>
        <div class="campaign-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(campaign.raised / campaign.target) * 100}%"></div>
          </div>
          <div class="progress-text">
            $${campaign.raised.toLocaleString()} / $${campaign.target.toLocaleString()}
          </div>
        </div>
        <button class="donate-to-campaign" data-campaign-id="${campaign.id}">
          Donate Now
        </button>
      </div>
    `).join('');

    // Add event listeners to campaign donation buttons
    document.querySelectorAll('.donate-to-campaign').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectCampaign(e.target.dataset.campaignId);
        document.getElementById('donation-form').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  populateCampaignSelect(campaigns) {
    const campaignSelect = document.getElementById('campaign-select');
    
    campaigns.forEach(campaign => {
      const option = document.createElement('option');
      option.value = campaign.id;
      option.textContent = campaign.title;
      campaignSelect.appendChild(option);
    });
  }

  selectCampaign(campaignId) {
    this.currentCampaign = campaignId;
    document.getElementById('campaign-select').value = campaignId;
  }

  filterAssets(searchTerm) {
    const assetSelect = document.getElementById('asset-select');
    const options = assetSelect.querySelectorAll('option');
    const searchLower = searchTerm.toLowerCase();

    // Show/hide options based on search
    options.forEach(option => {
      if (option.value === '') {
        option.style.display = 'block'; // Always show placeholder
        return;
      }

      const assetName = option.dataset.name || '';
      const assetSymbol = option.dataset.symbol || '';
      const network = option.dataset.network || '';

      const matches = 
        assetName.toLowerCase().includes(searchLower) ||
        assetSymbol.toLowerCase().includes(searchLower) ||
        network.toLowerCase().includes(searchLower);

      option.style.display = matches ? 'block' : 'none';
      
      // Show/hide optgroups
      const optgroup = option.parentElement;
      if (optgroup.tagName === 'OPTGROUP') {
        const visibleOptions = Array.from(optgroup.children).filter(opt => opt.style.display !== 'none');
        optgroup.style.display = visibleOptions.length > 0 ? 'block' : 'none';
      }
    });

    // Auto-select if only one match
    const visibleOptions = Array.from(options).filter(opt => 
      opt.style.display !== 'none' && opt.value !== ''
    );
    
    if (visibleOptions.length === 1 && searchTerm.length > 2) {
      visibleOptions[0].selected = true;
      this.updateAssetBalance(visibleOptions[0].value);
    }
  }

  updateAssetSearchDisplay(assetId) {
    const assetSelect = document.getElementById('asset-select');
    const selectedOption = assetSelect.querySelector(`option[value="${assetId}"]`);
    const searchInput = document.getElementById('asset-search');
    
    if (selectedOption) {
      searchInput.value = selectedOption.dataset.name || selectedOption.textContent;
    }
  }

  async updateAssetBalance(assetId) {
    if (!assetId || !this.isConnected) return;

    try {
      const balance = await this.walletManager.getAssetBalance(assetId);
      const balanceElement = document.getElementById('asset-balance');
      balanceElement.textContent = `Available: ${balance} ${assetId}`;
    } catch (error) {
      console.error('Failed to get asset balance:', error);
    }
  }

  async handleDonation() {
    if (!this.isConnected || !this.currentCampaign) {
      this.showError('Please connect wallet and select a campaign');
      return;
    }

    const amount = document.getElementById('donation-amount').value;
    const assetId = document.getElementById('asset-select').value;

    if (!amount || !assetId) {
      this.showError('Please enter amount and select asset');
      return;
    }

    try {
      this.showLoading('Processing donation...');
      
      // Create donation through SideShift API
      const donation = await this.donationManager.createDonation({
        campaignId: this.currentCampaign,
        assetId: assetId,
        amount: amount,
        recipientAddress: this.walletManager.getAddress()
      });

      // Execute swap via SideShift
      const swapResult = await this.sideShiftAPI.executeSwap(donation);
      
      // Update tracking
      this.updateTrackingMetrics(swapResult);
      
      this.showSuccess(`Donation successful! Transaction: ${swapResult.transactionId}`);
      
      // Reset form
      document.getElementById('donation-amount').value = '';
      
    } catch (error) {
      console.error('Donation failed:', error);
      this.showError(`Donation failed: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  updateTrackingMetrics(swapResult) {
    // Update total donations
    const totalElement = document.getElementById('total-donations');
    const currentTotal = parseFloat(totalElement.textContent.replace('$', '').replace(',', '')) || 0;
    totalElement.textContent = `$${(currentTotal + swapResult.usdValue).toLocaleString()}`;

    // Update successful swaps
    const swapsElement = document.getElementById('successful-swaps');
    const currentSwaps = parseInt(swapsElement.textContent) || 0;
    swapsElement.textContent = currentSwaps + 1;

    // Update impact metrics
    this.updateImpactMetrics(swapResult);
  }

  updateImpactMetrics(swapResult) {
    const fundsDistributed = document.querySelector('.metric-card .metric-value');
    const currentFunds = parseFloat(fundsDistributed.textContent.replace('$', '').replace(',', '')) || 0;
    fundsDistributed.textContent = `$${(currentFunds + swapResult.usdValue).toLocaleString()}`;

    // Simulate lives impacted (1 life per $100)
    const livesImpacted = document.querySelectorAll('.metric-card .metric-value')[1];
    const currentLives = parseInt(livesImpacted.textContent) || 0;
    const newLives = Math.floor(swapResult.usdValue / 100);
    livesImpacted.textContent = currentLives + newLives;
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showLoading(message) {
    this.showNotification(message, 'loading');
  }

  hideLoading() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => notification.remove());
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      loading: '⏳'
    };
    return icons[type] || 'ℹ️';
  }
}
