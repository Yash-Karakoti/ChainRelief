# 🔑 SideShift API Integration Setup Guide

## 📋 **Required Information from SideShift**

To integrate the real SideShift API, you'll need to obtain the following from your SideShift account:

### **1. API Credentials**
- **API Key**: Your SideShift API key (public identifier)
- **API Secret**: Your SideShift secret key (for authentication)
- **Affiliate ID**: Your affiliate/partner ID for commission tracking

### **2. How to Get SideShift Credentials**

1. **Visit SideShift.ai**: Go to [sideshift.ai](https://sideshift.ai)
2. **Create Account**: Sign up for a developer account
3. **Access API Section**: Navigate to API/Developer section
4. **Generate Keys**: Create new API keys for your application
5. **Get Affiliate ID**: Note your affiliate ID for commission tracking

## 🔧 **Environment Setup**

### **Step 1: Create Environment File**

Create a `.env` file in your project root:

```bash
# Copy the example file
cp env.example .env
```

### **Step 2: Configure Environment Variables**

Edit your `.env` file with your actual SideShift credentials:

```env
# SideShift API Configuration
VITE_SIDESHIFT_API_KEY=your_actual_api_key_here
VITE_SIDESHIFT_SECRET=your_actual_secret_here
VITE_SIDESHIFT_BASE_URL=https://sideshift.ai/api/v2

# Application Configuration
VITE_APP_NAME=ChainRelief
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Network Configuration
VITE_DEFAULT_CHAIN_ID=1
VITE_SUPPORTED_CHAINS=1,137,56,43114

# Commission Settings
VITE_COMMISSION_RATE=0.005
VITE_AFFILIATE_ID=your_actual_affiliate_id_here

# Feature Flags
VITE_ENABLE_REAL_API=true
VITE_ENABLE_TESTNET=false
VITE_ENABLE_ANALYTICS=true
```

### **Step 3: Security Considerations**

⚠️ **Important Security Notes:**

1. **Never commit `.env` files** to version control
2. **Use environment-specific keys** (testnet vs mainnet)
3. **Rotate keys regularly** for security
4. **Limit API permissions** to only what's needed

## 🚀 **Testing the Integration**

### **Step 1: Enable Real API**

Set `VITE_ENABLE_REAL_API=true` in your `.env` file

### **Step 2: Test API Connection**

```bash
# Start development server
npm run dev

# Check browser console for:
# ✅ "Loaded X supported assets from SideShift API"
# ❌ "Using mock data" (indicates API not working)
```

### **Step 3: Test Quote Generation**

1. Open browser console
2. Connect wallet
3. Select assets and amount
4. Check for real quote data vs mock data

## 🔍 **API Endpoints Used**

### **1. Get Supported Assets**
```javascript
GET /api/v1/pairs?pairs=btc-mainnet,usdc-bsc,bch,eth'
Headers: {
  'X-API-Key': 'your_api_key'
}
```

### **2. Generate Quote**
```javascript
POST /api/v1/quote
Headers: {
  'X-API-Key': 'your_api_key',
  'Content-Type': 'application/json'
}
Body: {
  "depositMethodId": "ETH",
  "settleMethodId": "USDC",
  "depositAmount": "1.0",
  "affiliateId": "your_affiliate_id"
}
```

### **3. Execute Swap**
```javascript
POST /api/v1/shift
Headers: {
  'X-API-Key': 'your_api_key',
  'Content-Type': 'application/json'
}
Body: {
  "quoteId": "quote_id",
  "settleAddress": "recipient_address",
  "affiliateId": "your_affiliate_id"
}
```

### **4. Check Order Status**
```javascript
GET /api/v1/order/{orderId}
Headers: {
  'X-API-Key': 'your_api_key'
}
```

## 🛠 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. API Key Not Working**
```
Error: "API Error 401: Unauthorized"
```
**Solution:**
- Verify API key is correct
- Check if key has proper permissions
- Ensure key is not expired

#### **2. CORS Issues**
```
Error: "CORS policy blocks request"
```
**Solution:**
- SideShift API should handle CORS
- Check if you're using correct base URL
- Verify request headers

#### **3. Rate Limiting**
```
Error: "API Error 429: Too Many Requests"
```
**Solution:**
- Implement request throttling
- Add retry logic with exponential backoff
- Check SideShift rate limits

#### **4. Network Issues**
```
Error: "Failed to fetch"
```
**Solution:**
- Check internet connection
- Verify API endpoint is accessible
- Test with curl/Postman first

## 📊 **Monitoring & Analytics**

### **API Usage Tracking**

The application automatically tracks:
- Successful API calls
- Failed requests
- Response times
- Error rates

### **Commission Tracking**

With affiliate ID configured:
- Automatic commission attribution
- Revenue tracking
- Performance metrics

## 🔄 **Fallback Strategy**

The application includes intelligent fallbacks:

1. **Real API First**: Try SideShift API with your credentials
2. **Mock Data Fallback**: Use mock data if API fails
3. **Error Handling**: Graceful degradation for better UX

## 🎯 **Buildathon Optimization**

### **For Demo/Submission**

1. **Use Real API**: Enable `VITE_ENABLE_REAL_API=true`
2. **Test Thoroughly**: Verify all endpoints work
3. **Show Real Data**: Demonstrate actual SideShift integration
4. **Handle Errors**: Show robust error handling

### **For Production**

1. **Environment Variables**: Use proper production keys
2. **Security**: Implement proper key management
3. **Monitoring**: Add comprehensive logging
4. **Scaling**: Implement rate limiting and caching

## 📞 **Support Resources**

- **SideShift Documentation**: [docs.sideshift.ai](https://docs.sideshift.ai)
- **API Reference**: Check SideShift's API docs for latest endpoints
- **Community Support**: SideShift Telegram/Discord channels
- **Buildathon Support**: SideShift team for buildathon participants

---

## 🚀 **Quick Start Checklist**

- [ ] Obtain SideShift API credentials
- [ ] Create `.env` file with your keys
- [ ] Set `VITE_ENABLE_REAL_API=true`
- [ ] Test API connection
- [ ] Verify quote generation works
- [ ] Test swap execution
- [ ] Check commission tracking
- [ ] Prepare for buildathon demo

**Ready to revolutionize disaster relief with real SideShift integration! 🚨**
