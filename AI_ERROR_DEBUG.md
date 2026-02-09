# AI Error Debugging Guide

## 🔍 Error क्यों हो रहा है - Check करने के Steps:

### Step 1: Backend Console Check करें
Backend server चलाते समय console में देखें:
- क्या `GEMINI_API_KEY` load हो रहा है?
- क्या कोई specific error message आ रहा है?

### Step 2: AI Test करें
```bash
cd backend
node utils/testAI.js
```

यह script बताएगी:
- ✅ API key सही है या नहीं
- ✅ Model `gemini-2.5-flash-lite` available है या नहीं
- ✅ Network connection है या नहीं

### Step 3: Common Errors और Solutions

#### Error 1: "API key not valid"
**Solution**: `.env` file में `GEMINI_API_KEY` check करें

#### Error 2: "Model not found" या "Invalid model name"
**Possible Reasons**:
- Model name `gemini-2.5-flash-lite` available नहीं हो सकता
- API key में इस model का access नहीं हो सकता

**Solution**: Code automatically fallback करेगा `gemini-1.5-flash` पर

#### Error 3: "Network error" या "Failed to fetch"
**Solution**: Internet connection check करें

#### Error 4: "Quota exceeded"
**Solution**: Gemini API quota check करें

### Step 4: Backend Logs देखें

Backend console में detailed errors दिखेंगे:
```
AI Chat Error: [actual error message]
Error Details: {
  message: "...",
  stack: "...",
  name: "..."
}
```

### Step 5: Frontend Console Check करें

Browser console (F12) में देखें:
- Network tab में API call fail हो रही है?
- Response में क्या error message आ रहा है?

## 🔧 Changes Made:

1. ✅ Original model name `gemini-2.5-flash-lite` रखा
2. ✅ Detailed error logging added
3. ✅ Automatic fallback to `gemini-1.5-flash` if original fails
4. ✅ Better error messages in frontend
5. ✅ Test utility created (`backend/utils/testAI.js`)

## 📝 Next Steps:

1. Backend restart करें:
   ```bash
   cd backend
   npm run dev
   ```

2. Test utility run करें:
   ```bash
   node utils/testAI.js
   ```

3. AI chat try करें और backend console देखें - actual error message दिखेगा

4. Error message share करें ताकि exact fix कर सकूं
