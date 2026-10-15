import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  ArrowLeftRight, 
  Car, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  ArrowLeft, 
  ShieldCheck, 
  Phone, 
  Plane, 
  Navigation,
  ChevronRight,
  Filter,
  Info
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';
import BookingModal from '../components/BookingModal';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { trackPageView, trackRouteClick } from '../utils/analytics';

export const ALL_INDIA_ROUTES = [
  // --- Punjab Intercity Express & Airports ---
  {
    id: "jalandhar-delhi",
    category: "delhi-ncr",
    title: "Jalandhar to Delhi & Delhi to Jalandhar Taxi Service",
    shortRoute: "Jalandhar ⇄ Delhi / IGI Airport",
    from: "Jalandhar, Punjab",
    to: "Delhi NCR / IGI Airport (DEL)",
    distance: "~375 km",
    duration: "6–7 Hours via NH44",
    bestFor: "IGI Airport T1/T2/T3, New Delhi Railway, Aerocity & Delhi NCR",
    badge: "Bestseller Highway Route",
    vehicles: "Dzire, Etios, Ertiga, Innova Crysta",
    description: "24/7 door-to-door cab service from Jalandhar to Delhi (IGI Airport, Connaught Place, South Delhi) and return taxi from Delhi to Jalandhar. Pay only one-way fare with zero return dead-mileage charges.",
    tags: ["taxi service", "cab service", "Jalandhar to Delhi taxi", "Delhi to Jalandhar cab", "airport taxi service", "one way cab", "outstation taxi"]
  },
  {
    id: "jalandhar-amritsar",
    category: "punjab",
    title: "Jalandhar to Amritsar & Amritsar to Jalandhar Cab Service",
    shortRoute: "Jalandhar ⇄ Amritsar / ATQ Airport",
    from: "Jalandhar, Punjab",
    to: "Amritsar / Sri Guru Ram Dass Jee Airport",
    distance: "~85 km",
    duration: "1.5 Hours via GT Road",
    bestFor: "Golden Temple (Sri Harmandir Sahib), Wagah Border & ATQ Airport",
    badge: "Golden Temple Express",
    vehicles: "Sedan, Ertiga, Innova Crysta, Tempo",
    description: "Reliable airport pickups and temple pilgrimage cabs connecting Jalandhar and Amritsar. Available 24/7 with verified punctual drivers and clean air-conditioned vehicles.",
    tags: ["cab service", "taxi service", "Jalandhar to Amritsar cab", "Amritsar to Jalandhar taxi", "Amritsar airport taxi", "one way cab Punjab"]
  },
  {
    id: "jalandhar-chandigarh",
    category: "punjab",
    title: "Jalandhar to Chandigarh & Chandigarh to Jalandhar Taxi Service",
    shortRoute: "Jalandhar ⇄ Chandigarh / IXC Airport",
    from: "Jalandhar, Punjab",
    to: "Chandigarh / Mohali / Panchkula",
    distance: "~150 km",
    duration: "2.5–3 Hours via NH344A",
    bestFor: "PGI Chandigarh, Sector 17, Mohali IT Hub & Chandigarh Airport",
    badge: "Express Intercity",
    vehicles: "Dzire, Amaze, Ertiga, Innova Crysta",
    description: "Fast express highway cab service between Jalandhar and Chandigarh/Mohali. Ideal for hospital visits to PGI, airport flights from IXC, embassy appointments, and corporate commutes.",
    tags: ["taxi service", "cab service", "Jalandhar to Chandigarh cab", "Chandigarh to Jalandhar taxi", "airport cab service", "outstation cab"]
  },
  {
    id: "jalandhar-ludhiana",
    category: "punjab",
    title: "Jalandhar to Ludhiana & Ludhiana to Jalandhar Cab Service",
    shortRoute: "Jalandhar ⇄ Ludhiana City",
    from: "Jalandhar, Punjab",
    to: "Ludhiana City / Clock Tower",
    distance: "~62 km",
    duration: "1 Hour via NH44",
    bestFor: "Business travel, industrial visits, shopping, and railway connections",
    badge: "1-Hour Express",
    vehicles: "Hatchback, Sedan, SUV",
    description: "Doorstep pickup in Jalandhar for rapid 60-minute travel to Ludhiana (Ferozepur Road, Chaura Bazaar, DMCH) with flat transparent fares and instant driver assignment.",
    tags: ["cab service", "taxi service", "Jalandhar to Ludhiana cab", "Ludhiana to Jalandhar taxi", "one way cab", "local taxi service"]
  },
  {
    id: "jalandhar-hoshiarpur",
    category: "punjab",
    title: "Jalandhar to Hoshiarpur & Hoshiarpur to Jalandhar Taxi",
    shortRoute: "Jalandhar ⇄ Hoshiarpur",
    from: "Jalandhar, Punjab",
    to: "Hoshiarpur City",
    distance: "~45 km",
    duration: "50 Minutes",
    bestFor: "Doaba daily commute, family visits, hospital appointments",
    badge: "Doaba Express",
    vehicles: "Sedan, Ertiga, Innova",
    description: "Frequent doorstep cab service between Jalandhar and Hoshiarpur. Ideal for students, commuters, and travelers catching connecting airport flights.",
    tags: ["taxi service", "cab service", "Jalandhar to Hoshiarpur cab", "Hoshiarpur to Jalandhar taxi", "one way taxi"]
  },
  {
    id: "jalandhar-phagwara-kapurthala",
    category: "punjab",
    title: "Jalandhar to Phagwara & Kapurthala Local Cab Service",
    shortRoute: "Jalandhar ⇄ Phagwara / Kapurthala",
    from: "Jalandhar, Punjab",
    to: "Phagwara / Kapurthala",
    distance: "~22 km",
    duration: "25–30 Minutes",
    bestFor: "LPU Phagwara campus, Kapurthala Rail Coach Factory (RCF), Jagatjit Palace",
    badge: "Local Hub",
    vehicles: "Compact Sedan, Hatchback, SUV",
    description: "Quick city transfer cabs for university students heading to Lovely Professional University (LPU) or travellers visiting Kapurthala heritage palaces.",
    tags: ["cab service", "taxi service", "LPU taxi", "Phagwara cab", "Kapurthala taxi", "local cab booking"]
  },
  {
    id: "jalandhar-patiala",
    category: "punjab",
    title: "Jalandhar to Patiala Cab Service",
    shortRoute: "Jalandhar ⇄ Patiala",
    from: "Jalandhar, Punjab",
    to: "Patiala Heritage City",
    distance: "~155 km",
    duration: "3 Hours",
    bestFor: "Thapar University, Qila Mubarak, wedding events & family trips",
    badge: "Royal City Route",
    vehicles: "Dzire, Ertiga, Innova Crysta",
    description: "Comfortable AC one-way and round-trip taxi service from Jalandhar to Patiala with experienced highway drivers and timely pickups.",
    tags: ["taxi service", "cab service", "Jalandhar to Patiala taxi", "Patiala to Jalandhar cab", "outstation taxi"]
  },
  {
    id: "jalandhar-bathinda",
    category: "punjab",
    title: "Jalandhar to Bathinda Taxi Service",
    shortRoute: "Jalandhar ⇄ Bathinda",
    from: "Jalandhar, Punjab",
    to: "Bathinda City / AIIMS",
    distance: "~170 km",
    duration: "3.5 Hours",
    bestFor: "AIIMS Bathinda, thermal plant visits, Malwa region travel",
    badge: "Malwa Express",
    vehicles: "Dzire, Ertiga, Innova",
    description: "Direct outstation cabs from Jalandhar to Bathinda. Safe, reliable chauffeur service with fair fixed rates and zero hidden fees.",
    tags: ["cab service", "taxi service", "Jalandhar to Bathinda cab", "Bathinda taxi service", "one way cab Punjab"]
  },
  {
    id: "jalandhar-pathankot",
    category: "punjab",
    title: "Jalandhar to Pathankot Cab Service",
    shortRoute: "Jalandhar ⇄ Pathankot",
    from: "Jalandhar, Punjab",
    to: "Pathankot Cantt / City",
    distance: "~115 km",
    duration: "2.5 Hours via NH44",
    bestFor: "Pathankot Cantt Railway junction, gate to Himachal & Jammu",
    badge: "Gateway Route",
    vehicles: "Sedan, SUV, Innova",
    description: "Smooth highway transit from Jalandhar to Pathankot for connecting trains or onward travel into Jammu & Kashmir and Kangra Valley.",
    tags: ["taxi service", "cab service", "Jalandhar to Pathankot taxi", "Pathankot cab service", "outstation taxi"]
  },
  {
    id: "jalandhar-nawanshahr",
    category: "punjab",
    title: "Jalandhar to Nawanshahr & Banga Taxi Service",
    shortRoute: "Jalandhar ⇄ Nawanshahr / Banga",
    from: "Jalandhar, Punjab",
    to: "Nawanshahr (SBS Nagar) / Banga",
    distance: "~60 km",
    duration: "1 Hour 15 Mins",
    bestFor: "NRI family visits, rural hometown trips, local errands",
    badge: "Doaba Rural",
    vehicles: "Sedan, SUV",
    description: "Dedicated point-to-point taxi transfers between Jalandhar and SBS Nagar / Nawanshahr with luggage assistance and clean cabs.",
    tags: ["cab service", "taxi service", "Nawanshahr taxi", "Banga cab service", "one way taxi"]
  },
  {
    id: "jalandhar-nakodar-shahkot",
    category: "punjab",
    title: "Jalandhar to Nakodar & Shahkot Cab Service",
    shortRoute: "Jalandhar ⇄ Nakodar / Shahkot",
    from: "Jalandhar, Punjab",
    to: "Nakodar Dargah / Shahkot",
    distance: "~35 km",
    duration: "40 Minutes",
    bestFor: "Baba Murad Shah Ji Dargah, Peer Baba Laddi Shah Ji, local visits",
    badge: "Dargah Pilgrimage",
    vehicles: "Hatchback, Sedan, Ertiga",
    description: "Special pilgrimage and family cabs to Dargah Baba Murad Shah Ji in Nakodar with flexible round-trip waiting options.",
    tags: ["taxi service", "cab service", "Nakodar cab", "Baba Murad Shah taxi", "local taxi service"]
  },
  {
    id: "jalandhar-moga-firozpur",
    category: "punjab",
    title: "Jalandhar to Moga & Firozpur Cab Service",
    shortRoute: "Jalandhar ⇄ Moga / Firozpur",
    from: "Jalandhar, Punjab",
    to: "Moga / Firozpur Border",
    distance: "~135 km",
    duration: "2.5 Hours",
    bestFor: "Hussainiwala Border Retreat, hospital commutes, agricultural hubs",
    badge: "Border Express",
    vehicles: "Sedan, Ertiga, Innova",
    description: "Punctual one-way and round-trip taxi service from Jalandhar to Moga and Firozpur with seasoned highway drivers.",
    tags: ["taxi service", "cab service", "Moga taxi service", "Firozpur cab", "outstation cab"]
  },

  // --- Himachal Pradesh & Hill Stations ---
  {
    id: "jalandhar-shimla",
    category: "himachal",
    title: "Jalandhar to Shimla Outstation Hill Taxi Service",
    shortRoute: "Jalandhar ⇄ Shimla / Kufri",
    from: "Jalandhar, Punjab",
    to: "Shimla, Himachal Pradesh",
    distance: "~220 km",
    duration: "5–6 Hours",
    bestFor: "The Mall Road, Kufri snow point, Jakhu Temple, Chail",
    badge: "Queen of Hills",
    vehicles: "Dzire, Ertiga, Innova Crysta",
    description: "Specialized mountain-tested chauffeurs for Jalandhar to Shimla holidays and family tours. Safe driving on curves with photo stopovers at Timber Trail Parwanoo.",
    tags: ["taxi service", "cab service", "Jalandhar to Shimla taxi", "Shimla outstation cab", "Himachal tour taxi", "best cab service"]
  },
  {
    id: "jalandhar-manali",
    category: "himachal",
    title: "Jalandhar to Manali & Solang Valley Taxi Service",
    shortRoute: "Jalandhar ⇄ Manali / Solang",
    from: "Jalandhar, Punjab",
    to: "Manali / Atal Tunnel / Rohtang",
    distance: "~330 km",
    duration: "8–9 Hours",
    bestFor: "Solang Valley adventure, Atal Tunnel, Old Manali, Rohtang Pass",
    badge: "Himalayan Tour",
    vehicles: "Innova Crysta, Ertiga, Sedan",
    description: "Premium AC cabs from Jalandhar to Manali with experienced hill drivers. Round-trip packages available covering local sightseeing, Solang, and Atal Tunnel.",
    tags: ["cab service", "taxi service", "Jalandhar to Manali taxi", "Manali tour cab", "Innova taxi service", "outstation taxi"]
  },
  {
    id: "jalandhar-dharamshala",
    category: "himachal",
    title: "Jalandhar to Dharamshala & McLeod Ganj Cab Service",
    shortRoute: "Jalandhar ⇄ Dharamshala / McLeod Ganj",
    from: "Jalandhar, Punjab",
    to: "Dharamshala / McLeod Ganj",
    distance: "~160 km",
    duration: "4 Hours",
    bestFor: "HPCA Cricket Stadium, Dalai Lama Temple, Bhagsu Waterfall, Triund",
    badge: "Peace & Mountains",
    vehicles: "Dzire, Ertiga, Innova",
    description: "Scenic drive from Jalandhar to Dharamshala and McLeod Ganj. Enjoy smooth mountain roads with experienced drivers who know every turn of the Kangra Valley.",
    tags: ["taxi service", "cab service", "Jalandhar to Dharamshala taxi", "McLeod Ganj cab", "Himachal cab service"]
  },
  {
    id: "jalandhar-dalhousie",
    category: "himachal",
    title: "Jalandhar to Dalhousie & Khajjiar Tour Taxi",
    shortRoute: "Jalandhar ⇄ Dalhousie / Khajjiar",
    from: "Jalandhar, Punjab",
    to: "Dalhousie / Mini Switzerland Khajjiar",
    distance: "~195 km",
    duration: "5 Hours",
    bestFor: "Khajjiar meadows, Panchpula, Dainkund Peak, Kalatop Sanctuary",
    badge: "Mini Switzerland",
    vehicles: "Innova Crysta, Ertiga, Sedan",
    description: "Romantic and family holiday cab service from Jalandhar to Dalhousie and Khajjiar with verified chauffeurs and comfortable suspension.",
    tags: ["cab service", "taxi service", "Jalandhar to Dalhousie cab", "Khajjiar taxi", "outstation holiday taxi"]
  },
  {
    id: "jalandhar-kasauli",
    category: "himachal",
    title: "Jalandhar to Kasauli Weekend Getaway Taxi",
    shortRoute: "Jalandhar ⇄ Kasauli",
    from: "Jalandhar, Punjab",
    to: "Kasauli Pine Hills",
    distance: "~190 km",
    duration: "4.5 Hours",
    bestFor: "Gilbert Nature Trail, Sunset Point, Christ Church, quiet retreats",
    badge: "Pine Woods Retreat",
    vehicles: "Sedan, SUV, Innova",
    description: "Quick weekend mountain escape from Jalandhar to Kasauli. Clean cabs, punctual pickup, and peaceful driving through scenic pine forests.",
    tags: ["taxi service", "cab service", "Jalandhar to Kasauli taxi", "weekend getaway cab", "outstation taxi"]
  },
  {
    id: "jalandhar-palampur-bir",
    category: "himachal",
    title: "Jalandhar to Palampur & Bir Billing Paragliding Cab",
    shortRoute: "Jalandhar ⇄ Palampur / Bir Billing",
    from: "Jalandhar, Punjab",
    to: "Palampur Tea Gardens / Bir Billing",
    distance: "~190 km",
    duration: "5 Hours",
    bestFor: "Bir Billing paragliding site, lush tea gardens, Baijnath Temple",
    badge: "Paragliding Hub",
    vehicles: "Innova Crysta, Ertiga, Sedan",
    description: "Adventure trip cabs from Jalandhar to Bir Billing (World's #2 Paragliding site) and Palampur tea estates with mountain-certified drivers.",
    tags: ["cab service", "taxi service", "Bir Billing taxi", "Palampur cab service", "outstation tour taxi"]
  },

  // --- Jammu & Kashmir ---
  {
    id: "jalandhar-katra",
    category: "jammu-kashmir",
    title: "Jalandhar to Katra (Mata Vaishno Devi) Pilgrimage Taxi",
    shortRoute: "Jalandhar ⇄ Katra / Vaishno Devi",
    from: "Jalandhar, Punjab",
    to: "Katra Base Camp, J&K",
    distance: "~255 km",
    duration: "5.5 Hours via NH44",
    bestFor: "Mata Vaishno Devi Bhawan Yatra, Banganga, Ardhkuwari, Bhairon Temple",
    badge: "Mata Vaishno Devi Yatra",
    vehicles: "Innova Crysta, Ertiga, Dzire",
    description: "Dedicated 24/7 pilgrimage cabs from Jalandhar to Katra. Verified drivers with route experience across Lakhanpur and Jammu bypass. Same-day or multi-day return waiting.",
    tags: ["taxi service", "cab service", "Jalandhar to Katra taxi", "Vaishno Devi cab service", "Katra outstation taxi", "pilgrimage cab"]
  },
  {
    id: "jalandhar-jammu",
    category: "jammu-kashmir",
    title: "Jalandhar to Jammu City & Jammu Airport Cab Service",
    shortRoute: "Jalandhar ⇄ Jammu Tawi / Airport",
    from: "Jalandhar, Punjab",
    to: "Jammu Tawi / Jammu Airport (IXJ)",
    distance: "~210 km",
    duration: "4.5 Hours",
    bestFor: "Jammu Tawi Railway Station, Raghunath Temple, Jammu Airport transfers",
    badge: "City of Temples",
    vehicles: "Sedan, SUV, Innova",
    description: "Comfortable interstate taxi connecting Jalandhar to Jammu with timely pickups and zero state border hassles.",
    tags: ["cab service", "taxi service", "Jalandhar to Jammu cab", "Jammu to Jalandhar taxi", "interstate taxi service"]
  },
  {
    id: "jalandhar-srinagar",
    category: "jammu-kashmir",
    title: "Jalandhar to Srinagar (Kashmir Valley) Tour Taxi",
    shortRoute: "Jalandhar ⇄ Srinagar / Dal Lake",
    from: "Jalandhar, Punjab",
    to: "Srinagar / Dal Lake / Gulmarg",
    distance: "~480 km",
    duration: "11–12 Hours via Banihal Qazigund Tunnel",
    bestFor: "Dal Lake Shikara, Gulmarg Gondola, Pahalgam Valley, Sonamarg",
    badge: "Paradise on Earth",
    vehicles: "Innova Crysta, Ertiga 7-Seater",
    description: "Complete Kashmir holiday taxi package from Jalandhar. Experienced long-haul mountain drivers with verified safety credentials for high mountain passes.",
    tags: ["taxi service", "cab service", "Jalandhar to Srinagar taxi", "Kashmir tour cab", "Innova Crysta Kashmir taxi"]
  },

  // --- Delhi NCR, Haryana, Rajasthan & Uttarakhand ---
  {
    id: "jalandhar-gurugram",
    category: "delhi-ncr",
    title: "Jalandhar to Gurugram (Gurgaon) Corporate Cab Service",
    shortRoute: "Jalandhar ⇄ Gurugram / Cyber Hub",
    from: "Jalandhar, Punjab",
    to: "Gurugram (Gurgaon) Cyber City / Golf Course Rd",
    distance: "~410 km",
    duration: "7 Hours via Western Peripheral Expressway (KMP)",
    bestFor: "DLF Cyber City, MNC corporate offices, Udyog Vihar",
    badge: "Corporate Express",
    vehicles: "Executive Sedan, Innova Crysta",
    description: "Door-to-door direct corporate cabs between Jalandhar and Gurgaon with seamless expressway navigation avoiding central Delhi traffic.",
    tags: ["cab service", "taxi service", "Jalandhar to Gurgaon cab", "Gurugram outstation taxi", "corporate cab service"]
  },
  {
    id: "jalandhar-noida",
    category: "delhi-ncr",
    title: "Jalandhar to Noida & Greater Noida Taxi Service",
    shortRoute: "Jalandhar ⇄ Noida / Greater Noida",
    from: "Jalandhar, Punjab",
    to: "Noida Sector 62 / Greater Noida Express",
    distance: "~415 km",
    duration: "7.5 Hours via Eastern Peripheral Expressway",
    bestFor: "IT Parks, India Expo Mart, residential sectors",
    badge: "NCR Expressway",
    vehicles: "Sedan, SUV, Innova",
    description: "Reliable highway cabs from Jalandhar to Noida and Greater Noida with upfront billing and professional chauffeurs.",
    tags: ["taxi service", "cab service", "Jalandhar to Noida taxi", "Noida outstation cab", "one way taxi"]
  },
  {
    id: "jalandhar-jaipur",
    category: "haryana-rajasthan",
    title: "Jalandhar to Jaipur (Pink City) Heritage Tour Cab",
    shortRoute: "Jalandhar ⇄ Jaipur / Rajasthan",
    from: "Jalandhar, Punjab",
    to: "Jaipur, Rajasthan",
    distance: "~610 km",
    duration: "9.5 Hours via Trans-Haryana Expressway (NH152D)",
    bestFor: "Hawa Mahal, Amer Fort, City Palace, Royal weddings",
    badge: "Royal Heritage",
    vehicles: "Innova Crysta, Ertiga, Sedan",
    description: "Ultra-smooth high-speed highway ride via NH152D connecting Jalandhar directly to Jaipur. Ideal for family vacations and heritage sightseeing.",
    tags: ["cab service", "taxi service", "Jalandhar to Jaipur taxi", "Jaipur outstation cab", "Trans Haryana expressway taxi"]
  },
  {
    id: "jalandhar-agra",
    category: "haryana-rajasthan",
    title: "Jalandhar to Agra (Taj Mahal Tour) Cab Service",
    shortRoute: "Jalandhar ⇄ Agra / Taj Mahal",
    from: "Jalandhar, Punjab",
    to: "Agra, Uttar Pradesh",
    distance: "~590 km",
    duration: "9 Hours via Yamuna Expressway",
    bestFor: "Taj Mahal sunrise view, Agra Fort, Fatehpur Sikri",
    badge: "Wonder of the World",
    vehicles: "Innova Crysta, Ertiga, Sedan",
    description: "Direct tourist cab service from Jalandhar to the Taj Mahal city of Agra via modern expressways with comfortable rest stopovers.",
    tags: ["taxi service", "cab service", "Jalandhar to Agra taxi", "Taj Mahal tour cab", "outstation car rental"]
  },
  {
    id: "jalandhar-haridwar-rishikesh",
    category: "haryana-rajasthan",
    title: "Jalandhar to Haridwar & Rishikesh Ganga Darshan Taxi",
    shortRoute: "Jalandhar ⇄ Haridwar / Rishikesh",
    from: "Jalandhar, Punjab",
    to: "Haridwar Har Ki Pauri / Rishikesh Ram Jhula",
    distance: "~360 km",
    duration: "7 Hours",
    bestFor: "Ganga Aarti at Har Ki Pauri, Rishikesh river rafting, yoga ashrams",
    badge: "Holy Ganga Tour",
    vehicles: "Dzire, Ertiga, Innova Crysta",
    description: "Spiritual pilgrimage and adventure cabs from Jalandhar to Haridwar and Rishikesh with flexible same-day or multi-day return options.",
    tags: ["taxi service", "cab service", "Jalandhar to Haridwar taxi", "Rishikesh cab service", "holy Ganga pilgrimage taxi"]
  },
  {
    id: "jalandhar-dehradun-mussoorie",
    category: "haryana-rajasthan",
    title: "Jalandhar to Dehradun & Mussoorie Hill Station Cab",
    shortRoute: "Jalandhar ⇄ Dehradun / Mussoorie",
    from: "Jalandhar, Punjab",
    to: "Dehradun / Mussoorie Mall Road",
    distance: "~340 km",
    duration: "6.5–7 Hours",
    bestFor: "Kempty Falls, Gun Hill, Robber's Cave, Forest Research Institute (FRI)",
    badge: "Queen of Hills UK",
    vehicles: "Innova Crysta, Ertiga, Sedan",
    description: "Scenic road trip from Jalandhar to Dehradun and the misty hills of Mussoorie with experienced hill chauffeurs and spotless vehicles.",
    tags: ["cab service", "taxi service", "Jalandhar to Dehradun cab", "Mussoorie taxi service", "Uttarakhand hill cab"]
  },
  {
    id: "jalandhar-ambala-kurukshetra",
    category: "haryana-rajasthan",
    title: "Jalandhar to Ambala & Kurukshetra Cab Service",
    shortRoute: "Jalandhar ⇄ Ambala / Kurukshetra",
    from: "Jalandhar, Punjab",
    to: "Ambala Cantt / Kurukshetra Brahma Sarovar",
    distance: "~175–220 km",
    duration: "3–3.5 Hours via NH44",
    bestFor: "Ambala Cloth Market, Kurukshetra University, Brahma Sarovar Darshan",
    badge: "Highway Intercity",
    vehicles: "Sedan, SUV",
    description: "Dependable point-to-point one-way and round-trip taxi service between Jalandhar and Haryana cities along National Highway 44.",
    tags: ["taxi service", "cab service", "Jalandhar to Ambala cab", "Kurukshetra taxi service", "NH44 outstation taxi"]
  },
  {
    id: "jalandhar-panipat-sonipat",
    category: "haryana-rajasthan",
    title: "Jalandhar to Panipat & Sonipat Highway Taxi",
    shortRoute: "Jalandhar ⇄ Panipat / Sonipat",
    from: "Jalandhar, Punjab",
    to: "Panipat Textile City / Sonipat",
    distance: "~290 km",
    duration: "5 Hours via NH44",
    bestFor: "Textile market visits, Murthal Dhabas, education hubs (OP Jindal/Ashoka)",
    badge: "Industrial Route",
    vehicles: "Sedan, SUV",
    description: "Comfortable highway cab service connecting Jalandhar to Panipat and Sonipat with easy roadside halt options at Murthal.",
    tags: ["cab service", "taxi service", "Jalandhar to Panipat cab", "Sonipat taxi", "one way outstation taxi"]
  }
];

