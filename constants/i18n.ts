export type Locale = 'en' | 'sn' | 'nd';

export interface Translations {
  // Tabs
  home: string;
  pay: string;
  history: string;
  profile: string;
  // Common
  available: string;
  creditLimit: string;
  used: string;
  total: string;
  transactions: string;
  remaining: string;
  search: string;
  cancel: string;
  confirm: string;
  submit: string;
  close: string;
  add: string;
  delete: string;
  // Home
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  availableCredit: string;
  quickActions: string;
  payAtStore: string;
  viewQR: string;
  statement: string;
  analytics: string;
  findStore: string;
  thisMonth: string;
  recentTransactions: string;
  seeAll: string;
  nextDeduction: string;
  // Pay
  payTitle: string;
  paySub: string;
  showCashier: string;
  confirmWithPin: string;
  // History
  historyTitle: string;
  historySub: string;
  totalSpent: string;
  noTransactions: string;
  // Profile
  profileTitle: string;
  personalDetails: string;
  employmentDetails: string;
  deductionSchedule: string;
  appearance: string;
  themeMode: string;
  settings: string;
  language: string;
  changePIN: string;
  notifications: string;
  helpSupport: string;
  terms: string;
  signOut: string;
  biometricLogin: string;
  autoDarkMode: string;
  familyAccounts: string;
  addFamilyMember: string;
  creditRequest: string;
  downloadStatement: string;
  shoppingList: string;
  // Analytics
  analyticsTitle: string;
  spendingByCategory: string;
  monthlyTrend: string;
  avgDailySpend: string;
  // Stores
  storesTitle: string;
  allStores: string;
  open: string;
  kmAway: string;
  // Shopping List
  shoppingListTitle: string;
  addItem: string;
  estimatedTotal: string;
  clearCompleted: string;
  itemName: string;
  estimatedPrice: string;
  // Dispute
  disputeTitle: string;
  disputeReason: string;
  disputeNote: string;
  disputeSubmitted: string;
  // Credit Request
  creditRequestTitle: string;
  currentLimit: string;
  desiredLimit: string;
  reason: string;
  requestSubmitted: string;
}

export const en: Translations = {
  home: 'Home', pay: 'Pay', history: 'History', profile: 'Profile',
  available: 'Available', creditLimit: 'Credit Limit', used: 'Used',
  total: 'Total', transactions: 'Transactions', remaining: 'Remaining',
  search: 'Search', cancel: 'Cancel', confirm: 'Confirm', submit: 'Submit',
  close: 'Close', add: 'Add', delete: 'Delete',
  goodMorning: 'Good Morning', goodAfternoon: 'Good Afternoon', goodEvening: 'Good Evening',
  availableCredit: 'Available Credit', quickActions: 'Quick Actions',
  payAtStore: 'Pay at Store', viewQR: 'View QR', statement: 'Statement',
  analytics: 'Analytics', findStore: 'Find Store',
  thisMonth: 'This Month', recentTransactions: 'Recent Transactions',
  seeAll: 'See All', nextDeduction: 'Next Deduction',
  payTitle: 'Pay at Store', paySub: 'Present QR code to the OK cashier',
  showCashier: 'Show this code to the cashier at any OK store',
  confirmWithPin: 'Confirm with PIN',
  historyTitle: 'Transaction History', historySub: 'Your OK Civil Servant purchases',
  totalSpent: 'Total Spent', noTransactions: 'No transactions found',
  profileTitle: 'Profile', personalDetails: 'Personal Details',
  employmentDetails: 'Employment Details', deductionSchedule: 'Deduction Schedule',
  appearance: 'Appearance', themeMode: 'Theme Mode', settings: 'Settings',
  language: 'Language', changePIN: 'Change PIN', notifications: 'Push Notifications',
  helpSupport: 'Help & Support', terms: 'Terms & Conditions', signOut: 'Sign Out',
  biometricLogin: 'Biometric Login', autoDarkMode: 'Auto Dark Mode Schedule',
  familyAccounts: 'Family Sub-accounts', addFamilyMember: '+ Add Family Member',
  creditRequest: 'Request Credit Limit Increase', downloadStatement: 'Download Statement PDF',
  shoppingList: 'Shopping List',
  analyticsTitle: 'Spending Analytics', spendingByCategory: 'By Category',
  monthlyTrend: 'Monthly Trend', avgDailySpend: 'Avg Daily Spend',
  storesTitle: 'Find a Store', allStores: 'All', open: 'Open', kmAway: 'km away',
  shoppingListTitle: 'Shopping List', addItem: 'Add Item',
  estimatedTotal: 'Estimated Total', clearCompleted: 'Clear Completed',
  itemName: 'Item name', estimatedPrice: 'Est. price ($)',
  disputeTitle: 'Dispute Transaction', disputeReason: 'Reason',
  disputeNote: 'Additional notes (optional)', disputeSubmitted: 'Dispute submitted successfully.',
  creditRequestTitle: 'Credit Limit Request', currentLimit: 'Current Limit',
  desiredLimit: 'Desired Limit ($)', reason: 'Reason for increase',
  requestSubmitted: 'Your request has been submitted. We will review and respond within 5 business days.',
};

