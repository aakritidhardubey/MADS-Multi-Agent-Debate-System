# AI Debate Arena - Render Deployment Guide

## 🚀 Quick Deploy to Render

### Prerequisites
- A [Render account](https://render.com) (free tier works!)
- Your GROQ API key

### Deployment Steps

#### Option 1: Deploy with render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Add Environment Variable**
   - In Render dashboard, go to your service
   - Navigate to "Environment" tab
   - Add: `GROQ_API_KEY` = `your_groq_api_key_here`
   - Click "Save Changes"

4. **Deploy!**
   - Render will automatically build and deploy
   - Your app will be live at: `https://your-app-name.onrender.com`

#### Option 2: Manual Deploy

1. **Push code to GitHub** (same as above)

2. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository

3. **Configure Service**
   - **Name**: `ai-debate-arena`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**
   - `GROQ_API_KEY`: Your Groq API key
   - `PYTHON_VERSION`: `3.12.0`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### 🔧 Post-Deployment

#### Verify Deployment
Visit these endpoints to verify:
- Homepage: `https://your-app.onrender.com/`
- API Health: `https://your-app.onrender.com/api/models`

#### Common Issues

**Issue: App crashes on startup**
- Solution: Check logs in Render dashboard
- Verify GROQ_API_KEY is set correctly

**Issue: Static files not loading**
- Solution: Ensure `static/` folder is committed to git
- Check browser console for 404 errors

**Issue: Slow first load**
- Solution: This is normal on Render free tier (cold starts)
- Consider upgrading to paid tier for instant loads

### 📊 Features Deployed

✅ Multi-agent debate system
✅ Side-by-side argument display
✅ Interactive follow-up questions
✅ PDF export functionality
✅ Beautiful responsive UI
✅ Real-time AI responses

### 🔐 Security Notes

- Never commit `.env` file to git
- Always use environment variables for API keys
- GROQ_API_KEY is stored securely in Render

### 💰 Cost

- **Free Tier**: Perfect for demos and testing
  - 750 hours/month
  - Sleeps after 15 min of inactivity
  - Cold starts (15-30 seconds)

- **Paid Tier** ($7/month): Recommended for production
  - Always on
  - No cold starts
  - Better performance

### 🆘 Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Verify environment variables are set
3. Ensure all dependencies are in `requirements.txt`

### 🎉 Success!

Once deployed, share your link:
`https://your-app-name.onrender.com`

Enjoy your AI Debate Arena! 🚀