export const CATEGORIES = [
  { id: "all", label: "All India Routes" },
  { id: "punjab", label: "Punjab Intercity & Airports" },
  { id: "delhi-ncr", label: "Delhi NCR & Airport Cabs" },
  { id: "himachal", label: "Himachal Pradesh & Hill Stations" },
  { id: "jammu-kashmir", label: "Jammu & Katra (Vaishno Devi)" },
  { id: "haryana-rajasthan", label: "Haryana, Rajasthan & Uttarakhand" },
];

export const DENSE_SEO_KEYWORD_TAGS = [
  "taxi service",
  "cab service",
  "taxi service near me",
  "cab service near me",
  "best taxi service in Jalandhar",
  "cheapest cab service in Punjab",
  "Jalandhar taxi service",
  "Jalandhar cab service",
  "One Way Jalandhar taxi",
  "one way cab Punjab",
  "outstation taxi service",
  "outstation cab service",
  "airport taxi service",
  "airport cab booking",
  "Delhi airport taxi service",
  "Amritsar airport cab service",
  "Chandigarh airport taxi",
  "round trip taxi service",
  "intercity cab service",
  "Innova Crysta taxi service",
  "Dzire cab booking",
  "Ertiga taxi service Jalandhar",
  "24/7 taxi service",
  "safe cab service for women",
  "Himachal tour taxi service",
  "Katra Vaishno Devi taxi",
  "Manali outstation cab",
  "Shimla outstation taxi",
  "Dharamshala cab service",
  "Dalhousie taxi service",
  "Jaipur outstation cab",
  "Agra Taj Mahal tour taxi",
  "Haridwar Rishikesh taxi",
  "Dehradun cab service",
  "Mussoorie hill taxi",
  "PB08 TAXI booking",
  "PB08 cab service",
  "cheap outstation cab",
  "instant WhatsApp taxi booking"
];

