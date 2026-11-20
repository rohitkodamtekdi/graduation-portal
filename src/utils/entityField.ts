// Province/site come back as a single {value, label} object, an array of them, or a raw id string
export const toEntityList = (field: any): any[] => {
  if (field === null || field === undefined || field === '') return [];
  return (Array.isArray(field) ? field : [field]).filter(
    item => item !== null && item !== undefined && item !== '',
  );
};

export const getEntityLabel = (field: any, fallback = ''): string => {
  const labels = toEntityList(field)
    .map(item => (typeof item === 'object' ? item.label ?? item.name ?? '' : String(item)))
    .filter(Boolean);
  return labels.length ? labels.join(', ') : fallback;
};

export const getEntityValues = (field: any): string[] =>
  toEntityList(field)
    .map(item => (typeof item === 'object' ? item.value ?? item._id ?? item.id ?? '' : String(item)))
    .filter(Boolean)
    .map(String);

export const getEntityValue = (field: any): string => getEntityValues(field)[0] || '';
