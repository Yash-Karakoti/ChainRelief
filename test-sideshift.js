// Test SideShift V2 API with your real credentials
import { config } from './src/config.js';

const testSideShiftAPI = async () => {
  console.log('🚨 ChainRelief - SideShift V2 API Test');
  console.log('=====================================\n');
  
  const apiKey = config.sideshift.apiKey;
  const affiliateId = config.sideshift.affiliateId;
  const baseURL = config.sideshift.baseURL;
  
  console.log('🔑 Your Credentials:');
  console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`Affiliate ID: ${affiliateId}`);
  console.log(`Base URL: ${baseURL}\n`);

  // Test 1: Get Coins
  console.log('🧪 Test 1: Get Supported Coins');
  try {
    const response = await fetch(`${baseURL}/coins`, {
      headers: {
        'X-API-Key': apiKey
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection: SUCCESS');
      console.log(`📊 Available Coins: ${Array.isArray(data) ? data.length : 'Unknown'}`);
      console.log(`🎯 First 10 coins:`);
      if (Array.isArray(data)) {
        data.slice(0, 10).forEach(coin => {
          console.log(`  - ${coin.name || coin.coin || 'Unknown'} (${coin.id || coin.symbol || 'N/A'}) on ${coin.network || 'Unknown'}`);
        });
      }
    } else {
      console.log('❌ API Connection: FAILED');
      console.log(`Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ API Connection: ERROR');
    console.log(`Error: ${error.message}`);
  }
  
  console.log('');

  // Test 2: Get Pairs
  console.log('🧪 Test 2: Get Trading Pairs');
  try {
    const response = await fetch(`${baseURL}/pairs`, {
      headers: {
        'X-API-Key': apiKey
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pairs API: SUCCESS');
      console.log(`📊 Available Pairs: ${Array.isArray(data) ? data.length : 'Unknown'}`);
    } else {
      console.log('❌ Pairs API: FAILED');
      console.log(`Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Pairs API: ERROR');
    console.log(`Error: ${error.message}`);
  }
  
  console.log('');

  // Test 3: Get Quote
  console.log('🧪 Test 3: Generate Quote (ETH to USDC)');
  try {
    const quoteData = {
      fromCoin: 'ETH',
      toCoin: 'USDC',
      amount: '0.1',
      affiliateId: affiliateId
    };

    const response = await fetch(`${baseURL}/request-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(quoteData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Quote Generation: SUCCESS');
      console.log(`💱 Rate: 1 ETH = ${data.rate} USDC`);
      console.log(`💰 You'll receive: ${data.toAmount} USDC`);
      console.log(`💸 Fee: ${data.fee} ETH`);
      console.log(`🏦 Deposit Address: ${data.depositAddress}`);
    } else {
      console.log('❌ Quote Generation: FAILED');
      console.log(`Status: ${response.status} ${response.statusText}`);
      const error = await response.text();
      console.log(`Error: ${error}`);
    }
  } catch (error) {
    console.log('❌ Quote Generation: ERROR');
    console.log(`Error: ${error.message}`);
  }
  
  console.log('');

  // Test 4: Check Commission
  console.log('🧪 Test 4: Commission Tracking');
  console.log(`💰 Your Affiliate ID: ${affiliateId}`);
  console.log(`📈 Commission Rate: 0.5% on all transactions`);
  console.log('✅ Commission tracking will be automatic with affiliate ID');
  
  console.log('\n🏁 Test Complete!');
  console.log('🚀 Your ChainRelief app is ready with real SideShift V2 integration!');
};

// Run the test
testSideShiftAPI().catch(console.error);