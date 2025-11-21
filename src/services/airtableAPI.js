// services/airtableAPI.js
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID; // apptYXI5JrJp9MwfE
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;  // your token
const TRACKS_TABLE = "Tracks";

// -----------------------------
// Helper function to fetch from Airtable
// -----------------------------
async function fetchTracks(filterFormula = "") {
  try {
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${TRACKS_TABLE}?pageSize=50`;
    if (filterFormula) {
      url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY}`,
      },
    });

    const json = await res.json();

    if (!json.records) {
      console.error("No records found in Airtable response", json);
      return [];
    }

    return json.records.map((r) => ({
      id: r.id,
      name: r.fields.Title,
      artists: [{ name: r.fields.Artist }],
      audioUrl: r.fields.Audio_url,
      image: [{ url: r.fields.Cover_url }],
      duration: r.fields.Duration,
      section: r.fields.Section,
    }));
  } catch (err) {
    console.error("Airtable fetch error:", err);
    return [];
  }
}

// -----------------------------
// Get songs by section
// -----------------------------
export async function getSongsBySection(sectionName) {
  const formula = `{Section}="${sectionName}"`;
  return await fetchTracks(formula);
}

// -----------------------------
// Get all songs
// -----------------------------
export async function getAllSongs() {
  return await fetchTracks();
}

// -----------------------------
// Get a single song by ID
// -----------------------------
export async function getSongById(id) {
  const formula = `RECORD_ID()="${id}"`;
  const songs = await fetchTracks(formula);
  return songs[0] || null;
}

// -----------------------------
// Replacement for homePageData
// -----------------------------
export async function homePageData() {
  try {
    const sections = ["Featured", "Trending", "Popular"]; // match v1
    const data = {};

    for (const section of sections) {
      const songs = await getSongsBySection(section);
      data[section.toLowerCase()] = { songs }; // lowercase to match old structure
    }

    return data;
  } catch (err) {
    console.error("Error fetching homepage Airtable data:", err);
    return {};
  }
}
