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
        this.checkSystemHealth();
      }
    }, 30000);

    // Update quote previews every 10 seconds
    setInterval(() => {
      if (this.realTimeUpdates) {
        this.updateQuotePreviews();
      }
    }, 10000);

    // Check for expired quotes every 5 seconds
    setInterval(() => {
      this.checkExpiredQuotes();
    }, 5000);
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

  // Quote management methods
  updateQuotePreviews() {
    const previewElement = document.getElementById('quote-preview');
    if (previewElement && previewElement.style.display !== 'none') {
      // Trigger quote update in main app
      const event = new CustomEvent('updateQuotePreview');
      window.dispatchEvent(event);
    }
  }

  checkExpiredQuotes() {
    // Check if any quotes in the UI are expired
    const quoteElements = document.querySelectorAll('.quote-preview, .quote-modal');
    quoteElements.forEach(element => {
      const expiryElement = element.querySelector('.quote-expiry');
      if (expiryElement) {
        const timeText = expiryElement.textContent;
        const timeMatch = timeText.match(/(\d+)/);
        if (timeMatch) {
          const timeLeft = parseInt(timeMatch[1]);
          if (timeLeft <= 0) {
            this.showQuoteExpiredAlert();
            element.remove();
          }
        }
      }
    });
  }

  showQuoteExpiredAlert() {
    const alert = document.createElement('div');
    alert.className = 'quote-expired-alert';
    alert.innerHTML = `
      <div class="alert-content">
        <span class="alert-icon">⏰</span>
        <span class="alert-message">Quote expired. Please get a new quote.</span>
        <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 5000);
  }

  // Enhanced donation tracking
  trackDonationProgress(donationId, status, data = {}) {
    console.log(`Donation ${donationId} status: ${status}`, data);
    
    // Update UI based on status
    switch (status) {
      case 'quote_generated':
        this.showStatusUpdate('Quote generated successfully', 'success');
        break;
      case 'quote_expired':
        this.showStatusUpdate('Quote expired, please try again', 'warning');
        break;
      case 'swap_initiated':
        this.showStatusUpdate('Swap initiated, processing...', 'info');
        break;
      case 'swap_completed':
        this.showStatusUpdate('Swap completed successfully!', 'success');
        this.addDonation(data);
        break;
      case 'swap_failed':
        this.showStatusUpdate('Swap failed, please try again', 'error');
        break;
    }
  }

  showStatusUpdate(message, type) {
    const notification = document.createElement('div');
    notification.className = `status-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getStatusIcon(type)}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  getStatusIcon(type) {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }

  // Real-time donation feed
  addToDonationFeed(donation) {
    const feedElement = document.getElementById('donation-feed');
    if (!feedElement) return;

    const feedItem = document.createElement('div');
    feedItem.className = 'donation-feed-item';
    feedItem.innerHTML = `
      <div class="feed-avatar">🎉</div>
      <div class="feed-content">
        <div class="feed-message">
          <strong>New donation received!</strong>
          <span>$${donation.usdValue.toLocaleString()} ${donation.asset}</span>
        </div>
        <div class="feed-time">${new Date().toLocaleTimeString()}</div>
        <div class="feed-impact">
          ${donation.impact.livesImpacted} lives will be impacted
        </div>
      </div>
    `;

    // Add to top of feed
    feedElement.insertBefore(feedItem, feedElement.firstChild);

    // Remove old items (keep only last 10)
    const items = feedElement.querySelectorAll('.donation-feed-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }

    // Add animation
    feedItem.style.opacity = '0';
    feedItem.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      feedItem.style.transition = 'all 0.3s ease';
      feedItem.style.opacity = '1';
      feedItem.style.transform = 'translateY(0)';
    }, 100);
  }
}
