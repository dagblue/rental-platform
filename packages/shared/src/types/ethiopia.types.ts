// Ethiopian-specific types and constants

export enum EthiopianRegion {
    ADDIS_ABABA = 'ADDIS_ABABA',
    AFAR = 'AFAR',
    AMHARA = 'AMHARA',
    BENISHANGUL_GUMUZ = 'BENISHANGUL_GUMUZ',
    DIRE_DAWA = 'DIRE_DAWA',
    GAMBELA = 'GAMBELA',
    HARARI = 'HARARI',
    OROMIA = 'OROMIA',
    SIDAMA = 'SIDAMA',
    SOMALI = 'SOMALI',
    SOUTH_WEST = 'SOUTH_WEST',
    TIGRAY = 'TIGRAY',
    SOUTHERN = 'SOUTHERN'
  }
  
  export enum EthiopianCity {
    ADDIS_ABABA = 'ADDIS_ABABA',
    DIRE_DAWA = 'DIRE_DAWA',
    BAHIR_DAR = 'BAHIR_DAR',
    MEKELLE = 'MEKELLE',
    AWASA = 'AWASA',
    JIMMA = 'JIMMA',
    HARAR = 'HARAR',
    GONDAR = 'GONDAR',
    DESSIE = 'DESSIE',
    NEKEMTE = 'NEKEMTE',
    SHASHAMANE = 'SHASHAMANE',
    ASSELA = 'ASSELA',
    ARBA_MINCH = 'ARBA_MINCH',
    SODO = 'SODO',
    ASOSA = 'ASOSA',
    GAMBELLA = 'GAMBELLA',
    JIJIGA = 'JIJIGA',
    ADAMA = 'ADAMA',
    AMBO = 'AMBO',
    DEBRE_BIRHAN = 'DEBRE_BIRHAN',
    DEBRE_MARKOS = 'DEBRE_MARKOS',
    HAWASSA = 'HAWASSA',
    WOLKITE = 'WOLKITE'
  }
  
  export enum EthiopianLanguage {
    AMHARIC = 'am',
    ENGLISH = 'en',
    OROMO = 'om',
    TIGRIGNA = 'ti',
    SOMALI = 'so',
    AFAR = 'aa',
    WOLAYTTA = 'wal'
  }
  
  export enum EthiopianCalendarMonth {
    MESKEREM = 'MESKEREM',
    TIKIMT = 'TIKIMT',
    HIDAR = 'HIDAR',
    TAHSAS = 'TAHSAS',
    TIR = 'TIR',
    YEKATIT = 'YEKATIT',
    MEGABIT = 'MEGABIT',
    MIAZIA = 'MIAZIA',
    GENBOT = 'GENBOT',
    SENE = 'SENE',
    HAMLE = 'HAMLE',
    NEHASE = 'NEHASE',
    PAGUMEN = 'PAGUMEN'
  }
  
  export enum MobileMoneyProvider {
    M_PESA = 'M_PESA',
    TELEBIRR = 'TELEBIRR',
    CBE_BIRR = 'CBE_BIRR',
    HELLO_CASH = 'HELLO_CASH',
    AMOLE = 'AMOLE',
    BANK_TRANSFER = 'BANK_TRANSFER'
  }
  
  export enum EthiopianBank {
    COMMERCIAL_BANK_OF_ETHIOPIA = 'CBE',
    AWASH_BANK = 'AWASH',
    DASHEN_BANK = 'DASHEN',
    BANK_OF_ABYSSINIA = 'BOA',
    WEGAGEN_BANK = 'WEGAGEN',
    NIB_INTERNATIONAL_BANK = 'NIB',
    COOPERATIVE_BANK_OF_OROMIA = 'CBO',
    LION_INTERNATIONAL_BANK = 'LION',
    ZEMEN_BANK = 'ZEMEN',
    BUNNA_INTERNATIONAL_BANK = 'BUNNA',
    BERHAN_BANK = 'BERHAN',
    ABYSSINIA_BANK = 'ABYSSINIA',
    ADDIS_BANK = 'ADDIS',
    ENAT_BANK = 'ENAT',
    HIJRA_BANK = 'HIJRA',
    SHABELLE_BANK = 'SHABELLE',
    SIBA_BANK = 'SIBA',
    ZAMZAM_BANK = 'ZAMZAM'
  }
  
  export interface EthiopianAddress {
    region: EthiopianRegion;
    zone: string;
    woreda: string;
    kebele: string;
    city: EthiopianCity;
    subcity: string;
    houseNumber: string;
    landmark: string | null;
    coordinates: {
      lat: number;
      lng: number;
    };
    formattedAddress: string;
  }
  
  export interface EthiopianPhoneNumber {
    countryCode: '+251';
    number: string; // 9XXXXXXXX
    formatted: string; // +251 9X XXX XXXX
    isValid: boolean;
    provider: 'ETHIO_TELECOM' | 'SAFARICOM' | 'OTHER';
  }
  
  export interface EthiopianBusinessHours {
    // Ethiopian business hours (typically 8:30 AM - 5:30 PM with lunch break)
    opensAt: string; // "08:30"
    closesAt: string; // "17:30"
    lunchStart: string; // "12:30"
    lunchEnd: string; // "13:30"
    workingDays: number[]; // [0, 1, 2, 3, 4] Monday-Friday
    is24Hours: boolean;
  }
  
  export interface EthiopianHoliday {
    name: string;
    amharicName: string;
    date: Date;
    type: 'NATIONAL' | 'RELIGIOUS' | 'REGIONAL';
    description: string;
    affectsBusiness: boolean;
  }
  
  export interface ExchangeRate {
    from: 'USD' | 'EUR' | 'GBP';
    to: 'ETB';
    rate: number;
    lastUpdated: Date;
    source: 'NBE' | 'COMMERCIAL_BANKS' | 'BLACK_MARKET';
  }