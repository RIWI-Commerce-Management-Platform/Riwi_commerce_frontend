import { useState, useCallback } from "react";
import * as clientsService from "../services/clientsService";

export default function useClientContacts(clientId) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await clientsService.getClientContacts(clientId);
      setContacts(data || []);
    } catch (err) {
      setError(err.message || "Error al cargar contactos.");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const addContact = async (contactData) => {
    const created = await clientsService.createClientContact(clientId, contactData);
    await fetchContacts();
    return created;
  };

  const updateContact = async (contactId, contactData) => {
    const updated = await clientsService.updateClientContact(clientId, contactId, contactData);
    await fetchContacts();
    return updated;
  };

  const promotePrimary = async (contactId) => {
    await clientsService.setPrimaryContact(clientId, contactId);
    // El backend automáticamente desmarca a los demás
    await fetchContacts();
  };

  const removeContact = async (contactId) => {
    await clientsService.deleteClientContact(clientId, contactId);
    await fetchContacts();
  };

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    addContact,
    updateContact,
    promotePrimary,
    removeContact,
  };
}
