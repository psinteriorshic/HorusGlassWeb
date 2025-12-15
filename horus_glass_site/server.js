/**
 * Alternative: Self-hosted Node/Express server to proxy Google reviews
 * Run: npm i express node-fetch
 *      GOOGLE_API_KEY=... GOOGLE_PLACE_ID=... node server.js
 */
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/google-reviews", async (req, res) => {
  try {
    const { GOOGLE_API_KEY, GOOGLE_PLACE_ID } = process.env;
    if (!GOOGLE_API_KEY || !GOOGLE_PLACE_ID) {
      res.status(500).json({ error: "Missing GOOGLE_API_KEY or GOOGLE_PLACE_ID." });
      return;
    }
    const params = new URLSearchParams({
      place_id: GOOGLE_PLACE_ID,
      fields: "rating,reviews",
      reviews_sort: "newest",
      key: GOOGLE_API_KEY
    });
    const url = "https://maps.googleapis.com/maps/api/place/details/json?" + params.toString();
    const r = await fetch(url);
    const data = await r.json();
    const reviews = (data?.result?.reviews || []).map(rv => ({
      author: rv.author_name,
      rating: rv.rating,
      text: rv.text,
      time: rv.relative_time_description,
      profile: rv.author_url,
      photo: rv.profile_photo_url,
      location: "Verified Google Reviewer"
    }));
    res.setHeader("Cache-Control", "public, max-age=900");
    res.json(reviews);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch Google reviews." });
  }
});

app.use(express.static("./"));

app.listen(PORT, () => console.log("Server on http://localhost:" + PORT));