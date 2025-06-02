/*import React, { useRef, useEffect, useState } from "react";
import { Viewer, Cartesian3, VerticalOrigin, Cartesian2 } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

async function geocodeLocation(location) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
}

const CustomerGlobeCesium = () => {
  const cesiumContainer = useRef(null);
  const viewerRef = useRef(null);
  const [customers, setCustomers] = useState([]);

  // Fetch customers from backend API on mount
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("http://192.168.0.106:8080/api/customer"); // Replace with your backend URL
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    }
    fetchCustomers();
  }, []);

  // Initialize Cesium viewer and add pins when customers update
  useEffect(() => {
    if (!cesiumContainer.current) return;

    if (!viewerRef.current) {
      viewerRef.current = new Viewer(cesiumContainer.current, {
        timeline: false,
        animation: false,
        baseLayerPicker: true,
        geocoder: false,
        navigationHelpButton: false,
      });
    }

    const viewer = viewerRef.current;

    viewer.entities.removeAll();

    async function addPins() {
      for (const customer of customers) {
        if (!customer.location) continue;

        const coords = await geocodeLocation(customer.location);
        if (!coords) continue;

        viewer.entities.add({
          position: Cartesian3.fromDegrees(coords.longitude, coords.latitude),
          billboard: {
            image: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            verticalOrigin: VerticalOrigin.BOTTOM,
            scale: 0.05,
          },
          label: {
            text: customer.name || "Unknown",
            font: "14px sans-serif",
            pixelOffset: new Cartesian2(0, -30),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          description: `
            <h3>${customer.name || "Customer"}</h3>
            <p><b>Location:</b> ${customer.location}</p>
            <p><b>Email:</b> ${customer.email || "N/A"}</p>
            <p><b>Phone:</b> ${customer.contact || "N/A"}</p>
          `,
        });
      }
    }

    addPins();

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(0, 20, 20000000),
    });

    return () => {
      viewer.entities.removeAll();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [customers]);

  return (
    <div
      ref={cesiumContainer}
      style={{ width: "100%", height: "500px", borderRadius: "8px", overflow: "hidden" }}
    />
  );
};

export default CustomerGlobeCesium;*/
