export class DonationManager {
  constructor() {
    this.donations = [];
    this.currentDonation = null;
  }

  async createDonation(donationData) {
    try {
      // Validate donation data
      this.validateDonationData(donationData);

      // Create donation object
      const donation = {
        id: this.generateDonationId(),
        campaignId: donationData.campaignId,
        assetId: donationData.assetId,
        amount: donationData.amount,
        recipientAddress: donationData.recipientAddress,
        quote: donationData.quote || null,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        transactionHash: null,
        swapResult: null,
        impact: this.calculateImpact(donationData.amount, donationData.assetId, donationData.quote)
      };

      // Store donation
      this.donations.push(donation);
      this.currentDonation = donation;

      console.log('Donation created:', donation);
      return donation;
    } catch (error) {
      console.error('Failed to create donation:', error);
      throw error;
    }
  }

  validateDonationData(data) {
    const required = ['campaignId', 'assetId', 'amount', 'recipientAddress'];
    
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (parseFloat(data.amount) <= 0) {
      throw new Error('Donation amount must be greater than 0');
    }

    if (!data.recipientAddress || data.recipientAddress.length < 10) {
      throw new Error('Invalid recipient address');
    }
  }

  generateDonationId() {
    return 'donation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  calculateImpact(amount, assetId, quote = null) {
    // Calculate estimated impact based on donation amount
    let usdValue;
    
    if (quote && quote.settleCoin === 'USDC') {
      // Use actual quote value if available
      usdValue = parseFloat(quote.settleAmount);
    } else {
      // Fallback to estimated USD value
      usdValue = this.getUSDValue(assetId, amount);
    }
    
    return {
      usdValue: usdValue,
      livesImpacted: Math.floor(usdValue / 100), // $100 per life
      mealsProvided: Math.floor(usdValue / 5), // $5 per meal
      medicalSupplies: Math.floor(usdValue / 50), // $50 per medical kit
      shelterDays: Math.floor(usdValue / 20), // $20 per shelter day
      quote: quote
    };
  }

  getUSDValue(assetId, amount) {
    const usdRates = {
      'ETH': 3200,
      'BTC': 65000,
      'USDC': 1.0,
      'USDT': 1.0,
      'DAI': 1.0,
      'MATIC': 0.85,
      'BNB': 580,
      'AVAX': 35
    };

    // Try exact match first
    if (usdRates[assetId]) {
      return parseFloat(amount) * usdRates[assetId];
    }

    // Try case-insensitive match
    const upperAssetId = assetId.toUpperCase();
    if (usdRates[upperAssetId]) {
      return parseFloat(amount) * usdRates[upperAssetId];
    }

    // Try to extract main asset name
    const simplifiedAsset = this.simplifyAssetName(assetId);
    if (usdRates[simplifiedAsset]) {
      return parseFloat(amount) * usdRates[simplifiedAsset];
    }

    // Fallback to 1.0 for unknown assets
    console.warn(`No USD rate found for ${assetId}, using $1.00`);
    return parseFloat(amount) * 1.0;
  }

  simplifyAssetName(assetId) {
    // Extract the main asset name from complex IDs
    const upperId = assetId.toUpperCase();
    if (upperId.includes('ETH')) return 'ETH';
    if (upperId.includes('BTC')) return 'BTC';
    if (upperId.includes('USDC')) return 'USDC';
    if (upperId.includes('USDT')) return 'USDT';
    if (upperId.includes('DAI')) return 'DAI';
    if (upperId.includes('MATIC')) return 'MATIC';
    if (upperId.includes('BNB')) return 'BNB';
    if (upperId.includes('AVAX')) return 'AVAX';
    return assetId;
  }

  updateDonationStatus(donationId, status, swapResult = null) {
    const donation = this.donations.find(d => d.id === donationId);
    if (donation) {
      donation.status = status;
      donation.updatedAt = Date.now();
      
      if (swapResult) {
        donation.swapResult = swapResult;
        donation.transactionHash = swapResult.transactionId;
      }
    }
  }

  getDonation(donationId) {
    return this.donations.find(d => d.id === donationId);
  }

