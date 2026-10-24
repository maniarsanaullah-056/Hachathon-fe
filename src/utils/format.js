// Server date-only values UTC midnight par hoti hain, is liye UTC mein format karte hain
export function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export const toInputDate = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export function formatDateTime(value) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export const formatCurrency = (value, currency = 'PKR') =>
  value === undefined || value === null
    ? '-'
    : new Intl.NumberFormat('en-PK', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

export function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    const first = error.response.data.errors?.[0];
    return first ? `${error.response.data.message}: ${first.field}: ${first.message}` : error.response.data.message;
  }
  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Check your connection or the API URL.';
  return error?.message || 'Something went wrong';
}

// Backend validation errors ko { field: message } mein badalta hai
export function getFieldErrors(error) {
  const list = error?.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  return Object.fromEntries(list.map((e) => [e.field, e.message]));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
