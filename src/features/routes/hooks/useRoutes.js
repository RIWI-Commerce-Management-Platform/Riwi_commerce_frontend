import { useState, useEffect, useCallback } from "react";
import * as routesService from "../services/routesService";
import { getCatalogs } from "@/features/clients/services/clientsService";

export default function useRoutes() {
  const [routes, setRoutes] = useState([]);
  const [zones, setZones] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    zoneId: "",
    status: "",
    dayOfWeek: "",
    frequency: "",
    isActive: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga zonas desde catálogos para filtros
  useEffect(() => {
    getCatalogs()
      .then((data) => {
        if (data?.zones) setZones(data.zones);
      })
      .catch((err) => console.warn("Error cargando zonas para rutas:", err));
  }, []);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await routesService.getRoutes({
        search: filters.search,
        zoneId: filters.zoneId,
        status: filters.status,
        dayOfWeek: filters.dayOfWeek,
        frequency: filters.frequency,
        isActive: filters.isActive,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (res) {
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        const total = res?.meta?.total ?? res?.total ?? list.length;
        const totalPages = res?.meta?.totalPages ?? res?.totalPages ?? 1;

        setRoutes(list);
        setPagination((prev) => ({
          ...prev,
          total,
          totalPages,
        }));
      }
    } catch (err) {
      setError(err.message || "Error al cargar el listado de rutas.");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      zoneId: "",
      status: "",
      dayOfWeek: "",
      frequency: "",
      isActive: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const setPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleToggleStatus = async (route) => {
    try {
      const updated = await routesService.toggleRouteStatus(route.id);
      setRoutes((prev) =>
        prev.map((r) => (r.id === route.id ? { ...r, isActive: updated.isActive } : r))
      );
    } catch (err) {
      alert(`No se pudo cambiar el estado: ${err.message}`);
    }
  };

  return {
    routes,
    zones,
    filters,
    pagination,
    loading,
    error,
    setFilter,
    resetFilters,
    setPage,
    refresh: fetchRoutes,
    handleToggleStatus,
  };
}