export default function PopularRoutesPage() {
  const { settings } = useSiteSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const brandTitle = settings?.brand_title || 'PB08 TAXI';
  const supportPhone = settings?.support_phone || '+919888079736';
  const cleanPhone = supportPhone.replace(/\D/g, '');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `Popular Taxi & Cab Routes in India — ${brandTitle} | One Way & Airport Cabs`;
    trackPageView('/popular-routes');
  }, [brandTitle]);

  const handleOpenBooking = (routeTitle = 'Popular Route') => {
    trackRouteClick(typeof routeTitle === 'string' ? routeTitle : 'Popular Route Page');
    setIsBookingOpen(true);
  };
  const handleCloseBooking = () => setIsBookingOpen(false);

  // Filter routes based on search query and category
  const filteredRoutes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ALL_INDIA_ROUTES.filter((route) => {
      const matchesCategory = selectedCategory === 'all' || route.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const searchableText = `${route.title} ${route.shortRoute} ${route.from} ${route.to} ${route.bestFor} ${route.description} ${route.tags.join(' ')}`.toLowerCase();
      return searchableText.includes(query);
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-taxi-yellow selection:text-black">
      {/* Navigation */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Hero Header */}
      <header className="relative pt-28 pb-16 bg-gradient-to-b from-zinc-900/90 via-black to-black border-b border-zinc-850 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-96 bg-taxi-yellow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium">
            <Link to="/" className="hover:text-taxi-yellow flex items-center space-x-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-200">Routes &amp; Travel</span>
            <span>/</span>
            <span className="text-taxi-yellow">Popular Taxi &amp; Cab Routes Across India</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-taxi-yellow/15 border border-taxi-yellow/30 text-taxi-yellow text-xs font-bold uppercase tracking-wider">
              <ArrowLeftRight className="w-4 h-4" />
              <span>India-Wide 24/7 Outstation &amp; Airport Taxi Service</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Popular Taxi &amp; Cab Routes Across India
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
              Book verified, commercial one-way cabs and round-trip outstation taxi services from <strong className="text-white">Jalandhar, Punjab</strong> to <strong className="text-taxi-yellow">Delhi, Amritsar, Ludhiana, Chandigarh, Shimla, Manali, Katra, Jaipur, Haridwar</strong> and 30+ destinations across India. Transparent fixed pricing, zero return charges, and guaranteed 24/7 on-time dispatch.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-2xl">
              <span className="text-xl sm:text-2xl font-black text-taxi-yellow block">35+ Routes</span>
              <span className="text-[11px] text-zinc-400">All India Coverage</span>
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-2xl">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block">One-Way Drop</span>
              <span className="text-[11px] text-zinc-400">Zero Return Fare</span>
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-2xl">
              <span className="text-xl sm:text-2xl font-black text-white block">24/7 Helpline</span>
              <span className="text-[11px] text-zinc-400">Live Driver Tracking</span>
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-2xl">
              <span className="text-xl sm:text-2xl font-black text-taxi-yellow block">4.9 ★ Rating</span>
              <span className="text-[11px] text-zinc-400">Verified Chauffeurs</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Search & Filter Bar */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destination, city, or route (e.g. Delhi, Amritsar, Manali, Airport, Katra)..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-taxi-yellow rounded-2xl py-3 pl-12 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Result Counter */}
            <div className="text-xs text-zinc-400 flex items-center space-x-1.5 self-center md:self-auto flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-taxi-yellow animate-pulse" />
              <span>Showing <strong className="text-white">{filteredRoutes.length}</strong> of {ALL_INDIA_ROUTES.length} routes</span>
            </div>

          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-taxi-yellow text-black border-taxi-yellow shadow-md shadow-taxi-yellow/20'
                      : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 hover:text-white border-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Routes Grid */}
        {filteredRoutes.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-taxi-yellow flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No routes found matching "{searchQuery}"</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              We travel to any city, town, or state across India! Call our 24/7 hotline directly to get an instant customized fare quote.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Reset Filters
              </button>
              <a
                href={`tel:${cleanPhone}`}
                className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black text-xs font-black px-5 py-2 rounded-xl flex items-center space-x-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Helpline: {supportPhone}</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route) => (
              <article
                key={route.id}
                className="bg-zinc-950 border border-zinc-850 hover:border-taxi-yellow/50 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-taxi-yellow/5 group"
              >
                <div className="space-y-4">
                  {/* Badge & Route Origin-Destination Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-taxi-yellow bg-taxi-yellow/10 border border-taxi-yellow/20 px-2.5 py-1 rounded-full truncate">
                      {route.badge}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1 flex-shrink-0">
                      <Clock className="w-3 h-3 text-taxi-yellow" />
                      <span>{route.duration}</span>
                    </span>
                  </div>

                  {/* Route Title */}
                  <div>
                    <h2 className="text-lg font-black text-white group-hover:text-taxi-yellow transition-colors leading-tight">
                      {route.title}
                    </h2>
                    <p className="text-xs font-bold text-zinc-400 flex items-center space-x-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-taxi-yellow flex-shrink-0" />
                      <span className="text-zinc-200">{route.shortRoute}</span>
                    </p>
                  </div>

                  {/* Distance & Highlights */}
                  <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-400">Route Distance:</span>
                      <strong className="text-white font-mono">{route.distance}</strong>
                    </div>
                    <div className="text-[11px] text-zinc-400 pt-0.5">
                      <strong className="text-zinc-300">Key Stops:</strong> {route.bestFor}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {route.description}
                  </p>

                  {/* SEO Keyword Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {route.tags.slice(0, 4).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Inside Card */}
                <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-zinc-400 truncate flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{route.vehicles}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking(route.shortRoute)}
                    className="bg-taxi-yellow hover:bg-taxi-yellowHover text-black font-extrabold px-4 py-2 rounded-xl text-xs shadow-md shadow-taxi-yellow/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5 flex-shrink-0"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Book Cab</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* High-Impact SEO Keywords & Cab Service Tags Directory */}
        <section className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-taxi-yellow">
              <Sparkles className="w-4 h-4" />
              <span>High-Ranking Taxi &amp; Cab Service Keywords Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Instant One-Click Booking by Search Tags
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Looking for a specific taxi service, outstation cab, airport drop, or chauffeur-driven car in Punjab? Click any tag below to launch instant WhatsApp confirmation at flat, guaranteed tariffs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {DENSE_SEO_KEYWORD_TAGS.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOpenBooking(`Keyword Tag: ${tag}`)}
                className="text-xs font-semibold text-zinc-300 hover:text-black bg-zinc-900 hover:bg-taxi-yellow border border-zinc-800 hover:border-taxi-yellow px-3.5 py-2 rounded-xl transition-all shadow-sm hover:scale-105"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* Why Book PB08 TAXI for Popular Routes */}
        <section className="bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 border border-zinc-850 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-taxi-yellow">
              The PB08 Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Travellers Choose PB08 TAXI Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="bg-black/60 border border-zinc-850 p-5 rounded-2xl space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">Zero Hidden Charges</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Clear upfront tariff with state tolls, border tax, and parking explained transparently. Zero midnight surge surprises.
              </p>
            </div>

            <div className="bg-black/60 border border-zinc-850 p-5 rounded-2xl space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">Guaranteed On-Time Pickups</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Flight catching or early morning departure? Chauffeurs arrive 15 minutes before scheduled pickup at your doorstep.
              </p>
            </div>

            <div className="bg-black/60 border border-zinc-850 p-5 rounded-2xl space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-taxi-yellow/10 text-taxi-yellow flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white">Spotless Sanitized Fleet</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose from compact Dzire sedans, spacious Ertiga MPVs, or luxury Toyota Innova Crysta with luggage carriers.
              </p>
            </div>
          </div>
        </section>

        {/* Ready to Travel CTA */}
        <section className="bg-taxi-yellow text-black rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Ready to Book Your Ride Across India?
            </h2>
            <p className="text-xs sm:text-sm font-medium text-black/80 max-w-xl">
              Get instant driver details and booking confirmation on WhatsApp in under 60 seconds with PB08 TAXI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleOpenBooking('Popular Routes Bottom CTA')}
              className="w-full sm:w-auto bg-black hover:bg-zinc-900 text-white font-black text-xs sm:text-sm px-8 py-4 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 text-center"
            >
              One Click Book Your Ride
            </button>
            <a
              href={`tel:${cleanPhone}`}
              className="w-full sm:w-auto bg-white/90 hover:bg-white text-black font-extrabold text-xs sm:text-sm px-6 py-4 rounded-xl shadow-md transition-all text-center flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>{supportPhone}</span>
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer onOpenBooking={handleOpenBooking} />

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp onOpenBooking={handleOpenBooking} />

      {/* One Click Book Your Ride Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
}
