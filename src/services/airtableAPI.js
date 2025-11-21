// services/airtableAPI.js
const AIRTABLE_BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID; // Must have NEXT_PUBLIC_ prefix!
const AIRTABLE_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;

const TRACKS_TABLE = "Tracks";

// Helper function to fetch from Airtable
async function fetchTracks(filterFormula = "") {
  // Fallback to hardcoded values if env vars are missing (for debugging)
  const baseId = AIRTABLE_BASE || "apptYXI5JrJp9MwfE";
  const apiKey = AIRTABLE_KEY || "patehy7F0F8nHj77H.28281492f4dcfc52b9f71b8a271635a586b1652760bd40bcd157bbbf3a478d8d";

  if (!baseId || !apiKey) {
    console.error("❌ Airtable credentials missing!");
    return [];
  }

  try {
    let url = `https://api.airtable.com/v0/${baseId}/${TRACKS_TABLE}?pageSize=50`;
    if (filterFormula) {
      url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    }

    console.log("🔍 Fetching from Airtable:", url);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      console.error("❌ Airtable API error:", res.status, res.statusText);
      return [];
    }

    const json = await res.json();
    
    if (!json.records || json.records.length === 0) {
      console.warn("⚠️ No records found in Airtable response", json);
      return [];
    }

    console.log(`✅ Found ${json.records.length} records for filter: ${filterFormula}`);

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
    console.error("❌ Airtable fetch error:", err);
    return [];
  }
}

// Get songs by section
export async function getSongsBySection(sectionName) {
  const formula = `{Section}="${sectionName}"`;
  return await fetchTracks(formula);
}

// Get all songs
export async function getAllSongs() {
  return await fetchTracks();
}

// Get a single song by ID
export async function getSongById(id) {
  const formula = `RECORD_ID()="${id}"`;
  const songs = await fetchTracks(formula);
  return songs[0] || null;
}

// Replacement for homePageData - matching your Home.jsx structure
export async function homePageData() {
  try {
    console.log("📡 Fetching homepage data from Airtable...");

    // Fetch all sections in parallel
    const [featured, trending, popular, newReleases] = await Promise.all([
      getSongsBySection("Featured"),
      getSongsBySection("Trending"),
      getSongsBySection("Popular"),
      getSongsBySection("New Releases"), // or use "Featured" if this doesn't exist
    ]);

    const data = {
      featured: { songs: featured },
      trending: { songs: trending },
      popular_songs: { songs: popular }, // Match Home.jsx expectation
      sound_surge: { songs: newReleases.length > 0 ? newReleases : featured }, // Fallback to featured
    };

    console.log("✅ Homepage data loaded:", {
      featured: featured.length,
      trending: trending.length,
      popular: popular.length,
      newReleases: newReleases.length,
    });

    return data;
  } catch (err) {
    console.error("❌ Error fetching homepage Airtable data:", err);
    return {
      featured: { songs: [] },
      trending: { songs: [] },
      popular_songs: { songs: [] },
      sound_surge: { songs: [] },
    };
  }
}
