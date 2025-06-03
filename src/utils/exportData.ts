// Option 1: Using a generic type (most flexible)
export const convertToCSV = <T extends Record<string, unknown>>(
  data: T[],
  headers: { [key: string]: string }
) => {
  if (data.length === 0) return '';

  // Create header row
  const headerRow = Object.values(headers).join(',');

  // Create data rows
  const rows = data.map((item) => {
    return Object.keys(headers)
      .map((key) => {
        let value = item[key];

        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value).replace(/"/g, '""');
        }

        // Handle strings that need to be quoted
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"') || value.includes('\n'))
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(',');
  });

  return `${headerRow}\n${rows.join('\n')}`;
};

// Option 2: Using Record<string, unknown> (simpler but less type-safe)
export const convertToCSVAlt = (
  data: Record<string, unknown>[],
  headers: { [key: string]: string }
) => {
  if (data.length === 0) return '';

  // Create header row
  const headerRow = Object.values(headers).join(',');

  // Create data rows
  const rows = data.map((item) => {
    return Object.keys(headers)
      .map((key) => {
        let value = item[key];

        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value).replace(/"/g, '""');
        }

        // Handle strings that need to be quoted
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"') || value.includes('\n'))
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(',');
  });

  return `${headerRow}\n${rows.join('\n')}`;
};

interface INavigator extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName: string) => boolean;
}

export const downloadCSV = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const navigator: INavigator = window.navigator;

  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, fileName);
  } else {
    // Modern browsers
    const link = document.createElement('a');
    if (link.download !== undefined) {
      // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Fallback for older browsers
      const url =
        'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      window.open(url);
    }
  }
};
