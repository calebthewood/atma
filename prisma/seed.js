const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { addDays } = require("date-fns");

const imagePaths = [
  "/img/iStock-1929812569.jpg",
  "/img/iStock-1812905796.jpg",
  "/img/iStock-1550112895.jpg",
  "/img/iStock-1507078404.jpg",
  "/img/iStock-1490140364.jpg",
  "/img/iStock-1291807006.jpg",
  "/img/iStock-1250509758.jpg",
  "/img/iStock-1439793956.jpg",
  "/img/empty-hallway-background.jpg",
  "/img/indoor-design-luxury-resort.jpg",
  "/img/people-exercising-practicing-sports-with-use-foam-roller.jpg",
  "/img/recovery-center-outside-lush-stunning-spa-nature-mauritiusisland.jpg",
  "/img/wellness-practices-self-care-world-health-day.jpg",
  "/img/woman-sits-pool-with-palm-trees-background.jpg",
];

const hosts = [
  {
    name: "Ada's Algorithmic Retreats",
    type: "Corporate",
    description: "Experience luxury vacations with a computational twist.",
    email: "ada@algorithmicretreats.com",
    phone: "+1 (555) 123-4567",
    profilePic: "/img/iStock-1929812569.jpg",
  },
  {
    name: "Turing's Tranquil Escapes",
    type: "Independent",
    description: "Decode relaxation in our enigmatic resorts.",
    email: "alan@tranquilescapes.com",
    phone: "+1 (555) 987-6543",
    profilePic: "/img/iStock-1490140364.jpg",
  },
  {
    name: "Grace's Graceful Getaways",
    type: "Corporate",
    description:
      "Compile unforgettable memories in our high-level accommodations.",
    email: "grace@gracefulgetaways.com",
    phone: "+1 (555) 246-8135",
    profilePic: "/img/woman-sits-pool-with-palm-trees-background.jpg",
  },
  {
    name: "Hopper's Haven",
    type: "Corporate",
    description:
      "Debug your stress in our compiler-free coastal retreat, where the only bugs you'll encounter are on the beach.",
    email: "ada@algorithmicretreats.com",
    phone: "+1 (555) 123-4567",
    profilePic: "/img/indoor-design-luxury-resort.jpg",
  },
  {
    name: "Babbage's Blissful Bungalows",
    type: "Independent",
    description:
      "Experience analytical luxury in our difference engine of relaxation, where every stay computes to perfection.",
    email: "alan@tranquilescapes.com",
    phone: "+1 (555) 987-6543",
    profilePic: "",
  },
  {
    name: "Dijkstra's Serene Paths",
    type: "Corporate",
    description:
      "Navigate to tranquility through our optimally relaxing accommodations, where every route leads to bliss.",
    email: "grace@gracefulgetaways.com",
    phone: "+1 (555) 246-8135",
    profilePic: "",
  },
  {
    name: "Jobs' Innovative Retreats",
    type: "Corporate",
    description:
      "Think different about vacations in our sleek, user-friendly oasis. Our genius bar serves cocktails, and relaxation comes standard on all our devices.",
    email: "ada@algorithmicretreats.com",
    phone: "+1 (555) 123-4567",
    profilePic: "",
  },
  {
    name: "Engelbart's Interactive Oasis",
    type: "Independent",
    description:
      "Click into comfort with our revolutionary approach to hospitality, featuring intuitive luxury at your fingertips.",
    email: "alan@tranquilescapes.com",
    phone: "+1 (555) 987-6543",
    profilePic: "",
  },
  {
    name: "Von Neumann's Architectural Marvel",
    type: "Corporate",
    description:
      "Immerse yourself in the architecture of opulence, where luxury is stored in every address of our resort.",
    email: "grace@gracefulgetaways.com",
    phone: "+1 (555) 246-8135",
    profilePic: "",
  },
  {
    name: "Torvalds' Open Source Serenity",
    type: "Corporate",
    description:
      "Contribute to your own relaxation in our collaborative luxury environment, where peace is always the latest stable release.",
    email: "ada@algorithmicretreats.com",
    phone: "+1 (555) 123-4567",
    profilePic: "",
  },
  {
    name: "Berners-Lee's Web of Wellness",
    type: "Independent",
    description:
      "Connect to ultimate relaxation in our worldwide web of spa treatments and gourmet dining experiences.",
    email: "alan@tranquilescapes.com",
    phone: "+1 (555) 987-6543",
    profilePic: "",
  },
  {
    name: "Lovelace's Analytical Spa",
    type: "Corporate",
    description:
      "Compute your way to bliss in our numerically inspired sanctuary. Our algorithms of comfort will leave you feeling positively integrated.",
    email: "grace@gracefulgetaways.com",
    phone: "+1 (555) 246-8135",
    profilePic: "",
  },
  {
    name: "Knuth's Algorithmic Escapes",
    type: "Corporate",
    description:
      "Optimize your vacation with our art of relaxation programming, where every moment is precisely calculated for maximum enjoyment.",
    email: "grace@gracefulgetaways.com",
    phone: "+1 (555) 246-8135",
    profilePic: "",
  },
];

