
import { Property, PropertyStatus } from './types';

export const PREMIUM_PROPERTIES: Property[] = [
  {
    id: 'HAUS-BNDI-001',
    address: '124 Ocean Avenue',
    suburb: 'Bondi',
    state: 'NSW',
    postcode: '2026',
    price: '$8,450,000',
    beds: 4,
    baths: 3,
    cars: 2,
    sqm: 450,
    description: 'Iconic beachside living with panoramic views of the Pacific Ocean. Architecture by Woods Bagot. Features a rare rooftop terrace.',
    status: PropertyStatus.Auction,
    thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop',
    images: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop'
    ],
    coordinates: { lat: -33.8915, lng: 151.2767 },
    amenities: ['Pool', 'Ocean View', 'Wine Cellar', 'Smart Home'],
    metrics: { yield: 2.4, growthPotential: 'High', rentalEstimate: '$4,500/pw' }
  },
  {
    id: 'HAUS-TOOR-002',
    address: '42 St Georges Road',
    suburb: 'Toorak',
    state: 'VIC',
    postcode: '3142',
    price: '$12,200,000',
    beds: 6,
    baths: 5,
    cars: 4,
    sqm: 1200,
    description: 'A grand estate in Melbournes most prestigious street. Private tennis court, curated gardens, and a hand-carved library.',
    status: PropertyStatus.PrivateTreaty,
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1200&auto=format&fit=crop'
    ],
    coordinates: { lat: -37.8398, lng: 145.0112 },
    amenities: ['Tennis Court', 'Gym', 'Library', 'Security'],
    metrics: { yield: 1.8, growthPotential: 'Steady', rentalEstimate: '$6,200/pw' }
  },
  {
    id: 'HAUS-BYRN-003',
    address: '7 Lighthouse Court',
    suburb: 'Byron Bay',
    state: 'NSW',
    postcode: '2481',
    price: '$6,750,000',
    beds: 3,
    baths: 2,
    cars: 2,
    sqm: 320,
    description: 'Minimalist luxury at the edge of the world. Solar powered with sustainable materials and infinity views.',
    status: PropertyStatus.ForSale,
    thumbnail: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1200&auto=format&fit=crop',
    images: [
        'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop'
    ],
    coordinates: { lat: -28.6474, lng: 153.6358 },
    amenities: ['Eco-friendly', 'Solar', 'Infinity Pool', 'Nature Track'],
    metrics: { yield: 3.1, growthPotential: 'High', rentalEstimate: '$2,800/pw' }
  },
  {
    id: 'HAUS-BRIS-004',
    address: '15 Brisbane Terrace',
    suburb: 'New Farm',
    state: 'QLD',
    postcode: '4005',
    price: '$4,100,000',
    beds: 5,
    baths: 3,
    cars: 2,
    sqm: 600,
    description: 'Classic Queenslander reimagined with modern industrial aesthetics. Riverfront access and outdoor kitchen.',
    status: PropertyStatus.Sold,
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513584685908-95c9e2d01977?q=80&w=1200&auto=format&fit=crop'
    ],
    coordinates: { lat: -27.4698, lng: 153.0518 },
    amenities: ['River Views', 'Outdoor Kitchen', 'Original Features', 'Boathouse'],
    metrics: { yield: 4.2, growthPotential: 'Medium', rentalEstimate: '$1,950/pw' }
  }
];
