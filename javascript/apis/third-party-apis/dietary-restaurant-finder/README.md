# Dietary restaurant finder

Pick one or more dietary restrictions, choose a location, and get a list of nearby
restaurants, cafés and fast-food places:

1. **Meets all your restrictions** – sorted by distance.
2. **Meets some of your restrictions** – sorted by how many restrictions they meet
   ("limited options" counts as half), then by distance.

Places with no positive information for any of your restrictions are left out.

## Running it

No build step and no API key. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

"Use my location" needs the page to be served from `localhost` or HTTPS. You can also
type a town, address or postcode, or press **Try with sample data** to explore offline.

## How it works

| File | Purpose |
| --- | --- |
| `matching.js` | Restriction list, per-place status (`yes` / `limited` / `no` / `unknown`), distance, ranking. No DOM code, so it runs in Node too. |
| `main.js` | Form, geolocation, API calls and rendering. |
| `sample-data.js` | Fictional places for the demo button. |

Data comes from [OpenStreetMap](https://www.openstreetmap.org/copyright):

- **Nominatim** turns a typed place into coordinates.
- **Overpass API** returns `amenity=restaurant|cafe|fast_food` within the chosen radius.
- Each restriction maps to an OSM tag, e.g. `diet:vegan`, `diet:gluten_free`, `diet:halal`.
  Values `yes`/`only` count as a match, `limited` as partial. A `cuisine=vegan` or
  `cuisine=vegetarian` tag also counts as a match for the relevant restrictions.

Coverage of `diet:*` tags varies a lot by area, since the data is community maintained, so
expect fewer results than in a commercial directory. Always confirm with the restaurant.
