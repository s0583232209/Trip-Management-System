import api from "../api.js";

export async function getTripFiles(tripId) {
  const res = await api.get(`/api/trips/${tripId}/files/kit`);
  return res.data;
}

export async function uploadTripFile(tripId, formData) {
  const res = await api.post(`/api/trips/${tripId}/files/kit`, formData);
  return res.data;
}

export async function deleteTripFile(tripId, fileId) {
  const res = await api.delete(`/api/trips/${tripId}/files/${fileId}`);
  return res.data;
}

export async function openFile(tripId, fileId) {
  const response = await api.get(`/api/trips/${tripId}/files/${fileId}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(response.data);
  window.open(url, "_blank");
}
