// Browser-based SideShift V2 API test
// This will work in the browser environment
import { config } from './config.js';

export const testSideShiftInBrowser = async () => {
  console.log('🚨 ChainRelief - Browser SideShift V2 API Test');
  console.log('=============================================\n');
  
  const apiKey = config.sideshift.apiKey;
  const affiliateId = config.sideshift.affiliateId;
  const baseURL = config.sideshift.baseURL;
  
  console.log('🔑 Your Credentials:');
  console.log(`API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`Affiliate ID: ${affiliateId}`);
  console.log(`Base URL: ${baseURL}\n`);

  // Test 1: Get Coins (V2 API)
  console.log('🧪 Test 1: Get Supported Coins (V2 API)');
  try {
    const response = await fetch(`${baseURL}/coins`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection: SUCCESS');
      console.log(`📊 Available Coins: ${Array.isArray(data) ? data.length : 'Unknown'}`);
      
      // Show some example coins
      if (Array.isArray(data)) {
        console.log('🎯 Example Coins:');
        data.slice(0, 5).forEach(coin => {
          console.log(`  - ${coin.name} (${coin.id}) on ${coin.network}`);
        });
      }
      
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ API Connection: FAILED');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log('❌ API Connection: ERROR');
    console.log(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Test Quote Generation (V2 API)
export const testQuoteGeneration = async () => {
  console.log('\n🧪 Test 2: Generate Quote (ETH to USDC) - V2 API');
  
  const apiKey = config.sideshift.apiKey;
  const affiliateId = config.sideshift.affiliateId;
  const baseURL = config.sideshift.baseURL;
  
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
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(quoteData),
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Quote Generation: SUCCESS');
      console.log(`💱 Rate: 1 ETH = ${data.rate} USDC`);
      console.log(`💰 You'll receive: ${data.toAmount} USDC`);
      console.log(`💸 Fee: ${data.fee} ETH`);
      console.log(`🏦 Deposit Address: ${data.depositAddress}`);
      console.log(`⏰ Expires at: ${new Date(data.expiresAt).toLocaleString()}`);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ Quote Generation: FAILED');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log('❌ Quote Generation: ERROR');
    console.log(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Test Pairs (V2 API)
export const testPairs = async () => {
  console.log('\n🧪 Test 3: Get Trading Pairs - V2 API');
  
  const apiKey = config.sideshift.apiKey;
  const baseURL = config.sideshift.baseURL;
  
  try {
    const response = await fetch(`${baseURL}/pairs`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Pairs API: SUCCESS');
      console.log(`📊 Available Pairs: ${Array.isArray(data) ? data.length : 'Unknown'}`);
      
      // Show some example pairs
      if (Array.isArray(data)) {
        console.log('🎯 Example Pairs:');
        data.slice(0, 5).forEach(pair => {
          console.log(`  - ${pair.fromCoin} → ${pair.toCoin}`);
        });
      }
      
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log('❌ Pairs API: FAILED');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log('❌ Pairs API: ERROR');
    console.log(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting comprehensive SideShift V2 API tests...\n');
  
  const test1 = await testSideShiftInBrowser();
  const test2 = await testPairs();
  const test3 = await testQuoteGeneration();
  
  console.log('\n📊 Test Summary:');
  console.log(`Coins API Test: ${test1.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Pairs API Test: ${test2.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Quote API Test: ${test3.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1.success && test2.success && test3.success) {
    console.log('\n🎉 All tests passed! Your SideShift V2 integration is working perfectly!');
    console.log(`💰 Commission tracking enabled with affiliate ID: ${config.sideshift.affiliateId}`);
  } else {
    console.log('\n⚠️ Some tests failed. This might be due to:');
    console.log('- CORS policy restrictions');
    console.log('- Network connectivity issues');
    console.log('- API endpoint changes');
    console.log('- Authentication issues');
    console.log('\n💡 The app will fall back to mock data for demo purposes.');
  }
  
  return { test1, test2, test3 };
};