import api from "../src/api.js";

export async function openFile(fileId) {
  const response = await api.get(
    `/api/files/${fileId}`,
    {
      responseType: "blob",
    },
  );
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}