  getDonationsByCampaign(campaignId) {
    return this.donations.filter(d => d.campaignId === campaignId);
  }

  getAllDonations() {
    return this.donations;
  }

  getDonationStats() {
    const totalDonations = this.donations.length;
    const totalAmount = this.donations.reduce((sum, d) => {
      return sum + this.getUSDValue(d.assetId, d.amount);
    }, 0);

    const successfulDonations = this.donations.filter(d => d.status === 'completed').length;
    const pendingDonations = this.donations.filter(d => d.status === 'pending').length;

    return {
      totalDonations,
      totalAmount,
      successfulDonations,
      pendingDonations,
      successRate: totalDonations > 0 ? (successfulDonations / totalDonations) * 100 : 0
    };
  }

  getCampaignStats(campaignId) {
    const campaignDonations = this.getDonationsByCampaign(campaignId);
    
    const totalAmount = campaignDonations.reduce((sum, d) => {
      return sum + this.getUSDValue(d.assetId, d.amount);
    }, 0);

    const totalLivesImpacted = campaignDonations.reduce((sum, d) => {
      return sum + d.impact.livesImpacted;
    }, 0);

    const totalMeals = campaignDonations.reduce((sum, d) => {
      return sum + d.impact.mealsProvided;
    }, 0);

    return {
      campaignId,
      totalDonations: campaignDonations.length,
      totalAmount,
      totalLivesImpacted,
      totalMeals,
      averageDonation: campaignDonations.length > 0 ? totalAmount / campaignDonations.length : 0
    };
  }

  // Emergency donation processing
  processEmergencyDonation(donationData) {
    // For emergency situations, use pre-configured swap parameters
    const emergencyParams = {
      ...donationData,
      slippage: 0.01, // 1% slippage tolerance
      maxGasPrice: 100, // Max gas price in gwei
      priority: 'high',
      autoExecute: true
    };

    return this.createDonation(emergencyParams);
  }

  // Batch donation processing
  async processBatchDonations(donations) {
    const results = [];
    
    for (const donationData of donations) {
      try {
        const donation = await this.createDonation(donationData);
        results.push({ success: true, donation });
      } catch (error) {
        results.push({ success: false, error: error.message, donationData });
      }
    }

    return results;
  }

  // Donation validation and fraud prevention
  validateDonationForFraud(donation) {
    const warnings = [];
    
    // Check for unusually large donations
    const usdValue = this.getUSDValue(donation.assetId, donation.amount);
    if (usdValue > 100000) {
      warnings.push('Large donation detected - manual review recommended');
    }

    // Check for rapid successive donations (potential bot)
    const recentDonations = this.donations.filter(d => 
      d.recipientAddress === donation.recipientAddress && 
      Date.now() - d.createdAt < 60000 // Within last minute
    );

    if (recentDonations.length > 5) {
      warnings.push('Rapid successive donations detected');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  // Generate donation receipt
  generateReceipt(donationId) {
    const donation = this.getDonation(donationId);
    if (!donation) {
      throw new Error('Donation not found');
    }

    return {
      receiptId: 'receipt_' + donation.id,
      donation: donation,
      timestamp: new Date(donation.createdAt).toISOString(),
      blockchainHash: donation.transactionHash,
      impact: donation.impact,
      taxDeductible: this.isTaxDeductible(donation),
      verificationUrl: `https://chainrelief.vercel.app/verify/${donation.id}`
    };
  }

  isTaxDeductible(donation) {
    // In a real implementation, this would check against registered 501(c)(3) organizations
    const taxDeductibleCampaigns = [
      'hurricane-relief-2024',
      'earthquake-response-asia',
      'flood-relief-europe'
    ];

    return taxDeductibleCampaigns.includes(donation.campaignId);
  }

  // Export donation data for accounting
  exportDonationData(format = 'json') {
    const data = this.donations.map(donation => ({
      id: donation.id,
      campaignId: donation.campaignId,
      amount: donation.amount,
      asset: donation.assetId,
      usdValue: this.getUSDValue(donation.assetId, donation.amount),
      status: donation.status,
      timestamp: new Date(donation.createdAt).toISOString(),
      transactionHash: donation.transactionHash
    }));

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }
}
