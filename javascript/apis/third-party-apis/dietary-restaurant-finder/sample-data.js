// Fictional restaurants used by the "Try with sample data" button, so the app can be
// explored without location access or network calls. Tags follow OpenStreetMap conventions.
const SAMPLE_ORIGIN = { lat: 51.5145, lon: -0.1270, label: 'sample neighbourhood' };

const SAMPLE_PLACES = [
  { id: 'sample-1', lat: 51.5150, lon: -0.1262, tags: { name: 'Green Fork Kitchen', amenity: 'restaurant', cuisine: 'vegan', 'diet:gluten_free': 'yes' } },
  { id: 'sample-2', lat: 51.5139, lon: -0.1291, tags: { name: 'Olive & Thyme', amenity: 'restaurant', cuisine: 'mediterranean', 'diet:vegetarian': 'yes', 'diet:vegan': 'limited', 'diet:gluten_free': 'yes', 'diet:halal': 'yes' } },
  { id: 'sample-3', lat: 51.5162, lon: -0.1248, tags: { name: 'Saffron House', amenity: 'restaurant', cuisine: 'indian', 'diet:vegetarian': 'yes', 'diet:vegan': 'yes', 'diet:halal': 'yes', 'diet:gluten_free': 'yes' } },
  { id: 'sample-4', lat: 51.5128, lon: -0.1301, tags: { name: 'Burger Barn', amenity: 'fast_food', cuisine: 'burger', 'diet:vegetarian': 'limited', 'diet:gluten_free': 'limited' } },
  { id: 'sample-5', lat: 51.5171, lon: -0.1285, tags: { name: 'Little Tokyo Noodle Bar', amenity: 'restaurant', cuisine: 'japanese;ramen', 'diet:vegetarian': 'yes', 'diet:pescetarian': 'yes' } },
  { id: 'sample-6', lat: 51.5119, lon: -0.1240, tags: { name: 'Bagel & Co', amenity: 'cafe', cuisine: 'bagel', 'diet:kosher': 'yes', 'diet:vegetarian': 'yes' } },
  { id: 'sample-7', lat: 51.5158, lon: -0.1312, tags: { name: 'The Steak Room', amenity: 'restaurant', cuisine: 'steak_house', 'diet:vegetarian': 'no', 'diet:gluten_free': 'yes' } },
  { id: 'sample-8', lat: 51.5135, lon: -0.1229, tags: { name: 'Bloom Café', amenity: 'cafe', cuisine: 'coffee_shop', 'diet:vegan': 'yes', 'diet:vegetarian': 'yes', 'diet:gluten_free': 'yes', 'diet:lactose_free': 'yes' } },
  { id: 'sample-9', lat: 51.5180, lon: -0.1259, tags: { name: 'Mezze Garden', amenity: 'restaurant', cuisine: 'lebanese', 'diet:halal': 'yes', 'diet:vegetarian': 'yes', 'diet:vegan': 'limited' } },
  { id: 'sample-10', lat: 51.5110, lon: -0.1278, tags: { name: 'Pasta Nonna', amenity: 'restaurant', cuisine: 'italian', 'diet:vegetarian': 'yes', 'diet:gluten_free': 'limited' } },
];
