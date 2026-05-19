const User = require("../models/User");
const Profile = require("../models/Profile");
const Property = require("../models/Property");
const Room = require("../models/Room");

// Sample seed data
const seedData = {
  users: [
    {
      auth0Id: "seed|landlord1",
      name: "John Smith",
      email: "landlord@example.com",
      picture: "https://i.pravatar.cc/150?img=12",
      role: "landlord",
    },
    {
      auth0Id: "seed|resident1",
      name: "Sarah Johnson",
      email: "resident@example.com",
      picture: "https://i.pravatar.cc/150?img=45",
      role: "resident",
    },
    {
      auth0Id: "seed|contractor1",
      name: "Mike Wilson",
      email: "contractor@example.com",
      picture: "https://i.pravatar.cc/150?img=33",
      role: "contractor",
    },
  ],

  profiles: [
    {
      auth0Id: "seed|landlord1",
      firstName: "John",
      lastName: "Smith",
      email: "landlord@example.com",
      contactNumber: "+1-416-555-0101",
      address: "123 Maple Street",
      city: "Toronto",
      state: "ON",
    },
    {
      auth0Id: "seed|resident1",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "resident@example.com",
      contactNumber: "+1-416-555-0102",
      address: "456 Oak Avenue",
      city: "Toronto",
      state: "ON",
    },
    {
      auth0Id: "seed|contractor1",
      firstName: "Mike",
      lastName: "Wilson",
      email: "contractor@example.com",
      contactNumber: "+1-416-555-0103",
      address: "789 Pine Road",
      city: "Toronto",
      state: "ON",
      jobType: "Plumbing",
      averageRating: 8.5,
      totalRatings: 24,
    },
  ],

  properties: [
    {
      landlordId: "seed|landlord1",
      name: "Sunset Apartments",
      address: "100 Queen Street West",
      city: "Toronto",
      state: "ON",
      postalCode: "M5H 2N2",
      type: "Apartment",
      photos: [
        {
          url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
          publicId: "sample1",
        },
      ],
    },
    {
      landlordId: "seed|landlord1",
      name: "Downtown Condo Tower",
      address: "200 King Street East",
      city: "Toronto",
      state: "ON",
      postalCode: "M5A 1J1",
      type: "Condo",
      photos: [
        {
          url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
          publicId: "sample2",
        },
      ],
    },
  ],

  rooms: [
    {
      propertyId: null, // Will be set after property creation
      roomNumber: "101",
      rent: 1500,
      status: "occupied",
      residentId: "seed|resident1",
      leaseStart: new Date("2024-01-01"),
      leaseEnd: new Date("2024-12-31"),
      rentStatus: "paid",
    },
    {
      propertyId: null, // Will be set after property creation
      roomNumber: "102",
      rent: 1600,
      status: "vacant",
    },
    {
      propertyId: null, // Will be set after property creation
      roomNumber: "103",
      rent: 1550,
      status: "vacant",
    },
  ],
};

/**
 * Seeds the database with sample data if it's empty
 */
const seedDatabase = async () => {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      console.log("📊 Database already has data. Skipping seed.");
      return;
    }

    console.log("🌱 Seeding database with sample data...");

    // 1. Create Users
    const users = await User.insertMany(seedData.users);
    console.log(`   ✅ Created ${users.length} users`);

    // 2. Create Profiles
    const profiles = await Profile.insertMany(seedData.profiles);
    console.log(`   ✅ Created ${profiles.length} profiles`);

    // 3. Create Properties
    const properties = await Property.insertMany(seedData.properties);
    console.log(`   ✅ Created ${properties.length} properties`);

    // 4. Create Rooms (link to first property)
    if (properties.length > 0) {
      const roomsWithProperty = seedData.rooms.map((room, index) => ({
        ...room,
        propertyId: properties[index % properties.length]._id,
      }));
      const rooms = await Room.insertMany(roomsWithProperty);
      console.log(`   ✅ Created ${rooms.length} rooms`);
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  }
};

module.exports = seedDatabase;
