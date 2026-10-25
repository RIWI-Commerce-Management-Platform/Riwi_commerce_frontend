import { useEffect, useState } from "react";
import { getTerritories, getWeeklyKpis } from "../services/dashboardService";
import { mondayOf } from "../utils/dashboardFormat";

export default function useDashboardKpis() {
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [territoryId, setTerritoryId] = useState("");
  const [territories, setTerritories] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTerritories().then(setTerritories).catch(() => setTerritories([]));
  }, []);

  useEffect(() => {
    let ignore = false; // descarta respuestas de filtros anteriores
    setLoading(true);
    setError(null);
    getWeeklyKpis({ weekStart, territoryId })
      .then((data) => !ignore && setKpis(data))
      .catch((err) => !ignore && setError(err))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [weekStart, territoryId]);

  return { weekStart, setWeekStart, territoryId, setTerritoryId, territories, kpis, loading, error };
}
