// Clean SideShift API Client - Based on SwapSmith implementation
export class SideShiftClient {
  constructor() {
    this.baseURL = 'https://sideshift.ai/api/v2';
    this.apiKey = import.meta.env?.VITE_SIDESHIFT_API_KEY;
    this.affiliateId = import.meta.env?.VITE_AFFILIATE_ID;
    
    if (!this.apiKey) {
      console.warn('SideShift API key not configured - some features may not work');
    }
    
    console.log('SideShift Client initialized');
  }

  async getUserIP() {
    try {
      // Try to get user's IP from a reliable IP service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      console.log('User IP detected:', data.ip);
      return data.ip;
    } catch (error) {
      console.warn('Failed to get user IP, using fallback:', error);
      // Fallback to a generic IP - this might still cause issues with SideShift
      return '127.0.0.1';
    }
  }

  async makeRequest(endpoint, method = 'GET', data = null, userIP = null) {
    if (!this.apiKey) {
      throw new Error('SideShift API key not configured');
    }
    
    // Get user IP if not provided
    if (!userIP) {
      userIP = await this.getUserIP();
    }
    
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-sideshift-secret': this.apiKey,
        'x-user-ip': userIP
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      console.log(`Making SideShift API request: ${method} ${endpoint}`);
      
      const response = await fetch(url, options);
      
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.error?.message || `API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('SideShift API request successful');
      return result;
    } catch (error) {
      console.error('SideShift API request failed:', error);
      throw error;
    }
  }

  async getPairs() {
    try {
      const pairs = await this.makeRequest('/pairs');
      console.log(`Fetched ${pairs.length} trading pairs from SideShift`);
      return pairs;
    } catch (error) {
      console.error('Failed to fetch pairs:', error);
      throw new Error('Failed to fetch trading pairs');
    }
  }

  async createQuote(fromAsset, fromNetwork, toAsset, toNetwork, amount, userIP = null) {
    try {
      // Get user's IP if not provided
      if (!userIP) {
        userIP = await this.getUserIP();
      }

      console.log(`Creating quote: ${fromAsset} → ${toAsset}`);

      const quoteData = {
        depositCoin: fromAsset,
        depositNetwork: fromNetwork,
        settleCoin: toAsset,
        settleNetwork: toNetwork,
        depositAmount: amount.toString(),
        affiliateId: this.affiliateId
      };

      const quote = await this.makeRequest('/quotes', 'POST', quoteData, userIP);
      
      if (quote.error) {
        throw new Error(quote.error.message);
      }

      console.log(`Quote created successfully: ${quote.depositAmount} ${quote.depositCoin} → ${quote.settleAmount} ${quote.settleCoin}`);
      return quote;
    } catch (error) {
      console.error('SideShift Client - Failed to create quote:', error);
      throw new Error(`Failed to create quote for ${fromAsset} to ${toAsset}: ${error.message}`);
    }
  }

  async getCoins() {
    try {
      const coins = await this.makeRequest('/coins');
      console.log(`Fetched ${coins.length} coins from SideShift`);
      return coins;
    } catch (error) {
      console.error('Failed to fetch coins:', error);
      throw new Error('Failed to fetch supported coins');
    }
  }
}

// Export singleton instance
export const sideShiftClient = new SideShiftClient();
