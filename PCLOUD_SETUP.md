# pCloud Integration Setup Guide

## 🎯 Complete Setup for Recorded Courses

### Step 1: Official pCloud SDK Implementation (Recommended)

Based on the [pCloud JavaScript SDK](https://github.com/pCloud/pcloud-sdk-js), we've implemented the official integration:

1. **Install SDK** (already done):
   ```bash
   npm install pcloud-sdk-js
   ```

2. **Get API Credentials**:
   - Visit: https://docs.pcloud.com/
   - Create a new app
   - Get your `Client ID` and `Client Secret`

3. **Add Environment Variables**:
   ```env
   PCLOUD_CLIENT_ID=your_client_id_here
   PCLOUD_CLIENT_SECRET=your_client_secret_here
   ```

4. **How It Works**:
   - Uses official `pcloud-sdk-js` package
   - Implements OAuth2 authentication flow
   - Creates pCloud client: `pcloudSdk.createClient(accessToken)`
   - Lists files: `client.listfolder(0)`
   - Filters for video/audio content
   - Generates public and streaming URLs

### Step 2: Alternative - Public File Links (Simpler)

If you prefer not to use the API, you can use public file links:

1. **Upload Files to pCloud**
   - Sign in to your pCloud account
   - Create a folder named `RecordedCourses`
   - Upload your video/audio files to this folder

2. **Make Files Public**
   - Right-click on each file → "Share"
   - Click "Get link"
   - Copy the public link (it will look like: `https://pcloud.link/...`)

3. **Update the API Route**
   - Open `src/app/api/pcloud/route.ts`
   - Replace the `publicUrl` and `streamUrl` values with your actual pCloud public links

### Step 3: Test the Integration

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the RecordedCourses section** to see your files

## 🎵 Supported File Types

### Video Files ✅
- MP4, AVI, MOV, MKV, FLV, WebM
- Any video format supported by pCloud

### Audio Files ✅
- MP3, WAV, M4A
- Any audio format supported by pCloud

## 🔧 Current Implementation

The current setup provides:

### **Official SDK Integration:**
- **pCloud SDK**: Uses `pcloud-sdk-js` package
- **OAuth2 Authentication**: Proper token-based authentication
- **File Listing**: `client.listfolder(0)` method
- **Real-time Data**: Fetches actual files from your pCloud account
- **Automatic Filtering**: Shows only video/audio files
- **URL Generation**: Creates public and streaming links

### **Fallback System:**
- **Sample Data**: If SDK fails, shows sample courses
- **Error Handling**: Graceful degradation
- **User Feedback**: Clear messages about what's happening

## 🚨 Why This Approach?

The official pCloud SDK approach is:
- **More reliable** - Uses official, maintained package
- **Feature-rich** - Access to full pCloud API
- **Well-documented** - Based on [official repository](https://github.com/pCloud/pcloud-sdk-js)
- **Future-proof** - Updates and improvements from pCloud team

## 🎬 Features

- **Horizontal scrolling** - Left to right navigation
- **Real pCloud data** - Fetches actual files from your account
- **File information** - Size, creation date, content type
- **Smart categorization** - Video vs Audio courses
- **Interactive buttons** - Preview and Start Learning
- **Responsive design** - Works on all devices

## 📝 Next Steps

1. **Add your pCloud credentials** to `.env.local`
2. **Upload course files** to pCloud
3. **Test the integration** with real files
4. **Customize the folder path** if needed (currently uses root folder)

## 🔗 References

- **Official SDK**: [pCloud JavaScript SDK](https://github.com/pCloud/pcloud-sdk-js)
- **API Documentation**: [pCloud API Docs](https://docs.pcloud.com/)
- **SDK Features**: Universal/Isomorphic, Promise-based, OAuth support

This implementation gives you the best of both worlds: official pCloud SDK integration with fallback to sample data! 🎉
