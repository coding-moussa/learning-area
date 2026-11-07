// DOM wiring for the dietary restaurant finder. Matching logic lives in matching.js.

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const STORAGE_KEY = 'diet-finder-restrictions';

const form = document.querySelector('#search-form');
const restrictionList = document.querySelector('#restriction-list');
const placeInput = document.querySelector('#place');
const radiusSelect = document.querySelector('#radius');
const useLocationBtn = document.querySelector('#use-location');
const searchBtn = document.querySelector('#search');
const demoBtn = document.querySelector('#demo');
const statusEl = document.querySelector('#status');
const results = document.querySelector('#results');

let deviceLocation = null; // set when "Use my location" succeeds

// ---------- Restriction checkboxes ----------

function loadSavedRestrictions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRestrictions(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable (private mode etc.) — not essential.
  }
}

const saved = loadSavedRestrictions();
for (const r of RESTRICTIONS) {
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = r.id;
  input.checked = saved.includes(r.id);
  const span = document.createElement('span');
  span.textContent = r.label;
  label.append(input, span);
  restrictionList.append(label);
}

function selectedRestrictions() {
  return [...restrictionList.querySelectorAll('input:checked')].map(i => i.value);
}

// ---------- Status helpers ----------

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function setBusy(busy) {
  searchBtn.disabled = busy;
  demoBtn.disabled = busy;
  useLocationBtn.disabled = busy;
}

// ---------- Location ----------

useLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    setStatus('Your browser does not support geolocation — type a place instead.', true);
    return;
  }
  setStatus('Getting your location…');
  navigator.geolocation.getCurrentPosition(
    pos => {
      deviceLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'your location' };
      placeInput.value = '';
      placeInput.placeholder = 'Using your location';
      setStatus('Location found. Press "Find restaurants".');
    },
    err => setStatus(`Couldn't get your location (${err.message}). Type a place instead.`, true),
    { enableHighAccuracy: false, timeout: 10000 },
  );
});

placeInput.addEventListener('input', () => {
  if (placeInput.value.trim()) deviceLocation = null;
});

async function geocode(query) {
  const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const data = await res.json();
  if (!data.length) throw new Error(`Couldn't find "${query}".`);
  return { lat: Number(data[0].lat), lon: Number(data[0].lon), label: data[0].display_name.split(',')[0] };
}

async function resolveOrigin() {
  const query = placeInput.value.trim();
  if (query) return geocode(query);
  if (deviceLocation) return deviceLocation;
  throw new Error('Choose "Use my location" or type a place first.');
}

// ---------- Restaurant data ----------

async function fetchPlaces(origin, radius) {
  const around = `(around:${radius},${origin.lat},${origin.lon})`;
  const query = `[out:json][timeout:25];
    nwr["amenity"~"^(restaurant|cafe|fast_food)$"]["name"]${around};
    out center tags 500;`;

  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, { method: 'POST', body: new URLSearchParams({ data: query }) });
      if (!res.ok) throw new Error(`Restaurant search failed (${res.status})`);
      const data = await res.json();
      return data.elements
        .map(el => ({
          id: `${el.type}/${el.id}`,
          lat: el.lat ?? el.center?.lat,
          lon: el.lon ?? el.center?.lon,
          tags: el.tags || {},
        }))
        .filter(p => p.lat != null && p.lon != null);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// ---------- Rendering ----------

const STATUS_TEXT = { yes: '✓', limited: '~ limited', no: '✗', unknown: '?' };

function formatDistance(m) {
  return m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
}

function prettify(value) {
  return value.replace(/_/g, ' ').replace(/;/g, ', ');
}

function renderPlace(place, selectedIds) {
  const li = document.createElement('li');
  li.className = 'place';

  const head = document.createElement('div');
  head.className = 'place-head';
  const h3 = document.createElement('h3');
  if (place.id.startsWith('sample-')) {
    h3.textContent = place.tags.name;
  } else {
    const a = document.createElement('a');
    a.href = `https://www.openstreetmap.org/${place.id}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = place.tags.name;
    h3.append(a);
  }
  const dist = document.createElement('span');
  dist.textContent = formatDistance(place.distance);
  head.append(h3, dist);

  const meta = document.createElement('p');
  meta.className = 'meta';
  const bits = [prettify(place.tags.amenity || 'restaurant')];
  if (place.tags.cuisine) bits.push(prettify(place.tags.cuisine));
  const street = [place.tags['addr:housenumber'], place.tags['addr:street']].filter(Boolean).join(' ');
  if (street) bits.push(street);
  meta.textContent = bits.join(' · ');

  const badges = document.createElement('ul');
  badges.className = 'badges';
  for (const r of RESTRICTIONS.filter(x => selectedIds.includes(x.id))) {
    const s = place.statuses[r.id];
    const b = document.createElement('li');
    b.className = `badge ${s}`;
    b.textContent = `${r.label} ${STATUS_TEXT[s]}`;
    b.title = { yes: 'Caters for this', limited: 'Limited options', no: 'Does not cater for this', unknown: 'No information' }[s];
    badges.append(b);
  }

  li.append(head, meta, badges);
  return li;
}

function renderList(listEl, countEl, places, selectedIds, emptyText) {
  listEl.replaceChildren();
  countEl.textContent = `(${places.length})`;
  if (!places.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = emptyText;
    listEl.append(li);
    return;
  }
  for (const p of places) listEl.append(renderPlace(p, selectedIds));
}

function showResults(places, origin, selectedIds) {
  const { full, partial } = rankPlaces(places, selectedIds, origin);
  renderList(document.querySelector('#full-list'), document.querySelector('#full-count'),
    full, selectedIds, 'No places nearby are known to meet all of your restrictions.');
  renderList(document.querySelector('#partial-list'), document.querySelector('#partial-count'),
    partial, selectedIds, 'No places nearby are known to meet any of your restrictions.');
  results.hidden = false;
  setStatus(`Checked ${places.length} places near ${origin.label}.`);
}

// ---------- Actions ----------

function requireRestrictions() {
  const ids = selectedRestrictions();
  if (!ids.length) {
    setStatus('Pick at least one dietary restriction.', true);
    return null;
  }
  saveRestrictions(ids);
  return ids;
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const ids = requireRestrictions();
  if (!ids) return;

  setBusy(true);
  try {
    setStatus('Finding location…');
    const origin = await resolveOrigin();
    setStatus(`Searching restaurants near ${origin.label}…`);
    const places = await fetchPlaces(origin, Number(radiusSelect.value));
    showResults(places, origin, ids);
  } catch (err) {
    setStatus(err.message || 'Something went wrong.', true);
  } finally {
    setBusy(false);
  }
});

demoBtn.addEventListener('click', () => {
  const ids = requireRestrictions();
  if (!ids) return;
  showResults(SAMPLE_PLACES, SAMPLE_ORIGIN, ids);
});
