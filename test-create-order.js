// Test script to create a Clover order
const https = require('https');

const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;
const CLOVER_ACCESS_TOKEN = process.env.CLOVER_ACCESS_TOKEN;

const orderData = JSON.stringify({
  total: 1500, // $15.00 in cents
  currency: "USD",
  note: "Test order from webhook integration",
  lineItems: [
    {
      name: "Test Item",
      price: 1500,
      unitQty: 1
    }
  ]
});

const options = {
  hostname: 'sandbox.dev.clover.com',
  port: 443,
  path: `/v3/merchants/${CLOVER_MERCHANT_ID}/orders`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CLOVER_ACCESS_TOKEN}`,
    'Content-Length': orderData.length
  }
};

console.log('Creating test order in Clover...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200 || res.statusCode === 201) {
      const order = JSON.parse(data);
      console.log('\n✅ Test order created successfully!');
      console.log('Order ID:', order.id);
      console.log('\nNow check your Railway logs to see if the webhook was received.');
    } else {
      console.error('❌ Failed to create order');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(orderData);
req.end();

