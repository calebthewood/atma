const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const cities = [
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Stockholm", lat: 59.3293, lon: 18.0686 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Honolulu", lat: 21.3069, lon: -157.8583 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Hong Kong", lat: 22.3193, lon: 114.1694 },
]

function getRandomCity() {
  return cities[Math.floor(Math.random() * cities.length)]
}

function getRandomOffset() {
  // Generate a random offset between -0.05 and 0.05 (roughly 5km at the equator)
  return (Math.random() - 0.5) * 0.1
}

async function updatePropertiesWithGeoData() {
  try {
    const properties = await prisma.property.findMany()

    for (const property of properties) {
      const city = getRandomCity()
      const latitude = city.lat + getRandomOffset()
      const longitude = city.lon + getRandomOffset()

      await prisma.property.update({
        where: { id: property.id },
        data: {
          latitude: latitude,
          longitude: longitude,
          city: city.name,
          location: `${["Tropical", "Temperate", "Metropolitan"][Math.floor(Math.random() * 3)]} ${city.name}`,
          closestAirport: `${city.name} International Airport`,
          // Update address to include the city
          address: property.address.replace(
            /^(.*,).*,(.*)$/,
            `$1 ${city.name},$2`
          ),
        },
      })

      console.log(
        `Updated property ${property.id} with location: ${city.name} (${latitude}, ${longitude})`
      )
    }

    console.log("All properties have been updated with geographic data.")
  } catch (error) {
    console.error("Error updating properties:", error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePropertiesWithGeoData()
