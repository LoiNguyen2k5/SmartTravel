export const formatCurrency = (amount: number, locale = 'vi-VN', currency = 'VND'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export const formatDate = (dateStr: string, locale = 'vi-VN'): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr: string, locale = 'vi-VN'): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString(locale);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const formatDuration = (days: number, nights: number): string => {
  return `${days}N${nights}Đ`;
};
