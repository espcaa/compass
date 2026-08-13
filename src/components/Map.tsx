import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { createRoot, type Root } from "react-dom/client";
import "maplibre-gl/dist/maplibre-gl.css";

import style from "../assets/misc/style.json";

const VIEW_BOUNDS: [[number, number], [number, number]] = [
  [20.0, 59.5],
  [32.0, 70.5],
];

const VIEW_CENTER: [number, number] = [25.0, 61.8];

const FIT_ZOOM_OFFSET = 0;

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
      transformRequest: (url, resourceType) => {
        console.log("[maplibre req]", resourceType, url);
        return { url };
      },
    });

    map.on("load", () => {
      map.resize();
      map.fitBounds(VIEW_BOUNDS, { padding: 40, duration: 0 });
      map.setCenter(VIEW_CENTER);
      map.setZoom(map.getZoom() + FIT_ZOOM_OFFSET);
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

  return (
    <div style={{ position: "relative", width, height }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div className="map-fade" />
    </div>
  );
};

export default Map;
