const axios = require('axios');

const API_BASE = 'http://localhost:5002/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Endpoints...\n');

    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'citizen'
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data);
    console.log('User ID:', registerResponse.data.data.user._id);
    console.log('Token:', registerResponse.data.data.token ? 'Present' : 'Missing');
    console.log('');

    // Test 2: Login with the user
    console.log('2. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data);
    console.log('User ID:', loginResponse.data.data.user._id);
    console.log('Token:', loginResponse.data.data.token ? 'Present' : 'Missing');
    console.log('');

    // Test 3: Get current user with token
    console.log('3. Testing get current user...');
    const token = loginResponse.data.data.token;
    const userResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Get current user successful:', userResponse.data);
    console.log('User ID:', userResponse.data.data.user._id);
    console.log('');

    // Test 4: Test protected endpoint
    console.log('4. Testing protected endpoint (community overview)...');
    const communityResponse = await axios.get(`${API_BASE}/community/overview`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Community overview successful:', communityResponse.data);
    console.log('');

    console.log('🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run the test
testAuth();
