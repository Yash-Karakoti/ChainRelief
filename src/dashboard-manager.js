export class DashboardManager {
  constructor() {
    this.metrics = {
      totalDonations: 0,
      totalAmount: 0,
      activeCampaigns: 0,
      successfulSwaps: 0,
      livesImpacted: 0,
      responseTime: 0
    };
    this.realTimeUpdates = true;
  }

  init() {
    this.setupRealTimeUpdates();
    this.initializeMetrics();
  }

  setupRealTimeUpdates() {
    // Update metrics every 30 seconds
    setInterval(() => {
      if (this.realTimeUpdates) {
        this.updateMetrics();
      }
    }, 30000);
  }

  initializeMetrics() {
    // Initialize with demo data
    this.metrics = {
      totalDonations: 0,
      totalAmount: 0,
      activeCampaigns: 3,
      successfulSwaps: 0,
      livesImpacted: 0,
      responseTime: 120 // 2 minutes average
    };

    this.updateDashboard();
  }

  updateMetrics(newData = null) {
    if (newData) {
      this.metrics = { ...this.metrics, ...newData };
    }

    this.updateDashboard();
  }

  updateDashboard() {
    // Update total donations
    const totalDonationsElement = document.getElementById('total-donations');
    if (totalDonationsElement) {
      totalDonationsElement.textContent = `$${this.metrics.totalAmount.toLocaleString()}`;
    }

    // Update active campaigns
    const activeCampaignsElement = document.getElementById('active-campaigns');
    if (activeCampaignsElement) {
      activeCampaignsElement.textContent = this.metrics.activeCampaigns.toString();
    }

    // Update successful swaps
    const successfulSwapsElement = document.getElementById('successful-swaps');
    if (successfulSwapsElement) {
      successfulSwapsElement.textContent = this.metrics.successfulSwaps.toString();
    }

    // Update impact metrics
    this.updateImpactMetrics();
  }

  updateImpactMetrics() {
    // Update funds distributed
    const fundsDistributed = document.querySelector('.metric-card .metric-value');
    if (fundsDistributed) {
      fundsDistributed.textContent = `$${this.metrics.totalAmount.toLocaleString()}`;
    }

    // Update lives impacted
    const livesImpacted = document.querySelectorAll('.metric-card .metric-value')[1];
    if (livesImpacted) {
      livesImpacted.textContent = this.metrics.livesImpacted.toString();
    }

    // Update response time
    const responseTime = document.querySelectorAll('.metric-card .metric-value')[2];
    if (responseTime) {
      responseTime.textContent = `< ${Math.round(this.metrics.responseTime / 60)} min`;
    }
  }

  // Add new donation to metrics
  addDonation(donationData) {
    this.metrics.totalDonations += 1;
    this.metrics.totalAmount += donationData.usdValue;
    this.metrics.successfulSwaps += 1;
    this.metrics.livesImpacted += donationData.impact.livesImpacted;

    this.updateDashboard();
    this.showDonationNotification(donationData);
  }

  showDonationNotification(donationData) {
    const notification = document.createElement('div');
    notification.className = 'donation-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">🎉</div>
        <div class="notification-text">
          <strong>New Donation Received!</strong>
          <p>$${donationData.usdValue.toLocaleString()} from ${donationData.asset}</p>
          <small>${donationData.impact.livesImpacted} lives will be impacted</small>
        </div>
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

  // Generate real-time analytics
  generateAnalytics() {
    return {
      metrics: this.metrics,
      trends: this.calculateTrends(),
      topAssets: this.getTopDonatedAssets(),
      campaignPerformance: this.getCampaignPerformance(),
      geographicDistribution: this.getGeographicDistribution()
    };
  }

  calculateTrends() {
    // Mock trend data - in production this would analyze historical data
    return {
      donationGrowth: '+15.3%',
      averageDonationSize: '$247',
      peakHours: '2:00 PM - 4:00 PM UTC',
      topPerformingCampaign: 'Hurricane Relief Fund 2024'
    };
  }

  getTopDonatedAssets() {
    // Mock data - in production this would be calculated from actual donations
    return [
      { asset: 'USDC', amount: 45000, percentage: 45 },
      { asset: 'ETH', amount: 25000, percentage: 25 },
      { asset: 'USDT', amount: 15000, percentage: 15 },
      { asset: 'DAI', amount: 10000, percentage: 10 },
      { asset: 'BTC', amount: 5000, percentage: 5 }
    ];
  }

  getCampaignPerformance() {
    return [
      {
        id: 'hurricane-relief-2024',
        name: 'Hurricane Relief Fund 2024',
        raised: 12500,
        target: 50000,
        donors: 47,
        avgDonation: 266
      },
      {
        id: 'earthquake-response-asia',
        name: 'Asia Earthquake Response',
        raised: 32000,
        target: 75000,
        donors: 89,
        avgDonation: 359
      },
      {
        id: 'flood-relief-europe',
        name: 'European Flood Relief',
        raised: 18000,
        target: 30000,
        donors: 62,
        avgDonation: 290
      }
    ];
  }

  getGeographicDistribution() {
    // Mock geographic data
    return [
      { region: 'North America', percentage: 35, amount: 35000 },
      { region: 'Europe', percentage: 28, amount: 28000 },
      { region: 'Asia', percentage: 22, amount: 22000 },
      { region: 'Other', percentage: 15, amount: 15000 }
    ];
  }

  // Create visual charts (would integrate with Chart.js or similar in production)
  createDonationChart() {
    // Mock chart data
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Monthly Donations',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    };

    return chartData;
  }

  // Export dashboard data
  exportDashboardData() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      analytics: this.generateAnalytics(),
      chartData: this.createDonationChart()
    };
  }

  // Real-time monitoring alerts
  setupAlerts() {
    // Alert for large donations
    this.checkLargeDonation = (amount) => {
      if (amount > 10000) {
        this.showAlert('Large donation detected', 'warning');
      }
    };

    // Alert for system issues
    this.checkSystemHealth = () => {
      // Mock health check
      const healthStatus = {
        apiStatus: 'healthy',
        walletConnections: 'active',
        swapSuccess: '98.5%'
      };

      if (healthStatus.swapSuccess < 95) {
        this.showAlert('Low swap success rate detected', 'error');
      }
    };
  }

  showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `dashboard-alert ${type}`;
    alert.innerHTML = `
      <div class="alert-content">
        <span class="alert-icon">${this.getAlertIcon(type)}</span>
        <span class="alert-message">${message}</span>
        <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    const dashboard = document.querySelector('.tracking-dashboard');
    if (dashboard) {
      dashboard.appendChild(alert);
    }
  }

  getAlertIcon(type) {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅'
    };
    return icons[type] || 'ℹ️';
  }

  // Performance monitoring
  trackPerformance(operation, duration) {
    console.log(`Performance: ${operation} took ${duration}ms`);
    
    // Update response time metric
    if (operation === 'donation_processing') {
      this.metrics.responseTime = (this.metrics.responseTime + duration) / 2;
      this.updateDashboard();
    }
  }

  // Enable/disable real-time updates
  toggleRealTimeUpdates() {
    this.realTimeUpdates = !this.realTimeUpdates;
    return this.realTimeUpdates;
  }

  // Get current dashboard state
  getDashboardState() {
    return {
      metrics: this.metrics,
      realTimeUpdates: this.realTimeUpdates,
      lastUpdated: new Date().toISOString()
    };
  }
}
