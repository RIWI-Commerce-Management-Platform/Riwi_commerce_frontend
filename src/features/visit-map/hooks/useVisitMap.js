import { useState, useEffect, useCallback } from "react";
import { getVisitMap } from "../services/visitMapService";
import { getCatalogs } from "@/features/clients/services/clientsService";
import { getAvailableAdvisors } from "@/features/routes/services/routesService";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export default function useVisitMap() {
  const [date, setDate] = useState(() => todayIso());
  const [territoryId, setTerritoryId] = useState("");
  const [advisorId, setAdvisorId] = useState("");

  const [zones, setZones] = useState([]);
  const [advisors, setAdvisors] = useState([]);

  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Catálogos para los filtros (zonas y asesores)
  useEffect(() => {
    getCatalogs()
      .then((data) => {
        if (Array.isArray(data?.zones)) setZones(data.zones);
      })
      .catch(() => setZones([]));

    getAvailableAdvisors()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setAdvisors(list);
      })
      .catch(() => setAdvisors([]));
  }, []);

  const fetchMap = useCallback(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    getVisitMap({ date, territoryId, advisorId })
      .then((data) => !ignore && setMap(data))
      .catch((err) => !ignore && setError(err))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [date, territoryId, advisorId]);

  useEffect(() => {
    const cancel = fetchMap();
    return cancel;
  }, [fetchMap]);

  return {
    date,
    setDate,
    territoryId,
    setTerritoryId,
    advisorId,
    setAdvisorId,
    zones,
    advisors,
    map,
    loading,
    error,
    refresh: fetchMap,
  };
}
