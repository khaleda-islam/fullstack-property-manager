# Database Seeding

This project includes automatic database seeding with sample data for testing and development.

## Automatic Seeding

When you start the backend server, it will automatically check if the database is empty. If no data exists, it will populate the database with sample data.

**Sample data includes:**

### 👥 Users (3)
1. **Landlord** - John Smith
   - Email: landlord@example.com
   - Auth0 ID: seed|landlord1

2. **Resident** - Sarah Johnson
   - Email: resident@example.com
   - Auth0 ID: seed|resident1

3. **Contractor** - Mike Wilson
   - Email: contractor@example.com
   - Auth0 ID: seed|contractor1
   - Job Type: Plumbing
   - Rating: 8.5/10 (24 reviews)

### 🏢 Properties (2)
1. **Sunset Apartments**
   - Address: 100 Queen Street West, Toronto, ON
   - Type: Apartment

2. **Downtown Condo Tower**
   - Address: 200 King Street East, Toronto, ON
   - Type: Condo

### 🚪 Rooms (3)
- Room 101: $1,500/month (Occupied by Sarah Johnson)
- Room 102: $1,600/month (Vacant)
- Room 103: $1,550/month (Vacant)

## Manual Commands

### Seed the database manually
```bash
npm run seed
```

### Clear all data from the database
```bash
npm run db:clear
```
**⚠️ WARNING:** This will delete ALL data!

## How It Works

1. When the server starts, it connects to MongoDB
2. The seed function checks if any users exist
3. If no users are found, it inserts sample data
4. If users exist, it skips seeding

## Customizing Seed Data

Edit `backend/config/seed.js` to customize:
- User accounts and profiles
- Properties and their details
- Rooms and lease information
- Any other sample data

## Notes

- Seed data uses fake Auth0 IDs (prefixed with `seed|`)
- These accounts cannot be used for actual login via Auth0
- To test with real login, use Auth0 signup and complete onboarding
- Seed data is only inserted once (when database is empty)