async function main() {
  await dropDB();
  await seedHostsPropsRetreats();
  await seedImages();
  await seedRetreatInstances();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

async function dropDB() {
  await prisma.retreatInstance.deleteMany();
  await prisma.image.deleteMany();
  await prisma.host.deleteMany();
  await prisma.property.deleteMany();
  await prisma.room.deleteMany();
  await prisma.retreat.deleteMany();
  await prisma.priceMod.deleteMany();
}

async function seedRetreatInstances() {
  const retreats = await prisma.retreat.findMany();

  for (const retreat of retreats) {
    const oneOnly = ["open", "flexible_range"].includes(retreat.bookingType);
    const numberOfInstances = oneOnly ? 1 : Math.floor(Math.random() * 6);

    for (let i = 0; i < numberOfInstances; i++) {
      // Calculate random start date between June 2024 and June 2025
      const startDate = new Date(
        Date.UTC(2024, 5, 1) +
          Math.random() * (Date.UTC(2025, 5, 30) - Date.UTC(2024, 5, 1))
      );
      // stored as "1 Day", should move to int: 1
      const durationInDays = parseInt(retreat.duration.split(" ")[0]);
      const endDate = addDays(startDate, durationInDays);
      const minNight = Math.floor(Math.random() * 3) + 1;

      const instance = await prisma.retreatInstance.create({
        data: {
          retreatId: retreat.id,
          startDate: startDate,
          endDate: endDate,
          minNights: minNight,
          maxNights: minNight + minNight,
          availableSlots: retreat.maxGuests,
          isFull: false,
        },
      });

      // Create 3 price mods for each host
      const priceModTypes = ["FIXED_VALUE", "PERCENT", "FIXED_VALUE"];
      const priceModCategories = [
        "Room Type",
        "Extra Amenity",
        "Transportation",
      ];
      for (let k = 0; k < 3; k++) {
        await prisma.priceMod.create({
          data: {
            hostId: instance.hostId,
            retreatInstanceId: instance.id,
            name: `${["Binary", "Quantum", "Neural"][k]} ${["Boost", "Upgrade", "Enhancement"][k]}`,
            description: `${["Elevate", "Amplify", "Maximize"][k]} your stay with our ${priceModCategories[k].toLowerCase()} options.`,
            type: priceModTypes[k],
            category: priceModCategories[k],
            value: k === 1 ? 15 : 100 * (k + 1), // 15% for PERCENT, 100 or 300 for FIXED_VALUE
          },
        });
      }
    }
  }
}

async function seedImages() {
  const hosts = await prisma.host.findMany();

  for (let i = 0; i < hosts.length; i++) {
    const host = hosts[i];

    for (let j = 0; j < 6; j++) {
      await prisma.image.create({
        data: {
          filePath: imagePaths[Math.floor((i + j) % imagePaths.length)],
          hostId: host.id,
        },
      });
    }
  }

  const properties = await prisma.property.findMany();

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];

    for (let j = 0; j < 6; j++) {
      await prisma.image.create({
        data: {
          filePath: imagePaths[Math.floor((i + j + 1) % imagePaths.length)],
          propertyId: property.id,
        },
      });
    }
  }

  const retreats = await prisma.retreat.findMany();

  for (let i = 0; i < retreats.length; i++) {
    const retreat = retreats[i];

    for (let j = 0; j < 6; j++) {
      await prisma.image.create({
        data: {
          filePath: imagePaths[Math.floor((i + j + 2) % imagePaths.length)],
          retreatId: retreat.id,
        },
      });
    }
  }
  console.log("Seed data for images has been created successfully.");
}

