# Cloudinary Service Documentation

## Table of Contents
1. [What is Cloudinary?](#what-is-cloudinary)
2. [Why We Use Cloudinary](#why-we-use-cloudinary)
3. [How Cloudinary is Used in Our Project](#how-cloudinary-is-used-in-our-project)
4. [Setup Guide](#setup-guide)
5. [File Organization Structure](#file-organization-structure)
6. [API Usage Examples](#api-usage-examples)
7. [Security Considerations](#security-considerations)
8. [Best Practices](#best-practices)

---

## What is Cloudinary?

**Cloudinary** is a cloud-based media management platform that provides:
- **Image & Video Storage**: Secure cloud storage for media files
- **Image Transformation**: On-the-fly image manipulation (resize, crop, optimize)
- **Content Delivery Network (CDN)**: Fast global delivery of media files
- **File Management**: Upload, organize, and delete files via API
- **Document Storage**: Support for PDFs and other file types

Official Website: [https://cloudinary.com](https://cloudinary.com)

---

## Why We Use Cloudinary

In our **Property Management System**, we use Cloudinary for several critical reasons:

### 1. **Scalable Media Storage**
- No need to store large files (images, PDFs) in our MongoDB database
- Avoids database bloat and keeps queries fast
- Unlimited storage capacity with cloud infrastructure

### 2. **Image Optimization**
- Automatic image compression and format conversion
- Responsive image delivery (right size for each device)
- Faster page loads for users

### 3. **Secure File Management**
- Each file gets a unique URL and public ID
- Easy to delete files when no longer needed
- Access control through API credentials

### 4. **Multiple File Types**
- **Images**: Property photos, profile photos, maintenance request photos
- **PDFs**: Lease agreements, contractor documents

### 5. **CDN Performance**
- Files are delivered from servers close to users
- Faster loading times globally
- Reduced server bandwidth costs

### 6. **Professional Features**
- **Face detection**: Auto-crop profile photos to center on faces
- **Transformations**: Resize and optimize images on upload
- **Folder organization**: Structured file organization (`t6pms/properties`, `t6pms/profiles`)

---

## How Cloudinary is Used in Our Project

### Overview of Usage

| Feature | File Type | Cloudinary Folder | Models Affected |
|---------|-----------|-------------------|-----------------|
| **Profile Photos** | Images (JPG/PNG) | `t6pms/profiles` | Profile |
| **Property Images** | Images (JPG/PNG) | `t6pms/properties` | Property |
| **Maintenance Photos** | Images (JPG/PNG) | `t6pms/maintenance` | Maintenance |
| **Lease Documents** | PDFs | `t6pms/leases` | Assignment |
| **Contractor Documents** | PDFs | `t6pms/contractors` | Profile (future) |

### 1. Profile Photos

**Purpose**: Store user profile pictures for landlords, residents, and contractors.

**Features**:
- Auto-crop to 400x400 pixels
- Face detection to center on user's face
- Replaces old photo when user updates profile

**Models**: `Profile.photo { url, publicId }`

**Controllers**: `profileController.js` → `updateProfile()`

```javascript
// Example: Profile photo upload
const uploaded = await cloudinary.uploader.upload(photoBase64, {
  folder: "t6pms/profiles",
  transformation: [{ 
    width: 400, 
    height: 400, 
    crop: "fill", 
    gravity: "face" 
  }],
});
```

### 2. Property Images

**Purpose**: Store property listing photos uploaded by landlords.

**Features**:
- Full-size image storage
- Automatically optimized for web delivery
- Deleted when property is deleted

**Models**: `Property.image { url, publicId }`

**Controllers**: `propertyController.js` → `createProperty()`, `updateProperty()`, `deleteProperty()`

```javascript
// Example: Property image upload
const uploaded = await cloudinary.uploader.upload(imageBase64, {
  folder: "t6pms/properties",
});
```

### 3. Maintenance Request Photos

**Purpose**: Store photos submitted by residents when reporting maintenance issues.

**Features**:
- Up to 3 photos per request
- Helps contractors understand the issue before visiting
- Deleted when maintenance request is deleted

**Models**: `Maintenance.photos [{ url, publicId }, ...]`

**Controllers**: `maintenanceController.js` → `createRequest()`, `deleteRequest()`

```javascript
// Example: Maintenance photo upload
for (const base64 of photos.slice(0, 3)) {
  const uploaded = await cloudinary.uploader.upload(base64, {
    folder: "t6pms/maintenance",
  });
  uploadedPhotos.push({ 
    url: uploaded.secure_url, 
    publicId: uploaded.public_id 
  });
}
```

### 4. Lease Documents (PDFs)

**Purpose**: Store lease agreements when landlords assign residents to properties.

**Features**:
- PDF file upload
- Unique naming: `lease_propertyId_residentId`
- Forces browser to download (not preview)
- Residents can download their lease anytime

**Models**: `Assignment.leaseDocument { url, publicId, fileName }`

**Controllers**: `assignmentController.js` → `createAssignment()`

```javascript
// Example: Lease document upload
const uploaded = await cloudinary.uploader.upload(leaseDocumentBase64, {
  folder: "t6pms/leases",
  resource_type: "raw",  // For non-image files
  public_id: `lease_${propertyId}_${residentId}`,
  flags: "attachment",  // Forces download
});
```

---

## Setup Guide

### Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a **free account**
3. Free tier includes:
   - 25 GB storage
   - 25 GB bandwidth/month
   - 25,000 transformations/month

### Step 2: Get Your API Credentials

1. Log in to your Cloudinary Dashboard
2. Navigate to **Dashboard** → **Account Details**
3. Copy the following credentials:
   - **Cloud Name**: Your unique Cloudinary identifier (e.g., `dfysjxuma`)
   - **API Key**: Public key for API access (e.g., `263195463588666`)
   - **API Secret**: Private key (keep this secret!)

### Step 3: Configure Environment Variables

1. Open `backend/.env` file
2. Add your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important**: Never commit `.env` file to GitHub! It's already in `.gitignore`.

### Step 4: Install Dependencies

The Cloudinary SDK is already in `package.json`:

```json
{
  "dependencies": {
    "cloudinary": "^2.2.0"
  }
}
```

If you need to install it manually:

```bash
cd backend
npm install cloudinary
```

### Step 5: Verify Configuration

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check for initialization message in console:
   ```
   ✅ MongoDB connected
   🚀 Server on http://localhost:3000
   ```

3. The Cloudinary configuration happens in `server.js`:

```javascript
// server.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### Step 6: Test Upload

Test by uploading a profile photo or property image through the frontend. Check your Cloudinary dashboard to see the uploaded file.

---

## File Organization Structure

Our Cloudinary files are organized in a folder structure:

```
t6pms/                         (Root folder for "Term 6 Property Management System")
├── profiles/                  (User profile photos)
│   ├── profile_photo_1.jpg
│   ├── profile_photo_2.jpg
│   └── ...
├── properties/                (Property listing images)
│   ├── property_image_1.jpg
│   ├── property_image_2.jpg
│   └── ...
├── maintenance/               (Maintenance request photos)
│   ├── maintenance_photo_1.jpg
│   ├── maintenance_photo_2.jpg
│   └── ...
├── leases/                    (Lease agreement PDFs)
│   ├── lease_propertyId_residentId.pdf
│   └── ...
└── contractors/               (Contractor documents - future)
    └── ...
```

**Benefits**:
- Easy to find files by category
- Separate development/production environments if needed
- Clear organization for team collaboration

---

## API Usage Examples

### Uploading Images (Profile, Property, Maintenance)

```javascript
const cloudinary = require("cloudinary").v2;

// Upload with automatic optimization
const result = await cloudinary.uploader.upload(base64Image, {
  folder: "t6pms/properties",
  resource_type: "image",
});

// Save to database
const imageData = {
  url: result.secure_url,      // https://res.cloudinary.com/...
  publicId: result.public_id,  // t6pms/properties/abc123
};
```

### Uploading PDFs (Lease Documents)

```javascript
const result = await cloudinary.uploader.upload(base64PDF, {
  folder: "t6pms/leases",
  resource_type: "raw",          // For non-image files
  public_id: "lease_abc_xyz",    // Custom filename
  flags: "attachment",           // Force download instead of preview
});

const pdfData = {
  url: result.secure_url,
  publicId: result.public_id,
  fileName: "lease_agreement.pdf",
};
```

### Deleting Files

```javascript
// Delete an image
await cloudinary.uploader.destroy(publicId, { 
  resource_type: "image" 
});

// Delete a PDF
await cloudinary.uploader.destroy(publicId, { 
  resource_type: "raw" 
});
```

### Image Transformations (Profile Photos)

```javascript
// Auto-crop to face and resize to 400x400
const result = await cloudinary.uploader.upload(base64Image, {
  folder: "t6pms/profiles",
  transformation: [{
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "face",  // Centers on detected face
  }],
});
```

---

## Security Considerations

### 1. **Never Expose API Secret**

❌ **DON'T**: Commit `.env` file to GitHub  
✅ **DO**: Keep credentials in environment variables

Our `.gitignore` already excludes `.env`:

```gitignore
# dotenv environment variable files
.env
.env.*
!.env.example
```

### 2. **Backend-Only Uploads**

🔒 **All uploads happen on the backend**, not in the browser:
- Frontend sends base64-encoded images to backend API
- Backend validates and uploads to Cloudinary
- Frontend receives the final URL

This prevents:
- Exposing API credentials to users
- Unauthorized uploads
- Malicious file uploads

### 3. **Delete Old Files**

Always delete old files when updating or deleting records:

```javascript
// Before updating profile photo
if (profile.photo?.publicId) {
  await cloudinary.uploader.destroy(profile.photo.publicId);
}
```

### 4. **File Size Limits**

Our backend limits base64 uploads to **10MB**:

```javascript
// server.js
app.use(express.json({ limit: "10mb" }));
```

### 5. **Public IDs for Deletion**

Always store `publicId` in database to enable file deletion:

```javascript
// Example: Property model
image: {
  url: { type: String, default: "" },
  publicId: { type: String, default: "" },  // ✅ Required for deletion
}
```

---

## Best Practices

### 1. **Use Folder Structure**

Organize files by feature:
```javascript
folder: "t6pms/profiles"      // Profile photos
folder: "t6pms/properties"    // Property images
folder: "t6pms/maintenance"   // Maintenance photos
```

### 2. **Optimize Images on Upload**

Apply transformations during upload:
```javascript
transformation: [{ 
  width: 400, 
  height: 400, 
  crop: "fill" 
}]
```

### 3. **Use Secure URLs**

Always use `secure_url` (HTTPS) instead of `url` (HTTP):
```javascript
url: result.secure_url  // ✅ HTTPS
```

### 4. **Clean Up Orphaned Files**

Delete Cloudinary files when database records are deleted:
```javascript
// Before deleting property
if (property.image?.publicId) {
  await cloudinary.uploader.destroy(property.image.publicId);
}
await Property.findByIdAndDelete(propertyId);
```

### 5. **Handle Errors Gracefully**

```javascript
try {
  const result = await cloudinary.uploader.upload(base64);
  // Success
} catch (error) {
  console.error("Cloudinary upload failed:", error);
  return res.status(500).json({ 
    error: "Failed to upload image" 
  });
}
```

### 6. **Use Base64 Encoding**

Our frontend sends images as base64 strings:
```javascript
// Frontend example
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const reader = new FileReader();
reader.onloadend = () => {
  const base64 = reader.result;  // data:image/png;base64,iVBOR...
  // Send to backend API
};
reader.readAsDataURL(file);
```

---

## Summary

### What We Store in Cloudinary

| Type | Count | Purpose |
|------|-------|---------|
| **Profile Photos** | ~1 per user | User avatars |
| **Property Images** | ~1 per property | Property listings |
| **Maintenance Photos** | ~0-3 per request | Issue documentation |
| **Lease Documents** | ~1 per assignment | Legal agreements |

### Key Endpoints Using Cloudinary

| Endpoint | Method | Cloudinary Action |
|----------|--------|-------------------|
| `PUT /api/profile` | Update profile | Upload/delete profile photo |
| `POST /api/properties` | Create property | Upload property image |
| `PUT /api/properties/:id` | Update property | Upload/delete property image |
| `DELETE /api/properties/:id` | Delete property | Delete property image |
| `POST /api/maintenance` | Create request | Upload maintenance photos |
| `DELETE /api/maintenance/:id` | Delete request | Delete maintenance photos |
| `POST /api/assignments/:propertyId` | Assign resident | Upload lease document |

### Benefits We Get

✅ **Scalability**: No file size limits on our server  
✅ **Performance**: Fast CDN delivery worldwide  
✅ **Optimization**: Automatic image compression  
✅ **Security**: Files stored securely in the cloud  
✅ **Flexibility**: Easy to add more file types  
✅ **Cost-effective**: Free tier covers development needs

---

## Troubleshooting

### Issue: "Cannot upload to Cloudinary"

**Solution**: Check your `.env` file has correct credentials:
```bash
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET
```

### Issue: "File too large"

**Solution**: Increase backend JSON limit in `server.js`:
```javascript
app.use(express.json({ limit: "20mb" }));
```

### Issue: "Old images not deleted"

**Solution**: Ensure you're calling `cloudinary.uploader.destroy()` before updating:
```javascript
if (existingPublicId) {
  await cloudinary.uploader.destroy(existingPublicId);
}
```

---

## Additional Resources

- **Cloudinary Documentation**: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Node.js SDK Guide**: [https://cloudinary.com/documentation/node_integration](https://cloudinary.com/documentation/node_integration)
- **Image Transformations**: [https://cloudinary.com/documentation/image_transformations](https://cloudinary.com/documentation/image_transformations)
- **Video Tutorials**: [https://cloudinary.com/documentation/video_tutorials](https://cloudinary.com/documentation/video_tutorials)

---

**Last Updated**: May 19, 2026  
**Project**: Fullstack Property Manager (Khaleda Islam)  
**Cloudinary Version**: 2.2.0
