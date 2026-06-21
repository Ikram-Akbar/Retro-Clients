export const unwrapApiData = (response) => response?.data?.data ?? response?.data ?? response ?? null;

export const extractList = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  return [];
};

export const extractItem = (response) => unwrapApiData(response);
