export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

export const prettyJson = (value) => JSON.stringify(value ?? {}, null, 2);
