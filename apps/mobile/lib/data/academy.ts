export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  type: "video" | "article" | "quiz" | "interactive";
  videoUrl?: string;
  thumbnailUrl: string;
  content?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isLocked?: boolean;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "first-home" | "investor" | "finance" | "market" | "legal";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: number; // total minutes
  lessonsCount: number;
  modulesCount: number;
  thumbnailUrl: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  modules: Module[];
  rating: number;
  studentsCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  progress?: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  courses: string[];
  duration: string;
  coursesCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type Country = "AU" | "NZ";

export interface AustralianState {
  id: string;
  name: string;
  abbrev: string;
  country: "AU";
  fhogAmount: number;
  fhogThreshold: number;
  fhogNewOnly: boolean;
  stampDutyExemptionThreshold: number;
  stampDutyConcessionThreshold: number;
  landTaxThreshold: number;
  foreignBuyerSurcharge: number;
  keyLegislation: string[];
  resources: {
    title: string;
    url: string;
    type: "government" | "calculator" | "guide";
  }[];
}

export interface NewZealandRegion {
  id: string;
  name: string;
  abbrev: string;
  country: "NZ";
  kiwiSaverFirstHomeWithdrawal: boolean;
  firstHomeLoanAmount: number;
  firstHomeGrantAmount: number;
  firstHomeGrantThresholdNew: number;
  firstHomeGrantThresholdExisting: number;
  brightLineYears: number;
  overseasInvestmentRestrictions: boolean;
  healthyHomesRequired: boolean;
  keyLegislation: string[];
  resources: {
    title: string;
    url: string;
    type: "government" | "calculator" | "guide";
  }[];
}

export type Region = AustralianState | NewZealandRegion;

export const australianStates: AustralianState[] = [
  {
    id: "nsw",
    name: "New South Wales",
    abbrev: "NSW",
    country: "AU",
    fhogAmount: 10000,
    fhogThreshold: 600000,
    fhogNewOnly: true,
    stampDutyExemptionThreshold: 800000,
    stampDutyConcessionThreshold: 1000000,
    landTaxThreshold: 969000,
    foreignBuyerSurcharge: 8,
    keyLegislation: [
      "Duties Act 1997",
      "Conveyancing Act 1919",
      "Real Property Act 1900",
      "Strata Schemes Management Act 2015",
      "Residential Tenancies Act 2010",
    ],
    resources: [
      { title: "Revenue NSW", url: "https://www.revenue.nsw.gov.au", type: "government" },
      { title: "Service NSW - First Home Buyer", url: "https://www.service.nsw.gov.au", type: "government" },
      { title: "NSW Stamp Duty Calculator", url: "https://www.revenue.nsw.gov.au/calculators", type: "calculator" },
    ],
  },
  {
    id: "vic",
    name: "Victoria",
    abbrev: "VIC",
    country: "AU",
    fhogAmount: 10000,
    fhogThreshold: 750000,
    fhogNewOnly: true,
    stampDutyExemptionThreshold: 600000,
    stampDutyConcessionThreshold: 750000,
    landTaxThreshold: 300000,
    foreignBuyerSurcharge: 8,
    keyLegislation: [
      "Duties Act 2000",
      "Sale of Land Act 1962",
      "Property Law Act 1958",
      "Owners Corporations Act 2006",
      "Residential Tenancies Act 1997",
    ],
    resources: [
      { title: "State Revenue Office Victoria", url: "https://www.sro.vic.gov.au", type: "government" },
      { title: "VIC Stamp Duty Calculator", url: "https://www.sro.vic.gov.au/calculators", type: "calculator" },
    ],
  },
  {
    id: "qld",
    name: "Queensland",
    abbrev: "QLD",
    country: "AU",
    fhogAmount: 30000,
    fhogThreshold: 750000,
    fhogNewOnly: true,
    stampDutyExemptionThreshold: 500000,
    stampDutyConcessionThreshold: 550000,
    landTaxThreshold: 600000,
    foreignBuyerSurcharge: 8,
    keyLegislation: [
      "Duties Act 2001",
      "Property Law Act 1974",
      "Body Corporate and Community Management Act 1997",
      "Residential Tenancies and Rooming Accommodation Act 2008",
    ],
    resources: [
      { title: "Queensland Revenue Office", url: "https://qro.qld.gov.au", type: "government" },
      { title: "QLD Transfer Duty Calculator", url: "https://qro.qld.gov.au/calculators", type: "calculator" },
    ],
  },
  {
    id: "sa",
    name: "South Australia",
    abbrev: "SA",
    country: "AU",
    fhogAmount: 15000,
    fhogThreshold: 650000,
    fhogNewOnly: true,
    stampDutyExemptionThreshold: 0,
    stampDutyConcessionThreshold: 0,
    landTaxThreshold: 450000,
    foreignBuyerSurcharge: 7,
    keyLegislation: [
      "Stamp Duties Act 1923",
      "Real Property Act 1886",
      "Land and Business (Sale and Conveyancing) Act 1994",
      "Strata Titles Act 1988",
      "Residential Tenancies Act 1995",
    ],
    resources: [
      { title: "RevenueSA", url: "https://www.revenuesa.sa.gov.au", type: "government" },
      { title: "SA Stamp Duty Calculator", url: "https://www.revenuesa.sa.gov.au/calculators", type: "calculator" },
    ],
  },
  {
    id: "wa",
    name: "Western Australia",
    abbrev: "WA",
    country: "AU",
    fhogAmount: 10000,
    fhogThreshold: 750000,
    fhogNewOnly: true,
    stampDutyExemptionThreshold: 430000,
    stampDutyConcessionThreshold: 530000,
    landTaxThreshold: 300000,
    foreignBuyerSurcharge: 7,
    keyLegislation: [
      "Duties Act 2008",
      "Transfer of Land Act 1893",
      "Strata Titles Act 1985",
      "Residential Tenancies Act 1987",
    ],
    resources: [
      { title: "WA Department of Finance", url: "https://www.wa.gov.au/organisation/department-of-finance", type: "government" },
      { title: "Keystart Home Loans", url: "https://www.keystart.com.au", type: "government" },
    ],
  },
  {
    id: "tas",
    name: "Tasmania",
    abbrev: "TAS",
    country: "AU",
    fhogAmount: 30000,
    fhogThreshold: 600000,
    fhogNewOnly: true,
    stampDutyExemptionThreshold: 0,
    stampDutyConcessionThreshold: 0,
    landTaxThreshold: 50000,
    foreignBuyerSurcharge: 8,
    keyLegislation: [
      "Duties Act 2001",
      "Land Titles Act 1980",
      "Conveyancing and Law of Property Act 1884",
      "Strata Titles Act 1998",
      "Residential Tenancy Act 1997",
    ],
    resources: [
      { title: "State Revenue Office Tasmania", url: "https://www.sro.tas.gov.au", type: "government" },
    ],
  },
  {
    id: "nt",
    name: "Northern Territory",
    abbrev: "NT",
    country: "AU",
    fhogAmount: 10000,
    fhogThreshold: 750000,
    fhogNewOnly: false,
    stampDutyExemptionThreshold: 0,
    stampDutyConcessionThreshold: 0,
    landTaxThreshold: 0,
    foreignBuyerSurcharge: 0,
    keyLegislation: [
      "Stamp Duty Act 1978",
      "Land Title Act 2000",
      "Unit Titles Act 1975",
      "Residential Tenancies Act 1999",
    ],
    resources: [
      { title: "NT Treasury", url: "https://treasury.nt.gov.au", type: "government" },
      { title: "Territory Revenue Office", url: "https://treasury.nt.gov.au/dtf/territory-revenue-office", type: "government" },
    ],
  },
  {
    id: "act",
    name: "Australian Capital Territory",
    abbrev: "ACT",
    country: "AU",
    fhogAmount: 7000,
    fhogThreshold: 750000,
    fhogNewOnly: true,
    stampDutyExemptionThreshold: 600000,
    stampDutyConcessionThreshold: 750000,
    landTaxThreshold: 0,
    foreignBuyerSurcharge: 0,
    keyLegislation: [
      "Duties Act 1999",
      "Land Titles Act 1925",
      "Civil Law (Property) Act 2006",
      "Unit Titles Act 2001",
      "Residential Tenancies Act 1997",
    ],
    resources: [
      { title: "ACT Revenue Office", url: "https://www.revenue.act.gov.au", type: "government" },
      { title: "Home Buyer Concession Scheme", url: "https://www.revenue.act.gov.au/home-buyer-assistance", type: "government" },
    ],
  },
];

