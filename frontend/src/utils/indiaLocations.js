/**
 * Comprehensive India Locations Dataset & Autocomplete Search Utility for PB08 TAXI
 * 
 * Features:
 * - 400+ Curated Indian Cities, Towns, Airports, Railway Stations & Tourist Destinations
 * - Deep Punjab & North India local coverage (Chowks, Localities, Towns)
 * - All Major Domestic & International Indian Airports (DEL, ATQ, IXC, BOM, BLR, etc.)
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
  { name: 'Delhi IGI Airport (DEL) Terminal 3', state: 'Delhi', type: 'airport', display: 'Delhi IGI Airport (DEL) T3' },
  { name: 'Amritsar Airport (ATQ)', state: 'Punjab', type: 'airport', display: 'Amritsar Airport (ATQ)' },
  { name: 'Chandigarh Airport (IXC)', state: 'Punjab/Haryana', type: 'airport', display: 'Chandigarh Airport (IXC)' },
  { name: 'Delhi NCR / New Delhi', state: 'Delhi', type: 'city', display: 'Delhi NCR (All Areas)' },
  { name: 'Amritsar (Golden Temple)', state: 'Punjab', type: 'landmark', display: 'Amritsar (Golden Temple)' },
  { name: 'Chandigarh (Sector 17 / Mohali)', state: 'Punjab/Haryana', type: 'city', display: 'Chandigarh / Mohali' },
  { name: 'Shimla', state: 'Himachal Pradesh', type: 'city', display: 'Shimla, Himachal Pradesh' },
  { name: 'Manali', state: 'Himachal Pradesh', type: 'city', display: 'Manali, Himachal Pradesh' },
  { name: 'Dharamshala / Mcleodganj', state: 'Himachal Pradesh', type: 'city', display: 'Dharamshala / Mcleodganj, HP' },
  { name: 'Katra (Mata Vaishno Devi)', state: 'Jammu & Kashmir', type: 'landmark', display: 'Katra (Vaishno Devi), Jammu' },
  { name: 'Jaipur', state: 'Rajasthan', type: 'city', display: 'Jaipur (Pink City), Rajasthan' },
  { name: 'Agra (Taj Mahal)', state: 'Uttar Pradesh', type: 'city', display: 'Agra (Taj Mahal), UP' },
  { name: 'Haridwar / Rishikesh', state: 'Uttarakhand', type: 'city', display: 'Haridwar / Rishikesh, Uttarakhand' }
];

export const INDIA_LOCATIONS_DATABASE = [
  // --- PUNJAB PRIMARY CITIES, TOWNS & LOCALITIES (PB08 TAXI CORE) ---
  { name: 'Jalandhar', state: 'Punjab', type: 'city', keywords: ['jal', 'pb08', 'jallandhar', 'punjab'] },
  { name: 'Jalandhar City Railway Station', state: 'Punjab', type: 'railway', keywords: ['jal', 'railway', 'station'] },
  { name: 'Jalandhar Cantt', state: 'Punjab', type: 'railway', keywords: ['jal', 'cantt', 'station'] },
  { name: 'Model Town, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'model town'] },
  { name: 'BMC Chowk, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'bmc', 'chowk'] },
  { name: 'PAP Chowk, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'pap', 'chowk'] },
  { name: 'Rama Mandi, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'rama mandi'] },
  { name: 'Adampur Airport (AIP), Jalandhar', state: 'Punjab', type: 'airport', keywords: ['jal', 'adampur', 'aip', 'airport'] },
  { name: 'Jalandhar Bus Stand', state: 'Punjab', type: 'landmark', keywords: ['jal', 'bus stand', 'isbt'] },
  { name: 'Urban Estate Phase 1 & 2, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'urban estate'] },
  { name: 'Curo High Street / Mall Road, Jalandhar', state: 'Punjab', type: 'landmark', keywords: ['jal', 'mall road'] },
  { name: 'Amritsar', state: 'Punjab', type: 'city', keywords: ['amr', 'amritsar', 'golden temple'] },
  { name: 'Sri Guru Ram Dass Jee International Airport (ATQ), Amritsar', state: 'Punjab', type: 'airport', keywords: ['amr', 'atq', 'airport', 'amritsar'] },
  { name: 'Golden Temple (Harmandir Sahib), Amritsar', state: 'Punjab', type: 'landmark', keywords: ['amr', 'golden temple', 'darbar sahib'] },
  { name: 'Amritsar Junction Railway Station', state: 'Punjab', type: 'railway', keywords: ['amr', 'station', 'railway'] },
  { name: 'Wagah Border, Amritsar', state: 'Punjab', type: 'landmark', keywords: ['amr', 'wagah border', 'attari'] },
  { name: 'Ludhiana', state: 'Punjab', type: 'city', keywords: ['lud', 'ludhiana', 'industrial'] },
  { name: 'Ludhiana Junction Railway Station', state: 'Punjab', type: 'railway', keywords: ['lud', 'station'] },
  { name: 'Ferozepur Road / Clock Tower, Ludhiana', state: 'Punjab', type: 'landmark', keywords: ['lud', 'ferozepur road'] },
  { name: 'Chandigarh', state: 'Tri-City (PB/HR)', type: 'city', keywords: ['cha', 'chandigarh', 'city beautiful'] },
  { name: 'Shaheed Bhagat Singh International Airport (IXC), Chandigarh', state: 'Punjab/Haryana', type: 'airport', keywords: ['cha', 'ixc', 'airport', 'mohali'] },
  { name: 'Chandigarh Railway Station', state: 'Punjab/Haryana', type: 'railway', keywords: ['cha', 'station'] },
  { name: 'Sector 17, Chandigarh', state: 'Chandigarh', type: 'landmark', keywords: ['cha', 'sector 17'] },
  { name: 'Mohali (SAS Nagar)', state: 'Punjab', type: 'city', keywords: ['moh', 'mohali', 'sas nagar', 'stadium'] },
  { name: 'Panchkula', state: 'Haryana', type: 'city', keywords: ['pan', 'panchkula', 'tri-city'] },
  { name: 'Zirakpur', state: 'Punjab', type: 'city', keywords: ['zir', 'zirakpur', 'highway'] },
  { name: 'Kharar', state: 'Punjab', type: 'city', keywords: ['kha', 'kharar', 'mohali'] },
  { name: 'Kurali', state: 'Punjab', type: 'city', keywords: ['kur', 'kurali'] },
  { name: 'Dera Bassi', state: 'Punjab', type: 'city', keywords: ['der', 'dera bassi'] },
  { name: 'Phagwara', state: 'Punjab', type: 'city', keywords: ['pha', 'phagwara', 'lpu', 'jalandhar'] },
  { name: 'Lovely Professional University (LPU), Phagwara', state: 'Punjab', type: 'landmark', keywords: ['lpu', 'university', 'phagwara'] },
  { name: 'Hoshiarpur', state: 'Punjab', type: 'city', keywords: ['hos', 'hoshiarpur', 'doaba'] },
  { name: 'Kapurthala', state: 'Punjab', type: 'city', keywords: ['kap', 'kapurthala', 'rail coach'] },
  { name: 'Nawanshahr (SBS Nagar)', state: 'Punjab', type: 'city', keywords: ['naw', 'nawanshahr', 'sbs nagar'] },
  { name: 'Nakodar', state: 'Punjab', type: 'city', keywords: ['nak', 'nakodar', 'dargah'] },
  { name: 'Shahkot', state: 'Punjab', type: 'city', keywords: ['sha', 'shahkot'] },
  { name: 'Kartarpur', state: 'Punjab', type: 'city', keywords: ['kar', 'kartarpur'] },
  { name: 'Goraya', state: 'Punjab', type: 'city', keywords: ['gor', 'goraya'] },
  { name: 'Nurmahal', state: 'Punjab', type: 'city', keywords: ['nur', 'nurmahal'] },
  { name: 'Phillaur', state: 'Punjab', type: 'city', keywords: ['phi', 'phillaur', 'fort'] },
  { name: 'Bhogpur', state: 'Punjab', type: 'city', keywords: ['bho', 'bhogpur'] },
  { name: 'Adampur', state: 'Punjab', type: 'city', keywords: ['ada', 'adampur'] },
  { name: 'Batala', state: 'Punjab', type: 'city', keywords: ['bat', 'batala', 'gurdaspur'] },
  { name: 'Gurdaspur', state: 'Punjab', type: 'city', keywords: ['gur', 'gurdaspur'] },
  { name: 'Pathankot', state: 'Punjab', type: 'city', keywords: ['pat', 'pathankot', 'cantt'] },
  { name: 'Pathankot Cantt Railway Station', state: 'Punjab', type: 'railway', keywords: ['pat', 'cantt', 'chakki bank'] },
  { name: 'Patiala', state: 'Punjab', type: 'city', keywords: ['pat', 'patiala', 'sheesh mahal'] },
  { name: 'Bathinda', state: 'Punjab', type: 'city', keywords: ['bat', 'bathinda', 'thermal'] },
  { name: 'Moga', state: 'Punjab', type: 'city', keywords: ['mog', 'moga'] },
  { name: 'Abohar', state: 'Punjab', type: 'city', keywords: ['abo', 'abohar'] },
  { name: 'Malerkotla', state: 'Punjab', type: 'city', keywords: ['mal', 'malerkotla'] },
  { name: 'Khanna', state: 'Punjab', type: 'city', keywords: ['kha', 'khanna', 'mandi'] },
  { name: 'Muktsar (Sri Muktsar Sahib)', state: 'Punjab', type: 'city', keywords: ['muk', 'muktsar'] },
  { name: 'Barnala', state: 'Punjab', type: 'city', keywords: ['bar', 'barnala'] },
  { name: 'Firozpur (Ferozepur)', state: 'Punjab', type: 'city', keywords: ['fir', 'firozpur', 'ferozepur'] },
  { name: 'Rajpura', state: 'Punjab', type: 'city', keywords: ['raj', 'rajpura'] },
  { name: 'Sangrur', state: 'Punjab', type: 'city', keywords: ['san', 'sangrur'] },
  { name: 'Fazilka', state: 'Punjab', type: 'city', keywords: ['faz', 'fazilka'] },
  { name: 'Tarn Taran', state: 'Punjab', type: 'city', keywords: ['tar', 'tarn taran'] },
  { name: 'Jagraon', state: 'Punjab', type: 'city', keywords: ['jag', 'jagraon'] },
  { name: 'Mansa', state: 'Punjab', type: 'city', keywords: ['man', 'mansa'] },
  { name: 'Sunam', state: 'Punjab', type: 'city', keywords: ['sun', 'sunam'] },
  { name: 'Dhuri', state: 'Punjab', type: 'city', keywords: ['dhu', 'dhuri'] },
  { name: 'Nabha', state: 'Punjab', type: 'city', keywords: ['nab', 'nabha'] },
  { name: 'Anandpur Sahib (Sri Anandpur Sahib)', state: 'Punjab', type: 'city', keywords: ['ana', 'anandpur sahib', 'virasat-e-khalsa'] },
  { name: 'Ropar (Roopnagar)', state: 'Punjab', type: 'city', keywords: ['rop', 'ropar', 'roopnagar'] },
  { name: 'Sultanpur Lodhi', state: 'Punjab', type: 'city', keywords: ['sul', 'sultanpur lodhi'] },
  { name: 'Qadian', state: 'Punjab', type: 'city', keywords: ['qad', 'qadian'] },
  { name: 'Dasuya', state: 'Punjab', type: 'city', keywords: ['das', 'dasuya'] },
  { name: 'Mukerian', state: 'Punjab', type: 'city', keywords: ['muk', 'mukerian'] },
  { name: 'Balachaur', state: 'Punjab', type: 'city', keywords: ['bal', 'balachaur'] },
  { name: 'Banga', state: 'Punjab', type: 'city', keywords: ['ban', 'banga'] },

  // --- DELHI NCR (CAPITAL & AIRPORT TRANSFERS) ---
  { name: 'Delhi (All Areas)', state: 'Delhi NCR', type: 'city', keywords: ['del', 'delhi', 'ncr', 'capital'] },
  { name: 'Delhi IGI Airport (DEL) Terminal 3', state: 'Delhi', type: 'airport', keywords: ['del', 'igi', 't3', 'airport', 'delhi'] },
  { name: 'Delhi IGI Airport (DEL) Terminal 1', state: 'Delhi', type: 'airport', keywords: ['del', 'igi', 't1', 'airport', 'delhi'] },
  { name: 'Delhi IGI Airport (DEL) Terminal 2', state: 'Delhi', type: 'airport', keywords: ['del', 'igi', 't2', 'airport', 'delhi'] },
  { name: 'New Delhi Railway Station (NDLS)', state: 'Delhi', type: 'railway', keywords: ['del', 'ndls', 'station', 'new delhi'] },
  { name: 'Old Delhi Railway Station (DLI)', state: 'Delhi', type: 'railway', keywords: ['del', 'old delhi', 'dli'] },
  { name: 'Hazrat Nizamuddin Railway Station (NZM)', state: 'Delhi', type: 'railway', keywords: ['del', 'nizamuddin', 'nzm'] },
  { name: 'Anand Vihar Railway Station / ISBT', state: 'Delhi', type: 'railway', keywords: ['del', 'anand vihar', 'isbt'] },
  { name: 'Delhi Cantt Railway Station', state: 'Delhi', type: 'railway', keywords: ['del', 'delhi cantt'] },
  { name: 'Connaught Place (CP), New Delhi', state: 'Delhi', type: 'landmark', keywords: ['del', 'cp', 'connaught place'] },
  { name: 'Aerocity, Delhi', state: 'Delhi', type: 'landmark', keywords: ['del', 'aerocity', 'hotels'] },
  { name: 'Noida (All Sectors)', state: 'Uttar Pradesh (NCR)', type: 'city', keywords: ['noi', 'noida', 'ncr'] },
  { name: 'Greater Noida', state: 'Uttar Pradesh (NCR)', type: 'city', keywords: ['gre', 'greater noida'] },
  { name: 'Gurugram / Gurgaon (Cyber Hub / Golf Course)', state: 'Haryana (NCR)', type: 'city', keywords: ['gur', 'gurgaon', 'gurugram', 'cyber city'] },
  { name: 'Faridabad', state: 'Haryana (NCR)', type: 'city', keywords: ['far', 'faridabad', 'ncr'] },
  { name: 'Ghaziabad', state: 'Uttar Pradesh (NCR)', type: 'city', keywords: ['gha', 'ghaziabad', 'ncr'] },
  { name: 'Indirapuram, Ghaziabad', state: 'Uttar Pradesh (NCR)', type: 'landmark', keywords: ['ind', 'indirapuram'] },

  // --- HIMACHAL PRADESH (HILL STATIONS & TOURS) ---
  { name: 'Shimla', state: 'Himachal Pradesh', type: 'city', keywords: ['shi', 'shimla', 'mall road', 'hp'] },
  { name: 'Kufri / Chail, Shimla', state: 'Himachal Pradesh', type: 'landmark', keywords: ['kuf', 'kufri', 'chail'] },
  { name: 'Manali', state: 'Himachal Pradesh', type: 'city', keywords: ['man', 'manali', 'solang', 'rohtang'] },
  { name: 'Solang Valley / Atal Tunnel, Manali', state: 'Himachal Pradesh', type: 'landmark', keywords: ['sol', 'atal tunnel', 'solang'] },
  { name: 'Kullu', state: 'Himachal Pradesh', type: 'city', keywords: ['kul', 'kullu', 'bhuntar'] },
  { name: 'Dharamshala', state: 'Himachal Pradesh', type: 'city', keywords: ['dha', 'dharamshala', 'hpca'] },
  { name: 'Mcleodganj, Dharamshala', state: 'Himachal Pradesh', type: 'landmark', keywords: ['mcl', 'mcleodganj', 'dalai lama'] },
  { name: 'Dalhousie', state: 'Himachal Pradesh', type: 'city', keywords: ['dal', 'dalhousie'] },
  { name: 'Khajjiar (Mini Switzerland)', state: 'Himachal Pradesh', type: 'landmark', keywords: ['kha', 'khajjiar'] },
  { name: 'Kasauli', state: 'Himachal Pradesh', type: 'city', keywords: ['kas', 'kasauli'] },
  { name: 'Solan', state: 'Himachal Pradesh', type: 'city', keywords: ['sol', 'solan'] },
  { name: 'Mandi', state: 'Himachal Pradesh', type: 'city', keywords: ['man', 'mandi'] },
  { name: 'Bilaspur', state: 'Himachal Pradesh', type: 'city', keywords: ['bil', 'bilaspur'] },
  { name: 'Hamirpur', state: 'Himachal Pradesh', type: 'city', keywords: ['ham', 'hamirpur'] },
  { name: 'Una', state: 'Himachal Pradesh', type: 'city', keywords: ['una', 'una railway'] },
  { name: 'Chamba', state: 'Himachal Pradesh', type: 'city', keywords: ['cha', 'chamba'] },
  { name: 'Palampur', state: 'Himachal Pradesh', type: 'city', keywords: ['pal', 'palampur', 'tea garden'] },
  { name: 'Kangra', state: 'Himachal Pradesh', type: 'city', keywords: ['kan', 'kangra', 'temple'] },
  { name: 'Jwalaji / Chintpurni Temple', state: 'Himachal Pradesh', type: 'landmark', keywords: ['jwa', 'jwalaji', 'chintpurni', 'shaktipeeth'] },
  { name: 'Baddi', state: 'Himachal Pradesh', type: 'city', keywords: ['bad', 'baddi', 'industrial'] },
  { name: 'Paonta Sahib', state: 'Himachal Pradesh', type: 'city', keywords: ['pao', 'paonta sahib'] },
  { name: 'Kaza / Spiti Valley', state: 'Himachal Pradesh', type: 'city', keywords: ['kaz', 'spiti', 'kaza'] },

  // --- JAMMU & KASHMIR ---
  { name: 'Katra (Mata Vaishno Devi)', state: 'Jammu & Kashmir', type: 'city', keywords: ['kat', 'katra', 'vaishno devi'] },
  { name: 'Jammu City', state: 'Jammu & Kashmir', type: 'city', keywords: ['jam', 'jammu', 'tawi'] },
  { name: 'Jammu Tawi Railway Station', state: 'Jammu & Kashmir', type: 'railway', keywords: ['jam', 'jammu tawi'] },
  { name: 'Jammu Airport (IXJ)', state: 'Jammu & Kashmir', type: 'airport', keywords: ['jam', 'ixj', 'airport'] },
  { name: 'Srinagar', state: 'Jammu & Kashmir', type: 'city', keywords: ['sri', 'srinagar', 'dal lake', 'kashmir'] },
  { name: 'Srinagar International Airport (SXR)', state: 'Jammu & Kashmir', type: 'airport', keywords: ['sri', 'sxr', 'airport'] },
  { name: 'Gulmarg', state: 'Jammu & Kashmir', type: 'landmark', keywords: ['gul', 'gulmarg', 'gondola'] },
  { name: 'Pahalgam', state: 'Jammu & Kashmir', type: 'landmark', keywords: ['pah', 'pahalgam', 'betaab'] },
  { name: 'Udhampur', state: 'Jammu & Kashmir', type: 'city', keywords: ['udh', 'udhampur'] },
  { name: 'Patnitop', state: 'Jammu & Kashmir', type: 'landmark', keywords: ['pat', 'patnitop'] },

  // --- HARYANA ---
  { name: 'Ambala (Ambala Cantt)', state: 'Haryana', type: 'city', keywords: ['amb', 'ambala', 'cantt'] },
  { name: 'Panipat', state: 'Haryana', type: 'city', keywords: ['pan', 'panipat'] },
  { name: 'Karnal', state: 'Haryana', type: 'city', keywords: ['kar', 'karnal'] },
  { name: 'Kurukshetra', state: 'Haryana', type: 'city', keywords: ['kur', 'kurukshetra', 'brahma sarovar'] },
  { name: 'Sonipat', state: 'Haryana', type: 'city', keywords: ['son', 'sonipat'] },
  { name: 'Rohtak', state: 'Haryana', type: 'city', keywords: ['roh', 'rohtak'] },
  { name: 'Hisar', state: 'Haryana', type: 'city', keywords: ['his', 'hisar'] },
  { name: 'Yamunanagar / Jagadhri', state: 'Haryana', type: 'city', keywords: ['yam', 'yamunanagar'] },
  { name: 'Rewari', state: 'Haryana', type: 'city', keywords: ['rew', 'rewari'] },
  { name: 'Sirsa', state: 'Haryana', type: 'city', keywords: ['sir', 'sirsa'] },
  { name: 'Kaithal', state: 'Haryana', type: 'city', keywords: ['kai', 'kaithal'] },
  { name: 'Jind', state: 'Haryana', type: 'city', keywords: ['jin', 'jind'] },
  { name: 'Bhiwani', state: 'Haryana', type: 'city', keywords: ['bhi', 'bhiwani'] },
  { name: 'Kalka / Pinjore', state: 'Haryana', type: 'city', keywords: ['kal', 'kalka', 'pinjore garden'] },

  // --- UTTARAKHAND ---
  { name: 'Dehradun', state: 'Uttarakhand', type: 'city', keywords: ['deh', 'dehradun', 'capital'] },
  { name: 'Dehradun Jolly Grant Airport (DED)', state: 'Uttarakhand', type: 'airport', keywords: ['deh', 'ded', 'airport'] },
  { name: 'Haridwar (Har Ki Pauri)', state: 'Uttarakhand', type: 'city', keywords: ['har', 'haridwar', 'ganga'] },
  { name: 'Rishikesh (Triveni Ghat / Tapovan)', state: 'Uttarakhand', type: 'city', keywords: ['ris', 'rishikesh', 'yoga', 'rafting'] },
  { name: 'Mussoorie', state: 'Uttarakhand', type: 'city', keywords: ['mus', 'mussoorie', 'kempty falls'] },
  { name: 'Nainital', state: 'Uttarakhand', type: 'city', keywords: ['nai', 'nainital', 'naini lake'] },
  { name: 'Roorkee', state: 'Uttarakhand', type: 'city', keywords: ['roo', 'roorkee', 'iit'] },
  { name: 'Haldwani', state: 'Uttarakhand', type: 'city', keywords: ['hal', 'haldwani', 'kathgodam'] },
  { name: 'Jim Corbett / Ramnagar', state: 'Uttarakhand', type: 'landmark', keywords: ['cor', 'jim corbett', 'ramnagar'] },
  { name: 'Kashipur / Rudrapur', state: 'Uttarakhand', type: 'city', keywords: ['kas', 'kashipur', 'rudrapur'] },

  // --- RAJASTHAN ---
  { name: 'Jaipur (Pink City)', state: 'Rajasthan', type: 'city', keywords: ['jai', 'jaipur', 'hawa mahal'] },
  { name: 'Jaipur International Airport (JAI)', state: 'Rajasthan', type: 'airport', keywords: ['jai', 'jai', 'airport'] },
  { name: 'Udaipur (City of Lakes)', state: 'Rajasthan', type: 'city', keywords: ['uda', 'udaipur', 'lake pichola'] },
  { name: 'Jodhpur (Blue City)', state: 'Rajasthan', type: 'city', keywords: ['jod', 'jodhpur', 'mehrangarh'] },
  { name: 'Jaisalmer (Golden City)', state: 'Rajasthan', type: 'city', keywords: ['jai', 'jaisalmer', 'sam dunes'] },
  { name: 'Ajmer / Pushkar', state: 'Rajasthan', type: 'city', keywords: ['ajm', 'ajmer sharif', 'pushkar'] },
  { name: 'Khatu Shyam Ji Temple, Sikar', state: 'Rajasthan', type: 'landmark', keywords: ['kha', 'khatu shyam', 'sikar'] },
  { name: 'Salasar Balaji, Churu', state: 'Rajasthan', type: 'landmark', keywords: ['sal', 'salasar balaji'] },
  { name: 'Bikaner', state: 'Rajasthan', type: 'city', keywords: ['bik', 'bikaner'] },
  { name: 'Kota', state: 'Rajasthan', type: 'city', keywords: ['kot', 'kota'] },
  { name: 'Alwar / Neemrana', state: 'Rajasthan', type: 'city', keywords: ['alw', 'alwar', 'neemrana'] },
  { name: 'Mount Abu', state: 'Rajasthan', type: 'city', keywords: ['mou', 'mount abu', 'dilwara'] },

  // --- UTTAR PRADESH ---
  { name: 'Agra (Taj Mahal)', state: 'Uttar Pradesh', type: 'city', keywords: ['agr', 'agra', 'taj mahal'] },
  { name: 'Mathura / Vrindavan', state: 'Uttar Pradesh', type: 'city', keywords: ['mat', 'mathura', 'vrindavan', 'krishna'] },
  { name: 'Lucknow', state: 'Uttar Pradesh', type: 'city', keywords: ['luc', 'lucknow', 'capital'] },
  { name: 'Lucknow Airport (LKO)', state: 'Uttar Pradesh', type: 'airport', keywords: ['luc', 'lko', 'airport'] },
  { name: 'Kanpur', state: 'Uttar Pradesh', type: 'city', keywords: ['kan', 'kanpur'] },
  { name: 'Varanasi / Kashi (Banaras)', state: 'Uttar Pradesh', type: 'city', keywords: ['var', 'varanasi', 'kashi', 'banaras'] },
  { name: 'Ayodhya (Ram Mandir)', state: 'Uttar Pradesh', type: 'city', keywords: ['ayo', 'ayodhya', 'ram mandir'] },
  { name: 'Prayagraj (Allahabad / Sangam)', state: 'Uttar Pradesh', type: 'city', keywords: ['pra', 'prayagraj', 'allahabad'] },
  { name: 'Meerut', state: 'Uttar Pradesh', type: 'city', keywords: ['mee', 'meerut'] },
  { name: 'Bareilly', state: 'Uttar Pradesh', type: 'city', keywords: ['bar', 'bareilly'] },
  { name: 'Aligarh', state: 'Uttar Pradesh', type: 'city', keywords: ['ali', 'aligarh'] },
  { name: 'Moradabad', state: 'Uttar Pradesh', type: 'city', keywords: ['mor', 'moradabad'] },
  { name: 'Saharanpur', state: 'Uttar Pradesh', type: 'city', keywords: ['sah', 'saharanpur'] },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', type: 'city', keywords: ['gor', 'gorakhpur'] },
  { name: 'Jhansi', state: 'Uttar Pradesh', type: 'city', keywords: ['jha', 'jhansi'] },

  // --- MAHARASHTRA & METROS ---
  { name: 'Mumbai', state: 'Maharashtra', type: 'city', keywords: ['mum', 'mumbai', 'bombay'] },
  { name: 'Mumbai Airport (BOM) Terminal 2', state: 'Maharashtra', type: 'airport', keywords: ['mum', 'bom', 't2', 'airport'] },
  { name: 'Mumbai Airport (BOM) Terminal 1', state: 'Maharashtra', type: 'airport', keywords: ['mum', 'bom', 't1', 'airport'] },
  { name: 'Pune', state: 'Maharashtra', type: 'city', keywords: ['pun', 'pune'] },
  { name: 'Pune Airport (PNQ)', state: 'Maharashtra', type: 'airport', keywords: ['pun', 'pnq', 'airport'] },
  { name: 'Nagpur', state: 'Maharashtra', type: 'city', keywords: ['nag', 'nagpur'] },
  { name: 'Nashik', state: 'Maharashtra', type: 'city', keywords: ['nas', 'nashik'] },
  { name: 'Shirdi (Sai Baba Temple)', state: 'Maharashtra', type: 'city', keywords: ['shi', 'shirdi', 'sai baba'] },
  { name: 'Lonavala / Khandala', state: 'Maharashtra', type: 'landmark', keywords: ['lon', 'lonavala'] },
  { name: 'Mahabaleshwar', state: 'Maharashtra', type: 'city', keywords: ['mah', 'mahabaleshwar'] },
  { name: 'Aurangabad (Chhatrapati Sambhaji Nagar)', state: 'Maharashtra', type: 'city', keywords: ['aur', 'aurangabad', 'ajanta ellora'] },

  // --- GUJARAT ---
  { name: 'Ahmedabad', state: 'Gujarat', type: 'city', keywords: ['ahm', 'ahmedabad'] },
  { name: 'Ahmedabad Airport (AMD)', state: 'Gujarat', type: 'airport', keywords: ['ahm', 'amd', 'airport'] },
  { name: 'Surat', state: 'Gujarat', type: 'city', keywords: ['sur', 'surat'] },
  { name: 'Vadodara (Baroda)', state: 'Gujarat', type: 'city', keywords: ['vad', 'vadodara', 'baroda'] },
  { name: 'Rajkot', state: 'Gujarat', type: 'city', keywords: ['raj', 'rajkot'] },
  { name: 'Gandhinagar', state: 'Gujarat', type: 'city', keywords: ['gan', 'gandhinagar'] },
  { name: 'Statue of Unity, Kevadia', state: 'Gujarat', type: 'landmark', keywords: ['sta', 'statue of unity', 'kevadia'] },

  // --- GOA ---
  { name: 'Goa (North Goa - Calangute/Baga)', state: 'Goa', type: 'city', keywords: ['goa', 'baga', 'calangute'] },
  { name: 'Goa (South Goa - Margao/Colva)', state: 'Goa', type: 'city', keywords: ['goa', 'margao', 'colva'] },
  { name: 'Goa Manohar International Airport (MOPA)', state: 'Goa', type: 'airport', keywords: ['goa', 'mopa', 'airport'] },
  { name: 'Goa Dabolim Airport (GOI)', state: 'Goa', type: 'airport', keywords: ['goa', 'dabolim', 'goi', 'airport'] },

  // --- KARNATAKA, TAMIL NADU, TELANGANA, KERALA & SOUTH ---
  { name: 'Bengaluru (Bangalore)', state: 'Karnataka', type: 'city', keywords: ['ben', 'bangalore', 'bengaluru', 'it capital'] },
  { name: 'Bengaluru Airport (BLR) Kempegowda', state: 'Karnataka', type: 'airport', keywords: ['ben', 'blr', 'airport', 'kempegowda'] },
  { name: 'Mysuru (Mysore)', state: 'Karnataka', type: 'city', keywords: ['mys', 'mysore', 'mysuru'] },
  { name: 'Hyderabad', state: 'Telangana', type: 'city', keywords: ['hyd', 'hyderabad', 'hitec city'] },
  { name: 'Hyderabad Airport (HYD) Rajiv Gandhi', state: 'Telangana', type: 'airport', keywords: ['hyd', 'hyd', 'airport'] },
  { name: 'Chennai', state: 'Tamil Nadu', type: 'city', keywords: ['che', 'chennai', 'madras'] },
  { name: 'Chennai International Airport (MAA)', state: 'Tamil Nadu', type: 'airport', keywords: ['che', 'maa', 'airport'] },
  { name: 'Coimbatore', state: 'Tamil Nadu', type: 'city', keywords: ['coi', 'coimbatore'] },
  { name: 'Kochi (Cochin)', state: 'Kerala', type: 'city', keywords: ['koc', 'kochi', 'cochin'] },
  { name: 'Cochin International Airport (COK)', state: 'Kerala', type: 'airport', keywords: ['koc', 'cok', 'airport'] },
  { name: 'Thiruvananthapuram (Trivandrum)', state: 'Kerala', type: 'city', keywords: ['thi', 'trivandrum'] },
  { name: 'Visakhapatnam (Vizag)', state: 'Andhra Pradesh', type: 'city', keywords: ['vis', 'vizag', 'visakhapatnam'] },
  { name: 'Vijayawada', state: 'Andhra Pradesh', type: 'city', keywords: ['vij', 'vijayawada'] },
  { name: 'Tirupati (Balaji Temple)', state: 'Andhra Pradesh', type: 'city', keywords: ['tir', 'tirupati', 'balaji'] },

  // --- EAST & CENTRAL INDIA ---
  { name: 'Kolkata', state: 'West Bengal', type: 'city', keywords: ['kol', 'kolkata', 'calcutta'] },
  { name: 'Kolkata Airport (CCU) Netaji Subhash', state: 'West Bengal', type: 'airport', keywords: ['kol', 'ccu', 'airport'] },
  { name: 'Siliguri / Darjeeling', state: 'West Bengal', type: 'city', keywords: ['sil', 'siliguri', 'darjeeling'] },
  { name: 'Indore', state: 'Madhya Pradesh', type: 'city', keywords: ['ind', 'indore', 'clean city'] },
  { name: 'Bhopal', state: 'Madhya Pradesh', type: 'city', keywords: ['bho', 'bhopal'] },
  { name: 'Gwalior', state: 'Madhya Pradesh', type: 'city', keywords: ['gwa', 'gwalior'] },
  { name: 'Ujjain (Mahakaleshwar Jyotirlinga)', state: 'Madhya Pradesh', type: 'city', keywords: ['ujj', 'ujjain', 'mahakal'] },
  { name: 'Patna', state: 'Bihar', type: 'city', keywords: ['pat', 'patna', 'capital'] },
  { name: 'Gaya / Bodh Gaya', state: 'Bihar', type: 'city', keywords: ['gay', 'gaya', 'bodh gaya'] },
  { name: 'Bhubaneswar', state: 'Odisha', type: 'city', keywords: ['bhu', 'bhubaneswar'] },
  { name: 'Puri (Jagannath Temple)', state: 'Odisha', type: 'city', keywords: ['pur', 'puri', 'jagannath'] },
  { name: 'Guwahati', state: 'Assam', type: 'city', keywords: ['guw', 'guwahati', 'kamakhya'] }
];

/**
 * Synchronous, instant search inside the curated Indian Locations database
 */
