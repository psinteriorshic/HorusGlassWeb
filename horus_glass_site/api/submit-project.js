
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = await req.body;

    res.status(200).json({
      message: "Project received successfully",
      received: form,
    });
  } catch (error) {
    console.error("Error in API:", error);
    res.status(500).json({ error: "Server error" });
  }
}