export const newZealandRegions: NewZealandRegion[] = [
  {
    id: "auckland",
    name: "Auckland",
    abbrev: "AKL",
    country: "NZ",
    kiwiSaverFirstHomeWithdrawal: true,
    firstHomeLoanAmount: 875000,
    firstHomeGrantAmount: 10000,
    firstHomeGrantThresholdNew: 875000,
    firstHomeGrantThresholdExisting: 625000,
    brightLineYears: 2,
    overseasInvestmentRestrictions: true,
    healthyHomesRequired: true,
    keyLegislation: [
      "Property Law Act 2007",
      "Unit Titles Act 2010",
      "Residential Tenancies Act 1986",
      "Overseas Investment Act 2005",
      "Healthy Homes Guarantee Act 2017",
      "Building Act 2004",
    ],
    resources: [
      { title: "Kāinga Ora - First Home", url: "https://kaingaora.govt.nz/home-ownership/first-home-grant/", type: "government" },
      { title: "IRD - Bright-line Test", url: "https://www.ird.govt.nz/property/buying-and-selling-property/the-brightline-test", type: "government" },
      { title: "Sorted - First Home Calculator", url: "https://sorted.org.nz/tools/home-affordability-calculator", type: "calculator" },
    ],
  },
  {
    id: "wellington",
    name: "Wellington",
    abbrev: "WLG",
    country: "NZ",
    kiwiSaverFirstHomeWithdrawal: true,
    firstHomeLoanAmount: 650000,
    firstHomeGrantAmount: 10000,
    firstHomeGrantThresholdNew: 650000,
    firstHomeGrantThresholdExisting: 550000,
    brightLineYears: 2,
    overseasInvestmentRestrictions: true,
    healthyHomesRequired: true,
    keyLegislation: [
      "Property Law Act 2007",
      "Unit Titles Act 2010",
      "Residential Tenancies Act 1986",
      "Overseas Investment Act 2005",
      "Healthy Homes Guarantee Act 2017",
    ],
    resources: [
      { title: "Kāinga Ora", url: "https://kaingaora.govt.nz", type: "government" },
      { title: "Tenancy Services NZ", url: "https://www.tenancy.govt.nz", type: "government" },
    ],
  },
  {
    id: "canterbury",
    name: "Canterbury",
    abbrev: "CAN",
    country: "NZ",
    kiwiSaverFirstHomeWithdrawal: true,
    firstHomeLoanAmount: 550000,
    firstHomeGrantAmount: 10000,
    firstHomeGrantThresholdNew: 550000,
    firstHomeGrantThresholdExisting: 450000,
    brightLineYears: 2,
    overseasInvestmentRestrictions: true,
    healthyHomesRequired: true,
    keyLegislation: [
      "Property Law Act 2007",
      "Unit Titles Act 2010",
      "Residential Tenancies Act 1986",
      "Canterbury Earthquake Recovery Act 2011",
    ],
    resources: [
      { title: "Kāinga Ora", url: "https://kaingaora.govt.nz", type: "government" },
    ],
  },
  {
    id: "waikato",
    name: "Waikato",
    abbrev: "WKO",
    country: "NZ",
    kiwiSaverFirstHomeWithdrawal: true,
    firstHomeLoanAmount: 550000,
    firstHomeGrantAmount: 10000,
    firstHomeGrantThresholdNew: 550000,
    firstHomeGrantThresholdExisting: 450000,
    brightLineYears: 2,
    overseasInvestmentRestrictions: true,
    healthyHomesRequired: true,
    keyLegislation: [
      "Property Law Act 2007",
      "Unit Titles Act 2010",
      "Residential Tenancies Act 1986",
    ],
    resources: [
      { title: "Kāinga Ora", url: "https://kaingaora.govt.nz", type: "government" },
    ],
  },
  {
    id: "bay-of-plenty",
    name: "Bay of Plenty",
    abbrev: "BOP",
    country: "NZ",
    kiwiSaverFirstHomeWithdrawal: true,
    firstHomeLoanAmount: 550000,
    firstHomeGrantAmount: 10000,
    firstHomeGrantThresholdNew: 550000,
    firstHomeGrantThresholdExisting: 450000,
    brightLineYears: 2,
    overseasInvestmentRestrictions: true,
    healthyHomesRequired: true,
    keyLegislation: [
      "Property Law Act 2007",
      "Unit Titles Act 2010",
      "Residential Tenancies Act 1986",
    ],
    resources: [
      { title: "Kāinga Ora", url: "https://kaingaora.govt.nz", type: "government" },
    ],
  },
  {
    id: "otago",
    name: "Otago",
    abbrev: "OTA",
    country: "NZ",
    kiwiSaverFirstHomeWithdrawal: true,
    firstHomeLoanAmount: 550000,
    firstHomeGrantAmount: 10000,
    firstHomeGrantThresholdNew: 550000,
    firstHomeGrantThresholdExisting: 450000,
    brightLineYears: 2,
    overseasInvestmentRestrictions: true,
    healthyHomesRequired: true,
    keyLegislation: [
      "Property Law Act 2007",
      "Unit Titles Act 2010",
      "Residential Tenancies Act 1986",
    ],
    resources: [
      { title: "Kāinga Ora", url: "https://kaingaora.govt.nz", type: "government" },
    ],
  },
];