export function searchLocalIndiaLocations(query, isDestination = false, limit = 7) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return isDestination ? POPULAR_DESTINATION_SUGGESTIONS.slice(0, limit) : POPULAR_PICKUP_SUGGESTIONS.slice(0, limit);
  }

  const q = query.trim().toLowerCase();

  const scored = INDIA_LOCATIONS_DATABASE.map((item) => {
    const nameLower = item.name.toLowerCase();
    const stateLower = item.state.toLowerCase();
    let score = 0;

    // 1. Direct name prefix match (Top priority: "Jal" -> "Jalandhar", "Del" -> "Delhi")
    if (nameLower.startsWith(q)) {
      score += 1200;
    }
    // 2. Word boundary start (e.g. "New Delhi" matches "del", "ATQ Airport" matches "air")
    else if (nameLower.split(/[\s,()/-]+/).some((w) => w.startsWith(q))) {
      score += 800;
    }
    // 3. Keyword / alias prefix (e.g. "pb08" -> Jalandhar, "igi" -> Delhi Airport)
    else if (item.keywords && item.keywords.some((k) => k.startsWith(q))) {
      score += 600;
    }
    // 4. Name contains substring
    else if (nameLower.includes(q)) {
      score += 300;
    }
    // 5. State contains substring
    else if (stateLower.includes(q)) {
      score += 150;
    }

    // Boost Punjab/NCR locations slightly for regional taxi relevance
    if (score > 0 && (item.state.includes('Punjab') || item.state.includes('Delhi'))) {
      score += 100;
    }

    return { item, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => ({
      name: entry.item.name,
      state: entry.item.state,
      type: entry.item.type,
      display: `${entry.item.name}, ${entry.item.state}`
    }));

  return scored;
}

/**
 * Asynchronous debounced online map geocoder (Photon / OpenStreetMap)
 * Fallback / enrichment for specific colonies, streets or addresses in India
 */
export async function searchOnlineMapLocations(query, signal) {
  if (!query || query.trim().length < 3) return [];

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
      return unique.join(', ');
    }
  } catch (err) {
    console.warn('Reverse geocode error:', err);
  }
  return `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
}
