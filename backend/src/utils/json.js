export const safeJsonParse = (value) => {
  if (value === null || value === undefined) {
    return { success: false, error: 'Empty value', data: null };
  }

  if (typeof value === 'object') {
    return { success: true, error: null, data: value };
  }

  try {
    return { success: true, error: null, data: JSON.parse(value) };
  } catch (error) {
    const match = String(value).match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return { success: true, error: null, data: JSON.parse(match[0]) };
      } catch (secondError) {
        return { success: false, error: secondError.message, data: null };
      }
    }

    return { success: false, error: error.message, data: null };
  }
};

export const stringifyJson = (value) => JSON.stringify(value ?? null, null, 2);