export const allRegions: Region[] = [...australianStates, ...newZealandRegions];

export const getRegionById = (id: string): Region | undefined => {
  return allRegions.find((r) => r.id === id);
};

export const getRegionsByCountry = (country: Country): Region[] => {
  return allRegions.filter((r) => r.country === country);
};

export const stampDutyRates: Record<string, { threshold: number; rate: number; base: number }[]> = {
  nsw: [
    { threshold: 16000, rate: 1.25, base: 0 },
    { threshold: 35000, rate: 1.5, base: 200 },
    { threshold: 93000, rate: 1.75, base: 485 },
    { threshold: 351000, rate: 3.5, base: 1500 },
    { threshold: 1168000, rate: 4.5, base: 10530 },
    { threshold: 3505000, rate: 5.5, base: 47295 },
    { threshold: Infinity, rate: 7.0, base: 175808 },
  ],
  vic: [
    { threshold: 25000, rate: 1.4, base: 0 },
    { threshold: 130000, rate: 2.4, base: 350 },
    { threshold: 960000, rate: 6.0, base: 2870 },
    { threshold: 2000000, rate: 5.5, base: 52700 },
    { threshold: Infinity, rate: 6.5, base: 110000 },
  ],
  qld: [
    { threshold: 5000, rate: 0, base: 0 },
    { threshold: 75000, rate: 1.5, base: 0 },
    { threshold: 540000, rate: 3.5, base: 1050 },
    { threshold: 1000000, rate: 4.5, base: 17325 },
    { threshold: Infinity, rate: 5.75, base: 38025 },
  ],
  sa: [
    { threshold: 12000, rate: 1.0, base: 0 },
    { threshold: 30000, rate: 2.0, base: 120 },
    { threshold: 50000, rate: 3.0, base: 480 },
    { threshold: 100000, rate: 3.5, base: 1080 },
    { threshold: 200000, rate: 4.0, base: 2830 },
    { threshold: 250000, rate: 4.25, base: 6830 },
    { threshold: 300000, rate: 4.75, base: 8955 },
    { threshold: 500000, rate: 5.0, base: 11330 },
    { threshold: Infinity, rate: 5.5, base: 21330 },
  ],
  wa: [
    { threshold: 120000, rate: 1.9, base: 0 },
    { threshold: 150000, rate: 2.85, base: 2280 },
    { threshold: 360000, rate: 3.8, base: 3135 },
    { threshold: 725000, rate: 4.75, base: 11115 },
    { threshold: Infinity, rate: 5.15, base: 28453 },
  ],
  tas: [
    { threshold: 3000, rate: 0, base: 50 },
    { threshold: 25000, rate: 1.75, base: 50 },
    { threshold: 75000, rate: 2.25, base: 435 },
    { threshold: 200000, rate: 3.5, base: 1560 },
    { threshold: 375000, rate: 4.0, base: 5935 },
    { threshold: 725000, rate: 4.25, base: 12935 },
    { threshold: Infinity, rate: 4.5, base: 27810 },
  ],
  nt: [
    { threshold: 525000, rate: 0, base: 0 },
    { threshold: 3000000, rate: 4.95, base: 0 },
    { threshold: Infinity, rate: 5.75, base: 122513 },
  ],
  act: [
    { threshold: 200000, rate: 0.68, base: 0 },
    { threshold: 300000, rate: 2.2, base: 1360 },
    { threshold: 500000, rate: 3.4, base: 3560 },
    { threshold: 750000, rate: 4.32, base: 10360 },
    { threshold: 1000000, rate: 5.9, base: 21160 },
    { threshold: 1455000, rate: 6.4, base: 35910 },
    { threshold: Infinity, rate: 4.54, base: 65030 },
  ],
};

export const calculateStampDuty = (state: string, propertyValue: number): number => {
  const rates = stampDutyRates[state];
  if (!rates) return 0;

  let previousThreshold = 0;
  for (const bracket of rates) {
    if (propertyValue <= bracket.threshold) {
      const taxableAmount = propertyValue - previousThreshold;
      return bracket.base + (taxableAmount * bracket.rate) / 100;
    }
    previousThreshold = bracket.threshold;
  }
  return 0;
};

export const getStateById = (id: string): AustralianState | undefined => {
  return australianStates.find((s) => s.id === id);
};

