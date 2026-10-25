import { useState, useEffect, useCallback } from "react";
import * as clientsService from "../services/clientsService";

export default function useClients() {
  const [clients, setClients] = useState([]);
  const [catalogs, setCatalogs] = useState({
    zones: [],
    clientTypes: [],
    potentials: [],
    clientStatuses: [],
  });
  const [filters, setFilters] = useState({
    search: "",
    zoneId: "",
    clientTypeId: "",
    potentialId: "",
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

  // Carga inicial de catálogos paramétricos
  useEffect(() => {
    clientsService
      .getCatalogs()
      .then((data) => {
        if (data) {
          setCatalogs({
            zones: data.zones || [],
            clientTypes: data.clientTypes || [],
            potentials: data.potentials || [],
            clientStatuses: data.clientStatuses || [],
          });
        }
      })
      .catch((err) => console.warn("Error cargando catálogos:", err));
  }, []);

  // Consulta de clientes con filtros y paginación
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientsService.getClients({
        search: filters.search,
        zoneId: filters.zoneId,
        clientTypeId: filters.clientTypeId,
        potentialId: filters.potentialId,
        isActive: filters.isActive,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (data) {
        setClients(data.items || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
        }));
      }
    } catch (err) {
      setError(err.message || "Error al cargar la lista de clientes.");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Resetea a página 1 al filtrar
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      zoneId: "",
      clientTypeId: "",
      potentialId: "",
      isActive: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const setPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleToggleStatus = async (client) => {
    try {
      const newStatus = !client.isActive;
      await clientsService.toggleClientStatus(client.id, newStatus);
      // Actualización optimista local
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, isActive: newStatus } : c))
      );
    } catch (err) {
      alert(`No se pudo cambiar el estado: ${err.message}`);
    }
  };

  return {
    clients,
    catalogs,
    filters,
    pagination,
    loading,
    error,
    setFilter,
    resetFilters,
    setPage,
    refresh: fetchClients,
    handleToggleStatus,
  };
}
