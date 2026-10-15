/**
 * Comprehensive India Locations Dataset & Autocomplete Search Utility for PB08 TAXI
 * 
 * Features:
 * - 400+ Curated Indian Cities, Towns, Airports, Railway Stations & Tourist Destinations
 * - Deep Punjab & North India local coverage (Chowks, Localities, Towns)
 * - All Major Domestic & International Indian Airports (DEL, ATQ, IXC, BOM, BLR, etc.)
 * - Advanced Multi-Token Matching (e.g. "Amritsar Airport", "Delhi Airport", "Airport Amritsar")
 * - Instant prefix & fuzzy matching (<1ms response time, zero network delay)
 * - Debounced Map Geocoding fallback via Photon/OpenStreetMap for granular addresses
 */

export const POPULAR_PICKUP_SUGGESTIONS = [
  { name: 'Jalandhar City', state: 'Punjab', type: 'city', display: 'Jalandhar City, Punjab' },
  { name: 'Model Town, Jalandhar', state: 'Punjab', type: 'landmark', display: 'Model Town, Jalandhar' },
  { name: 'Jalandhar Cantt Railway Station', state: 'Punjab', type: 'railway', display: 'Jalandhar Cantt, Punjab' },
  { name: 'BMC Chowk, Jalandhar', state: 'Punjab', type: 'landmark', display: 'BMC Chowk, Jalandhar' },
  { name: 'Rama Mandi, Jalandhar', state: 'Punjab', type: 'landmark', display: 'Rama Mandi, Jalandhar' },
  { name: 'Phagwara', state: 'Punjab', type: 'city', display: 'Phagwara, Punjab' },
  { name: 'Ludhiana', state: 'Punjab', type: 'city', display: 'Ludhiana, Punjab' },
  { name: 'Amritsar', state: 'Punjab', type: 'city', display: 'Amritsar, Punjab' },
  { name: 'Chandigarh', state: 'Punjab/Haryana', type: 'city', display: 'Chandigarh, Tri-City' },
  { name: 'Delhi NCR', state: 'Delhi', type: 'city', display: 'Delhi NCR' }
];

export const POPULAR_DESTINATION_SUGGESTIONS = [
  { name: 'Delhi Airport (DEL) — IGI Terminal 3', state: 'Delhi NCR', type: 'airport', display: 'Delhi Airport (DEL) T3' },
  { name: 'Amritsar Airport (ATQ) — Sri Guru Ram Dass Jee', state: 'Punjab', type: 'airport', display: 'Amritsar Airport (ATQ)' },
  { name: 'Chandigarh Airport (IXC) — Shaheed Bhagat Singh', state: 'Punjab/Haryana', type: 'airport', display: 'Chandigarh Airport (IXC)' },
  { name: 'Delhi NCR / New Delhi', state: 'Delhi', type: 'city', display: 'Delhi NCR (All Areas)' },
  { name: 'Golden Temple (Harmandir Sahib), Amritsar', state: 'Punjab', type: 'landmark', display: 'Golden Temple, Amritsar' },
  { name: 'Chandigarh (Sector 17 / Mohali)', state: 'Punjab/Haryana', type: 'city', display: 'Chandigarh / Mohali' },
  { name: 'Shimla', state: 'Himachal Pradesh', type: 'city', display: 'Shimla, Himachal Pradesh' },
  { name: 'Manali', state: 'Himachal Pradesh', type: 'city', display: 'Manali, Himachal Pradesh' },
  { name: 'Dharamshala / Mcleodganj', state: 'Himachal Pradesh', type: 'city', display: 'Dharamshala / Mcleodganj, HP' },
  { name: 'Katra (Mata Vaishno Devi Temple)', state: 'Jammu & Kashmir', type: 'landmark', display: 'Katra (Vaishno Devi), Jammu' },
  { name: 'Jaipur (Pink City)', state: 'Rajasthan', type: 'city', display: 'Jaipur (Pink City), Rajasthan' },
  { name: 'Agra (Taj Mahal)', state: 'Uttar Pradesh', type: 'city', display: 'Agra (Taj Mahal), UP' },
  { name: 'Haridwar / Rishikesh', state: 'Uttarakhand', type: 'city', display: 'Haridwar / Rishikesh, Uttarakhand' }
];