export const learningPaths: LearningPath[] = [
  {
    id: "first-home-buyer",
    title: "First Home Buyer",
    description: "Everything you need to buy your first property with confidence",
    icon: "Home",
    color: "#0ea5e9",
    courses: ["fhb-101", "finance-fundamentals", "legal-basics", "market-analysis"],
    duration: "8 hours",
    coursesCount: 4,
  },
  {
    id: "property-investor",
    title: "Property Investor",
    description: "Build wealth through strategic property investment",
    icon: "TrendingUp",
    color: "#10b981",
    courses: ["investor-101", "portfolio-strategy", "tax-optimization", "market-analysis"],
    duration: "12 hours",
    coursesCount: 4,
  },
  {
    id: "finance-mastery",
    title: "Finance Mastery",
    description: "Master mortgage structures and lending strategies",
    icon: "Calculator",
    color: "#f59e0b",
    courses: ["finance-fundamentals", "advanced-lending", "refinancing"],
    duration: "6 hours",
    coursesCount: 3,
  },
  {
    id: "au-state-guides",
    title: "Australian State Guides",
    description: "Understand AU laws, stamp duty & grants specific to your state",
    icon: "MapPin",
    color: "#8b5cf6",
    courses: ["state-nsw", "state-vic", "state-qld", "state-sa", "state-wa", "state-tas"],
    duration: "6 hours",
    coursesCount: 6,
  },
  {
    id: "nz-region-guides",
    title: "New Zealand Region Guides",
    description: "Learn about NZ property law, KiwiSaver, and regional requirements",
    icon: "Globe",
    color: "#06b6d4",
    courses: ["region-auckland", "region-wellington", "region-canterbury"],
    duration: "4 hours",
    coursesCount: 3,
  },
  {
    id: "legal-essentials",
    title: "Legal Essentials",
    description: "Navigate contracts, conveyancing & property law",
    icon: "Scale",
    color: "#ec4899",
    courses: ["legal-basics", "contracts-101", "conveyancing-guide"],
    duration: "5 hours",
    coursesCount: 3,
  },
];

