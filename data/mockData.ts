export type Department = 'Teacher' | 'Nurse' | 'Police Officer' | 'Administrative Staff' | 'Social Worker';
export type Ministry = 'Ministry of Education' | 'Ministry of Health' | 'Zimbabwe Republic Police' | 'Ministry of Finance' | 'Ministry of Public Service';

export interface User {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  department: Department;
  ministry: Ministry;
  employerCode: string;
  monthlySalary: number;
  creditLimit: number;
  walletId: string;
  joinedDate: string;
  avatarInitials: string;
}

export interface Transaction {
  id: string;
  storeName: string;
  storeLocation: string;
  amount: number;
  date: string;
  time: string;
  category: 'Groceries' | 'Pharmacy' | 'Household' | 'Bakery' | 'Beverages';
  reference: string;
  balance: number;
}

export interface WalletState {
  creditLimit: number;
  amountUsed: number;
  availableCredit: number;
  nextDeductionDate: string;
  nextDeductionAmount: number;
  cycleStart: string;
  cycleEnd: string;
}

export const MOCK_USER: User = {
  id: 'CS-2024-007821',
  name: 'John Moyo',
  phone: '+263 77 234 5678',
  nationalId: '63-1234567X18',
  department: 'Teacher',
  ministry: 'Ministry of Education',
  employerCode: 'MOE-HRE-0047',
  monthlySalary: 450,
  creditLimit: 120,
  walletId: 'OKWLT-JM-20240115',
  joinedDate: '2024-01-15',
  avatarInitials: 'JM',
};

