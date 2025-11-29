# Admin Panel Implementation

This document describes the new admin panel and database-driven configuration system that allows churches to customize the application without code changes.

## Overview

The application now includes a comprehensive admin panel that allows administrators to manage:
- **Events** - Create, edit, and activate VBS events
- **Users** - Manage user accounts and roles
- **Categories** - Create and manage student categories dynamically
- **Settings** - Customize app branding and appearance

## Database Schema Changes

### New Models

1. **AppSettings** - Application-wide settings
   - `siteName` - Customizable site name
   - `primaryColor` - Brand color (hex)
   - `logoUrl` - Optional logo URL

2. **StudentCategory** - Dynamic student categories
   - `name` - Category name
   - `description` - Optional description
   - `color` - Optional color for UI display
   - `order` - Display order
   - `eventId` - Optional event-specific category (null = global)

### Updated Models

- **Event** - Added `startDate` and `endDate` fields
- **Student** - Added `categoryId` for optional category reference (backward compatible with `category` string)

## Migration Steps

1. **Create and run the migration:**
   ```bash
   npx prisma migrate dev --name add_admin_panel
   ```

2. **Initialize default categories:**
   ```bash
   npx tsx prisma/seed.ts
   ```

3. **Set your first admin user:**
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

## Admin Panel Features

### Events Management (`/admin/events`)

- **List all events** with status (active/inactive)
- **Create new events** with year, theme, and dates
- **Edit existing events**
- **Set active event** (only one can be active at a time)
- **View event statistics** (students, attendance, payments, sessions)
- **Delete events** (with confirmation)

### User Management (`/admin/users`)

- **View all users** with their roles and status
- **Change user roles** directly from the table (ADMIN, STAFF, VIEWER)
- **View user verification status**
- **See when users were created**

Note: Users are created automatically when they sign in. To invite a user, ask them to visit the sign-in page.

### Category Management (`/admin/categories`)

- **View global categories** (available for all events)
- **View event-specific categories**
- **Create new categories** with:
  - Name (required)
  - Description (optional)
  - Color (optional, hex format)
  - Display order
  - Event association (optional)
- **Edit existing categories**
- **Delete categories** (with confirmation)

Default categories are created on first seed:
- Youth
- Jovenes
- Teacher/Assistant

### Settings (`/admin/settings`)

- **Site Name** - Customize the application name
- **Primary Color** - Set brand color (hex format)
- **Logo URL** - Add a logo (upload to hosting service first)
- **Live Preview** - See changes before saving

## Dynamic Categories

All pages now use dynamic categories from the database:

- **Dashboard** - Shows stats for each category dynamically
- **Students Page** - Category filter uses database categories
- **Check-In Page** - Category filter uses database categories
- **Attendance Page** - Category filter and stats use database categories
- **Schedule Page** - Group selector uses database categories

## Backward Compatibility

- The `Student.category` field (string) is still used and maintained
- New `Student.categoryId` field is optional for future enhancements
- Existing students continue to work with their string categories
- All forms and filters work with category names (strings)

## Usage Examples

### Adding a Custom Category

1. Go to `/admin/categories`
2. Click "Add Category"
3. Enter name: "Preschool"
4. Set order: 0 (to appear first)
5. Choose color: #FF6B6B
6. Leave event blank for global category
7. Click "Create Category"

The category will immediately appear in all dropdowns and filters.

### Creating a New Event

1. Go to `/admin/events`
2. Click "Create Event"
3. Enter year: 2025
4. Enter theme: "Adventure Island"
5. Set start and end dates
6. Check "Set as active event" if this should be the current event
7. Click "Create Event"

### Customizing Branding

1. Go to `/admin/settings`
2. Change "Site Name" to your church name
3. Set "Primary Color" to your brand color
4. Add logo URL (upload to a hosting service first)
5. Click "Save Settings"

Changes take effect immediately.

## Technical Notes

- All admin routes require `ADMIN` role
- Settings are stored in a singleton record (id: "singleton")
- Categories can be global (eventId: null) or event-specific
- Event activation automatically deactivates other events
- Category deletion shows a warning about removing from students

## Future Enhancements

Potential additions:
- Bulk category import/export
- Category templates
- Custom fields for students
- Advanced event settings
- Email template customization
- User invitation system
- Activity logs