export const sn: Translations = {
  home: 'Musha', pay: 'Bhadhara', history: 'Nhoroondo', profile: 'Purofile',
  available: 'Inowanikwa', creditLimit: 'Muganho weKredhiti', used: 'Yashandiswa',
  total: 'Yese', transactions: 'Mishandiro', remaining: 'Yasara',
  search: 'Tsvaga', cancel: 'Dzima', confirm: 'Simbisa', submit: 'Tumira',
  close: 'Vhara', add: 'Wedzera', delete: 'Bvisa',
  goodMorning: 'Mangwanani Akanaka', goodAfternoon: 'Masikati Akanaka', goodEvening: 'Manheru Akanaka',
  availableCredit: 'Kredhiti Inowanikwa', quickActions: 'Zviito Zvikurumidze',
  payAtStore: 'Bhadhara muShop', viewQR: 'Ona QR', statement: 'Chirevo',
  analytics: 'Ongororo', findStore: 'Tsvaga Shop',
  thisMonth: 'Mwedzi Uno', recentTransactions: 'Mishandiro Yapfuura',
  seeAll: 'Ona Yese', nextDeduction: 'Kutorwa Kunotevera',
  payTitle: 'Bhadhara muShop', paySub: 'Ratidza kodhiyi QR kuna cashier',
  showCashier: 'Ratidza kodhiyi iyi kuna cashier kuOK store',
  confirmWithPin: 'Simbisa nePIN',
  historyTitle: 'Nhoroondo yeMishandiro', historySub: 'Zvakutengeswa kweOK Civil Servant',
  totalSpent: 'Yese Yakashandiswa', noTransactions: 'Hapana mishandiro yakawanikwa',
  profileTitle: 'Purofile', personalDetails: 'Ruzivo Rwako',
  employmentDetails: 'Ruzivo rweBasa', deductionSchedule: 'Nguva yekutorwa',
  appearance: 'Maonero', themeMode: 'Maitiro eTheme', settings: 'Magadziriro',
  language: 'Mutauro', changePIN: 'Shandura PIN', notifications: 'Zivisiro',
  helpSupport: 'Rubatsiro', terms: 'Mirayiridzo', signOut: 'Buda',
  biometricLogin: 'Biometric Login', autoDarkMode: 'Nguva yeDark Mode',
  familyAccounts: 'Akaunti dzeHumhuri', addFamilyMember: '+ Wedzera Nhengo',
  creditRequest: 'Kumbira Kukwira kweKredhiti', downloadStatement: 'Dhawunilodha Chirevo',
  shoppingList: 'Rondedzero yekutenga',
  analyticsTitle: 'Ongororo yekushandisa', spendingByCategory: 'Nerudzi',
  monthlyTrend: 'Mwedzi Nemwedzi', avgDailySpend: 'Mazuva ose',
  storesTitle: 'Tsvaga Shop', allStores: 'Dzese', open: 'Yakavhurwa', kmAway: 'km kure',
  shoppingListTitle: 'Rondedzero', addItem: 'Wedzera Chinhu',
  estimatedTotal: 'Yese Yakafungidzirwa', clearCompleted: 'Bvisa Zvakagadzirwa',
  itemName: 'Zita rechinhu', estimatedPrice: 'Mutengo (US$)',
  disputeTitle: 'Kurerutsa Mushandiro', disputeReason: 'Chikonzero',
  disputeNote: 'Zvimwe zvinhu', disputeSubmitted: 'Kukumbira kwatumirwa.',
  creditRequestTitle: 'Kukumbira Kredhiti', currentLimit: 'Muganho Wazviwa',
  desiredLimit: 'Muganho Unodikanwa (US$)', reason: 'Chikonzero chekukwira',
  requestSubmitted: 'Chikumbiro chako chatumirwa. Tichapindura mukati memazuva mashanu ebasa.',
};