async function seedHostsPropsRetreats() {
  const types = ["open", "fixed_range", "flexible_range"];
  const cities = [
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Stockholm", lat: 59.3293, lon: 18.0686 },
    { name: "New York", lat: 40.7128, lon: -74.006 },
    { name: "Honolulu", lat: 21.3069, lon: -157.8583 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
  ];

  function getRandomCity() {
    return cities[Math.floor(Math.random() * cities.length)];
  }

  function getRandomOffset() {
    // Generate a random offset between -0.05 and 0.05 (roughly 5km at the equator)
    return (Math.random() - 0.5) * 0.1;
  }
  const hostData = await prisma.host.createMany({ data: hosts });
  const hostsData = await prisma.host.findMany();

  for (const host of hostsData) {
    for (let i = 1; i <= 3; i++) {
      const city = getRandomCity();
      const latitude = city.lat + getRandomOffset();
      const longitude = city.lon + getRandomOffset();
      const property = await prisma.property.create({
        data: {
          email: `property${i}@${host.name.toLowerCase().replace(/\s/g, "")}.com`,
          phone: `+1 (555) ${100 + i}-${2000 + i}`,
          name: `${host.name.split(" ")[0]}'s ${["Luxury", "Elite", "Premium"][i - 1]} ${["Resort", "Hotel", "Villa"][i - 1]}`,
          description: `A ${["stunning", "breathtaking", "awe-inspiring"][i - 1]} ${["beachfront", "mountain", "urban"][i - 1]} retreat.`,
          address: `${1000 + i} Paradise Lane, Exotica City, EX ${10000 + i}`,
          closestAirport: `${["Sun", "Moon", "Star"][i - 1]} International Airport`,
          location: `${["Tropical Island", "Alpine Peaks", "Cosmopolitan Center"][i - 1]}`,
          type: i === 1 ? "Resort" : "Hotel",
          amenities:
            "Infinity Pool, Spa, Gourmet Restaurants, Private Beach, Fitness Center",
          rating: "0 / 0",
          hostId: host.id,
          latitude: latitude,
          longitude: longitude,
          city: city.name,
        },
      });

      // Create 3 rooms for each property
      for (let j = 1; j <= 3; j++) {
        await prisma.room.create({
          data: {
            type: ["Single", "Double", "Suite"][j - 1],
            roomCount: `${10 * j}`,
            amenities:
              "Air Conditioning, Wi-Fi Access, Flat-Screen TV, Mini Fridge, In-Room Safe",
            bedType: ["Queen Bed", "King Bed", "California King Bed"][j - 1],
            minGuests: 1,
            maxGuests: j * 2,
            propertyId: property.id,
          },
        });
      }

      // Create 3 retreats for each host
      await prisma.retreat.create({
        data: {
          name: `${["Bit", "Byte", "Algorithm"][i - 1]} ${["Bliss", "Serenity", "Luxe"][Math.floor(Math.random() * 3)]} Retreat`,
          description: `Immerse yourself in ${["digital detox", "coding workshops", "tech-free luxury"][i - 1]}.`,
          bookingType: types[Math.floor(Math.random() * 3)],
          duration: `${i * 2} days`,
          date: new Date(2024, i - 1, 15),
          price: `${1500 * i}`,
          minGuests: 1,
          maxGuests: 6,
          hostId: host.id,
          propertyId: property.id,
        },
      });
    }

    // Create 3 price mods for each host
    const priceModTypes = ["FIXED_VALUE", "PERCENT", "FIXED_VALUE"];
    const priceModCategories = ["Room Type", "Extra Amenity", "Transportation"];
    for (let k = 0; k < 3; k++) {
      await prisma.priceMod.create({
        data: {
          hostId: host.id,
          name: `${["Binary", "Quantum", "Neural"][k]} ${["Boost", "Upgrade", "Enhancement"][k]}`,
          description: `${["Elevate", "Amplify", "Maximize"][k]} your stay with our ${priceModCategories[k].toLowerCase()} options.`,
          type: priceModTypes[k],
          category: priceModCategories[k],
          value: k === 1 ? 15 : 100 * (k + 1), // 15% for PERCENT, 100 or 300 for FIXED_VALUE
        },
      });
    }
  }
}
