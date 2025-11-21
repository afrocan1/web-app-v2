// services/airtableAPI.js
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY;

// Helper function to fetch from Airtable
async function fetchFromAirtable(table, filterFormula = "") {
  try {
    let url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${table}?pageSize=50`;
    if (filterFormula) {
      url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_KEY}`,
      },
    });

    const json = await res.json();

    return json.records.map((r) => ({
      id: r.id,
      title: r.fields.Title,
      artist: r.fields.Artist,
      audioUrl: r.fields.Audio_url,
      coverUrl: r.fields.Cover_url,
      duration: r.fields.Duration,
      section: r.fields.Section,
    }));
  } catch (err) {
    console.error("Airtable fetch error:", err);
    return [];
  }
}

// Get songs by section
export async function getSongsBySection(sectionName) {
  const formula = `{Section}="${sectionName}"`;
  return await fetchFromAirtable("Songs", formula);
}

// Get all songs
export async function getAllSongs() {
  return await fetchFromAirtable("Songs");
}

// Get a single song by ID
export async function getSongById(id) {
  const formula = `RECORD_ID()="${id}"`;
  const songs = await fetchFromAirtable("Songs", formula);
  return songs[0] || null;
}
