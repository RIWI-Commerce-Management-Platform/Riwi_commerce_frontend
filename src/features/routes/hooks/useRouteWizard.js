import { useState, useEffect, useCallback } from "react";
import * as routesService from "../services/routesService";
import { getClients } from "@/features/clients/services/clientsService";

export default function useRouteWizard({ route = null, onSuccess, onClose }) {
  const [step, setStep] = useState(1);
  const [routeData, setRouteData] = useState(route);
  const [stops, setStops] = useState([]);
  const [zoneClients, setZoneClients] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [metrics, setMetrics] = useState({
    stopsCount: 0,
    totalDistanceKm: 0,
    estimatedDurationMinutes: 0,
  });

  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Si se abre para editar una ruta existente, carga sus paradas enriquecidas
  useEffect(() => {
    if (route?.id) {
      setRouteData(route);
      setLoading(true);
      routesService
        .getRouteById(route.id)
        .then((detailed) => {
          setRouteData(detailed);
          setStops(detailed.stops || []);
          setMetrics({
            stopsCount: detailed.stopsCount || detailed.stops?.length || 0,
            totalDistanceKm: detailed.totalDistanceKm || 0,
            estimatedDurationMinutes: detailed.estimatedDurationMinutes || 0,
          });
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setRouteData(null);
      setStops([]);
      setMetrics({ stopsCount: 0, totalDistanceKm: 0, estimatedDurationMinutes: 0 });
      setStep(1);
    }
  }, [route]);

  // Carga clientes de la zona seleccionada (Paso 2)
  const fetchZoneClients = useCallback(async (zoneId) => {
    if (!zoneId) return;
    setClientsLoading(true);
    try {
      const res = await getClients({ zoneId, limit: 100, isActive: true });
      const clientList = Array.isArray(res) ? res : res.data || res.items || [];
      setZoneClients(clientList);
    } catch (err) {
      console.warn("Error cargando clientes de la zona:", err);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  // Carga asesores disponibles para la zona (Paso 3)
  const fetchAdvisors = useCallback(async (zoneId) => {
    try {
      const res = await routesService.getAvailableAdvisors(zoneId);
      const list = Array.isArray(res) ? res : res.data || res.items || [];
      setAdvisors(list);
    } catch (err) {
      console.warn("Error cargando asesores:", err);
      // Fallback: si el endpoint /advisors no tuviera datos, asegurar que no rompa
      setAdvisors([]);
    }
  }, []);

  // Paso 1: Crear o actualizar borrador de ruta
  const submitStep1 = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      let saved;
      if (routeData?.id) {
        saved = await routesService.updateRouteDraft(routeData.id, formData);
      } else {
        saved = await routesService.createRouteDraft(formData);
      }
      setRouteData(saved);
      // Cargar clientes de la zona para el paso 2
      await fetchZoneClients(saved.zoneId);
      setStep(2);
    } catch (err) {
      setError(err.message || "Error al guardar los datos básicos de la ruta.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Agregar parada de cliente
  const handleAddStop = async (clientId, suggestedTime = "09:00:00", estimatedDurationMinutes = 30) => {
    if (!routeData?.id) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await routesService.addRouteStop(routeData.id, {
        clientId: Number(clientId),
        suggestedTime: suggestedTime || undefined,
        estimatedDurationMinutes: Number(estimatedDurationMinutes) || 30,
      });

      // Refresca el detalle completo para obtener coordenadas enriquecidas del cliente
      const detailed = await routesService.getRouteById(routeData.id);
      setRouteData(detailed);
      setStops(detailed.stops || []);
      setMetrics({
        stopsCount: detailed.stopsCount || detailed.stops?.length || 0,
        totalDistanceKm: detailed.totalDistanceKm || updated.totalDistanceKm || 0,
        estimatedDurationMinutes: detailed.estimatedDurationMinutes || updated.estimatedDurationMinutes || 0,
      });
    } catch (err) {
      setError(err.message || "No se pudo agregar la parada a la ruta.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Remover parada
  const handleRemoveStop = async (clientId) => {
    if (!routeData?.id) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await routesService.removeRouteStop(routeData.id, clientId);
      const detailed = await routesService.getRouteById(routeData.id);
      setRouteData(detailed);
      setStops(detailed.stops || []);
      setMetrics({
        stopsCount: detailed.stopsCount || detailed.stops?.length || 0,
        totalDistanceKm: detailed.totalDistanceKm || updated.totalDistanceKm || 0,
        estimatedDurationMinutes: detailed.estimatedDurationMinutes || updated.estimatedDurationMinutes || 0,
      });
    } catch (err) {
      setError(err.message || "No se pudo remover la parada.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Reordenar paradas (Mover arriba / abajo)
  const handleMoveStop = async (currentIndex, targetIndex) => {
    if (!routeData?.id || targetIndex < 0 || targetIndex >= stops.length) return;
    const reordered = [...stops];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedClientIds = reordered.map((s) => s.clientId);
    setLoading(true);
    setError(null);
    try {
      await routesService.reorderRouteStops(routeData.id, orderedClientIds);
      const detailed = await routesService.getRouteById(routeData.id);
      setRouteData(detailed);
      setStops(detailed.stops || []);
      setMetrics({
        stopsCount: detailed.stopsCount || detailed.stops?.length || 0,
        totalDistanceKm: detailed.totalDistanceKm || 0,
        estimatedDurationMinutes: detailed.estimatedDurationMinutes || 0,
      });
    } catch (err) {
      setError(err.message || "No se pudo reordenar la secuencia de paradas.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2 -> Paso 3
  const proceedToStep3 = async () => {
    if (stops.length === 0) {
      setError("Debes agregar al menos una parada a la ruta antes de continuar.");
      return;
    }
    setError(null);
    await fetchAdvisors(routeData.zoneId);
    setStep(3);
  };

  // Paso 3: Asignar asesor y programar visitas en agenda
  const submitStep3 = async (advisorId) => {
    if (!routeData?.id || !advisorId) {
      setError("Debes seleccionar un asesor comercial para asignar la ruta.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const assigned = await routesService.assignRouteAdvisor(routeData.id, Number(advisorId));
      setRouteData(assigned);
      if (onSuccess) onSuccess(assigned);
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "No se pudo asignar el asesor a la ruta.");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    routeData,
    stops,
    zoneClients,
    advisors,
    metrics,
    loading,
    clientsLoading,
    error,
    setError,
    submitStep1,
    handleAddStop,
    handleRemoveStop,
    handleMoveStop,
    proceedToStep3,
    submitStep3,
  };
}
