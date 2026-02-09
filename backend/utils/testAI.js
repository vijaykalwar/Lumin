// ════════════════════════════════════════════════════════════
// AI TESTING UTILITY - Check if AI is working
// ════════════════════════════════════════════════════════════

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
  console.log('🧪 Testing Gemini AI Configuration...\n');
  
  // Check API Key
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ ERROR: GEMINI_API_KEY not found in environment variables!');
    console.log('   Please add GEMINI_API_KEY to your .env file');
    return;
  }
  
  console.log('✅ GEMINI_API_KEY found');
  console.log(`   Key: ${process.env.GEMINI_API_KEY.substring(0, 20)}...`);
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test with original model
    console.log('\n📝 Testing model: gemini-2.5-flash-lite');
    try {
      const model1 = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7
        }
      });
      
      const result1 = await model1.generateContent('Say hello in one word');
      console.log('✅ gemini-2.5-flash-lite works!');
      console.log(`   Response: ${result1.response.text()}\n`);
    } catch (error) {
      console.error('❌ gemini-2.5-flash-lite failed:', error.message);
      console.log('\n📝 Trying fallback model: gemini-1.5-flash');
      
      try {
        const model2 = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7
          }
        });
        
        const result2 = await model2.generateContent('Say hello in one word');
        console.log('✅ gemini-1.5-flash works!');
        console.log(`   Response: ${result2.response.text()}\n`);
        console.log('💡 Suggestion: Use gemini-1.5-flash as fallback');
      } catch (error2) {
        console.error('❌ Both models failed:', error2.message);
        console.error('\n🔍 Possible issues:');
        console.error('   1. Invalid API key');
        console.error('   2. API key doesn\'t have access to these models');
        console.error('   3. Network/connectivity issues');
        console.error('   4. API quota exceeded');
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    console.error('\n🔍 Error details:', error);
  }
}

testAI();
