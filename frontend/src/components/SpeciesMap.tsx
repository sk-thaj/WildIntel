// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { sightings, type ConservationStatus } from "@/data/mockData";

function getMarkerColor(status: ConservationStatus) {
  switch (status) {
    case "Critically Endangered": return "#e11d48";
    case "Endangered": return "#ea580c";
    case "Vulnerable": return "#eab308";
    case "Near Threatened": return "#16a34a";
    default: return "#888";
  }
}

function createIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function SpeciesMap({ center, className, species = [] }: { center?: [number, number]; className?: string; species?: any[] }) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(
      center || [25, 75],
      center ? 5 : 4
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    mapRef.current = map;
    layerGroupRef.current = L.featureGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!layerGroupRef.current || species.length === 0) return;

    layerGroupRef.current.clearLayers();

    // Limit to 500 markers to ensure browser remains responsive (sampling)
    const renderLimit = species.length > 500 ? species.slice(0, 500) : species;

    renderLimit.forEach((sp) => {
      if (sp.lat && sp.lng) {
        const color = getMarkerColor(sp.status);
        L.marker([sp.lat, sp.lng], { icon: createIcon(color) })
          .addTo(layerGroupRef.current!)
          .bindPopup(`
            <div style="font-size:14px;min-width:180px">
              <p style="font-weight:bold;font-size:16px;margin:0 0 4px">${sp.name}</p>
              <p style="color:${color};font-weight:600;font-size:12px;margin:0 0 4px">${sp.status}</p>
              <p style="font-size:12px;margin:0 0 4px">${sp.habitat || "Various native habitats"}</p>
              <p style="font-size:12px;margin:0 0 4px">Population: ${sp.population || "Unknown"}</p>
              <p style="font-size:12px;font-weight:500;margin:4px 0 0">💡 ${sp.conservationActions?.[0] || 'Observe habitat'}</p>
            </div>
          `);
      }
    });

    // Removed fitBounds to ensure the map stays zoomed deeply enough to show location names initially
  }, [species]);

  useEffect(() => {
    if (center && mapRef.current) {
      mapRef.current.setView(center, 5);
    }
  }, [center]);

  return <div ref={containerRef} className={className || "h-[500px] w-full rounded-lg relative z-0"} />;
}
