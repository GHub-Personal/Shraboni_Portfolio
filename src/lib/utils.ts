export const parseAspectRatio = (dimensionStr: string | undefined): string => {
  if (!dimensionStr) return '1/1';
  
  // Clean up the string (lowercase, remove spaces and units like px, mm, cm, in)
  const cleanStr = dimensionStr.toLowerCase().replace(/\s+/g, '').replace(/[a-z]/g, '');
  
  // Try splitting by 'x', '*', ':', or '/'
  let parts: string[] = [];
  if (cleanStr.includes('x')) {
    parts = cleanStr.split('x');
  } else if (cleanStr.includes('*')) {
    parts = cleanStr.split('*');
  } else if (cleanStr.includes(':')) {
    parts = cleanStr.split(':');
  } else if (cleanStr.includes('/')) {
    parts = cleanStr.split('/');
  }
  
  if (parts.length === 2) {
    const width = parseFloat(parts[0]);
    const height = parseFloat(parts[1]);
    if (!isNaN(width) && !isNaN(height) && height !== 0) {
      return `${width}/${height}`;
    }
  }
  
  // Fallback
  return dimensionStr.replace(':', '/');
};