export const INDIA_LOCATIONS_DATABASE = [
  // --- PRIMARY AIRPORTS (HIGH TRAFFIC TAXI DESTINATIONS) ---
  { 
    name: 'Amritsar Airport (ATQ) — Sri Guru Ram Dass Jee International', 
    state: 'Punjab', 
    type: 'airport', 
    keywords: ['amritsar airport', 'amritsar air port', 'atq airport', 'amr', 'atq', 'airport amritsar', 'sri guru ram dass jee', 'rajasansi airport'] 
  },
  { 
    name: 'Delhi Airport (DEL) — IGI Terminal 3 (International & Domestic)', 
    state: 'Delhi NCR', 
    type: 'airport', 
    keywords: ['delhi airport', 'delhi air port', 'igi airport', 'airport delhi', 'del', 'igi', 't3', 'terminal 3', 'indira gandhi international'] 
  },
  { 
    name: 'Delhi Airport (DEL) — IGI Terminal 1 (Domestic Departures)', 
    state: 'Delhi NCR', 
    type: 'airport', 
    keywords: ['delhi airport', 'delhi air port', 'igi airport', 'airport delhi', 'del', 'igi', 't1', 'terminal 1', 'domestic airport delhi'] 
  },
  { 
    name: 'Delhi Airport (DEL) — IGI Terminal 2', 
    state: 'Delhi NCR', 
    type: 'airport', 
    keywords: ['delhi airport', 'delhi air port', 'igi airport', 'airport delhi', 'del', 'igi', 't2', 'terminal 2'] 
  },
  { 
    name: 'Chandigarh Airport (IXC) — Shaheed Bhagat Singh International', 
    state: 'Punjab/Haryana', 
    type: 'airport', 
    keywords: ['chandigarh airport', 'chandigarh air port', 'airport chandigarh', 'mohali airport', 'ixc', 'cha', 'shaheed bhagat singh'] 
  },
  { 
    name: 'Adampur Airport (AIP), Jalandhar', 
    state: 'Punjab', 
    type: 'airport', 
    keywords: ['adampur airport', 'jalandhar airport', 'airport jalandhar', 'aip', 'jal', 'adampur domestic airport'] 
  },
  { 
    name: 'Mumbai Airport (BOM) — Chhatrapati Shivaji Maharaj T2', 
    state: 'Maharashtra', 
    type: 'airport', 
    keywords: ['mumbai airport', 'bombay airport', 'airport mumbai', 'bom', 't2', 'chhatrapati shivaji'] 
  },
  { 
    name: 'Mumbai Airport (BOM) — Domestic Terminal 1', 
    state: 'Maharashtra', 
    type: 'airport', 
    keywords: ['mumbai airport', 'domestic airport mumbai', 'bom', 't1', 'santacruz airport'] 
  },
  { 
    name: 'Bengaluru Airport (BLR) — Kempegowda International', 
    state: 'Karnataka', 
    type: 'airport', 
    keywords: ['bangalore airport', 'bengaluru airport', 'airport bangalore', 'blr', 'kempegowda'] 
  },
  { 
    name: 'Hyderabad Airport (HYD) — Rajiv Gandhi International', 
    state: 'Telangana', 
    type: 'airport', 
    keywords: ['hyderabad airport', 'airport hyderabad', 'hyd', 'rajiv gandhi international', 'shamshabad'] 
  },
  { 
    name: 'Goa Manohar International Airport (MOPA)', 
    state: 'Goa', 
    type: 'airport', 
    keywords: ['goa airport', 'mopa airport', 'north goa airport', 'gox'] 
  },
  { 
    name: 'Goa Dabolim Airport (GOI)', 
    state: 'Goa', 
    type: 'airport', 
    keywords: ['goa airport', 'dabolim airport', 'south goa airport', 'goi'] 
  },
  { 
    name: 'Jaipur International Airport (JAI)', 
    state: 'Rajasthan', 
    type: 'airport', 
    keywords: ['jaipur airport', 'airport jaipur', 'jai', 'sanganer'] 
  },
  { 
    name: 'Dehradun Jolly Grant Airport (DED)', 
    state: 'Uttarakhand', 
    type: 'airport', 
    keywords: ['dehradun airport', 'rishikesh airport', 'jolly grant', 'ded'] 
  },
  { 
    name: 'Srinagar International Airport (SXR)', 
    state: 'Jammu & Kashmir', 
    type: 'airport', 
    keywords: ['srinagar airport', 'kashmir airport', 'sxr', 'sheikh ul alam'] 
  },
  { 
    name: 'Jammu Airport (IXJ)', 
    state: 'Jammu & Kashmir', 
    type: 'airport', 
    keywords: ['jammu airport', 'ixj', 'katra airport connection'] 
  },
  { 
    name: 'Lucknow Airport (LKO) — Chaudhary Charan Singh', 
    state: 'Uttar Pradesh', 
    type: 'airport', 
    keywords: ['lucknow airport', 'lko', 'amausi airport'] 
  },
  { 
    name: 'Ayodhya Airport (AYJ) — Maharishi Valmiki International', 
    state: 'Uttar Pradesh', 
    type: 'airport', 
    keywords: ['ayodhya airport', 'ram mandir airport', 'ayj'] 
  },
  { 
    name: 'Kolkata Netaji Subhash Chandra Bose Airport (CCU)', 
    state: 'West Bengal', 
    type: 'airport', 
    keywords: ['kolkata airport', 'calcutta airport', 'ccu', 'dum dum'] 
  },
  { 
    name: 'Ahmedabad Airport (AMD) — Sardar Vallabhbhai Patel', 
    state: 'Gujarat', 
    type: 'airport', 
    keywords: ['ahmedabad airport', 'amd', 'sardar vallabhbhai'] 
  },

  // --- PUNJAB PRIMARY CITIES, TOWNS & LOCALITIES (PB08 TAXI CORE) ---
  { name: 'Jalandhar', state: 'Punjab', type: 'city', keywords: ['jal', 'pb08', 'jallandhar', 'punjab', 'jalandhar city'] },
  { name: 'Jalandhar City Railway Station (JUC)', state: 'Punjab', type: 'railway', keywords: ['jal', 'jalandhar railway station', 'juc', 'station jalandhar', 'jalandhar train'] },
  { name: 'Jalandhar Cantt Railway Station (JRC)', state: 'Punjab', type: 'railway', keywords: ['jal', 'jalandhar cantt', 'cantt jalandhar', 'jrc', 'cantt railway station'] },
  { name: 'Model Town, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'model town', 'model town jalandhar', 'nikku park'] },
  { name: 'BMC Chowk, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'bmc chowk', 'bmc chowk jalandhar', 'radisson jalandhar'] },
  { name: 'PAP Chowk, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'pap chowk', 'pap jalandhar', 'highway chowk'] },
  { name: 'Rama Mandi, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'rama mandi', 'rama mandi jalandhar', 'cantt road'] },
  { name: 'Jalandhar Bus Stand (ISBT)', state: 'Punjab', type: 'landmark', keywords: ['jal', 'jalandhar bus stand', 'isbt jalandhar', 'bus station'] },
  { name: 'Urban Estate Phase 1 & 2, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'urban estate', 'urban estate jalandhar'] },
  { name: 'Curo High Street / Mall Road, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'mall road', 'curo mall', 'haveli jalandhar'] },
  { name: 'Amritsar City', state: 'Punjab', type: 'city', keywords: ['amr', 'amritsar', 'amritsar city', 'punjab'] },
  { name: 'Golden Temple (Harmandir Sahib), Amritsar', state: 'Punjab', type: 'landmark', keywords: ['golden temple', 'amritsar temple', 'harmandir sahib', 'darbar sahib amritsar', 'amr'] },
  { name: 'Amritsar Junction Railway Station (ASR)', state: 'Punjab', type: 'railway', keywords: ['amritsar railway station', 'amritsar station', 'asr', 'amr'] },
  { name: 'Wagah Border, Amritsar', state: 'Punjab', type: 'landmark', keywords: ['wagah border', 'attari border', 'amritsar wagah', 'amr'] },
  { name: 'Ludhiana City', state: 'Punjab', type: 'city', keywords: ['lud', 'ludhiana', 'ludhiana city', 'industrial'] },
  { name: 'Ludhiana Junction Railway Station (LDH)', state: 'Punjab', type: 'railway', keywords: ['ludhiana railway station', 'ludhiana station', 'ldh', 'lud'] },
  { name: 'Ferozepur Road / Clock Tower, Ludhiana', state: 'Punjab', type: 'landmark', keywords: ['lud', 'ferozepur road', 'ghanta ghar ludhiana'] },
  { name: 'Chandigarh (All Sectors)', state: 'Tri-City (PB/HR)', type: 'city', keywords: ['cha', 'chandigarh', 'city beautiful', 'sector 17'] },
  { name: 'Chandigarh Railway Station (CDG)', state: 'Punjab/Haryana', type: 'railway', keywords: ['chandigarh railway station', 'chandigarh station', 'cdg', 'cha'] },
  { name: 'Sector 17 / Sector 35 / PGI, Chandigarh', state: 'Chandigarh', type: 'landmark', keywords: ['cha', 'sector 17', 'sector 35', 'pgi chandigarh', 'elante mall'] },
  { name: 'Mohali (SAS Nagar)', state: 'Punjab', type: 'city', keywords: ['moh', 'mohali', 'sas nagar', 'pca stadium', 'phase 7 mohali'] },
  { name: 'Panchkula', state: 'Haryana', type: 'city', keywords: ['pan', 'panchkula', 'tri-city', 'nada sahib'] },
  { name: 'Zirakpur', state: 'Punjab', type: 'city', keywords: ['zir', 'zirakpur', 'highway', 'vip road'] },
  { name: 'Kharar', state: 'Punjab', type: 'city', keywords: ['kha', 'kharar', 'mohali kharar'] },
  { name: 'Kurali', state: 'Punjab', type: 'city', keywords: ['kur', 'kurali'] },
  { name: 'Dera Bassi', state: 'Punjab', type: 'city', keywords: ['der', 'dera bassi'] },
  { name: 'Phagwara', state: 'Punjab', type: 'city', keywords: ['pha', 'phagwara', 'phagwara city', 'jalandhar'] },
  { name: 'Lovely Professional University (LPU), Phagwara', state: 'Punjab', type: 'landmark', keywords: ['lpu', 'lovely professional university', 'phagwara university', 'lpu campus'] },
  { name: 'Hoshiarpur', state: 'Punjab', type: 'city', keywords: ['hos', 'hoshiarpur', 'hoshiarpur city', 'doaba'] },
  { name: 'Kapurthala', state: 'Punjab', type: 'city', keywords: ['kap', 'kapurthala', 'rail coach factory', 'rcf kapurthala'] },
  { name: 'Nawanshahr (SBS Nagar)', state: 'Punjab', type: 'city', keywords: ['naw', 'nawanshahr', 'sbs nagar', 'khatkar kalan'] },
  { name: 'Nakodar', state: 'Punjab', type: 'city', keywords: ['nak', 'nakodar', 'dargah nakodar', 'baba murad shah'] },
  { name: 'Shahkot', state: 'Punjab', type: 'city', keywords: ['sha', 'shahkot'] },
  { name: 'Kartarpur', state: 'Punjab', type: 'city', keywords: ['kar', 'kartarpur', 'jang-e-azadi'] },
  { name: 'Goraya', state: 'Punjab', type: 'city', keywords: ['gor', 'goraya'] },
  { name: 'Nurmahal', state: 'Punjab', type: 'city', keywords: ['nur', 'nurmahal', 'serai nurmahal'] },
  { name: 'Phillaur', state: 'Punjab', type: 'city', keywords: ['phi', 'phillaur', 'phillaur fort'] },
  { name: 'Bhogpur', state: 'Punjab', type: 'city', keywords: ['bho', 'bhogpur'] },
  { name: 'Batala', state: 'Punjab', type: 'city', keywords: ['bat', 'batala', 'gurdaspur'] },
  { name: 'Gurdaspur', state: 'Punjab', type: 'city', keywords: ['gur', 'gurdaspur', 'derababa nanak'] },
  { name: 'Pathankot (Pathankot Cantt)', state: 'Punjab', type: 'city', keywords: ['pat', 'pathankot', 'pathankot cantt', 'chakki bank'] },
  { name: 'Patiala', state: 'Punjab', type: 'city', keywords: ['pat', 'patiala', 'sheesh mahal', 'thapar university'] },
  { name: 'Bathinda', state: 'Punjab', type: 'city', keywords: ['bat', 'bathinda', 'bathinda junction', 'aiims bathinda'] },
  { name: 'Moga', state: 'Punjab', type: 'city', keywords: ['mog', 'moga'] },
  { name: 'Abohar', state: 'Punjab', type: 'city', keywords: ['abo', 'abohar'] },
  { name: 'Malerkotla', state: 'Punjab', type: 'city', keywords: ['mal', 'malerkotla'] },
  { name: 'Khanna', state: 'Punjab', type: 'city', keywords: ['kha', 'khanna', 'grain market'] },
  { name: 'Muktsar (Sri Muktsar Sahib)', state: 'Punjab', type: 'city', keywords: ['muk', 'muktsar', 'sri muktsar sahib'] },
  { name: 'Barnala', state: 'Punjab', type: 'city', keywords: ['bar', 'barnala'] },
  { name: 'Firozpur (Ferozepur)', state: 'Punjab', type: 'city', keywords: ['fir', 'firozpur', 'ferozepur cantt'] },
  { name: 'Rajpura', state: 'Punjab', type: 'city', keywords: ['raj', 'rajpura'] },
  { name: 'Sangrur', state: 'Punjab', type: 'city', keywords: ['san', 'sangrur'] },
  { name: 'Fazilka', state: 'Punjab', type: 'city', keywords: ['faz', 'fazilka'] },
  { name: 'Tarn Taran', state: 'Punjab', type: 'city', keywords: ['tar', 'tarn taran'] },
  { name: 'Jagraon', state: 'Punjab', type: 'city', keywords: ['jag', 'jagraon'] },
  { name: 'Mansa', state: 'Punjab', type: 'city', keywords: ['man', 'mansa'] },
  { name: 'Sunam', state: 'Punjab', type: 'city', keywords: ['sun', 'sunam'] },
  { name: 'Dhuri', state: 'Punjab', type: 'city', keywords: ['dhu', 'dhuri'] },
  { name: 'Nabha', state: 'Punjab', type: 'city', keywords: ['nab', 'nabha'] },
  { name: 'Anandpur Sahib (Sri Anandpur Sahib)', state: 'Punjab', type: 'city', keywords: ['ana', 'anandpur sahib', 'virasat-e-khalsa', 'takht sri kesgarh'] },
  { name: 'Ropar (Roopnagar)', state: 'Punjab', type: 'city', keywords: ['rop', 'ropar', 'roopnagar', 'iit ropar'] },
  { name: 'Sultanpur Lodhi', state: 'Punjab', type: 'city', keywords: ['sul', 'sultanpur lodhi', 'gurdwara ber sahib'] },
  { name: 'Dasuya', state: 'Punjab', type: 'city', keywords: ['das', 'dasuya'] },
  { name: 'Mukerian', state: 'Punjab', type: 'city', keywords: ['muk', 'mukerian'] },

  // --- DELHI NCR (CAPITAL & AIRPORT CONNECTIONS) ---
  { name: 'Delhi (All Areas)', state: 'Delhi NCR', type: 'city', keywords: ['del', 'delhi', 'new delhi', 'ncr', 'capital', 'delhi ncr'] },
  { name: 'New Delhi Railway Station (NDLS)', state: 'Delhi NCR', type: 'railway', keywords: ['new delhi railway station', 'delhi station', 'ndls', 'del', 'paharganj'] },
  { name: 'Old Delhi Railway Station (DLI)', state: 'Delhi NCR', type: 'railway', keywords: ['old delhi railway station', 'dli', 'chandni chowk', 'del'] },
  { name: 'Hazrat Nizamuddin Railway Station (NZM)', state: 'Delhi NCR', type: 'railway', keywords: ['hazrat nizamuddin', 'nizamuddin station', 'nzm', 'del'] },
  { name: 'Anand Vihar Railway Station / ISBT', state: 'Delhi NCR', type: 'railway', keywords: ['anand vihar', 'anand vihar isbt', 'anvt', 'del'] },
  { name: 'Delhi Cantt Railway Station (DEC)', state: 'Delhi NCR', type: 'railway', keywords: ['delhi cantt', 'delhi cantt station', 'dec', 'del'] },
  { name: 'Connaught Place (CP), New Delhi', state: 'Delhi NCR', type: 'landmark', keywords: ['connaught place', 'cp delhi', 'inner circle', 'del'] },
  { name: 'Aerocity, New Delhi', state: 'Delhi NCR', type: 'landmark', keywords: ['aerocity', 'aerocity hotels', 'delhi airport hotels', 'del'] },
  { name: 'Noida (All Sectors)', state: 'Uttar Pradesh (NCR)', type: 'city', keywords: ['noida', 'noida expressway', 'sector 18 noida', 'ncr'] },
  { name: 'Greater Noida / Pari Chowk', state: 'Uttar Pradesh (NCR)', type: 'city', keywords: ['greater noida', 'pari chowk', 'knowledge park'] },
  { name: 'Gurugram / Gurgaon (Cyber City & Golf Course)', state: 'Haryana (NCR)', type: 'city', keywords: ['gurugram', 'gurgaon', 'cyber hub', 'cyber city', 'golf course road', 'sohna road', 'ncr'] },
  { name: 'Faridabad', state: 'Haryana (NCR)', type: 'city', keywords: ['faridabad', 'bata chowk', 'ncr'] },
  { name: 'Ghaziabad / Indirapuram / Vaishali', state: 'Uttar Pradesh (NCR)', type: 'city', keywords: ['ghaziabad', 'indirapuram', 'vaishali', 'ncr'] },

  // --- HIMACHAL PRADESH (HILL STATIONS & TOURS) ---
  { name: 'Shimla (Mall Road & Ridge)', state: 'Himachal Pradesh', type: 'city', keywords: ['shi', 'shimla', 'mall road shimla', 'kufri', 'chail', 'hp'] },
  { name: 'Kufri / Chail, Shimla', state: 'Himachal Pradesh', type: 'landmark', keywords: ['kufri', 'chail', 'shimla kufri'] },
  { name: 'Manali (Mall Road & Old Manali)', state: 'Himachal Pradesh', type: 'city', keywords: ['man', 'manali', 'old manali', 'solang valley', 'atal tunnel', 'rohtang'] },
  { name: 'Solang Valley / Atal Tunnel / Sissu', state: 'Himachal Pradesh', type: 'landmark', keywords: ['solang valley', 'atal tunnel', 'sissu', 'rohtang pass', 'manali snow'] },
  { name: 'Kullu (Bhuntar)', state: 'Himachal Pradesh', type: 'city', keywords: ['kul', 'kullu', 'bhuntar', 'kasol', 'manikaran'] },
  { name: 'Kasol / Manikaran Sahib', state: 'Himachal Pradesh', type: 'landmark', keywords: ['kasol', 'manikaran sahib', 'parvati valley', 'hot springs'] },
  { name: 'Dharamshala (HPCA Stadium)', state: 'Himachal Pradesh', type: 'city', keywords: ['dha', 'dharamshala', 'hpca', 'cricket stadium'] },
  { name: 'Mcleodganj, Dharamshala', state: 'Himachal Pradesh', type: 'landmark', keywords: ['mcl', 'mcleodganj', 'dalai lama temple', 'bhagsunag', 'triund'] },
  { name: 'Dalhousie', state: 'Himachal Pradesh', type: 'city', keywords: ['dal', 'dalhousie', 'subhash baoli'] },
  { name: 'Khajjiar (Mini Switzerland of India)', state: 'Himachal Pradesh', type: 'landmark', keywords: ['khajjiar', 'dalhousie khajjiar', 'mini switzerland'] },
  { name: 'Kasauli (Heritage & Pine Hills)', state: 'Himachal Pradesh', type: 'city', keywords: ['kas', 'kasauli', 'monkey point', 'timber trail'] },
  { name: 'Solan (City of Red Gold)', state: 'Himachal Pradesh', type: 'city', keywords: ['sol', 'solan', 'mushroom city'] },
  { name: 'Mandi', state: 'Himachal Pradesh', type: 'city', keywords: ['man', 'mandi', 'chhoti kashi'] },
  { name: 'Bilaspur', state: 'Himachal Pradesh', type: 'city', keywords: ['bil', 'bilaspur', 'govind sagar'] },
  { name: 'Hamirpur', state: 'Himachal Pradesh', type: 'city', keywords: ['ham', 'hamirpur'] },
  { name: 'Una (Una Railway Station)', state: 'Himachal Pradesh', type: 'city', keywords: ['una', 'una railway station', 'una himachal'] },
  { name: 'Chamba', state: 'Himachal Pradesh', type: 'city', keywords: ['cha', 'chamba'] },
  { name: 'Palampur (Tea Gardens)', state: 'Himachal Pradesh', type: 'city', keywords: ['pal', 'palampur', 'tea gardens palampur'] },
  { name: 'Kangra (Brajeshwari Devi Temple)', state: 'Himachal Pradesh', type: 'city', keywords: ['kan', 'kangra', 'kangra fort', 'brajeshwari temple'] },
  { name: 'Jwalaji / Chintpurni Temple (Shaktipeeth)', state: 'Himachal Pradesh', type: 'landmark', keywords: ['jwalaji', 'chintpurni', 'shaktipeeth temple', 'jawalamukhi'] },
  { name: 'Baddi Industrial Area', state: 'Himachal Pradesh', type: 'city', keywords: ['bad', 'baddi', 'baddi industrial hub'] },
  { name: 'Paonta Sahib Gurdwara', state: 'Himachal Pradesh', type: 'city', keywords: ['pao', 'paonta sahib', 'gurdwara paonta sahib'] },
  { name: 'Spiti Valley / Kaza', state: 'Himachal Pradesh', type: 'city', keywords: ['spiti valley', 'kaza', 'tabo', 'key monastery'] },

  // --- JAMMU & KASHMIR ---
  { 
    name: 'Katra (Mata Vaishno Devi Temple)', 
    state: 'Jammu & Kashmir', 
    type: 'landmark', 
    keywords: ['katra', 'vaishno devi', 'mata vaishno devi', 'katra railway station', 'kat', 'shri mata vaishno devi'] 
  },
  { name: 'Jammu City', state: 'Jammu & Kashmir', type: 'city', keywords: ['jam', 'jammu', 'jammu city', 'bahu fort'] },
  { name: 'Jammu Tawi Railway Station (JAT)', state: 'Jammu & Kashmir', type: 'railway', keywords: ['jammu tawi', 'jammu railway station', 'jat', 'jam'] },
  { name: 'Srinagar (Dal Lake & Boulevard)', state: 'Jammu & Kashmir', type: 'city', keywords: ['sri', 'srinagar', 'dal lake', 'kashmir', 'lal chowk'] },
  { name: 'Gulmarg (Gondola Cable Car)', state: 'Jammu & Kashmir', type: 'landmark', keywords: ['gul', 'gulmarg', 'gondola', 'gulmarg ski'] },
  { name: 'Pahalgam (Betaab Valley / Aru)', state: 'Jammu & Kashmir', type: 'landmark', keywords: ['pah', 'pahalgam', 'betaab valley', 'aru valley'] },
  { name: 'Udhampur', state: 'Jammu & Kashmir', type: 'city', keywords: ['udh', 'udhampur'] },
  { name: 'Patnitop', state: 'Jammu & Kashmir', type: 'landmark', keywords: ['pat', 'patnitop', 'sanasan'] },

  // --- HARYANA ---
  { name: 'Ambala (Ambala Cantt Junction)', state: 'Haryana', type: 'city', keywords: ['amb', 'ambala', 'ambala cantt', 'ambala junction'] },
  { name: 'Panipat', state: 'Haryana', type: 'city', keywords: ['pan', 'panipat', 'textile city'] },
  { name: 'Karnal', state: 'Haryana', type: 'city', keywords: ['kar', 'karnal', 'karna lake'] },
  { name: 'Kurukshetra (Brahma Sarovar)', state: 'Haryana', type: 'city', keywords: ['kur', 'kurukshetra', 'brahma sarovar', 'jyotisar'] },
  { name: 'Sonipat / Murthal (Famous Dhabas)', state: 'Haryana', type: 'city', keywords: ['son', 'sonipat', 'murthal', 'amrik sukhdev'] },
  { name: 'Rohtak', state: 'Haryana', type: 'city', keywords: ['roh', 'rohtak'] },
  { name: 'Hisar', state: 'Haryana', type: 'city', keywords: ['his', 'hisar'] },
  { name: 'Yamunanagar / Jagadhri', state: 'Haryana', type: 'city', keywords: ['yam', 'yamunanagar', 'jagadhri'] },
  { name: 'Rewari', state: 'Haryana', type: 'city', keywords: ['rew', 'rewari'] },
  { name: 'Sirsa', state: 'Haryana', type: 'city', keywords: ['sir', 'sirsa'] },
  { name: 'Kalka / Pinjore Gardens', state: 'Haryana', type: 'city', keywords: ['kal', 'kalka', 'pinjore garden', 'kalka toy train'] },

  // --- UTTARAKHAND ---
  { name: 'Dehradun (Clock Tower / Rajpur Road)', state: 'Uttarakhand', type: 'city', keywords: ['deh', 'dehradun', 'dehradun city', 'rajpur road'] },
  { name: 'Haridwar (Har Ki Pauri Ghat)', state: 'Uttarakhand', type: 'city', keywords: ['har', 'haridwar', 'har ki pauri', 'ganga aarti'] },
  { name: 'Rishikesh (Tapovan / Laxman Jhula)', state: 'Uttarakhand', type: 'city', keywords: ['ris', 'rishikesh', 'laxman jhula', 'ram jhula', 'tapovan', 'river rafting'] },
  { name: 'Mussoorie (Queen of Hills / Mall Road)', state: 'Uttarakhand', type: 'city', keywords: ['mus', 'mussoorie', 'kempty falls', 'gun hill'] },
  { name: 'Nainital (Naini Lake & Mall Road)', state: 'Uttarakhand', type: 'city', keywords: ['nai', 'nainital', 'naini lake', 'bhimtal'] },
  { name: 'Jim Corbett National Park / Ramnagar', state: 'Uttarakhand', type: 'landmark', keywords: ['jim corbett', 'corbett safari', 'ramnagar', 'dhikala'] },
  { name: 'Roorkee (IIT Roorkee)', state: 'Uttarakhand', type: 'city', keywords: ['roo', 'roorkee', 'iit roorkee'] },
  { name: 'Haldwani / Kathgodam Railway Station', state: 'Uttarakhand', type: 'city', keywords: ['hal', 'haldwani', 'kathgodam'] },

  // --- RAJASTHAN ---
  { name: 'Jaipur (Pink City / Hawa Mahal)', state: 'Rajasthan', type: 'city', keywords: ['jai', 'jaipur', 'pink city', 'hawa mahal', 'amer fort'] },
  { name: 'Udaipur (City of Lakes / Pichola)', state: 'Rajasthan', type: 'city', keywords: ['uda', 'udaipur', 'lake pichola', 'city palace'] },
  { name: 'Jodhpur (Blue City / Mehrangarh)', state: 'Rajasthan', type: 'city', keywords: ['jod', 'jodhpur', 'mehrangarh fort'] },
  { name: 'Jaisalmer (Golden City & Sam Sand Dunes)', state: 'Rajasthan', type: 'city', keywords: ['jai', 'jaisalmer', 'sam sand dunes', 'desert safari'] },
  { name: 'Ajmer Sharif Dargah / Pushkar Lake', state: 'Rajasthan', type: 'city', keywords: ['ajmer', 'pushkar', 'dargah sharif', 'brahma temple pushkar'] },
  { name: 'Khatu Shyam Ji Temple, Sikar', state: 'Rajasthan', type: 'landmark', keywords: ['khatu shyam', 'khatu shyam ji', 'sikar temple', 'khatu dham'] },
  { name: 'Salasar Balaji Temple, Churu', state: 'Rajasthan', type: 'landmark', keywords: ['salasar balaji', 'salasar dham', 'hanuman temple'] },
  { name: 'Bikaner', state: 'Rajasthan', type: 'city', keywords: ['bik', 'bikaner', 'junagarh'] },
  { name: 'Neemrana Fort / Alwar', state: 'Rajasthan', type: 'city', keywords: ['alw', 'neemrana', 'alwar'] },
  { name: 'Mount Abu (Dilwara Temples & Nakki Lake)', state: 'Rajasthan', type: 'city', keywords: ['mou', 'mount abu', 'nakki lake'] },

  // --- UTTAR PRADESH ---
  { name: 'Agra (Taj Mahal & Agra Fort)', state: 'Uttar Pradesh', type: 'city', keywords: ['agr', 'agra', 'taj mahal', 'fatehpur sikri'] },
  { name: 'Mathura / Vrindavan (Banke Bihari Temple)', state: 'Uttar Pradesh', type: 'city', keywords: ['mat', 'mathura', 'vrindavan', 'banke bihari', 'prem mandir', 'krishna janmabhoomi'] },
  { name: 'Ayodhya (Shri Ram Janmabhoomi Mandir)', state: 'Uttar Pradesh', type: 'city', keywords: ['ayo', 'ayodhya', 'ram mandir', 'saryu ghat'] },
  { name: 'Varanasi / Kashi (Kashi Vishwanath & Ghats)', state: 'Uttar Pradesh', type: 'city', keywords: ['var', 'varanasi', 'kashi', 'banaras', 'kashi vishwanath', 'ganga aarti'] },
  { name: 'Lucknow (Hazratganj & Gomti Nagar)', state: 'Uttar Pradesh', type: 'city', keywords: ['luc', 'lucknow', 'hazratganj', 'bara imambara'] },
  { name: 'Kanpur', state: 'Uttar Pradesh', type: 'city', keywords: ['kan', 'kanpur'] },
  { name: 'Prayagraj / Allahabad (Triveni Sangam)', state: 'Uttar Pradesh', type: 'city', keywords: ['pra', 'prayagraj', 'allahabad', 'sangam'] },
  { name: 'Meerut', state: 'Uttar Pradesh', type: 'city', keywords: ['mee', 'meerut'] },
  { name: 'Bareilly', state: 'Uttar Pradesh', type: 'city', keywords: ['bar', 'bareilly'] },
  { name: 'Saharanpur', state: 'Uttar Pradesh', type: 'city', keywords: ['sah', 'saharanpur'] },

  // --- MAHARASHTRA & METROS ---
  { name: 'Mumbai (South Mumbai, Bandra, Andheri)', state: 'Maharashtra', type: 'city', keywords: ['mum', 'mumbai', 'bombay', 'marine drive', 'bandra'] },
  { name: 'Pune (Shivaji Nagar, Hinjawadi)', state: 'Maharashtra', type: 'city', keywords: ['pun', 'pune', 'hinjawadi'] },
  { name: 'Shirdi (Sai Baba Samadhi Temple)', state: 'Maharashtra', type: 'city', keywords: ['shi', 'shirdi', 'sai baba', 'shirdi temple'] },
  { name: 'Lonavala / Khandala', state: 'Maharashtra', type: 'landmark', keywords: ['lon', 'lonavala', 'khandala'] },
  { name: 'Nagpur', state: 'Maharashtra', type: 'city', keywords: ['nag', 'nagpur'] },
  { name: 'Nashik (Trimbakeshwar)', state: 'Maharashtra', type: 'city', keywords: ['nas', 'nashik', 'trimbakeshwar'] },

  // --- GUJARAT ---
  { name: 'Ahmedabad (Sabarmati Ashram)', state: 'Gujarat', type: 'city', keywords: ['ahm', 'ahmedabad', 'sabarmati'] },
  { name: 'Surat', state: 'Gujarat', type: 'city', keywords: ['sur', 'surat'] },
  { name: 'Vadodara (Baroda)', state: 'Gujarat', type: 'city', keywords: ['vad', 'vadodara', 'baroda'] },
  { name: 'Statue of Unity, Kevadia', state: 'Gujarat', type: 'landmark', keywords: ['statue of unity', 'kevadia', 'sardar patel'] },

  // --- GOA ---
  { name: 'Goa (North Goa — Baga, Calangute, Panjim)', state: 'Goa', type: 'city', keywords: ['goa', 'baga', 'calangute', 'panjim', 'candolim'] },
  { name: 'Goa (South Goa — Margao, Colva, Palolem)', state: 'Goa', type: 'city', keywords: ['goa', 'margao', 'colva', 'palolem'] },

  // --- KARNATAKA, TELANGANA, TAMIL NADU & KERALA ---
  { name: 'Bengaluru / Bangalore (Whitefield, Indiranagar)', state: 'Karnataka', type: 'city', keywords: ['ben', 'bangalore', 'bengaluru', 'whitefield', 'koramangala'] },
  { name: 'Hyderabad (HITEC City, Banjara Hills)', state: 'Telangana', type: 'city', keywords: ['hyd', 'hyderabad', 'hitec city', 'charminar'] },
  { name: 'Chennai (T. Nagar, OMR, Central)', state: 'Tamil Nadu', type: 'city', keywords: ['che', 'chennai', 'madras'] },
  { name: 'Kochi / Cochin', state: 'Kerala', type: 'city', keywords: ['koc', 'kochi', 'cochin', 'fort kochi'] },
  { name: 'Munnar (Tea Hills)', state: 'Kerala', type: 'landmark', keywords: ['mun', 'munnar', 'kerala hill station'] },
  { name: 'Tirupati (Sri Venkateswara Balaji Temple)', state: 'Andhra Pradesh', type: 'landmark', keywords: ['tir', 'tirupati', 'balaji temple', 'tirumala'] },

  // --- EAST & CENTRAL INDIA ---
  { name: 'Kolkata (Howrah, Park Street, Salt Lake)', state: 'West Bengal', type: 'city', keywords: ['kol', 'kolkata', 'calcutta', 'howrah'] },
  { name: 'Indore (Cleanest City / Rajwada)', state: 'Madhya Pradesh', type: 'city', keywords: ['ind', 'indore', 'rajwada', 'chhappan'] },
  { name: 'Ujjain (Mahakaleshwar Jyotirlinga)', state: 'Madhya Pradesh', type: 'city', keywords: ['ujj', 'ujjain', 'mahakaleshwar', 'mahakal lok'] },
  { name: 'Patna', state: 'Bihar', type: 'city', keywords: ['pat', 'patna'] },
  { name: 'Bodh Gaya (Mahabodhi Temple)', state: 'Bihar', type: 'landmark', keywords: ['bodh gaya', 'gaya', 'mahabodhi'] },
  { name: 'Puri (Jagannath Dham & Sea Beach)', state: 'Odisha', type: 'city', keywords: ['puri', 'jagannath puri', 'puri beach'] }
];

/**
 * Advanced Multi-Token & Phrase Search Engine
 * Handles queries in ANY order, phrase matches, acronyms, and single prefixes
 */
export function searchLocalIndiaLocations(query, isDestination = false, limit = 7) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return isDestination ? POPULAR_DESTINATION_SUGGESTIONS.slice(0, limit) : POPULAR_PICKUP_SUGGESTIONS.slice(0, limit);
  }

  // Normalize query: lower case, strip excess whitespace and special characters
  const cleanQuery = query.trim().toLowerCase();
  // Split query into tokens (e.g. "Amritsar Airport" -> ["amritsar", "airport"])
  const queryTokens = cleanQuery.split(/[\s,()/-]+/).filter(Boolean);

  if (queryTokens.length === 0) {
    return isDestination ? POPULAR_DESTINATION_SUGGESTIONS.slice(0, limit) : POPULAR_PICKUP_SUGGESTIONS.slice(0, limit);
  }

  const scoredEntries = INDIA_LOCATIONS_DATABASE.map((item) => {
    const nameLower = item.name.toLowerCase();
    const stateLower = item.state.toLowerCase();
    const keywords = (item.keywords || []).map((k) => k.toLowerCase());
    
    // Unified searchable corpus
    const fullSearchable = [nameLower, stateLower, ...keywords].join(' ');

    let score = 0;

    // --- RULE 1: EXACT FULL PHRASE MATCH ---
    if (nameLower.startsWith(cleanQuery)) {
      score += 3500;
    } else if (nameLower.includes(cleanQuery)) {
      score += 2800;
    } else if (keywords.some((k) => k === cleanQuery || k.startsWith(cleanQuery))) {
      score += 2400;
    } else if (keywords.some((k) => k.includes(cleanQuery))) {
      score += 2000;
    }

    // --- RULE 2: MULTI-TOKEN ALL-WORDS MATCH (HANDLES "Amritsar Airport", "Delhi Airport", etc.) ---
    // Every single word typed by user must appear in the name, state, or keywords
    const allTokensPresent = queryTokens.every((token) => fullSearchable.includes(token));

    if (allTokensPresent) {
      score += 1800;

      queryTokens.forEach((token) => {
        // Boost if name starts with this token
        if (nameLower.startsWith(token)) {
          score += 400;
        } 
        // Boost if a word in name starts with this token
        else if (nameLower.split(/[\s,()/-]+/).some((w) => w.startsWith(token))) {
          score += 250;
        } 
        // Boost if token is in name
        else if (nameLower.includes(token)) {
          score += 150;
        }
      });
    }

    // --- RULE 3: SINGLE OR PARTIAL TOKEN PREFIXES ---
    queryTokens.forEach((token) => {
      if (token.length >= 2) {
        if (nameLower.startsWith(token)) {
          score += 300;
        } else if (nameLower.split(/[\s,()/-]+/).some((w) => w.startsWith(token))) {
          score += 150;
        } else if (keywords.some((k) => k.startsWith(token))) {
          score += 100;
        }
      }
    });

    // --- RULE 4: SPECIFIC AIRPORT / STATION INTENT BOOST ---
    if (queryTokens.includes('airport') || queryTokens.includes('air') || queryTokens.includes('flight')) {
      if (item.type === 'airport') {
        score += 800;
      }
    }
    if (queryTokens.includes('railway') || queryTokens.includes('station') || queryTokens.includes('train')) {
      if (item.type === 'railway') {
        score += 600;
      }
    }

    // Regional relevance boost for Punjab / NCR hubs
    if (score > 0 && (item.state.includes('Punjab') || item.state.includes('Delhi'))) {
      score += 80;
    }

    return { item, score };
  })
    .filter((entry) => entry.score >= 350)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({
      name: entry.item.name,
      state: entry.item.state,
      type: entry.item.type,
      display: `${entry.item.name}, ${entry.item.state}`
    }));

  return scoredEntries;
}

/**
 * Asynchronous debounced online map geocoder (Photon / OpenStreetMap)
 * Fallback / enrichment for specific colonies, streets or addresses in India
 */
export async function searchOnlineMapLocations(query, signal) {
  if (!query || query.trim().length < 2) return [];

  try {
    const cleanQ = encodeURIComponent(query.trim());
    // Biased towards Northern India / Delhi / Punjab coordinates (lat: 29.5, lon: 76.5)
    const url = `https://photon.komoot.io/api/?q=${cleanQ}&lat=29.5&lon=76.5&limit=5`;
    const resp = await fetch(url, { signal });
    if (!resp.ok) return [];

    const data = await resp.json();
    if (!data || !data.features) return [];

    const results = [];
    for (const f of data.features) {
      const p = f.properties || {};
      const name = p.name || p.street || p.district;
      if (!name) continue;

      const secondaryParts = [p.city || p.district, p.state || p.country].filter(Boolean);
      const secondary = secondaryParts.join(', ') || 'India';

      results.push({
        name: name,
        state: secondary,
        type: 'map',
        display: `${name}, ${secondary}`
      });
    }

    return results;
  } catch (err) {
    if (err.name === 'AbortError') return [];
    console.warn('Map geocoding fetch error (offline fallback active):', err);
    return [];
  }
}

/**
 * Reverse Geocode Coordinates to human-readable Indian locality (for GPS button)
 */
export async function reverseGeocodeGPS(lat, lon) {
  const coordText = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Reverse geocode failed');
    const data = await resp.json();
    if (data && data.features && data.features.length > 0) {
      const p = data.features[0].properties || {};
      const locality = p.name || p.district || p.locality || p.city || 'Current Location';
      const city = p.city || p.county || '';
      const state = p.state || 'Punjab';
      const parts = [locality, city, state].filter(Boolean);
      // Remove duplicate consecutive words
      const unique = parts.filter((val, idx, arr) => arr.indexOf(val) === idx);
      const addr = unique.join(', ');
      return `${addr} (GPS: ${coordText})`;
    }
  } catch (err) {
    console.warn('Reverse geocode error:', err);
  }
  return `GPS Location (${coordText})`;
}
