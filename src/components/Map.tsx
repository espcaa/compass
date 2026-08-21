import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { createRoot, type Root } from "react-dom/client";
import "maplibre-gl/dist/maplibre-gl.css";
import { TrainMarker } from "./TrainMarker.tsx";

import style from "../assets/misc/style.json";
import type { TrainApiResponse } from "../pages/api/trains";
const VIEW_BOUNDS: [[number, number], [number, number]] = [
  [23.2, 63.6],
  [29.8, 68.4],
];
const VIEW_CENTER: [number, number] = [25.0, 61.8];

interface MapProps {
  width?: string;
  height?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
}

const Map: React.FC<MapProps> = ({
  width = "100%",
  height = "min(55vh, 560px)",
  latitude = 61.8,
  longitude = 25.0,
  zoom = 4.5,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const rootsRef = useRef<Root[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: style as maplibregl.StyleSpecification,
      center: [longitude, latitude],
      zoom,
      attributionControl: false,
      dragPan: false,
      dragRotate: false,
      scrollZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      keyboard: false,
      boxZoom: false,
    });

    map.on("load", () => {
      map.resize();
      map.fitBounds(VIEW_BOUNDS, { padding: 40, duration: 0 });
      map.setCenter(VIEW_CENTER);
      map.setMinZoom(map.getZoom());
      map.setMaxZoom(map.getZoom());
      map.setMaxPitch(0);
    });
    map.on("error", (e) => console.error("[maplibre error]", e.error));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, zoom]);

  // Poll /api/trains every 6s
  useEffect(() => {
    let cancelled = false;

    const refreshTrains = async () => {
      try {
        const res = await fetch("/api/trains");
        const data = (await res.json()) as TrainApiResponse;
        const map = mapRef.current;
        if (!map || cancelled) return;

        markersRef.current.forEach((m) => m.remove());
        rootsRef.current.forEach((r) => r.unmount());
        markersRef.current = [];
        rootsRef.current = [];

        for (const train of data.trains) {
          // make a custom marker for the train
          const el = document.createElement("div");
          const root = createRoot(el);

          root.render(
            <TrainMarker
              number={train.trainNumber?.toString() ?? ""}
              speed={train.speed?.toString() ?? ""}
              longitude={train.longitude}
              latitude={train.latitude}
            />,
          );

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([train.longitude, train.latitude])
            .addTo(map);

          markersRef.current.push(marker);
          rootsRef.current.push(root);
        }
      } catch (err) {
        console.error("[train fetch error]", err);
      }
    };

    refreshTrains();
    const id = setInterval(refreshTrains, 6000);

    return () => {
      cancelled = true;
      clearInterval(id);
      markersRef.current.forEach((m) => m.remove());
      rootsRef.current.forEach((r) => r.unmount());
    };
  }, []);

  return (
    <div
      style={{ position: "relative", width, height }}
      className="map-container"
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div className="map-fade" />
    </div>
  );
};

export default Map;
