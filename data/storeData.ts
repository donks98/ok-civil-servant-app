export type StoreType = 'OK' | 'BonMarche' | 'OKmart';

export interface StoreLocation {
  id: string;
  name: string;
  type: StoreType;
  address: string;
  suburb: string;
  city: string;
  distance: number;
  hours: string;
  phone: string;
  isOpen: boolean;
}

export const MOCK_STORES: StoreLocation[] = [
  { id: 'OK-001', name: 'OK Borrowdale', type: 'OK', address: 'Shop 12, Borrowdale Village', suburb: 'Borrowdale', city: 'Harare', distance: 1.2, hours: '08:00 – 20:00', phone: '+263 4 882 100', isOpen: true },
  { id: 'OK-002', name: 'OK Sam Levy\'s', type: 'OK', address: 'Sam Levy\'s Village, Borrowdale', suburb: 'Borrowdale', city: 'Harare', distance: 1.8, hours: '08:00 – 21:00', phone: '+263 4 882 200', isOpen: true },
  { id: 'OK-003', name: 'OK Eastgate', type: 'OK', address: 'Eastgate Mall, Robert Mugabe Rd', suburb: 'CBD', city: 'Harare', distance: 3.5, hours: '08:00 – 19:00', phone: '+263 4 753 300', isOpen: true },
  { id: 'OK-004', name: 'OK Bulawayo City', type: 'OK', address: '93 Jason Moyo Street', suburb: 'City Centre', city: 'Bulawayo', distance: 8.4, hours: '08:00 – 18:30', phone: '+263 9 888 001', isOpen: false },
  { id: 'OK-005', name: 'OK Kwekwe', type: 'OK', address: 'Robert Mugabe Way', suburb: 'Kwekwe CBD', city: 'Kwekwe', distance: 15.2, hours: '08:00 – 18:00', phone: '+263 55 222 100', isOpen: true },
  { id: 'BM-001', name: 'Bon Marché Avondale', type: 'BonMarche', address: '23 Avondale Shopping Centre', suburb: 'Avondale', city: 'Harare', distance: 2.1, hours: '07:30 – 20:30', phone: '+263 4 302 400', isOpen: true },
  { id: 'BM-002', name: 'Bon Marché Msasa', type: 'BonMarche', address: 'Msasa Shopping Centre', suburb: 'Msasa', city: 'Harare', distance: 4.7, hours: '07:30 – 20:00', phone: '+263 4 447 500', isOpen: true },
  { id: 'BM-003', name: 'Bon Marché Bulawayo', type: 'BonMarche', address: 'Shoprite Centre, Fife Street', suburb: 'City Centre', city: 'Bulawayo', distance: 9.1, hours: '08:00 – 19:00', phone: '+263 9 642 600', isOpen: true },
  { id: 'BM-004', name: 'Bon Marché Gweru', type: 'BonMarche', address: 'Robert Mugabe Way, Gweru', suburb: 'Gweru CBD', city: 'Gweru', distance: 22.6, hours: '08:00 – 18:00', phone: '+263 54 223 700', isOpen: false },
  { id: 'OKM-001', name: 'OKmart Graniteside', type: 'OKmart', address: 'Unit 5, Graniteside Industrial', suburb: 'Graniteside', city: 'Harare', distance: 5.3, hours: '08:00 – 18:00', phone: '+263 4 666 800', isOpen: true },
  { id: 'OKM-002', name: 'OKmart Highfield', type: 'OKmart', address: '44 Highfield Shopping Centre', suburb: 'Highfield', city: 'Harare', distance: 7.8, hours: '08:00 – 18:30', phone: '+263 4 621 900', isOpen: true },
  { id: 'OKM-003', name: 'OKmart Mutare', type: 'OKmart', address: 'Third Street Mall, Mutare', suburb: 'CBD', city: 'Mutare', distance: 35.4, hours: '08:00 – 17:30', phone: '+263 20 644 010', isOpen: true },
];

export const STORE_TYPE_COLORS: Record<StoreType, string> = {
  OK: '#CC0000',
  BonMarche: '#0066CC',
  OKmart: '#00843D',
};

export const STORE_TYPE_LABELS: Record<StoreType, string> = {
  OK: 'OK Stores',
  BonMarche: 'Bon Marché',
  OKmart: 'OKmart',
};