export const nd: Translations = {
  home: 'Ikhaya', pay: 'Khokha', history: 'Umlando', profile: 'Iprofayili',
  available: 'Iyatholakala', creditLimit: 'Umkhawulo weKhredithi', used: 'Isetyenzisiwe',
  total: 'Isamba', transactions: 'Imisebenzi', remaining: 'Esisele',
  search: 'Cinga', cancel: 'Khansela', confirm: 'Qinisekisa', submit: 'Thumela',
  close: 'Vala', add: 'Engeza', delete: 'Susa',
  goodMorning: 'Livukile', goodAfternoon: 'Lihle emini', goodEvening: 'Lihlabile',
  availableCredit: 'Ikhredithi Etholakala', quickActions: 'Izenzo Ezikhawulezayo',
  payAtStore: 'Khokha eSitolo', viewQR: 'Bona QR', statement: 'Isitatimende',
  analytics: 'Ukuhlaziywa', findStore: 'Thola Isitolo',
  thisMonth: 'Inyanga Le', recentTransactions: 'Imisebenzi Yakamuva',
  seeAll: 'Bona Konke', nextDeduction: 'Ukususwa Okulandelayo',
  payTitle: 'Khokha eSitolo', paySub: 'Khombisa ikhodi ye-QR kuka-cashier',
  showCashier: 'Khombisa ikhodi le ku-cashier eSitolo se-OK',
  confirmWithPin: 'Qinisekisa nge-PIN',
  historyTitle: 'Umlando weziMali', historySub: 'Ukuthenga kwakho kwe-OK Civil Servant',
  totalSpent: 'Esachithe', noTransactions: 'Ayikho imisebenzi etholiwe',
  profileTitle: 'Iprofayili', personalDetails: 'Imininingwane Yomuntu',
  employmentDetails: 'Imininingwane Yomsebenzi', deductionSchedule: 'Isikhathi Sokususwa',
  appearance: 'Ukubukeka', themeMode: 'Indlela yeTheme', settings: 'Izilungiselelo',
  language: 'Ulimi', changePIN: 'Shintsha i-PIN', notifications: 'Izaziso',
  helpSupport: 'Usizo', terms: 'Imigomo', signOut: 'Phuma',
  biometricLogin: 'Ukungena ngoBiometric', autoDarkMode: 'Isikhathi se-Dark Mode',
  familyAccounts: 'Ama-akhawunti Omndeni', addFamilyMember: '+ Engeza Ilungu',
  creditRequest: 'Cela Ukukhula kweKhredithi', downloadStatement: 'Landa iSitatimende',
  shoppingList: 'Uhlu lwezinto',
  analyticsTitle: 'Ukuhlaziywa kwendleko', spendingByCategory: 'Ngohlobo',
  monthlyTrend: 'Inyanga ngeNyanga', avgDailySpend: 'Nsuku zonke',
  storesTitle: 'Thola iSitolo', allStores: 'Zonke', open: 'Kuvuliwe', kmAway: 'km kude',
  shoppingListTitle: 'Uhlu lwezinto', addItem: 'Engeza Into',
  estimatedTotal: 'Isamba Esilindelekile', clearCompleted: 'Susa eZenziwe',
  itemName: 'Igama lento', estimatedPrice: 'Intengo (US$)',
  disputeTitle: 'Phikisa umsebenzi', disputeReason: 'Isizathu',
  disputeNote: 'Izinkomba ezengeziwe', disputeSubmitted: 'Isikhalo sithunyiwe.',
  creditRequestTitle: 'Isicelo seKhredithi', currentLimit: 'Umkhawulo Wamanje',
  desiredLimit: 'Umkhawulo Ofunekayo (US$)', reason: 'Isizathu sokukhula',
  requestSubmitted: 'Isicelo sakho sithunyiwe. Sizaphendula phakathi kwezinsuku ezinhlanu zebhizinisi.',
};

export const LOCALES: Record<Locale, Translations> = { en, sn, nd };

export const LOCALE_LABELS: Record<Locale, string> = {
  en: '🇬🇧  English',
  sn: '🇿🇼  ChiShona',
  nd: '🇿🇼  isiNdebele',
};
