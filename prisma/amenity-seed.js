const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedAmenities() {
  // First define amenities with type "Amenity"
  const amenities = [
    {
      type: "facility",
      category: "swimming-water-facilities",
      categoryName: "Swimming & Water Facilities",
      names: [
        "Indoor swimming pool",
        "Outdoor swimming pool",
        "Children's pool",
        "Hot springs",
        "Water park",
      ],
    },
    {
      type: "facility",
      category: "wellness-spa",
      categoryName: "Wellness & Spa",
      names: ["Spa", "Sauna", "Massage room", "Hot springs"],
    },
    {
      type: "facility",
      category: "fitness-sports-facilities",
      categoryName: "Fitness & Sports Facilities",
      names: [
        "Gym/Fitness Center",
        "Golf course",
        "Horse riding",
        "Tennis court",
        "Table tennis room",
        "Billiards room",
        "Squash court",
        "Surfing",
        "Snorkeling",
        "Diving",
        "Skiing",
        "Hiking trails",
        "Beach volleyball",
      ],
    },
    {
      type: "facility",
      category: "parking-transportation",
      categoryName: "Parking & Transportation",
      names: [
        "Private parking",
        "Public parking",
        "EV charging station",
        "Airport pick-up service",
        "Airport shuttle service",
        "Taxi booking service",
        "Car rentals",
        "Station pick-up/drop-off",
      ],
    },
    {
      type: "facility",
      category: "food-drink",
      categoryName: "Food & Drink",
      names: ["Restaurants", "Bar", "Cafe", "Tea room", "Beach bar"],
    },
    {
      type: "facility",
      category: "family-children-facilities",
      categoryName: "Family & Children Facilities",
      names: ["Kids' club", "Childcare services", "Playground"],
    },
    {
      type: "facility",
      category: "business-conference-services",
      categoryName: "Business & Conference Services",
      names: [
        "Conference room",
        "Multi-function room",
        "Business center",
        "Secretarial services",
        "Currency exchange",
      ],
    },
    {
      type: "facility",
      category: "front-desk-services",
      categoryName: "Front Desk Services",
      names: [
        "24-hour front desk",
        "Luggage storage",
        "Wake-up call",
        "Tour and ticket booking",
        "Currency exchange",
      ],
    },
    {
      type: "facility",
      category: "wifi-internet",
      categoryName: "Wi-Fi & Internet",
      names: ["Wi-Fi in public areas"],
    },
    {
      type: "facility",
      category: "public-areas-leisure",
      categoryName: "Public Areas & Leisure",
      names: ["Library", "Sunbathing area", "Nightclub"],
    },
    {
      type: "facility",
      category: "cleaning-services",
      categoryName: "Cleaning Services",
      names: ["Laundry room", "Housekeeping"],
    },
    {
      type: "facility",
      category: "safety-security",
      categoryName: "Safety & Security",
      names: ["Safety deposit box", "24-hour security"],
    },
    {
      type: "activity",
      category: "mind-body-practices",
      categoryName: "Mind-Body Practices",
      names: [
        "Yoga",
        "Yogilates",
        "Aqua Yoga",
        "Flying Yoga",
        "Pilates",
        "Reformer Pilates",
        "Aqua Pilates",
        "Tai Chi",
        "Qi Gong",
        "Meditation",
        "Breathwork",
        "Sound healing",
        "Reflexology",
        "Psychophysical rebalancing activities",
      ],
    },
    {
      type: "activity",
      category: "fitness-physical-activities",
      categoryName: "Fitness & Physical Activities",
      names: [
        "Fitness classes",
        "Aerobics",
        "Bootcamp",
        "Group-exercise",
        "TRX",
        "Stretching",
        "Aqua aerobics",
        "Aqua fitness",
        "Aqua sculpt",
        "HIIT dance",
        "Circuit training",
        "Bootcamp",
        "Running",
        "Jogging",
      ],
    },
    {
      type: "activity",
      category: "outdoor-adventure-activities",
      categoryName: "Outdoor & Adventure Activities",
      names: [
        "Hiking",
        "Trekking",
        "Mountain biking",
        "Cycling",
        "Horse riding",
        "Climbing",
        "Skiing",
        "Snowboarding",
        "Cross-country skiing",
        "Snowshoeing",
        "Rowing",
        "Archery",
        "Kayaking",
        "Canoeing",
        "Fishing",
        "Angling",
        "Stand-up paddleboarding",
        "Surfing",
        "Rafting",
        "Water skiing",
        "Wakeboarding",
        "Windsurfing",
        "Sailing",
        "Boat tours",
        "Cruises",
        "Beach activities",
        "Beach nature walks",
      ],
    },
    {
      type: "activity",
      category: "water-sports-aquatic-activities",
      categoryName: "Water Sports & Aquatic Activities",
      names: ["Swimming", "Snorkelling", "Diving", "Watersports", "Water polo"],
    },
    {
      type: "activity",
      category: "recreational-sports",
      categoryName: "Recreational Sports",
      names: [
        "Tennis",
        "Paddle Tennis",
        "Golf",
        "Volleyball",
        "Badminton",
        "Table tennis",
      ],
    },
    {
      type: "activity",
      category: "wellness-relaxation",
      categoryName: "Wellness & Relaxation",
      names: [
        "Spa treatments",
        "Traditional Japanese treatments",
        "Onsen",
        "Sauna",
        "Tai Chi",
        "Muay Thai",
        "Thai boxing",
        "Creative workshops",
        "Art workshops",
        "TIA tea workshops",
      ],
    },
    {
      type: "activity",
      category: "cultural-creative-activities",
      categoryName: "Cultural & Creative Activities",
      names: [
        "Cooking classes",
        "Cooking workshops",
        "Herbology workshops",
        "Tea ceremonies",
        "Tea celebrations",
        "Wine safaris",
        "Private wine tours",
        "Art classes",
        "Local excursions",
        "Guided tours",
        "Private guided day trips",
        "Classical music performances",
      ],
    },
    {
      type: "activity",
      category: "lectures-presentations",
      categoryName: "Lectures & presentations",
      names: ["Medical lectures", "Cultural lectures", "Wellness lectures"],
    },
    {
      type: "activity",
      category: "unique-seasonal-activities",
      categoryName: "Unique & Seasonal Activities",
      names: [
        "Guided nature walks",
        "Sunrise walks",
        "Rice paddy walks",
        "Nature trails",
        "Water aerobics",
        "Bio-gymnastics",
        "Skydiving",
        "Balloon flight",
        "Dolphin quest",
        "Traditional Dhoni sailing",
      ],
    },
  ];

  try {
    await prisma.amenity.deleteMany();

    for (const category of amenities) {
      for (const name of category.names) {
        await prisma.amenity.create({
          data: {
            type: category.type,
            category: category.category,
            categoryName: category.categoryName,
            name: name,
          },
        });
      }
    }

    console.log("Amenities seeded successfully");
  } catch (error) {
    console.error("Error seeding amenities:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seeding
seedAmenities().catch((error) => {
  console.error(error);
  process.exit(1);
});
