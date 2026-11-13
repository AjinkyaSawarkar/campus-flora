import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAMPUS } from "../content/site";
import { sized } from "../lib/plants";

export interface Pin {
  lat: number;
  lng: number;
  title: string;
  /** Second line in the popup, e.g. the scientific name. */
  subtitle?: string;
  by?: string;
  /** Photo shown in the popup. */
  src?: string;
  /** Page opened from the popup. */
  href?: string;
  /** Dot colour. */
  color?: string;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function popupHtml(p: Pin): string {
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking`;
  return `
    <div class="cf-pop">
      ${p.src ? `<img src="${esc(sized(p.src, 330))}" alt="" referrerpolicy="no-referrer">` : ""}
      <strong>${esc(p.title)}</strong>
      ${p.subtitle ? `<em>${esc(p.subtitle)}</em>` : ""}
      ${p.by ? `<span>Photo: ${esc(p.by)}</span>` : ""}
      <span class="cf-pop-links">
        ${p.href ? `<a href="${esc(p.href)}">Open plant</a>` : ""}
        <a href="${maps}" target="_blank" rel="noopener noreferrer">Walk there</a>
      </span>
    </div>`;
}

/**
 * A map of plant positions on campus (OpenStreetMap streets or satellite photos).
 * Loaded only on pages that show a map, so the rest of the site stays light.
 */
export default function CampusMap({ pins, className = "", locate = false }: { pins: Pin[]; className?: string; locate?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  // Create the map once.
  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false, attributionControl: true }).setView([CAMPUS.lat, CAMPUS.lng], 16);
    const streets = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
    });
    satellite.addTo(m); // trees are easier to recognise on the satellite photo
    L.control.layers({ Satellite: satellite, Streets: streets }, undefined, { position: "topright" }).addTo(m);
    m.on("click", () => m.scrollWheelZoom.enable()); // scrolling the page should not zoom the map by accident
    layer.current = L.layerGroup().addTo(m);
    map.current = m;

    if (locate) {
      const Locate = L.Control.extend({
        onAdd() {
          const b = L.DomUtil.create("button", "cf-locate");
          b.type = "button";
          b.textContent = "Where am I?";
          L.DomEvent.disableClickPropagation(b);
          b.onclick = () => m.locate({ setView: true, maxZoom: 18, enableHighAccuracy: true });
          return b;
        },
      });
      new Locate({ position: "bottomleft" }).addTo(m);
      let me: L.CircleMarker | null = null;
      m.on("locationfound", (e) => {
        me?.remove();
        me = L.circleMarker(e.latlng, { radius: 8, color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }).addTo(m).bindPopup("You are here").openPopup();
      });
      m.on("locationerror", () => window.alert("Your location could not be found. Check that location is allowed for this site."));
    }
    return () => {
      m.remove();
      map.current = null;
    };
  }, [locate]);

  // Redraw the pins whenever they change.
  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    for (const p of pins) {
      const icon = L.divIcon({
        className: "",
        html: `<span class="cf-pin" style="background:${p.color ?? "#1f3a2b"}"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -10],
      });
      L.marker([p.lat, p.lng], { icon, title: p.title, alt: p.title }).bindPopup(popupHtml(p), { maxWidth: 220 }).addTo(g);
    }
    if (pins.length === 1) m.setView([pins[0].lat, pins[0].lng], 18);
    else if (pins.length > 1) m.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])).pad(0.25), { maxZoom: 18 });
    else m.setView([CAMPUS.lat, CAMPUS.lng], 16);
  }, [pins]);

  return <div ref={el} className={`z-0 overflow-hidden rounded-xl bg-neutral-200 ${className}`} role="region" aria-label="Map of plant positions on campus" />;
}
