import type { APIRoute } from "astro";

const TTL = 6.5 * 1000; // 6-7 seconds

let cache: { data: TrainApiResponse; fetchedAt: number } | null = null;
let inflight: Promise<unknown> | null = null;

async function fetchTrains() {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < TTL) {
    return cache.data;
  }

  if (inflight) {
    return inflight;
  }

  inflight = fetch(
    `https://rata.digitraffic.fi/api/v1/train-locations.geojson/latest?bbox=19.0,59.7,31.6,70.1`,
  )
    .then((res) => res.json())
    .then((data: FinlandTrainResponse) => {
      const trains = data.features.map((feature) => ({
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        speed: feature.properties.speed,
        trainNumber: feature.properties.trainNumber,
      }));

      const response: TrainApiResponse = { trains, ok: true };

      cache = { data: response, fetchedAt: Date.now() };
      inflight = null;

      return response;
    })
    .catch((err) => {
      inflight = null;
      if (cache) return cache.data; // serve stale data instead of crashinggg
      throw err;
    });

  return inflight;
}

type FinlandTrainResponse = {
  features: {
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      speed?: number;
      trainNumber?: number;
    };
  }[];
};

export type TrainApiResponse = {
  ok: true;
  error?: string;
  trains: {
    latitude: number;
    longitude: number;
    speed?: number;
    trainNumber?: number;
  }[];
};

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const data = await fetchTrains();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[train fetch error]", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Failed to fetch train data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
