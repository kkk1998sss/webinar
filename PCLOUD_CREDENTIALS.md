# 🔐 pCloud Credentials Setup Guide

## 🚨 **IMPORTANT: Never Share Personal Credentials!**

**What you shared (DON'T USE THESE):**
- ❌ Email: `shreemahavidyashaktipeeth@gmail.com`
- ❌ Password: `Destiny@333`

**These are your personal login credentials - NOT for API use!**

## ✅ **What You Actually Need (Safe API Credentials):**

### **Step 1: Use Your pCloud Login Credentials (This is Safe!)**
Based on the [pCloud Authentication documentation](https://docs.pcloud.com/methods/intro/authentication.html), pCloud uses native username/password authentication with the `getauth` parameter.

**This is different from OAuth2 - it's pCloud's own secure method!**

### **Step 2: Add to Your Environment File**
Create a file called `.env.local` in your project root:

```env
# pCloud API Configuration
# Based on: https://docs.pcloud.com/methods/intro/authentication.html
PCLOUD_USERNAME=shreemahavidyashaktipeeth@gmail.com
PCLOUD_PASSWORD=Destiny@333
```

### **Step 3: Restart Your Development Server**
```bash
npm run dev
```

## 🔍 **Why This Approach is Safe:**

- **Native pCloud authentication** - Uses pCloud's own secure method
- **Documented approach** - Based on [official pCloud documentation](https://docs.pcloud.com/methods/intro/authentication.html)
- **No third-party OAuth** - Direct integration with pCloud API
- **Standard practice** - This is how pCloud designed their API to work
- **Secure communication** - All requests go through pCloud's secure API endpoints

## 🎯 **How It Works:**

According to the [pCloud documentation](https://docs.pcloud.com/methods/intro/authentication.html):

1. **Authentication**: Uses `userinfo?getauth=1&logout=1&username=X&password=Y`
2. **Token Generation**: Returns an `auth` token for API calls
3. **File Listing**: Uses `listfolder?auth=TOKEN&folderid=0`
4. **File Access**: Generates public and streaming URLs using the auth token

## 🚫 **What NOT to Do:**

- ❌ Don't commit `.env.local` to git
- ❌ Don't share credentials in public code
- ❌ Don't use these credentials for other purposes
- ❌ Don't expose the `.env.local` file

## 🎯 **Current Status:**

- ✅ **Dummy data removed** - No more sample courses
- ✅ **Real pCloud integration** - Fetches actual files from your account
- ✅ **Native authentication** - Uses pCloud's documented method
- ✅ **Proper error handling** - Shows real pCloud errors if any

## 📞 **Need Help?**

The implementation now follows the [official pCloud authentication documentation](https://docs.pcloud.com/methods/intro/authentication.html) exactly. Once you add your credentials to `.env.local`, the RecordedCourses section will automatically fetch your real pCloud files!

## 🔗 **References:**

- **Official Documentation**: [pCloud Authentication](https://docs.pcloud.com/methods/intro/authentication.html)
- **API Methods**: Uses `userinfo` and `listfolder` as documented
- **Authentication**: Native username/password with `getauth` parameter

This is the correct and documented way to integrate with pCloud! 🎉
