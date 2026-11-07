// Pure matching/scoring logic — no DOM access, so it can be unit-tested in Node.

const RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', tag: 'diet:vegetarian', cuisines: ['vegetarian', 'vegan'] },
  { id: 'vegan', label: 'Vegan', tag: 'diet:vegan', cuisines: ['vegan'] },
  { id: 'gluten_free', label: 'Gluten-free', tag: 'diet:gluten_free', cuisines: [] },
  { id: 'lactose_free', label: 'Dairy / lactose-free', tag: 'diet:lactose_free', cuisines: [] },
  { id: 'halal', label: 'Halal', tag: 'diet:halal', cuisines: [] },
  { id: 'kosher', label: 'Kosher', tag: 'diet:kosher', cuisines: [] },
  { id: 'pescetarian', label: 'Pescetarian', tag: 'diet:pescetarian', cuisines: ['vegetarian', 'vegan'] },
];

// Status of a single restriction for a single place:
//   'yes'     – explicitly caters for it ('yes' or 'only' in OpenStreetMap)
//   'limited' – some options available
//   'no'      – explicitly does not cater for it
//   'unknown' – no information
function restrictionStatus(tags, restriction) {
  const value = (tags[restriction.tag] || '').toLowerCase();
  if (value === 'yes' || value === 'only') return 'yes';
  if (value === 'limited') return 'limited';
  if (value === 'no') return 'no';

  const cuisines = (tags.cuisine || '').toLowerCase().split(/[;,]/).map(c => c.trim());
  if (restriction.cuisines.some(c => cuisines.includes(c))) return 'yes';
  return 'unknown';
}

// Great-circle distance in metres.
function distanceMetres(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Scores every place against the selected restriction ids and splits them into
//   full    – every selected restriction is 'yes'
//   partial – at least one selected restriction is 'yes' or 'limited', but not all 'yes'
// Places with no positive information for any selected restriction are dropped.
function rankPlaces(places, selectedIds, origin) {
  const selected = RESTRICTIONS.filter(r => selectedIds.includes(r.id));
  const full = [];
  const partial = [];

  for (const place of places) {
    const statuses = {};
    let yes = 0;
    let limited = 0;
    for (const r of selected) {
      const s = restrictionStatus(place.tags, r);
      statuses[r.id] = s;
      if (s === 'yes') yes++;
      else if (s === 'limited') limited++;
    }
    if (yes + limited === 0) continue;

    const scored = {
      ...place,
      statuses,
      yes,
      limited,
      // 'limited' counts as half a match when ordering partial results.
      score: yes + limited * 0.5,
      distance: distanceMetres(origin.lat, origin.lon, place.lat, place.lon),
    };
    (yes === selected.length ? full : partial).push(scored);
  }

  full.sort((a, b) => a.distance - b.distance);
  partial.sort((a, b) => b.score - a.score || a.distance - b.distance);
  return { full, partial };
}

if (typeof module !== 'undefined') {
  module.exports = { RESTRICTIONS, restrictionStatus, distanceMetres, rankPlaces };
}
