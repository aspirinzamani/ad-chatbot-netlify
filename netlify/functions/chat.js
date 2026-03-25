exports.handler = async function (event) {
  const headers = { "Content-Type": "application/json" };

  // ── GET: proxy a Google Drive file (bypasses browser CORS) ──
  if (event.httpMethod === "GET") {
    const fileId = event.queryStringParameters?.fileId;
    if (!fileId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing fileId" }) };
    }
    try {
      // First attempt direct download
      let url = `https://drive.google.com/uc?export=download&id=${fileId}`;
      let resp = await fetch(url, { redirect: "follow" });
      let text = await resp.text();

      // Google shows an HTML warning page for large files — detect and bypass
      if (
        text.trimStart().startsWith("<!") ||
        text.includes("virus scan warning") ||
        text.includes("download_warning")
      ) {
        // usercontent domain bypasses the warning page
        url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
        resp = await fetch(url, { redirect: "follow" });
        text = await resp.text();
      }

      // If still HTML, file is not publicly accessible
      if (text.trimStart().startsWith("<!")) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: `Could not access file. Make sure it is shared as "Anyone with the link".` }),
        };
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: text,
      };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── POST: proxy Anthropic API call ──
  if (event.httpMethod === "POST") {
    const API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: { message: "API key not configured. Add ANTHROPIC_API_KEY in Netlify environment variables." } }),
      };
    }

    try {
      const body = JSON.parse(event.body);

      let systemPrompt = body.system || "";
      if (systemPrompt.length > 120000) {
        systemPrompt = systemPrompt.slice(0, 120000) + "\n...[context truncated for length]";
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: systemPrompt,
          messages: body.messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ error: { message: data.error?.message || `API error ${response.status}` } }),
        };
      }

      return { statusCode: 200, headers, body: JSON.stringify(data) };

    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: { message: err.message } }) };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
