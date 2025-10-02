// SideShift API Integration Test Script
// Run this to test your API credentials
require('dotenv').config();

const testSideShiftAPI = async () => {
  console.log('🔑 Testing SideShift API Integration...\n');

  // Check environment variables
  const apiKey = process.env.VITE_SIDESHIFT_API_KEY;
  const baseURL = process.env.VITE_SIDESHIFT_BASE_URL || 'https://sideshift.ai/api/v2';

  if (!apiKey) {
    console.log('❌ VITE_SIDESHIFT_API_KEY not found in environment variables');
    console.log('📝 Please add your SideShift API key to .env file');
    return;
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 8)}...`);
  console.log(`🌐 Base URL: ${baseURL}\n`);

  // Test API endpoints
  const endpoints = [
    { name: 'Get Supported Assets', endpoint: '/pairs?pairs=btc-mainnet,usdc-bsc,bch,eth', method: 'GET' },
    { name: 'Test Quote Generation', endpoint: '/quote', method: 'POST', data: {
      depositMethodId: 'ETH',
      settleMethodId: 'USDC',
      depositAmount: '1.0'
    }}
  ];

  for (const test of endpoints) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
      };

      if (test.data) {
        options.body = JSON.stringify(test.data);
      }

      const response = await fetch(`${baseURL}${test.endpoint}`, options);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${test.name}: SUCCESS`);
        console.log(`📊 Response: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        console.log(`❌ ${test.name}: FAILED`);
        console.log(`🚨 Status: ${response.status} ${response.statusText}`);
        const error = await response.text();
        console.log(`📝 Error: ${error}`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      console.log(`🚨 Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🏁 API Test Complete!');
  console.log('💡 If tests pass, your SideShift integration is ready!');
};

// Run the test
testSideShiftAPI().catch(console.error);
