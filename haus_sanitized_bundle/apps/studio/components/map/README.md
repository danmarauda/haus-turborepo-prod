# MapLibre Components

This directory contains MapLibre GL JS map components for the HAUS application.

## Components

### MapLibreMap.tsx

A full-featured MapLibre GL JS map component with support for:
- Custom view state (center, zoom)
- Property markers with custom styling
- Click handlers for property interactions
- Optional radius circle visualization
- Dark mode styling with filters
- Decorative gradient overlays

**Props:**
```typescript
interface MapProps {
  viewState: {
    lat: number;
    lng: number;
    zoom: number;
  };
  properties?: Property[];
  onPropertyClick?: (property: Property) => void;
  radiusKm?: number;
}
```

### InteractiveMapView.tsx

A simplified map view component that uses a static background image with normalized coordinate positioning:
- Static Australia/NZ map background
- Property pins with hover effects
- Active property popups
- Click-to-view functionality
- Responsive bounding box normalization

**Props:**
```typescript
interface MapViewProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}
```

## Usage Examples

### Basic Map with View State

```tsx
import MapLibreMap from './components/map/MapLibreMap';

function App() {
  const [viewState, setViewState] = useState({
    lat: -33.8688,
    lng: 151.2093,
    zoom: 12
  });

  const properties = [
    {
      id: '1',
      lat: -33.8688,
      lng: 151.2093,
      title: 'Sydney Opera View',
      price: '$2,500,000',
      imageUrl: 'https://example.com/image.jpg'
    }
  ];

  return (
    <MapLibreMap
      viewState={viewState}
      properties={properties}
      onPropertyClick={(property) => console.log('Clicked:', property)}
    />
  );
}
```

### Map with Radius Circle

```tsx
<MapLibreMap
  viewState={viewState}
  properties={properties}
  onPropertyClick={handlePropertyClick}
  radiusKm={5} // Shows 5km radius circle
/>
```

### Interactive Map View (Static)

```tsx
import InteractiveMapView from './components/map/InteractiveMapView';

function PropertyList() {
  const properties = [...]; // Your property data

  return (
    <InteractiveMapView
      properties={properties}
      onPropertyClick={(property) => {
        // Navigate to property details
        navigate(`/property/${property.id}`);
      }}
    />
  );
}
```

## Dependencies

Required packages (already installed):
- `maplibre-gl@4.7.1`
- `@types/maplibre-gl`

## CSS

The MapLibre CSS is included in `index.html`:
```html
<link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
```

## Configuration

The `vite.config.ts` has been updated to optimize MapLibre:
```typescript
optimizeDeps: {
  include: ['maplibre-gl']
}
```

## Customization

### Map Style

The map uses OpenStreetMap tiles. To change the tile source, modify the `style` object in `MapLibreMap.tsx`:

```typescript
style: {
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://your-tile-server/{z}/{x}/{y}.png'],
      tileSize: 256,
    }
  },
  // ...
}
```

### Marker Style

Customize markers by modifying the marker element in `MapLibreMap.tsx`:

```typescript
el.className = 'w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer';
el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">...</svg>`;
```

## Integration Notes

- Both components use the shared `Property` type from `../types`
- The map automatically handles cleanup on unmount
- Markers are optimized to prevent memory leaks
- Supports both interactive and static map views
- Dark mode styling applied via CSS filters

## Troubleshooting

**Map not rendering:**
- Ensure MapLibre CSS is loaded
- Check that the container has defined dimensions
- Verify view state coordinates are valid

**Markers not appearing:**
- Confirm properties array has valid lat/lng coordinates
- Check that map is fully loaded before markers are added

**TypeScript errors:**
- Ensure `@types/maplibre-gl` is installed
- Verify Property type includes `lat` and `lng` properties
