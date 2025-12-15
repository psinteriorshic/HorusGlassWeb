// horus_glass_site/api/submit-project.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { RESEND_API_KEY, TO_EMAIL } = process.env;
    if (!RESEND_API_KEY || !TO_EMAIL) {
      return res.status(500).json({ error: "Missing RESEND_API_KEY or TO_EMAIL" });
    }

    const body = await readJson(req);
    const {
      type = "popup",
      name = "", email = "", phone = "", message = "",
      // optional designer fields:
      hardwareColor, glassThickness, doorType, glassHeight, totalWidth,
      panelCount, panels, layoutType, priceAmount, glassAreaSqft, hardwareCostLabel,
      // optional attachments: [{ filename, contentType, content(base64) }]
      attachments = []
    } = body || {};

    if (!email) return res.status(400).json({ error: "Customer email is required" });

    const subject =
      type === "designer" ? "Horus Glass — Designer submission" : "Horus Glass — Popup inquiry";

    const html = `
      <h2>${subject}</h2>
      <p><b>Name:</b> ${esc(name)}</p>
      <p><b>Email:</b> ${esc(email)}</p>
      <p><b>Phone:</b> ${esc(phone)}</p>
      <p><b>Message:</b> ${esc(message)}</p>
      ${type === "designer" ? `
        <hr/>
        <h3>Configurator Summary</h3>
        <ul>
          <li><b>Hardware:</b> ${esc(hardwareColor)}</li>
          <li><b>Glass Thickness:</b> ${esc(glassThickness)}</li>
          <li><b>Door Type:</b> ${esc(doorType)}</li>
          <li><b>Layout:</b> ${esc(layoutType)}</li>
          <li><b>Height (in):</b> ${esc(glassHeight)}</li>
          <li><b>Total Width (in):</b> ${esc(totalWidth)}</li>
          <li><b>Panels (in):</b> ${Array.isArray(panels) ? panels.join(", ") : ""}</li>
        </ul>
        <p><b>Glass Area:</b> ${esc(glassAreaSqft)} sq ft</p>
        <p><b>Hardware & Extras:</b> ${esc(hardwareCostLabel)}</p>
        <p><b>Estimated Price:</b> ${esc(priceAmount)}</p>
      ` : "" }
    `;

    // Attachments for Resend
    const resendAttachments = (Array.isArray(attachments) ? attachments : [])
      .slice(0, 5)
      .map(a => ({
        filename: String(a?.filename || "file"),
        content: String(a?.content || ""),          // base64 content
        contentType: String(a?.contentType || "application/octet-stream")
      }));

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Horus Glass <onboarding@resend.dev>", // switch to noreply@YOURDOMAIN after you verify a domain
        to: [TO_EMAIL],
        subject,
        html,
        attachments: resendAttachments
      })
    });

    if (!r.ok) {
      const details = await r.text();
      console.error("Resend error:", details);
      return res.status(502).json({ error: "Email service failed", details });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}

function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
async function readJson(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); }
  catch { return {}; }
}
