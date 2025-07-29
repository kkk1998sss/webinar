# Google Drive Integration Setup Guide

## 🎯 Complete Setup for Audio/Video Streaming

### Step 1: Get Google Drive API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create/Select Project**
   - Click on project dropdown at top
   - Create new project or select existing

3. **Enable Google Drive API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated key

### Step 2: Add Environment Variable

Create or update your `.env.local` file in the project root:

```env
GOOGLE_DRIVE_API_KEY=your_actual_api_key_here
```

### Step 3: Make Files Public

1. Go to your Google Drive folder: https://drive.google.com/drive/folders/1at8mW66FDrTQ05l4YtWgXoaWxroITOJ9
2. For each audio/video file:
   - Right-click → "Share"
   - Click "Change to anyone with the link"
   - Set to "Viewer"
   - Click "Done"

### Step 4: Restart Development Server

```bash
npm run dev
```

## 🎵 Streaming Capabilities

### Audio Streaming ✅
- Direct playback in HTML5 audio player
- No download required
- Works on all devices
- Supports: MP3, WAV, M4A, etc.

### Video Streaming ✅
- Direct playback in HTML5 video player
- No download required
- Works on all devices
- Supports: MP4, WebM, etc.

## 🔧 Alternative Methods (If API Setup is Complex)

### Method 1: Direct Links (Simpler)
If you prefer not to use the API, you can manually add file IDs:

```typescript
const audioFiles = [
  {
    name: "Brain Activation",
    url: "https://drive.google.com/uc?export=download&id=1v5tclXKS2uMzoGZ5X-hJveLaS4JLyFsL",
  },
  // Add more files...
];
```

### Method 2: Embed Player
Use Google Drive's built-in player:

```html
<iframe 
  src="https://drive.google.com/file/d/FILE_ID/preview"
  width="100%" 
  height="400"
  allow="autoplay">
</iframe>
```

## 🚀 Features Available

- ✅ Direct streaming (no download)
- ✅ Download links
- ✅ File metadata (size, type)
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Multiple format support

## 🐛 Troubleshooting

### "No Audio Files Found"
- Check API key is correct
- Ensure files are public
- Verify folder ID is correct
- Check browser console for errors

### "Audio Won't Play"
- Make sure files are set to "Anyone with link can view"
- Check file format is supported
- Try different browser

### "API Key Error"
- Verify key is in .env.local
- Check key has Drive API enabled
- Restart development server

## 📞 Need Help?

If you're still having issues:
1. Check browser console (F12) for errors
2. Verify all setup steps completed
3. Try the alternative methods above 