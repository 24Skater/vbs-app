# Google Forms Integration Guide

> **Purpose**: Allow parents to self-register students for VBS using Google Forms  
> **Status**: ✅ Implemented  
> **Last Updated**: 2024-12-26

---

## Overview

The Google Forms integration enables self-service student registration. Parents fill out a Google Form, and students are automatically added to your VBS App database.

```
Parent → Google Form → Google Apps Script → VBS App Webhook → Student Created
```

---

## Prerequisites

1. ✅ VBS App running and accessible (locally or publicly)
2. ✅ Google account (personal Gmail works fine)
3. ✅ An active VBS event created in the app
4. ✅ Admin access to VBS App

---

## Setup Instructions

### Step 1: Enable Integration in VBS App

1. Log into VBS App as admin
2. Go to **Admin → Google Forms**
3. Toggle **Enable** to ON
4. A webhook secret will be generated automatically

### Step 2: Create Your Google Form

Create a new Google Form at [forms.google.com](https://forms.google.com) with these fields:

| Field Name | Type | Required |
|------------|------|----------|
| Student Name | Short answer | ✅ Yes |
| Parent/Guardian Name | Short answer | Recommended |
| Parent Email | Short answer | Recommended |
| Parent Phone | Short answer | Recommended |
| Date of Birth | Date | Optional |
| Grade | Short answer or Dropdown | Optional |
| T-Shirt Size | Dropdown (XS, S, M, L, XL) | Optional |
| Category/Group | Dropdown | Optional |
| Emergency Contact Name | Short answer | Recommended |
| Emergency Contact Phone | Short answer | Recommended |
| Allergies | Paragraph | Optional |
| Medical Notes | Paragraph | Optional |

**Tips:**
- Field names are automatically matched by keywords
- "Student Name" is the only required field
- Use dropdowns for size and category for consistency

### Step 3: Add Google Apps Script

1. In your Google Form, click the **⋮ menu** (three dots)
2. Select **Script editor**
3. Delete any existing code
4. Copy the entire script from **Admin → Google Forms** in VBS App
5. Save the script (Ctrl+S or Cmd+S)

### Step 4: Create the Trigger

1. In the Apps Script editor, select **`createTrigger`** from the function dropdown
2. Click **Run** (▶️ button)
3. Grant permissions when prompted:
   - Allow access to Google Forms
   - Allow access to external services

### Step 5: Test the Integration

1. Submit a test response to your Google Form
2. Check VBS App → Students to see if the student appeared
3. Check Apps Script → Executions for any errors

---

## Field Mapping Reference

The Apps Script automatically maps form fields based on keywords in field names:

| If field name contains... | Maps to |
|---------------------------|---------|
| "student" + "name" | `studentName` |
| "parent" + "name" | `parentName` |
| "parent" + "email" | `parentEmail` |
| "parent" + "phone" | `parentPhone` |
| "birth" or "dob" | `dateOfBirth` |
| "grade" | `grade` |
| "size" or "shirt" | `size` |
| "category" or "group" or "class" | `category` |
| "emergency" + "name" | `emergencyContactName` |
| "emergency" + "phone" | `emergencyContactPhone` |
| "emergency" + "relation" | `emergencyContactRelationship` |
| "allerg" | `allergies` |
| "medical" | `medicalNotes` |
| "note" or "comment" | `notes` |

---

## Deployment Options

### Option 1: Local Testing (ngrok)

For testing when VBS App runs on localhost:

```bash
# Install ngrok
winget install ngrok  # Windows
brew install ngrok    # Mac

# Create tunnel
ngrok http 3000
```

Update your Apps Script with the ngrok URL (e.g., `https://abc123.ngrok-free.app/api/webhooks/google-forms`)

### Option 2: Cloudflare Tunnel (Recommended for Production)

No open ports required on your router:

```bash
# Install cloudflared
# Create tunnel to your Proxmox server
cloudflared tunnel create vbs-app
cloudflared tunnel route dns vbs-app vbs.yourchurch.org
```

### Option 3: Port Forwarding

Forward port 443 to your server. See security considerations in the deployment guide.

---

## Troubleshooting

### Form submitted but no student appears

1. **Check Apps Script Executions**
   - Go to Apps Script → Executions
   - Look for errors in red
   
2. **Common errors:**
   - "Connection refused" → Webhook URL not reachable (use ngrok or deploy publicly)
   - "401 Unauthorized" → Webhook secret doesn't match
   - "No active event" → Create and activate an event in VBS App

### "Invalid signature" error

- Regenerate the webhook secret in VBS App
- Update the `WEBHOOK_SECRET` in your Apps Script
- Save and test again

### Students created with wrong category

- Ensure your Google Form category dropdown matches categories in VBS App
- Categories are matched case-insensitively

### Duplicate students

- The webhook checks for existing students by name within the same event
- Duplicates are skipped automatically

---

## Security Features

1. **Webhook Secret** - All requests must include the correct secret
2. **Input Validation** - All fields are validated with Zod schemas
3. **Sanitization** - User inputs are trimmed and length-limited
4. **Rate Limiting** - Handled by VBS App middleware
5. **Duplicate Prevention** - Students are not duplicated

---

## Webhook API Reference

### Endpoint

```
POST /api/webhooks/google-forms
```

### Headers

```
Content-Type: application/json
x-webhook-secret: YOUR_SECRET_HERE
```

### Request Body

```json
{
  "studentName": "John Smith",
  "parentName": "Jane Smith",
  "parentEmail": "jane@example.com",
  "parentPhone": "(555) 123-4567",
  "dateOfBirth": "2015-06-15",
  "grade": "3rd",
  "size": "M",
  "category": "Elementary",
  "emergencyContactName": "Bob Smith",
  "emergencyContactPhone": "(555) 987-6543",
  "emergencyContactRelationship": "Uncle",
  "allergies": "Peanuts",
  "medicalNotes": "Asthma inhaler in backpack",
  "notes": "Prefers morning sessions",
  "timestamp": "2024-06-15T10:30:00Z"
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "studentId": 123,
  "studentName": "John Smith"
}
```

**Duplicate (200):**
```json
{
  "success": true,
  "message": "Student already registered",
  "studentId": 123,
  "duplicate": true
}
```

**Error (4xx/5xx):**
```json
{
  "error": "Error message here"
}
```

---

## Best Practices

1. **Test thoroughly** before sharing the form with parents
2. **Use dropdowns** for size and category to ensure consistency
3. **Make Student Name required** in your Google Form
4. **Monitor the integration** periodically via Apps Script Executions
5. **Keep the webhook secret secure** - regenerate if compromised
6. **Use HTTPS in production** - ngrok or Cloudflare Tunnel handle this automatically

---

## Landing Page Integration

When Google Forms is enabled and a form URL is configured, a "Register Now" button automatically appears on the VBS App landing page, linking parents directly to your registration form.

Configure this in **Admin → Google Forms → Settings → Google Form URL**.

