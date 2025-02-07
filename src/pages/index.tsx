import React, { useEffect, useState } from "react";
import { LngLatBounds } from "mapbox-gl";
import { overpassQuery } from "@/overpass/overpass";
import { FeatureCollection } from "geojson";
import { Window } from "../components/Window";
import { analyzeParking } from "@/analysis/analyzeParking";

import { MainMap } from "@/components/MainMap";

const initialViewState = {
  longitude: -118.482505,
  latitude: 34.0248477,
  zoom: 14,
};

export const MainPage = () => {
  const [bounds, setBounds] = useState<LngLatBounds>();
  const [savedBounds, setSavedBounds] = useState<LngLatBounds>();
  const [loading, setLoading] = useState(false);
  const [parkingLots, setParkingLots] = useState({
    type: "FeatureCollection",
    features: [],
  } as FeatureCollection);
  const [parkingArea, setParkingArea] = useState(0);
  const [windowBoundArea, setWindowBoundArea] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [viewport, setViewport] = useState(initialViewState);
  const [error, setError] = useState(false);

  const handleParkingSearch = async () => {
    if (viewport.zoom < 13) {
      setShowZoomModal(true);
      return;
    }

    if (!bounds) {
      return;
    }

    setLoading(true);
    setSavedBounds(bounds);

    try {
      const parking = (await overpassQuery(bounds)) as FeatureCollection;
      setParkingLots(parking);
      setLoading(false);

      const { totalParkingArea, boundArea } = analyzeParking({
        parking,
        bounds,
      });
      setParkingArea(totalParkingArea);
      setWindowBoundArea(boundArea);
      setError(false);
    } catch (e) {
      setLoading(false);
      setError(true);
    }
  };

  return (
    <>
      <div className="map-page">
        <Window
          handleParkingSearch={handleParkingSearch}
          loading={loading}
          parkingArea={parkingArea}
          windowBoundArea={windowBoundArea}
          setShowInfoModal={setShowInfoModal}
          error={error}
        />
        <MainMap
          showZoomModal={showZoomModal}
          setShowZoomModal={setShowZoomModal}
          showInfoModal={showInfoModal}
          setShowInfoModal={setShowInfoModal}
          loading={loading}
          parkingLots={parkingLots}
          savedBounds={savedBounds}
          setBounds={setBounds}
          viewport={viewport}
          setViewport={setViewport}
        />
      </div>
    </>
  );
};

export default MainPage;
