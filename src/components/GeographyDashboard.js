import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Button, Form, Alert } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Country/city name to approximate coordinates mapping
const locationCoordinates = {
  // --- USER LISTED LOCATIONS ---
  'South Coast, England': [50.8198, -0.1372], // Brighton as a proxy
  'Bradford, England': [53.7960, -1.7594],
  'London, England': [51.5074, -0.1278],
  'England, United Kingdom': [52.3555, -1.1743],
  'Liverpool,United Kingdom': [53.4084, -2.9916],
  'Sevenoaks': [51.2726, 0.1900],
  'Ireland': [53.1424, -7.6921],
  'East Midlands, England': [52.8300, -1.3300],
  'Norwich, England': [52.6309, 1.2974],
  'Straight Outta Cambridge': [52.2053, 0.1218], // Cambridge
  'Britain': [54.0000, -2.5000],
  'birmingham': [52.4862, -1.8904],
  'Glasvegas': [55.8642, -4.2518], // Glasgow
  'Banbury Oxfordshire': [52.0629, -1.3398],
  'Manchester, England': [53.4808, -2.2426],
  'Sheffield, England': [53.3811, -1.4701],
  'Berkhamsted, England': [51.7600, -0.5650],
  'Newquay cornwall': [50.4181, -5.0800],
  'Nottingham, England': [52.9548, -1.1581],
  'Wales': [52.1307, -3.7837],
  'Over the rainbow': [54.0000, -2.5000], // fallback UK
  'المملكة العربية السعودية': [24.7743, 46.7386], // Saudi Arabia
  'York, England': [53.9599, -1.0873],
  'Hull, England': [53.7676, -0.3274],
  'West Midlands, England': [52.4800, -1.9000],
  'Leeds, UK': [53.8008, -1.5491],
  'Surrey': [51.3148, -0.5599],
  'Essex': [51.7760, 0.0962],
  'North West, England': [53.7000, -2.5000],
  'ashford kent': [51.1465, 0.8750],
  'Northampton/Mablethorpe': [52.2405, -0.9027], // Northampton
  'Horley, Surrey': [51.1744, -0.1596],
  'Dublin, Ireland': [53.3498, -6.2603],
  'Bracknell': [51.4160, -0.7539],
  'Dubai & Teesside, prev Oman': [25.2048, 55.2708], // Dubai
  'Hither & Thither': [54.0000, -2.5000],
  'Southampton, England': [50.9097, -1.4044],
  'Shropshire, UK': [52.7064, -2.7411],
  'Tottington, Bury, Lancashire': [53.6246, -2.3426],
  'Staines-upon-Thames, England': [51.4358, -0.5116],
  'Knottingley, England': [53.7050, -1.2475],
  'Kent UK': [51.2787, 0.5217],
  'Ashford, England': [51.1465, 0.8750],
  'Barry!': [51.4051, -3.2696],
  'Sunny Southend': [51.5459, 0.7077],
  'Nonya, UK': [54.0000, -2.5000],
  'Miami, FL': [25.7617, -80.1918],
  'Ilkley, England': [53.9250, -1.8222],
  'Knottingley, England': [53.7050, -1.2475],
  'Hampshire, England': [51.0577, -1.3081],
  'Farcet, Peterborough': [52.5350, -0.2220],
  'Walsall': [52.5862, -1.9822],
  'Banga, India': [26.7417, 75.3893],
  'Whitehaven, England': [54.5484, -3.5847],
  'Scotland, United Kingdom': [56.4907, -4.2026],
  'Everywhere': [54.0000, -2.5000],
  'Pontyclun, Wales': [51.5220, -3.3930],
  'Taff\'s Well, Wales': [51.5436, -3.2625],
  'Portsmouth, England': [50.8198, -1.0880],
  'Wales / UK / International': [52.1307, -3.7837],
  'Northampton, England': [52.2405, -0.9027],
  'islamabad': [33.6844, 73.0479],
  'Dublin City, Ireland': [53.3498, -6.2603],
  'Ashby-de-la-Zouch, England': [52.7469, -1.4735],
  'Throwing ass to Korn': [54.0000, -2.5000],
  'Warrington, England': [53.3900, -2.5976],
  'Manchester, UK': [53.4808, -2.2426],
  'Nailsworth ,gloucestershire': [51.6949, -2.2207],
  'Rochester, South East': [51.3880, 0.4986],
  'carlisle uk': [54.8925, -2.9320],
  'Barnet, London': [51.6521, -0.2005],
  'Bermondsey': [51.4975, -0.0605],
  'Nottinghamshire': [53.1408, -1.1956],
  'East London': [51.5074, -0.1278],
  'Dewsbury': [53.6910, -1.6307],
  'Lincoln': [53.2307, -0.5406],
  'Pontefract, England': [53.6915, -1.3126],
  'Broxburn, Scotland': [55.9342, -3.4713],
  'Chippenham, Wiltshire. UK': [51.4613, -2.1195],
  'Preston': [53.7632, -2.7031],
  'North East, England': [54.9000, -1.6000],
  'Wakefield, England': [53.6833, -1.4977],
  'Ripley, Derbyshire': [53.0496, -1.4070],
  'yorkshire': [53.9915, -1.5412],
  'Hertfordshire': [51.8000, -0.2000],
  'Edinburgh': [55.9533, -3.1883],
  'Guildford, England': [51.2362, -0.5704],
  'Glasgow but Budapest is home!': [55.8642, -4.2518],
  'VII.XII.MMXIV': [54.0000, -2.5000],
  'Staffordshire England': [52.8793, -2.0576],
  'Teesside': [54.5730, -1.2917],
  'Gloucestershire': [51.8642, -2.2380],
  'Milton Keynes, England': [52.0406, -0.7594],
  'Vancouver BC/Hereford UK': [49.2827, -123.1207], // Vancouver
  'Maidstone, Kent': [51.2720, 0.5292],
  'West Sussex': [50.9280, -0.4636],
  'Warwickshire, UK': [52.2823, -1.5849],
  'Broughton,North Lincs,UK': [53.5700, -0.5500],
  'Stoke-on-Trent, England': [53.0027, -2.1794],
  'Tunbridge Wells': [51.1324, 0.2637],
  'South East': [51.4500, -0.9000],
  'Crawley, South East': [51.1125, -0.1871],
  'Portishead, England': [51.4844, -2.7682],
  'Stockport, England': [53.4083, -2.1494],
  'Leicester, England': [52.6369, -1.1398],
  'Oxford, Oxfordshire': [51.7520, -1.2577],
  'London, United Kingdom': [51.5074, -0.1278],
  'Harrogate, England': [53.9935, -1.5370],
  'Chester, England': [53.1913, -2.8900],
  'Bristol, England': [51.4545, -2.5879],
  'Great Britain': [54.0000, -2.5000],
  'Mcr': [53.4808, -2.2426], // Manchester
  'Gibraltar': [36.1408, -5.3536],
  'East Hanney, Oxon, England': [51.6340, -1.4070],
  'cardiff, south wales': [51.4816, -3.1791],
  'London and Devon.': [51.5074, -0.1278],
  'Crigglestone, Wakefield': [53.6537, -1.5252],
  'Nailsworth ,gloucestershire': [51.6949, -2.2207],
  'London x': [51.5074, -0.1278],
  'Manchester, England': [53.4808, -2.2426],
  'Surrey via Liverpool, UK': [51.3148, -0.5599],
  'utb Middlesbrough - England': [54.5742, -1.2350],
  'Liverpool/Cheshire': [53.4084, -2.9916],
  'Cambridge, England': [52.2053, 0.1218],
  'Cheshire, UK.': [53.2326, -2.6103],
  'Swindon, England': [51.5557, -1.7797],
  'Hemel Hempstead': [51.7537, -0.4497],
  'Wigan, England': [53.5457, -2.6338],
  'Bedfordshire': [52.1350, -0.4667],
  'Bideford, Devon': [51.0167, -4.2083],
  'Broxburn, Scotland': [55.9342, -3.4713],
  'Charlestown of Aberlour, Scotl': [57.4700, -3.2300],
  'Sunderland': [54.9069, -1.3836],
  'Erith': [51.4806, 0.1756],
  'Bfd': [53.7960, -1.7594], // Bradford
  'Barnsley / Manchester': [53.5526, -1.4790],
  'Loughborough, England': [52.7721, -1.2062],
  'Wolverhampton, England': [52.5870, -2.1288],
  'Northern UK': [55.0000, -2.0000],
  'Riga, Latvia': [56.9496, 24.1052],
  'Ashok Vihar, New Delhi': [28.6926, 77.1910],
  'Farcet, Peterborough': [52.5350, -0.2220],
  'Bury, England': [53.5933, -2.2967],
  'accrington': [53.7534, -2.3617],
  'Halifax, England': [53.7267, -1.8571],
  'Walthamstow, London UK': [51.5886, -0.0179],
  'Arlesey': [52.0280, -0.2652],
  'Lichfield, England': [52.6816, -1.8315],
  'Bedford': [52.1364, -0.4669],
  'Deal, Kent': [51.2220, 1.4042],
  'Lancashire....proud Northerner': [53.7632, -2.7031], // Preston
  'Staines-upon-Thames, England': [51.4358, -0.5116],
  'Juneau, AK': [58.3019, -134.4197],
  'Miami, FL': [25.7617, -80.1918],
  // --- END USER LISTED LOCATIONS ---
  // UK Cities and Regions
  'London': [51.5074, -0.1278],
  'London, UK': [51.5074, -0.1278],
  'Liverpool': [53.4084, -2.9916],
  'Manchester': [53.4808, -2.2426],
  'Birmingham, UK': [52.4862, -1.8904],
  'Birmingham': [52.4862, -1.8904],
  'Leeds': [53.8008, -1.5491],
  'Glasgow': [55.8642, -4.2518],
  'Sheffield': [53.3811, -1.4701],
  'Bristol': [51.4545, -2.5879],
  'Newcastle': [54.9783, -1.6178],
  'Nottingham': [52.9548, -1.1581],
  'Cardiff': [51.4816, -3.1791],
  'Belfast': [54.5973, -5.9301],
  'Leicester': [52.6369, -1.1398],
  'Edinburgh': [55.9533, -3.1883],
  'Coventry': [52.4068, -1.5197],
  'Hull': [53.7676, -0.3274],
  'Bradford': [53.7960, -1.7594],
  'Stoke-on-Trent': [53.0027, -2.1794],
  'Wolverhampton': [52.5870, -2.1288],
  'Plymouth': [50.3755, -4.1427],
  'Derby': [52.9225, -1.4746],
  'Swansea': [51.6214, -3.9436],
  'Southampton': [50.9097, -1.4044],
  'Aberdeen': [57.1497, -2.0943],
  'Portsmouth': [50.8198, -1.0880],
  'York': [53.9599, -1.0873],
  'Exeter': [50.7184, -3.5339],
  'Cambridge': [52.2053, 0.1218],
  'Oxford': [51.7520, -1.2577],
  'Bath': [51.3751, -2.3618],
  'Brighton': [50.8225, -0.1372],
  'Bournemouth': [50.7192, -1.8808],
  'Sunderland': [54.9069, -1.3836],
  'Preston': [53.7632, -2.7031],
  'Middlesbrough': [54.5742, -1.2350],
  'Blackpool': [53.8175, -3.0357],
  'Reading': [51.4543, -0.9781],
  'Huddersfield': [53.6458, -1.7850],
  'Oldham': [53.5409, -2.1114],
  'Warrington': [53.3900, -2.5976],
  'Luton': [51.8787, -0.4200],
  'Milton Keynes': [52.0406, -0.7594],
  'Northampton': [52.2405, -0.9027],
  'Norwich': [52.6309, 1.2974],
  'Wigan': [53.5457, -2.6338],
  'Ipswich': [52.0567, 1.1482],
  'Mansfield': [53.1457, -1.1959],
  'Swindon': [51.5557, -1.7797],
  'Cheltenham': [51.8979, -2.0782],
  'Peterborough': [52.5695, -0.2405],
  'Doncaster': [53.5226, -1.1285],
  'Dundee': [56.4620, -2.9707],
  'Slough': [51.5105, -0.5950],
  'Gloucester': [51.8642, -2.2380],
  'Telford': [52.6784, -2.4453],
  'Blackburn': [53.7465, -2.4825],
  'Colchester': [51.8959, 0.8919],
  'Birkenhead': [53.3933, -3.0174],
  'Southend-on-Sea': [51.5459, 0.7077],
  'Basildon': [51.5762, 0.4516],
  'Grimsby': [53.5675, -0.0807],
  'Hastings': [50.8543, 0.5731],
  'High Wycombe': [51.6285, -0.7488],
  'Eastbourne': [50.7685, 0.2901],
  'Barnsley': [53.5526, -1.4790],
  'Woking': [51.3190, -0.5586],
  'Stockport': [53.4083, -2.1494],
  'Watford': [51.6565, -0.3903],
  'Rotherham': [53.4302, -1.3573],
  'Hartlepool': [54.6858, -1.2139],
  'Halifax': [53.7267, -1.8571],
  'Worthing': [50.8173, -0.3724],
  'Gillingham': [51.3888, 0.5476],
  'Crawley': [51.1125, -0.1871],
  'Burnley': [53.8009, -2.2399],
  'Darlington': [54.5235, -1.5597],
  'St Helens': [53.4560, -2.7372],
  'Rochdale': [53.6094, -2.1555],
  'Basingstoke': [51.2667, -1.0876],
  'Maidstone': [51.2720, 0.5292],
  'Sutton Coldfield': [52.5700, -1.8200],
  'Chelmsford': [51.7343, 0.4685],
  'Salford': [53.4875, -2.2901],
  'Royal Tunbridge Wells': [51.1325, 0.2678],
  'Guildford': [51.2362, -0.5704],
  'Solihull': [52.4118, -1.7776],
  'Stockton-on-Tees': [54.5705, -1.3178],
  'Walsall': [52.5862, -1.9822],
  'Bedford': [52.1364, -0.4669],
  
  // UK Regions
  'England': [52.3555, -1.1743],
  'Scotland': [56.4907, -4.2026],
  'Wales': [52.1307, -3.7837],
  'Northern Ireland': [54.7877, -6.4923],
  'Britain': [54.0000, -2.5000],
  'United Kingdom': [54.0000, -2.5000],
  'UK': [54.0000, -2.5000],
  'East Midlands': [52.8300, -1.3300],
  'West Midlands': [52.4800, -1.9000],
  'North West England': [53.7000, -2.5000],
  'North East England': [54.9000, -1.6000],
  'South West England': [50.7772, -3.9995],
  'South East England': [51.4500, -0.9000],
  'East of England': [52.2400, 0.4200],
  'Yorkshire and the Humber': [53.9000, -1.3000],
  'Greater London': [51.5074, -0.1278],
  
  // Major Global Cities
  'New York': [40.7128, -74.0060],
  'New York, USA': [40.7128, -74.0060],
  'Paris': [48.8566, 2.3522],
  'Paris, France': [48.8566, 2.3522],
  'Tokyo': [35.6762, 139.6503],
  'Tokyo, Japan': [35.6762, 139.6503],
  'Sydney': [-33.8688, 151.2093],
  'Sydney, Australia': [-33.8688, 151.2093],
  'Berlin': [52.5200, 13.4050],
  'Berlin, Germany': [52.5200, 13.4050],
  'Mumbai': [19.0760, 72.8777],
  'Mumbai, India': [19.0760, 72.8777],
  'Toronto': [43.6532, -79.3832],
  'Toronto, Canada': [43.6532, -79.3832],
  'São Paulo': [-23.5505, -46.6333],
  'São Paulo, Brazil': [-23.5505, -46.6333],
  'Dubai': [25.2048, 55.2708],
  'Dubai, UAE': [25.2048, 55.2708],
  'Madrid': [40.4168, -3.7038],
  'Madrid, Spain': [40.4168, -3.7038],
  'Seoul': [37.5665, 126.9780],
  'Seoul, South Korea': [37.5665, 126.9780],
  'Moscow': [55.7558, 37.6173],
  'Moscow, Russia': [55.7558, 37.6173],
  'Singapore': [1.3521, 103.8198],
  'Bangkok': [13.7563, 100.5018],
  'Bangkok, Thailand': [13.7563, 100.5018],
  'Dublin': [53.3498, -6.2603],
  'Dublin, Ireland': [53.3498, -6.2603],
  'Amsterdam': [52.3676, 4.9041],
  'Amsterdam, Netherlands': [52.3676, 4.9041],
  'Rome': [41.9028, 12.4964],
  'Rome, Italy': [41.9028, 12.4964],
  'Johannesburg': [-26.2041, 28.0473],
  'Johannesburg, South Africa': [-26.2041, 28.0473],
  'Mexico City': [19.4326, -99.1332],
  'Mexico City, Mexico': [19.4326, -99.1332],
  
  // Fallback coordinates for unknown locations
  'default': [0, 0]
};

