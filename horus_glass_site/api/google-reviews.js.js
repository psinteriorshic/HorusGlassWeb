/**
 * Serverless function to return real Google reviews to your website.
 * Deploy this on Vercel at /api/google-reviews.js.
 *
 * Required environment variables:
 * - GOOGLE_API_KEY   (enable Places API in Google Cloud)
 * - GOOGLE_PLACE_ID  (your Business Profile Place ID)
 */
export default async function handler(req, res) {
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

    const rawReviews = (data?.result?.reviews) || [];

    // Map to a compact schema for your front-end
    const reviews = rawReviews.map(rv => ({
      author: rv.author_name,
      rating: rv.rating,
      text: rv.text,
      time: rv.relative_time_description,
      profile: rv.author_url,
      photo: rv.profile_photo_url,
      location: "Verified Google Reviewer"
    }));

    // Cache at the edge/CDN to reduce API costs
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Google reviews." });
  }
}