export const stateCourses: Course[] = [
  {
    id: "state-nsw",
    title: "NSW Property Guide",
    subtitle: "Complete guide to buying in New South Wales",
    description:
      "Master the NSW property market including stamp duty calculations, First Home Buyer assistance, and understanding the Duties Act 1997. Learn about the $10,000 FHOG, stamp duty exemptions up to $800,000, and key legal requirements.",
    category: "legal",
    difficulty: "beginner",
    duration: 75,
    lessonsCount: 10,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800",
    instructor: {
      name: "Jennifer Adams",
      title: "NSW Property Law Specialist",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
    },
    modules: [
      {
        id: "nsw-m1",
        title: "NSW Stamp Duty & Transfer Duty",
        description: "Understanding duty calculations and exemptions",
        lessons: [
          { id: "nsw-l1", title: "Transfer Duty Explained", description: "How NSW calculates transfer duty on property purchases", duration: 12, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
          { id: "nsw-l2", title: "First Home Buyer Exemptions", description: "Stamp duty exemptions and concessions for FHBs", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
          { id: "nsw-l3", title: "Interactive: NSW Duty Calculator", description: "Calculate your stamp duty", duration: 5, type: "interactive", thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" },
        ],
      },
      {
        id: "nsw-m2",
        title: "NSW First Home Buyer Schemes",
        description: "Maximise government assistance",
        lessons: [
          { id: "nsw-l4", title: "First Home Owner Grant (FHOG)", description: "$10,000 grant for new homes under $600,000", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
          { id: "nsw-l5", title: "First Home Buyer Assistance Scheme", description: "Full exemption up to $800,000", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400" },
          { id: "nsw-l6", title: "Shared Equity Home Buyer Helper", description: "NSW government co-ownership scheme", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400" },
        ],
      },
      {
        id: "nsw-m3",
        title: "NSW Legal Framework",
        description: "Key legislation and requirements",
        lessons: [
          { id: "nsw-l7", title: "Conveyancing Act 1919", description: "Your rights and obligations", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
          { id: "nsw-l8", title: "Cooling Off Periods", description: "5 business days cooling off in NSW", duration: 6, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400" },
          { id: "nsw-l9", title: "Strata vs Torrens Title", description: "Understanding property titles in NSW", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "nsw-l10", title: "NSW Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.9,
    studentsCount: 3421,
    isFeatured: true,
    progress: 0,
  },
  {
    id: "state-vic",
    title: "VIC Property Guide",
    subtitle: "Complete guide to buying in Victoria",
    description:
      "Navigate the Victorian property market with confidence. Understand the Duties Act 2000, stamp duty concessions, and the $10,000 FHOG for new homes. Learn about the unique aspects of buying in Melbourne and regional Victoria.",
    category: "legal",
    difficulty: "beginner",
    duration: 70,
    lessonsCount: 9,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800",
    instructor: {
      name: "Marcus Wong",
      title: "Victorian Property Advisor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
    modules: [
      {
        id: "vic-m1",
        title: "VIC Stamp Duty",
        description: "Duty calculations and concessions",
        lessons: [
          { id: "vic-l1", title: "Victorian Duty Rates", description: "Understanding VIC stamp duty tiers", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
          { id: "vic-l2", title: "Principal Place of Residence Concession", description: "Reduced duty for your home", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
          { id: "vic-l3", title: "Off-the-Plan Concessions", description: "Duty savings on new developments", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
        ],
      },
      {
        id: "vic-m2",
        title: "VIC First Home Buyer Benefits",
        description: "Government grants and schemes",
        lessons: [
          { id: "vic-l4", title: "FHOG Victoria", description: "$10,000 for new homes up to $750,000", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
          { id: "vic-l5", title: "First Home Buyer Duty Exemption", description: "Zero duty under $600,000", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400" },
          { id: "vic-l6", title: "Victorian Homebuyer Fund", description: "Shared equity scheme details", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400" },
        ],
      },
      {
        id: "vic-m3",
        title: "VIC Legal Requirements",
        description: "Contracts and settlement",
        lessons: [
          { id: "vic-l7", title: "Section 32 Statement", description: "The vendor statement explained", duration: 12, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
          { id: "vic-l8", title: "VIC Cooling Off Rights", description: "3 business days in Victoria", duration: 6, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400" },
          { id: "vic-l9", title: "VIC Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.8,
    studentsCount: 2876,
    progress: 0,
  },
  {
    id: "state-qld",
    title: "QLD Property Guide",
    subtitle: "Complete guide to buying in Queensland",
    description:
      "Queensland offers one of the most generous FHOGs at $30,000! Learn about transfer duty, the QLD property market, and legal requirements under the Duties Act 2001.",
    category: "legal",
    difficulty: "beginner",
    duration: 65,
    lessonsCount: 9,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=800",
    instructor: {
      name: "Sophie Turner",
      title: "Queensland Property Expert",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    },
    modules: [
      {
        id: "qld-m1",
        title: "QLD Transfer Duty",
        description: "Understanding Queensland duty",
        lessons: [
          { id: "qld-l1", title: "QLD Transfer Duty Rates", description: "How transfer duty is calculated", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
          { id: "qld-l2", title: "Home Concession", description: "Reduced duty for your residence", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
          { id: "qld-l3", title: "First Home Concession", description: "Zero duty under $500,000", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
        ],
      },
      {
        id: "qld-m2",
        title: "QLD First Home Buyer Benefits",
        description: "$30,000 FHOG and more",
        lessons: [
          { id: "qld-l4", title: "Queensland FHOG", description: "Australias most generous grant at $30,000", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
          { id: "qld-l5", title: "Regional Buying Advantages", description: "Benefits outside SEQ", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
          { id: "qld-l6", title: "Interactive: QLD Benefits Calculator", description: "Calculate your total benefits", duration: 5, type: "interactive", thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" },
        ],
      },
      {
        id: "qld-m3",
        title: "QLD Legal Framework",
        description: "Contracts and Body Corporate",
        lessons: [
          { id: "qld-l7", title: "REIQ Contracts", description: "Standard Queensland contracts explained", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
          { id: "qld-l8", title: "Body Corporate Explained", description: "Understanding QLD strata", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "qld-l9", title: "QLD Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.9,
    studentsCount: 2134,
    isNew: true,
    progress: 0,
  },
  {
    id: "state-sa",
    title: "SA Property Guide",
    subtitle: "Complete guide to buying in South Australia",
    description:
      "Learn the ins and outs of the South Australian property market. Understand stamp duty under the Stamp Duties Act 1923, the $15,000 FHOG, and legal requirements specific to SA.",
    category: "legal",
    difficulty: "beginner",
    duration: 60,
    lessonsCount: 8,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800",
    instructor: {
      name: "Daniel Harris",
      title: "SA Property Consultant",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    },
    modules: [
      {
        id: "sa-m1",
        title: "SA Stamp Duty",
        description: "Understanding SA duty rates",
        lessons: [
          { id: "sa-l1", title: "SA Stamp Duty Rates", description: "Progressive rate structure explained", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
          { id: "sa-l2", title: "Off-the-Plan Duty Concession", description: "Savings on new builds", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
        ],
      },
      {
        id: "sa-m2",
        title: "SA First Home Buyer Schemes",
        description: "$15,000 FHOG and assistance",
        lessons: [
          { id: "sa-l3", title: "SA First Home Owner Grant", description: "$15,000 for new homes under $650,000", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
          { id: "sa-l4", title: "HomeStart Finance", description: "Government-backed low deposit loans", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400" },
        ],
      },
      {
        id: "sa-m3",
        title: "SA Legal Requirements",
        description: "Contracts and settlement",
        lessons: [
          { id: "sa-l5", title: "Form 1 Vendor Statement", description: "What sellers must disclose", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
          { id: "sa-l6", title: "SA Cooling Off Period", description: "2 business days in SA", duration: 6, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400" },
          { id: "sa-l7", title: "Community vs Strata Title", description: "SA title types explained", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "sa-l8", title: "SA Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.7,
    studentsCount: 1243,
    progress: 0,
  },
  {
    id: "state-wa",
    title: "WA Property Guide",
    subtitle: "Complete guide to buying in Western Australia",
    description:
      "Navigate the WA property market with confidence. Learn about Keystart loans, the $10,000 FHOG, and stamp duty under the Duties Act 2008.",
    category: "legal",
    difficulty: "beginner",
    duration: 60,
    lessonsCount: 8,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
    instructor: {
      name: "Rachel Kim",
      title: "WA Property Specialist",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
    },
    modules: [
      {
        id: "wa-m1",
        title: "WA Transfer Duty",
        description: "Understanding WA duty",
        lessons: [
          { id: "wa-l1", title: "WA Duty Rates", description: "Progressive rate structure", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
          { id: "wa-l2", title: "First Home Owner Rate", description: "Reduced duty for FHBs", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
        ],
      },
      {
        id: "wa-m2",
        title: "WA First Home Buyer Benefits",
        description: "FHOG and Keystart",
        lessons: [
          { id: "wa-l3", title: "WA First Home Owner Grant", description: "$10,000 for new homes", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
          { id: "wa-l4", title: "Keystart Home Loans", description: "Government-backed 2% deposit loans", duration: 12, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400" },
        ],
      },
      {
        id: "wa-m3",
        title: "WA Legal Requirements",
        description: "Contracts and settlement",
        lessons: [
          { id: "wa-l5", title: "WA Contract of Sale", description: "Standard REIWA contracts", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
          { id: "wa-l6", title: "Strata Titles Act WA", description: "Understanding WA strata", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "wa-l7", title: "Settlement Agents", description: "WA uses settlement agents, not solicitors", duration: 6, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400" },
          { id: "wa-l8", title: "WA Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.8,
    studentsCount: 1567,
    progress: 0,
  },
  {
    id: "state-tas",
    title: "TAS Property Guide",
    subtitle: "Complete guide to buying in Tasmania",
    description:
      "Tasmania offers a generous $30,000 FHOG! Learn about the Tasmanian property market, stamp duty rates, and legal requirements unique to the Apple Isle.",
    category: "legal",
    difficulty: "beginner",
    duration: 55,
    lessonsCount: 7,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800",
    instructor: {
      name: "Thomas Bell",
      title: "Tasmanian Property Advisor",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    },
    modules: [
      {
        id: "tas-m1",
        title: "TAS Duty & Grants",
        description: "Duty and FHOG explained",
        lessons: [
          { id: "tas-l1", title: "Tasmanian Duty Rates", description: "Progressive rate structure", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
          { id: "tas-l2", title: "$30,000 TAS FHOG", description: "One of Australias most generous grants", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
        ],
      },
      {
        id: "tas-m2",
        title: "TAS Market Insights",
        description: "Understanding the TAS market",
        lessons: [
          { id: "tas-l3", title: "Hobart vs Regional", description: "Market differences explained", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400" },
          { id: "tas-l4", title: "Building in Tasmania", description: "New construction considerations", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
        ],
      },
      {
        id: "tas-m3",
        title: "TAS Legal Framework",
        description: "Contracts and requirements",
        lessons: [
          { id: "tas-l5", title: "TAS Contracts", description: "Understanding Tasmanian contracts", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
          { id: "tas-l6", title: "TAS Cooling Off Period", description: "5 business days in Tasmania", duration: 5, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400" },
          { id: "tas-l7", title: "TAS Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.7,
    studentsCount: 876,
    isNew: true,
    progress: 0,
  },
  {
    id: "region-auckland",
    title: "Auckland Property Guide",
    subtitle: "Complete guide to buying in Auckland, New Zealand",
    description:
      "Navigate Auckland's property market with confidence. Learn about KiwiSaver First Home Withdrawal, the First Home Grant, Healthy Homes Standards, and the bright-line test. Understand NZ's unique property laws and overseas buyer restrictions.",
    category: "legal",
    difficulty: "beginner",
    duration: 80,
    lessonsCount: 11,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800",
    instructor: {
      name: "Aroha Williams",
      title: "Auckland Property Specialist",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
    },
    modules: [
      {
        id: "akl-m1",
        title: "NZ First Home Buyer Schemes",
        description: "KiwiSaver and government assistance",
        lessons: [
          { id: "akl-l1", title: "KiwiSaver First Home Withdrawal", description: "Access your KiwiSaver savings for your first home", duration: 12, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
          { id: "akl-l2", title: "First Home Grant", description: "Up to $10,000 for eligible buyers", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
          { id: "akl-l3", title: "First Home Loan", description: "Kāinga Ora backed low-deposit loans", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400" },
          { id: "akl-l4", title: "Interactive: NZ Benefits Calculator", description: "Calculate your total assistance", duration: 5, type: "interactive", thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" },
        ],
      },
      {
        id: "akl-m2",
        title: "NZ Property Tax & Bright-line",
        description: "Understanding NZ property taxation",
        lessons: [
          { id: "akl-l5", title: "The Bright-line Test Explained", description: "Capital gains tax on property sales", duration: 12, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400" },
          { id: "akl-l6", title: "No Stamp Duty in NZ", description: "How NZ differs from Australia", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400" },
          { id: "akl-l7", title: "Overseas Investment Act", description: "Restrictions on foreign buyers", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
        ],
      },
      {
        id: "akl-m3",
        title: "NZ Legal Framework",
        description: "Property law and requirements",
        lessons: [
          { id: "akl-l8", title: "Property Law Act 2007", description: "Your rights and obligations", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
          { id: "akl-l9", title: "Healthy Homes Standards", description: "Rental property requirements that affect buyers", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "akl-l10", title: "Unit Titles vs Freehold", description: "Understanding NZ property titles", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
          { id: "akl-l11", title: "Auckland Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.8,
    studentsCount: 1245,
    isFeatured: true,
    isNew: true,
    progress: 0,
  },
  {
    id: "region-wellington",
    title: "Wellington Property Guide",
    subtitle: "Complete guide to buying in Wellington, New Zealand",
    description:
      "Master the Wellington property market. Learn about earthquake considerations, LIM reports, and Wellington-specific buying tips alongside KiwiSaver schemes and NZ property law.",
    category: "legal",
    difficulty: "beginner",
    duration: 70,
    lessonsCount: 9,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800",
    instructor: {
      name: "James Te Koha",
      title: "Wellington Property Advisor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
    modules: [
      {
        id: "wlg-m1",
        title: "Wellington Market Essentials",
        description: "Understanding the capital city market",
        lessons: [
          { id: "wlg-l1", title: "Wellington Market Overview", description: "Suburbs, prices, and trends", duration: 12, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400" },
          { id: "wlg-l2", title: "Earthquake Risk & Building Reports", description: "Understanding seismic considerations", duration: 14, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "wlg-l3", title: "LIM Reports Explained", description: "Land Information Memorandum essentials", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
        ],
      },
      {
        id: "wlg-m2",
        title: "First Home Buyer in Wellington",
        description: "Government schemes for Wellington buyers",
        lessons: [
          { id: "wlg-l4", title: "Wellington Price Caps", description: "First Home Grant thresholds in Wellington", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
          { id: "wlg-l5", title: "First Home Partner", description: "Kāinga Ora shared ownership scheme", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400" },
        ],
      },
      {
        id: "wlg-m3",
        title: "Wellington Legal Considerations",
        description: "Specific requirements for the capital",
        lessons: [
          { id: "wlg-l6", title: "Wellington City Council Requirements", description: "Local authority considerations", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400" },
          { id: "wlg-l7", title: "Building Consent History", description: "Checking renovation and building work", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "wlg-l8", title: "Pre-purchase Inspections", description: "What to check before buying", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400" },
          { id: "wlg-l9", title: "Wellington Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.7,
    studentsCount: 892,
    isNew: true,
    progress: 0,
  },
  {
    id: "region-canterbury",
    title: "Canterbury Property Guide",
    subtitle: "Complete guide to buying in Canterbury, New Zealand",
    description:
      "Navigate the Canterbury property market including Christchurch. Understand earthquake rebuilding considerations, EQC, and regional first home buyer caps.",
    category: "legal",
    difficulty: "beginner",
    duration: 65,
    lessonsCount: 8,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    instructor: {
      name: "Sarah Mitchell",
      title: "Canterbury Property Expert",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    },
    modules: [
      {
        id: "can-m1",
        title: "Canterbury Market & EQC",
        description: "Post-earthquake considerations",
        lessons: [
          { id: "can-l1", title: "Canterbury Market Overview", description: "Christchurch and regional trends", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400" },
          { id: "can-l2", title: "Understanding EQC & Natural Disaster Cover", description: "Earthquake Commission explained", duration: 12, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "can-l3", title: "Technical Categories (TC3 Land)", description: "Land classifications in Canterbury", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400" },
        ],
      },
      {
        id: "can-m2",
        title: "First Home Buyer in Canterbury",
        description: "Regional caps and assistance",
        lessons: [
          { id: "can-l4", title: "Canterbury Price Caps", description: "First Home Grant thresholds", duration: 8, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400" },
          { id: "can-l5", title: "New Build Opportunities", description: "Canterbury rebuild and new developments", duration: 10, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400" },
        ],
      },
      {
        id: "can-m3",
        title: "Canterbury Due Diligence",
        description: "Essential checks for Canterbury buyers",
        lessons: [
          { id: "can-l6", title: "Building Reports in Canterbury", description: "What to look for post-earthquake", duration: 12, type: "video", thumbnailUrl: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400" },
          { id: "can-l7", title: "Foundation Types", description: "Understanding Canterbury foundations", duration: 8, type: "article", thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" },
          { id: "can-l8", title: "Canterbury Module Quiz", description: "Test your knowledge", duration: 5, type: "quiz", thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400" },
        ],
      },
    ],
    rating: 4.6,
    studentsCount: 654,
    isNew: true,
    progress: 0,
  },
];

export const regionCourses = stateCourses;

export const courses: Course[] = [
  {
    id: "fhb-101",
    title: "First Home Buyer Essentials",
    subtitle: "Your complete guide to buying your first home",
    description:
      "This comprehensive course covers everything first home buyers need to know, from understanding the market to settlement day. Learn about government grants, deposit requirements, and how to avoid common pitfalls.",
    category: "first-home",
    difficulty: "beginner",
    duration: 180,
    lessonsCount: 24,
    modulesCount: 6,
    thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    instructor: {
      name: "Sarah Mitchell",
      title: "Property Educator & Former Bank Manager",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    },
    modules: [
      {
        id: "fhb-101-m1",
        title: "Getting Started",
        description: "Understand the home buying journey",
        lessons: [
          {
            id: "fhb-101-l1",
            title: "Welcome to Your Home Buying Journey",
            description: "An overview of what to expect when buying your first home",
            duration: 8,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
            isCompleted: true,
          },
          {
            id: "fhb-101-l2",
            title: "The Australian Property Market Explained",
            description: "Understanding market cycles and what they mean for buyers",
            duration: 12,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
            isCompleted: true,
          },
          {
            id: "fhb-101-l3",
            title: "Setting Realistic Goals",
            description: "How to determine what you can afford and where to buy",
            duration: 10,
            type: "article",
            thumbnailUrl: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l4",
            title: "Module 1 Quiz",
            description: "Test your knowledge",
            duration: 5,
            type: "quiz",
            thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400",
            isCompleted: false,
          },
        ],
      },
      {
        id: "fhb-101-m2",
        title: "Government Grants & Schemes",
        description: "Maximize available assistance programs",
        lessons: [
          {
            id: "fhb-101-l5",
            title: "First Home Owner Grant (FHOG)",
            description: "State-by-state breakdown of available grants",
            duration: 15,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l6",
            title: "First Home Guarantee Scheme",
            description: "How to buy with just 5% deposit",
            duration: 12,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l7",
            title: "Stamp Duty Concessions",
            description: "Understanding exemptions and savings",
            duration: 10,
            type: "article",
            thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l8",
            title: "Module 2 Quiz",
            description: "Test your knowledge on grants",
            duration: 5,
            type: "quiz",
            thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400",
            isCompleted: false,
          },
        ],
      },
      {
        id: "fhb-101-m3",
        title: "True Affordability",
        description: "Calculate what you can really afford",
        lessons: [
          {
            id: "fhb-101-l9",
            title: "Beyond the Purchase Price",
            description: "Hidden costs every buyer must know",
            duration: 14,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l10",
            title: "Calculating Your Borrowing Power",
            description: "How banks assess your application",
            duration: 18,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l11",
            title: "Interactive: Affordability Calculator",
            description: "Calculate your true budget",
            duration: 10,
            type: "interactive",
            thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l12",
            title: "Module 3 Quiz",
            description: "Test your affordability knowledge",
            duration: 5,
            type: "quiz",
            thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400",
            isCompleted: false,
          },
        ],
      },
      {
        id: "fhb-101-m4",
        title: "Finding Your Property",
        description: "Search strategies and evaluation",
        isLocked: false,
        lessons: [
          {
            id: "fhb-101-l13",
            title: "Research Like a Pro",
            description: "Tools and techniques for property research",
            duration: 12,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l14",
            title: "Inspecting Properties",
            description: "What to look for and red flags",
            duration: 16,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l15",
            title: "Location Analysis",
            description: "Evaluating suburbs and growth potential",
            duration: 14,
            type: "article",
            thumbnailUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
            isCompleted: false,
          },
        ],
      },
      {
        id: "fhb-101-m5",
        title: "Making an Offer",
        description: "Negotiation and contracts",
        isLocked: false,
        lessons: [
          {
            id: "fhb-101-l16",
            title: "Auction vs Private Sale",
            description: "Strategies for different sale methods",
            duration: 15,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l17",
            title: "Negotiation Masterclass",
            description: "Get the best deal possible",
            duration: 20,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400",
            isCompleted: false,
          },
        ],
      },
      {
        id: "fhb-101-m6",
        title: "Settlement & Beyond",
        description: "Final steps to ownership",
        isLocked: false,
        lessons: [
          {
            id: "fhb-101-l18",
            title: "The Settlement Process",
            description: "What happens between contract and keys",
            duration: 12,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
            isCompleted: false,
          },
          {
            id: "fhb-101-l19",
            title: "Final Course Quiz",
            description: "Complete your certification",
            duration: 10,
            type: "quiz",
            thumbnailUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400",
            isCompleted: false,
          },
        ],
      },
    ],
    rating: 4.9,
    studentsCount: 2847,
    isFeatured: true,
    progress: 15,
  },
  {
    id: "finance-fundamentals",
    title: "Mortgage & Finance Fundamentals",
    subtitle: "Understand lending inside and out",
    description:
      "Demystify mortgages, interest rates, and loan structures. Learn how to get the best deal from lenders and structure your loan for maximum flexibility.",
    category: "finance",
    difficulty: "beginner",
    duration: 120,
    lessonsCount: 16,
    modulesCount: 4,
    thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    instructor: {
      name: "Michael Chen",
      title: "Senior Mortgage Broker",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
    modules: [
      {
        id: "fin-101-m1",
        title: "How Mortgages Work",
        description: "Foundation knowledge for borrowers",
        lessons: [
          {
            id: "fin-101-l1",
            title: "Mortgage Basics Explained",
            description: "Principal, interest, and how loans work",
            duration: 15,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
            isCompleted: false,
          },
          {
            id: "fin-101-l2",
            title: "Fixed vs Variable Rates",
            description: "Choosing the right rate structure",
            duration: 12,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400",
            isCompleted: false,
          },
        ],
      },
      {
        id: "fin-101-m2",
        title: "Getting Approved",
        description: "What lenders look for",
        lessons: [
          {
            id: "fin-101-l3",
            title: "Your Credit Score Explained",
            description: "How to check and improve your score",
            duration: 14,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400",
            isCompleted: false,
          },
          {
            id: "fin-101-l4",
            title: "Document Preparation",
            description: "Everything you need for your application",
            duration: 10,
            type: "article",
            thumbnailUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400",
            isCompleted: false,
          },
        ],
      },
    ],
    rating: 4.8,
    studentsCount: 1923,
    isNew: true,
    progress: 0,
  },
  {
    id: "investor-101",
    title: "Property Investment Fundamentals",
    subtitle: "Start building your property portfolio",
    description:
      "Learn the strategies successful investors use to build wealth through property. Covers cash flow analysis, capital growth, and portfolio structuring.",
    category: "investor",
    difficulty: "intermediate",
    duration: 240,
    lessonsCount: 32,
    modulesCount: 8,
    thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    instructor: {
      name: "David Park",
      title: "Property Investment Advisor",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    },
    modules: [
      {
        id: "inv-101-m1",
        title: "Investment Fundamentals",
        description: "Core concepts every investor needs",
        lessons: [
          {
            id: "inv-101-l1",
            title: "Why Property Investment?",
            description: "Benefits and risks of property investing",
            duration: 12,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
            isCompleted: false,
          },
          {
            id: "inv-101-l2",
            title: "Cash Flow vs Capital Growth",
            description: "Understanding different investment strategies",
            duration: 18,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400",
            isCompleted: false,
          },
        ],
      },
    ],
    rating: 4.7,
    studentsCount: 1456,
    progress: 0,
  },
  {
    id: "legal-basics",
    title: "Property Law for Buyers",
    subtitle: "Understand contracts and your rights",
    description:
      "Navigate the legal side of property transactions with confidence. Learn about contracts, conveyancing, and protecting your interests.",
    category: "legal",
    difficulty: "beginner",
    duration: 90,
    lessonsCount: 12,
    modulesCount: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    instructor: {
      name: "Emma Walsh",
      title: "Property Lawyer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    },
    modules: [
      {
        id: "leg-101-m1",
        title: "Contract Essentials",
        description: "Understanding property contracts",
        lessons: [
          {
            id: "leg-101-l1",
            title: "Reading a Contract of Sale",
            description: "Key clauses and what they mean",
            duration: 20,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400",
            isCompleted: false,
          },
        ],
      },
    ],
    rating: 4.6,
    studentsCount: 892,
    progress: 0,
  },
  {
    id: "market-analysis",
    title: "Market Research & Analysis",
    subtitle: "Make data-driven property decisions",
    description:
      "Learn to analyze property markets like a professional. Understand market cycles, growth indicators, and how to identify opportunities.",
    category: "market",
    difficulty: "intermediate",
    duration: 150,
    lessonsCount: 20,
    modulesCount: 5,
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    instructor: {
      name: "James Liu",
      title: "Property Analyst",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    },
    modules: [
      {
        id: "mkt-101-m1",
        title: "Market Fundamentals",
        description: "Understanding property markets",
        lessons: [
          {
            id: "mkt-101-l1",
            title: "Property Market Cycles",
            description: "How markets move and what drives them",
            duration: 16,
            type: "video",
            thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
            isCompleted: false,
          },
        ],
      },
    ],
    rating: 4.8,
    studentsCount: 1234,
    progress: 0,
  },
];

export const quizQuestions: Record<string, QuizQuestion[]> = {
  "fhb-101-l4": [
    {
      id: "q1",
      question: "What is typically the minimum deposit required for a standard home loan in Australia?",
      options: ["5%", "10%", "20%", "25%"],
      correctAnswer: 2,
      explanation:
        "A 20% deposit is typically required to avoid Lenders Mortgage Insurance (LMI). However, some schemes allow lower deposits.",
    },
    {
      id: "q2",
      question: "Which of the following is NOT a common hidden cost when buying a property?",
      options: ["Stamp duty", "Conveyancing fees", "Council rates", "Real estate agent commission"],
      correctAnswer: 3,
      explanation: "Real estate agent commission is paid by the seller, not the buyer. All other costs are typically paid by the buyer.",
    },
    {
      id: "q3",
      question: "What does LMI stand for?",
      options: ["Loan Management Insurance", "Lenders Mortgage Insurance", "Legal Mortgage Indemnity", "Loan Modification Interest"],
      correctAnswer: 1,
      explanation: "LMI stands for Lenders Mortgage Insurance, which protects the lender (not you) if you default on your loan.",
    },
  ],
  "fhb-101-l8": [
    {
      id: "q1",
      question: "The First Home Owner Grant (FHOG) is available for:",
      options: ["Any property purchase", "New homes only", "Established homes only", "Investment properties"],
      correctAnswer: 1,
      explanation: "The FHOG is typically only available for new homes or substantially renovated homes, not established properties.",
    },
    {
      id: "q2",
      question: "The First Home Guarantee allows you to buy with what minimum deposit?",
      options: ["2%", "5%", "10%", "15%"],
      correctAnswer: 1,
      explanation: "The First Home Guarantee scheme allows eligible buyers to purchase with just a 5% deposit without paying LMI.",
    },
  ],
};

export const userProgress = {
  completedLessons: ["fhb-101-l1", "fhb-101-l2"],
  currentCourse: "fhb-101",
  currentLesson: "fhb-101-l3",
  totalXP: 450,
  streak: 5,
  certificates: [],
  achievements: [
    { id: "first-lesson", title: "First Step", description: "Complete your first lesson", earnedAt: "2024-01-15" },
    { id: "streak-3", title: "Consistent Learner", description: "3 day learning streak", earnedAt: "2024-01-17" },
  ],
};

export const getAllCourses = (): Course[] => {
  return [...courses, ...stateCourses];
};

export const getCourseById = (id: string): Course | undefined => {
  return getAllCourses().find((course) => course.id === id);
};

export const getLessonById = (courseId: string, lessonId: string): Lesson | undefined => {
  const course = getCourseById(courseId);
  if (!course) return undefined;

  for (const module of course.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
};

export const getModuleForLesson = (courseId: string, lessonId: string): Module | undefined => {
  const course = getCourseById(courseId);
  if (!course) return undefined;

  return course.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
};