// Helper function to find closest known location
const findBestCoordinateMatch = (locationName) => {
  if (!locationName) return locationCoordinates.default;
  
  // Normalize the location name for better matching
  const normalizedName = locationName.trim();
  
  // Check exact match
  if (locationCoordinates[normalizedName]) {
    return locationCoordinates[normalizedName];
  }
  
  // Try without any suffixes (e.g., "London, UK" -> "London")
  const simpleName = normalizedName.split(',')[0].trim();
  if (locationCoordinates[simpleName]) {
    return locationCoordinates[simpleName];
  }
  
  // Check for partial matches in city names
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    // Skip the default entry
    if (key === 'default') continue;
    
    const keySimpleName = key.split(',')[0].trim().toLowerCase();
    if (normalizedName.toLowerCase().includes(keySimpleName) || 
        keySimpleName.includes(normalizedName.toLowerCase())) {
      return coords;
    }
  }
  
  // Check for region matches (e.g., "North Yorkshire" should match to "Yorkshire")
  const ukRegions = [
    'Midlands', 'Yorkshire', 'London', 'Scotland', 'Wales', 'England', 
    'Northern Ireland', 'East', 'West', 'North', 'South', 'Britain', 'UK'
  ];
  
  for (const region of ukRegions) {
    if (normalizedName.toLowerCase().includes(region.toLowerCase())) {
      // Find the best matching region
      for (const [key, coords] of Object.entries(locationCoordinates)) {
        if (key.toLowerCase().includes(region.toLowerCase())) {
          return coords;
        }
      }
    }
  }
  
  // If we still don't have a match, default to UK coordinates for UK-sounding places
  if (normalizedName.toLowerCase().includes('shire') || 
      normalizedName.toLowerCase().includes('county') ||
      normalizedName.toLowerCase().match(/\b(north|south|east|west)\b/i)) {
    return locationCoordinates['UK'];
  }
  
  // Last resort: return the default coordinates
  console.log(`Could not find coordinates for: ${locationName}, using default`);
  return locationCoordinates.default;
};

