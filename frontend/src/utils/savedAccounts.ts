export interface SavedAccount {
  email: string;
  password: string;
}

const STORAGE_KEY = 'smart_travel_saved_accounts';

export const getSavedAccounts = (): SavedAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Dữ liệu mẫu ban đầu nếu chưa có tài khoản nào được lưu
      return [
        { email: 'admin@smarttravel.com', password: '123456' },
        { email: 'vendor@smarttravel.com', password: '123456' },
        { email: 'user@smarttravel.com', password: '123456' },
      ];
    }
    const parsed: SavedAccount[] = JSON.parse(raw);
    return parsed.map((acc) => ({
      ...acc,
      password: acc.password === 'password123' ? '123456' : acc.password,
    }));
  } catch (e) {
    return [];
  }
};

export const saveAccount = (email: string, password: string) => {
  if (!email || !password) return;
  try {
    const accounts = getSavedAccounts();
    const existingIndex = accounts.findIndex((acc) => acc.email.toLowerCase() === email.toLowerCase());
    if (existingIndex >= 0) {
      accounts[existingIndex].password = password;
    } else {
      accounts.unshift({ email, password });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save account', e);
  }
};

export const removeSavedAccount = (email: string): SavedAccount[] => {
  try {
    const accounts = getSavedAccounts().filter((acc) => acc.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    return accounts;
  } catch (e) {
    return [];
  }
};