export const MOCK_WALLET: WalletState = {
  creditLimit: 120.00,
  amountUsed: 46.50,
  availableCredit: 73.50,
  nextDeductionDate: '2026-03-28',
  nextDeductionAmount: 46.50,
  cycleStart: '2026-03-01',
  cycleEnd: '2026-03-28',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  // March 2026
  { id: 'TXN-2026030421', storeName: 'OK Borrowdale', storeLocation: 'Borrowdale, Harare', amount: 12.80, date: '2026-03-04', time: '14:32', category: 'Groceries', reference: 'POS-BRW-20260304-0421', balance: 73.50 },
  { id: 'TXN-2026030318', storeName: 'Bon Marché Avondale', storeLocation: 'Avondale, Harare', amount: 7.40, date: '2026-03-03', time: '11:15', category: 'Pharmacy', reference: 'POS-AVN-20260303-0318', balance: 86.30 },
  { id: 'TXN-2026030209', storeName: 'OK Borrowdale', storeLocation: 'Borrowdale, Harare', amount: 18.90, date: '2026-03-02', time: '16:47', category: 'Groceries', reference: 'POS-BRW-20260302-0209', balance: 93.70 },
  { id: 'TXN-2026030107', storeName: 'OKmart Graniteside', storeLocation: 'Graniteside, Harare', amount: 4.20, date: '2026-03-01', time: '09:05', category: 'Bakery', reference: 'POS-GRN-20260301-0107', balance: 112.60 },
  { id: 'TXN-2026030112', storeName: 'OK Sam Levy\'s', storeLocation: 'Borrowdale, Harare', amount: 3.20, date: '2026-03-01', time: '12:20', category: 'Beverages', reference: 'POS-SLV-20260301-0112', balance: 116.80 },
  // February 2026
  { id: 'TXN-2026022805', storeName: 'OK Sam Levy\'s', storeLocation: 'Borrowdale, Harare', amount: 3.20, date: '2026-02-28', time: '12:30', category: 'Beverages', reference: 'POS-SLV-20260228-0105', balance: 116.80 },
  { id: 'TXN-2026022704', storeName: 'Bon Marché Avondale', storeLocation: 'Avondale, Harare', amount: 22.50, date: '2026-02-27', time: '15:20', category: 'Household', reference: 'POS-AVN-20260227-0204', balance: 120.00 },
  { id: 'TXN-2026022503', storeName: 'OK Borrowdale', storeLocation: 'Borrowdale, Harare', amount: 31.70, date: '2026-02-25', time: '10:45', category: 'Groceries', reference: 'POS-BRW-20260225-0303', balance: 120.00 },
  { id: 'TXN-2026022201', storeName: 'OKmart Highfield', storeLocation: 'Highfield, Harare', amount: 9.80, date: '2026-02-22', time: '08:30', category: 'Pharmacy', reference: 'POS-HGH-20260222-0101', balance: 120.00 },
  { id: 'TXN-2026021508', storeName: 'OK Eastgate', storeLocation: 'CBD, Harare', amount: 14.60, date: '2026-02-15', time: '17:10', category: 'Groceries', reference: 'POS-EGT-20260215-0208', balance: 120.00 },
  { id: 'TXN-2026021006', storeName: 'Bon Marché Msasa', storeLocation: 'Msasa, Harare', amount: 6.90, date: '2026-02-10', time: '13:55', category: 'Bakery', reference: 'POS-MSA-20260210-0106', balance: 120.00 },
  { id: 'TXN-2026020502', storeName: 'OKmart Graniteside', storeLocation: 'Graniteside, Harare', amount: 11.30, date: '2026-02-05', time: '16:20', category: 'Household', reference: 'POS-GRN-20260205-0202', balance: 120.00 },
  // January 2026
  { id: 'TXN-2026013101', storeName: 'OK Borrowdale', storeLocation: 'Borrowdale, Harare', amount: 28.40, date: '2026-01-31', time: '14:00', category: 'Groceries', reference: 'POS-BRW-20260131-0101', balance: 120.00 },
  { id: 'TXN-2026012802', storeName: 'Bon Marché Avondale', storeLocation: 'Avondale, Harare', amount: 15.60, date: '2026-01-28', time: '11:30', category: 'Household', reference: 'POS-AVN-20260128-0102', balance: 120.00 },
  { id: 'TXN-2026012003', storeName: 'OK Sam Levy\'s', storeLocation: 'Borrowdale, Harare', amount: 22.10, date: '2026-01-20', time: '16:15', category: 'Groceries', reference: 'POS-SLV-20260120-0103', balance: 120.00 },
  { id: 'TXN-2026011504', storeName: 'OKmart Graniteside', storeLocation: 'Graniteside, Harare', amount: 8.90, date: '2026-01-15', time: '09:40', category: 'Bakery', reference: 'POS-GRN-20260115-0104', balance: 120.00 },
  { id: 'TXN-2026010905', storeName: 'Bon Marché Msasa', storeLocation: 'Msasa, Harare', amount: 18.50, date: '2026-01-09', time: '13:25', category: 'Pharmacy', reference: 'POS-MSA-20260109-0105', balance: 120.00 },
  { id: 'TXN-2026010306', storeName: 'OK Eastgate', storeLocation: 'CBD, Harare', amount: 5.50, date: '2026-01-03', time: '17:50', category: 'Beverages', reference: 'POS-EGT-20260103-0106', balance: 120.00 },
];

export const CATEGORY_ICONS: Record<Transaction['category'], string> = {
  Groceries: '🛒',
  Pharmacy: '💊',
  Household: '🏠',
  Bakery: '🍞',
  Beverages: '🥤',
};

export const CATEGORY_COLORS: Record<Transaction['category'], string> = {
  Groceries: '#CC0000',
  Pharmacy: '#0066CC',
  Household: '#FF6B00',
  Bakery: '#9C27B0',
  Beverages: '#00843D',
};

export const DEPARTMENTS: Department[] = [
  'Teacher', 'Nurse', 'Police Officer', 'Administrative Staff', 'Social Worker',
];

export const MINISTRIES: Ministry[] = [
  'Ministry of Education', 'Ministry of Health', 'Zimbabwe Republic Police',
  'Ministry of Finance', 'Ministry of Public Service',
];

export const SALARY_RANGES = [
  { label: 'USD 200 – 300', value: 250, creditLimit: 60 },
  { label: 'USD 301 – 450', value: 375, creditLimit: 90 },
  { label: 'USD 451 – 600', value: 525, creditLimit: 120 },
  { label: 'USD 601 – 900', value: 750, creditLimit: 150 },
  { label: 'USD 901+', value: 1000, creditLimit: 200 },
];
