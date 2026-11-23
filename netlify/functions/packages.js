export default async (request) => {
  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ message: "Method not allowed" }),
      { status: 405 }
    );
  }

  const apiKey = process.env.PAYBETA_API_KEY;
  const baseUrl =
    process.env.PAYBETA_BASE_URL ||
    "https://api.sandbox.paybeta.ng";

  if (!apiKey) {
    return new Response(
      JSON.stringify({ message: "API configuration missing" }),
      { status: 500 }
    );
  }

  const service = new URL(request.url).searchParams.get("service");

  const allowedServices = [
    "mtn_data",
    "airtel_data",
    "glo_data",
    "9mobile_data"
  ];

  if (!allowedServices.includes(service)) {
    return new Response(
      JSON.stringify({ message: "Invalid network service" }),
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${baseUrl}/v2/data-bundle/list`,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "P-API-KEY": apiKey
        },
        body: JSON.stringify({ service })
      }
    );

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: response.ok ? 200 : response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Unable to retrieve packages" }),
      { status: 502 }
    );
  }
};
