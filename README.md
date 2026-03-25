# AD Community Research Assistant

A research chatbot grounded in Alzheimer's Disease community forum data.

## Deployment (Netlify)

### Step 1 — Push to GitHub
```bash
git init
git branch -m main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ad-chatbot.git
git push -u origin main
```

### Step 2 — Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) and sign up (free)
2. Click **"Add new site" → "Import an existing project"**
3. Connect GitHub and select this repo
4. Build settings are auto-detected from `netlify.toml`
5. Click **Deploy site**

### Step 3 — Add your API key
1. In Netlify dashboard → **Site configuration → Environment variables**
2. Click **"Add a variable"**
3. Key: `ANTHROPIC_API_KEY`
4. Value: your Anthropic API key (`sk-ant-...`)
5. Click **Save** → then **Trigger redeploy**

Your site is now live at `https://YOUR-SITE-NAME.netlify.app` 🎉

## Data
- 19,383 threads from Alzheimer's Society UK forum (local)
- AgingCare, AlzConnected, Talking Point (fetched from Google Drive at runtime)
