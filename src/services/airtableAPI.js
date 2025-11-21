// services/airtableAPI.js
const AIRTABLE_BASE = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const AIRTABLE_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;

const TRACKS_TABLE = "Tracks";

async function fetchTracks(filterFormula = "") {
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

    console.log("🔍 Fetching from Airtable:", filterFormula || "all records");

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
      console.warn("⚠️ No records found for filter:", filterFormula);
      return [];
    }

    console.log(`✅ Found ${json.records.length} records for filter: ${filterFormula}`);

    // Transform to match Player component expectations
    return json.records.map((r) => {
      const fields = r.fields;
      
      return {
        id: r.id,
        name: fields.Title || "Unknown Title",
        artists: [{ name: fields.Artist || "Unknown Artist" }],
        primaryArtists: fields.Artist || "Unknown Artist",
        
        // Audio URL structure that Player expects
        downloadUrl: [
          { url: fields.Audio_url },
          { url: fields.Audio_url },
          { url: fields.Audio_url },
          { url: fields.Audio_url },
          { url: fields.Audio_url }, // index 4 that Player uses
        ],
        
        // Image URL structure that Player expects
        image: [
          { url: fields.Cover_url },
          { url: fields.Cover_url },
          { url: fields.Cover_url }, // index 2 for media session
        ],
        
        // Additional fields
        album: { name: fields.Album || "Single" },
        duration: fields.Duration || "0:00",
        section: fields.Section,
        
        // Raw fields for easy access
        audioUrl: fields.Audio_url,
        coverUrl: fields.Cover_url,
      };
    });
  } catch (err) {
    console.error("❌ Airtable fetch error:", err);
    return [];
  }
}

export async function getSongsBySection(sectionName) {
  const formula = `{Section}="${sectionName}"`;
  return await fetchTracks(formula);
}

export async function getAllSongs() {
  return await fetchTracks();
}

export async function getSongById(id) {
  const formula = `RECORD_ID()="${id}"`;
  const songs = await fetchTracks(formula);
  return songs[0] || null;
}

export async function homePageData() {
  try {
    console.log("📡 Fetching homepage data from Airtable...");

    const [featured, trending, popular, newReleases] = await Promise.all([
      getSongsBySection("Featured"),
      getSongsBySection("Trending"),
      getSongsBySection("Popular"),
      getSongsBySection("New Releases"),
    ]);

    const data = {
      featured: { songs: featured },
      trending: { songs: trending },
      popular_songs: { songs: popular },
      sound_surge: { songs: newReleases.length > 0 ? newReleases : featured },
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
