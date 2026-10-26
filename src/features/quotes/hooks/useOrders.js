import { useState, useEffect, useCallback } from "react";
import * as ordersService from "../services/ordersService";
import { getClients } from "@/features/clients/services/clientsService";

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [clientsById, setClientsById] = useState({});
  const [filters, setFilters] = useState({
    clientId: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClients({ limit: 200 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const map = {};
        list.forEach((c) => {
          map[c.id] = c;
        });
        setClientsById(map);
      })
      .catch(() => setClientsById({}));
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersService.getOrders({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (data) {
        const list = Array.isArray(data) ? data : data.data || [];
        const total = data?.meta?.total ?? list.length;
        const totalPages = data?.meta?.totalPages ?? 1;

        setOrders(list);
        setPagination((prev) => ({ ...prev, total, totalPages }));
      }
    } catch (err) {
      setError(err.message || "Error al cargar los pedidos.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ clientId: "", status: "", startDate: "", endDate: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const setPage = (page) => setPagination((prev) => ({ ...prev, page }));

  return {
    orders,
    clientsById,
    filters,
    pagination,
    loading,
    error,
    setFilter,
    resetFilters,
    setPage,
    refresh: fetchOrders,
  };
}
