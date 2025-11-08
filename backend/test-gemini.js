// Quick test script for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('Testing Gemini API...');
console.log('API Key present:', !!apiKey);
console.log('API Key format:', apiKey ? `${apiKey.substring(0, 15)}...` : 'N/A');

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

try {
  const genAI = new GoogleGenerativeAI(apiKey.trim());
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  console.log('✅ Model created, testing API call...');
  
  const result = await model.generateContent('Say hello in one word');
  const response = result.response;
  const text = response.text();
  
  console.log('✅ API call successful!');
  console.log('Response:', text);
} catch (error) {
  console.error('❌ API call failed:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error status:', error.status);
  console.error('Error details:', error);
  
  if (error.message.includes('API_KEY_INVALID')) {
    console.error('\n💡 The API key appears to be invalid. Please check:');
    console.error('   1. The key is correct');
    console.error('   2. The key has Gemini API access enabled');
    console.error('   3. Get a new key from: https://makersuite.google.com/app/apikey');
  }
  
  process.exit(1);
}

