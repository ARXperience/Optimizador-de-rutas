import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  TrafficLayer,
  Marker,
} from "@react-google-maps/api";

const App = () => {
  const [directions, setDirections] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const mapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }],
    },
  ];

  const calculateRoute = (customStart = null) => {
    const origin = customStart || start;

    // Verifica que el destino no esté vacío o incompleto
    if (!origin || !end || end.trim() === "") return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination: end,
        waypoints: waypoints.map((location) => ({ location, stopover: true })),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error("Error al calcular la ruta:", status);
        }
      }
    );
  };

  useEffect(() => {
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          const newStart = `${latitude},${longitude}`;

          setUserLocation(newLocation);
          setStart(newStart);

          // Recalcula la ruta automáticamente si hay un destino válido
          if (end && end.trim() !== "") calculateRoute(newStart);
        },
        (error) => alert("Error al obtener la ubicación."),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [end, waypoints]); // Depende de destino y waypoints para actualizar correctamente

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          padding: "20px",
          width: "300px",
          background: "#333",
          color: "#fff",
        }}
      >
        <h3>Configuración de Ruta</h3>
        <div>
          <label>Inicio:</label>
          <input
            type="text"
            value={start}
            placeholder="Ubicación actual"
            onChange={(e) => setStart(e.target.value)}
            disabled
          />
        </div>
        <div>
          <label>Destino:</label>
          <input
            type="text"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="Ingrese destino"
          />
        </div>
        {waypoints.map((wp, index) => (
          <div key={index}>
            <label>Waypoint {index + 1}:</label>
            <input
              type="text"
              value={wp}
              onChange={(e) =>
                setWaypoints(
                  waypoints.map((w, i) => (i === index ? e.target.value : w))
                )
              }
            />
          </div>
        ))}
        <button onClick={() => setWaypoints([...waypoints, ""])} className="add-waypoint">
          Agregar Waypoint
        </button>
        <button onClick={() => calculateRoute()} className="calculate-route">
          Calcular Ruta
        </button>
      </div>

      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100vh" }}
          center={userLocation || { lat: 40.7128, lng: -74.006 }}
          zoom={12}
          options={{ styles: mapStyle, disableDefaultUI: true }}
        >
          {directions && <DirectionsRenderer directions={directions} />}
          <TrafficLayer />
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: "https://maps.google.com/mapfiles/kml/shapes/info-i_maps.png",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default App;
