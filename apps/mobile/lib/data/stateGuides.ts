export interface StateGuide {
  id: string;
  name: string;
  abbrev: string;
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

export const stateGuides: StateGuide[] = [
  {
    id: "nsw",
    name: "New South Wales",
    abbrev: "NSW",
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

export const getStateGuideById = (id: string): StateGuide | undefined => {
  return stateGuides.find((s) => s.id === id);
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

export const calculateStampDuty = (stateId: string, propertyValue: number): number => {
  const rates = stampDutyRates[stateId];
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