const GeographyDashboard = ({ tweets = [], topic, onBack }) => {
  // Defensive: Ensure tweets is always an array
  const safeTweets = Array.isArray(tweets) ? tweets : [];
  const [locationData, setLocationData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Normalize location name to consolidate variations
      const normalizeLocationName = (location) => {
        if (!location) return '';
        
        const loc = location.trim().toLowerCase();
        
        // Handle empty or unknown locations
        if (!loc || loc === 'unknown') return '';
        
        // Handle UK variations
        if (loc.includes('united kingdom') || loc === 'uk' || loc === 'u.k.' || loc === 'great britain' || loc === 'gb' || loc === 'britain') {
          return 'United Kingdom';
        }
        
        // Handle England variations
        if (loc === 'england, uk' || loc === 'england, united kingdom' || loc === 'england, gb') {
          return 'England';
        }
        
        // Handle London variations
        if (loc === 'london, uk' || loc === 'london, england' || loc === 'london, united kingdom' || loc === 'london, gb') {
          return 'London';
        }
        
        // Handle Ireland variations
        if (loc === 'ireland' || loc === 'republic of ireland' || loc === 'ireland, eu') {
          return 'Ireland';
        }
        
        // For other locations, clean up and standardize the format
        return location.trim()
          .replace(/\s*,\s*/g, ', ')
          .replace(/\s+/g, ' ')
          .replace(/,\s*$/, ''); // Remove trailing comma if any
      };

      // Process location data from tweets
      const locations = {};
      
      safeTweets.forEach(tweet => {
        if (tweet.location && tweet.location.trim() && 
            tweet.location.trim().toLowerCase() !== 'unknown') {
          
          // Normalize the location name
          const normalizedLoc = normalizeLocationName(tweet.location);
          if (!normalizedLoc) return; // Skip if location is empty after normalization
          
          // Find the canonical name (in case of case differences)
          let canonicalName = Object.keys(locationCoordinates).find(
            key => key.toLowerCase() === normalizedLoc.toLowerCase()
          ) || normalizedLoc;
          
          // Special case for UK locations
          if (['united kingdom', 'uk', 'great britain', 'gb', 'britain'].includes(normalizedLoc.toLowerCase())) {
            canonicalName = 'United Kingdom';
          }
          
          if (!locations[canonicalName]) {
            // Get coordinates for this location
            const coordinates = findBestCoordinateMatch(canonicalName);
            
            locations[canonicalName] = {
              name: canonicalName,
              count: 0,
              totalLikes: 0,
              totalReplies: 0,
              totalViews: 0,
              coordinates: coordinates
            };
            
            // Log the location mapping for debugging
            console.log(`Mapped location: "${tweet.location}" -> "${canonicalName}" to coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
          }
          
          // Update the location data
          locations[canonicalName].count++;
          locations[canonicalName].totalLikes += tweet.likes || 0;
          locations[canonicalName].totalReplies += tweet.replies || 0;
          locations[canonicalName].totalViews += tweet.views || 100; // Default to 100 if missing
        }
      });
      
      // Convert to array for the map and sort by count (descending)
      const locationArray = Object.values(locations)
        .sort((a, b) => b.count - a.count);
      
      setLocationData(locationArray);
      setLoading(false);
    } catch (err) {
      console.error('Error processing location data:', err);
      setError('Failed to process location data. Please try again.');
      setLoading(false);
    }
  }, [safeTweets]);

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title>Geography Analysis</Card.Title>
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Processing location data...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title>Geography Analysis</Card.Title>
          <Alert variant="danger">{error}</Alert>
          <Button variant="primary" onClick={onBack}>Back to Dashboard</Button>
        </Card.Body>
      </Card>
    );
  }

  // Show all locations city-wise, sorted by tweet count
  const allLocations = [...locationData].sort((a, b) => b.count - a.count);

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span>Geography Analysis</span>
            {topic && (
              <Badge bg="info" className="ms-2">{topic}</Badge>
            )}
          </div>
        </Card.Title>

        <Row className="mb-4">
          <Col md={8}>
            <div style={{ height: '500px', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }}>
              <MapContainer 
                center={[20, 0]} 
                zoom={2} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locationData.map((location, index) => {
                  // Skip locations with default coordinates (0,0)
                  if (location.coordinates[0] === 0 && location.coordinates[1] === 0) {
                    return null;
                  }
                  // Calculate marker size based on tweet count (min 10, max 35)
                  const markerRadius = Math.min(Math.max(location.count * 3, 10), 35);
                  // Calculate color based on engagement rate
                  const engagementRate = (location.totalLikes + location.totalReplies) / location.totalViews * 100;
                  let fillColor = '#42a5f5'; // Default blue
                  // Color gradient based on engagement
                  if (engagementRate > 5) fillColor = '#f44336'; // High engagement (red)
                  else if (engagementRate > 3) fillColor = '#ff9800'; // Medium-high engagement (orange)
                  else if (engagementRate > 1.5) fillColor = '#4caf50'; // Medium engagement (green)
                  return (
                    <CircleMarker
                      key={`${location.name}-${index}`}
                      center={location.coordinates}
                      radius={markerRadius}
                      fillOpacity={0.6}
                      weight={1}
                      color="#1e88e5"
                      fillColor={fillColor}
                    >
                      <Popup>
                        <div>
                          <strong>{location.name}</strong><br />
                          <span>Tweets: {location.count}</span><br />
                          <span>Likes: {location.totalLikes}</span><br />
                          <span>Replies: {location.totalReplies}</span><br />
                          <span>Engagement Rate: {((location.totalLikes + location.totalReplies) / location.totalViews * 100).toFixed(2)}%</span>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">All Locations</h5>
                <div style={{ maxHeight: 420, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, padding: '0.5rem', background: '#fafbfc' }}>
                  {allLocations.length === 0 && (
                    <div className="text-muted">No location data available.</div>
                  )}
                  {allLocations.map((location, idx) => (
                    <div key={location.name} className="mb-3 pb-2 border-bottom" style={{ borderColor: '#f0f0f0' }}>
                      <div className="fw-bold" style={{ fontSize: '1rem' }}>{location.name}</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">
                          Engagement: {((location.totalLikes + location.totalReplies) / location.totalViews * 100).toFixed(2)}%
                        </span>
                        <Badge bg="secondary" pill>{location.count} tweets</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mt-3">
          <Card.Body>
            <Card.Title>Statistics</Card.Title>
            <ul className="list-unstyled">
              <li className="mb-2">Total Locations: <strong>{locationData.length}</strong></li>
              <li className="mb-2">Total Geo-tagged Tweets: <strong>{locationData.reduce((sum, loc) => sum + loc.count, 0)}</strong></li>
              <li className="mb-2">Avg. Tweets per Location: <strong>
                {locationData.length > 0 ? 
                  (locationData.reduce((sum, loc) => sum + loc.count, 0) / locationData.length).toFixed(1) : 
                  '0'}
              </strong></li>
            </ul>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default GeographyDashboard;
