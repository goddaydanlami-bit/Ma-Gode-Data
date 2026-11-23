import https from "node:https";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  const apiKey = process.env.PAYBETA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      message: "API key not configured"
    });
  }

  const service = req.query.service;

  const allowed = [
    "mtn_data",
    "airtel_data",
    "glo_data",
    "9mobile_data"
  ];

  if (!allowed.includes(service)) {
    return res.status(400).json({
      message: "Invalid network"
    });
  }

  const body = JSON.stringify({ service });

  const options = {
    hostname: "api.sandbox.paybeta.ng",
    path: "/v2/data-bundle/list",
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "P-API-KEY": apiKey,
      "Content-Length": Buffer.byteLength(body)
    }
  };

  try {
    const result = await new Promise((resolve, reject) => {
      const request = https.request(options, response => {
        let data = "";

        response.on("data", chunk => data += chunk);
        response.on("end", () => {
          resolve({
            status: response.statusCode,
            data
          });
        });
      });

      request.on("error", reject);
      request.write(body);
      request.end();
    });

    res.setHeader("Cache-Control", "no-store");
    res.status(result.status).send(result.data);

  } catch (error) {
    res.status(502).json({
      message: "Paybeta connection failed"
    });
  }
}
