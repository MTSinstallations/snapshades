/**
 * Norman® Digital Swatches — 134 colors crawled from normanusa.com
 * Organized by product line with fabric code, name, image URL, opacity
 */

export interface Swatch {
  id: string;
  name: string;
  collection: string;
  imageUrl: string;
  opacity?: 'sheer' | 'light-filtering' | 'room-darkening' | 'blackout';
  color?: string;
  code?: string;
}

// ============================================================
// PORTRAIT™ HONEYCOMB — 120+ colors
// ============================================================
export const HONEYCOMB_SWATCHES: Swatch[] = [
  // Light Filtering
  { id: 'hc-C5501', code: 'C5501', name: 'Jersey Cream', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C5501-Jersey-Cream.jpg', opacity: 'light-filtering', color: '#F5F0E1' },
  { id: 'hc-C5004', code: 'C5004', name: 'Cloud White', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C5004-Cloud-White.jpg', opacity: 'light-filtering', color: '#F8F6F0' },
  { id: 'hc-C5002', code: 'C5002', name: 'Cloudy Chiffon', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C5002-Cloudy-Chiffon.jpg', opacity: 'light-filtering', color: '#F0ECE2' },
  { id: 'hc-C5001', code: 'C5001', name: 'Seapearl', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C5001-Seapearl.jpg', opacity: 'light-filtering', color: '#E8E0D0' },
  { id: 'hc-C6001', code: 'C6001', name: 'Ice Mist', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6001-Ice-mist.jpg', opacity: 'light-filtering', color: '#EAE8E2' },
  { id: 'hc-C6002', code: 'C6002', name: 'Cotton', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6002-Cotton.jpg', opacity: 'light-filtering', color: '#F2EDE5' },
  { id: 'hc-C6003', code: 'C6003', name: 'Moonshine', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6003-Moonshine.jpg', opacity: 'light-filtering', color: '#E0DCD4' },
  { id: 'hc-C6004', code: 'C6004', name: 'Powder', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C6004-Powder-1.jpg.webp', opacity: 'light-filtering', color: '#E8E2D8' },
  { id: 'hc-C6005', code: 'C6005', name: 'Icicle', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C6005-Icicle-1.jpg.webp', opacity: 'light-filtering', color: '#ECEAE6' },
  { id: 'hc-C6101', code: 'C6101', name: 'Ashley Gray', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6101-Ashley-Gray.jpg', opacity: 'light-filtering', color: '#B8B4AC' },
  { id: 'hc-C6102', code: 'C6102', name: 'Silvery Blue', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6102-Silvery-Blue.jpg', opacity: 'light-filtering', color: '#B0B8C0' },
  { id: 'hc-C6401', code: 'C6401', name: 'Earth', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6401-Earth.jpg', opacity: 'light-filtering', color: '#A89880' },
  { id: 'hc-C6402', code: 'C6402', name: 'Travertine', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6402-Travertine.jpg', opacity: 'light-filtering', color: '#C8BCA8' },
  { id: 'hc-C6501', code: 'C6501', name: 'Mascarpone', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6501-Mascarpone.jpg', opacity: 'light-filtering', color: '#F0E8D8' },
  { id: 'hc-C6502', code: 'C6502', name: 'Calla Lily', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6502-Calla-Lily.jpg', opacity: 'light-filtering', color: '#F5F0E5' },
  { id: 'hc-C6505', code: 'C6505', name: 'Eggshell Cream', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C6505-Eggshell-Cream-1.jpg.webp', opacity: 'light-filtering', color: '#F2EDE2' },
  { id: 'hc-C6503', code: 'C6503', name: 'Toasted Beige', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C6503-Toasted-beige.jpg', opacity: 'light-filtering', color: '#D8C8B0' },
  { id: 'hc-C2410', code: 'C2410', name: 'Canvas', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C2410-Canvas.jpg', opacity: 'light-filtering', color: '#D8D0C0' },
  { id: 'hc-C2114', code: 'C2114', name: 'Winter Solstice', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C2114-Winter-Solstice.jpg', opacity: 'light-filtering', color: '#E0DCD6' },
  { id: 'hc-C2115', code: 'C2115', name: 'Sterling', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C2115-Sterling.jpg', opacity: 'light-filtering', color: '#C0BEB8' },
  { id: 'hc-C4113', code: 'C4113', name: 'Dawn', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C4113-Dawn.jpg', opacity: 'light-filtering', color: '#E8E0D0' },
  { id: 'hc-C4114', code: 'C4114', name: 'Magnetic Gray', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C4114-Magnetic-Gray.jpg', opacity: 'light-filtering', color: '#A0A0A0' },
  { id: 'hc-C4112', code: 'C4112', name: 'Titanium', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C4112-Titanium.jpg', opacity: 'light-filtering', color: '#888888' },
  { id: 'hc-C4107', code: 'C4107', name: 'Storm Cloud', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C4107-Storm-Cloud.jpg', opacity: 'light-filtering', color: '#707880' },
  { id: 'hc-C4106', code: 'C4106', name: 'Winter Solstice', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C4106-Winter-Solstice.jpg', opacity: 'light-filtering', color: '#C8C4BC' },
  { id: 'hc-C4116', code: 'C4116', name: 'Sterling', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C4116-Sterling.jpg', opacity: 'light-filtering', color: '#B0AEA8' },
  { id: 'hc-C1403', code: 'C1403', name: 'Fresh Brew', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C1403-Fresh-Brew.jpg', opacity: 'light-filtering', color: '#8B7355' },
  { id: 'hc-C4413', code: 'C4413', name: 'Fresh Brew', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C4413-Fresh-Brew.jpg', opacity: 'light-filtering', color: '#8B7355' },
  { id: 'hc-C4414', code: 'C4414', name: 'Canvas', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C4414-Canvas.jpg', opacity: 'light-filtering', color: '#D0C8B8' },
  { id: 'hc-C5201', code: 'C5201', name: 'Nightfall', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C5201-Nightfall.jpg', opacity: 'light-filtering', color: '#383838' },
  { id: 'hc-C7117', code: 'C7117', name: 'Smokey Violet', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C7117-Smokey-Violet.jpg', opacity: 'light-filtering', color: '#8888A0' },
  { id: 'hc-C7118', code: 'C7118', name: 'Silver Coin', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C7118-Silver-Coin.jpg', opacity: 'light-filtering', color: '#B8B8B8' },
  { id: 'hc-C7119', code: 'C7119', name: 'Quarry', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C7119-Quarry.jpg.webp', opacity: 'light-filtering', color: '#808080' },
  { id: 'hc-C7120', code: 'C7120', name: 'Urban Gray', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2020/03/C7120-Urban-Gray.jpg.webp', opacity: 'light-filtering', color: '#909090' },
  { id: 'hc-C7122', code: 'C7122', name: 'Steel', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C7122-Steel.jpg.webp', opacity: 'light-filtering', color: '#787878' },
  { id: 'hc-C7123', code: 'C7123', name: 'Dim Gray', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C7123-Dim-Gray.jpg.webp', opacity: 'light-filtering', color: '#696969' },
  { id: 'hc-C7137', code: 'C7137', name: 'Power Gray', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C7137-Power-Gray-3.jpg', opacity: 'light-filtering', color: '#606060' },
  { id: 'hc-C7203', code: 'C7203', name: 'Midnight', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C7203-Midnight.jpg', opacity: 'light-filtering', color: '#2A2A2A' },
  { id: 'hc-C7204', code: 'C7204', name: 'Warm Black', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C7204-Warm-Black.jpg.webp', opacity: 'light-filtering', color: '#1A1A1A' },
  { id: 'hc-C7419', code: 'C7419', name: 'Modern Tan', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C7419-Modern-Tan-1.jpg.webp', opacity: 'light-filtering', color: '#C0B098' },
  { id: 'hc-C7010', code: 'C7010', name: 'Modern White', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C7010-Modern-White-1.jpg', opacity: 'light-filtering', color: '#F5F5F0' },
  { id: 'hc-C7011', code: 'C7011', name: 'Pearl Sand', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C7011-Pearl-Sand-1.jpg', opacity: 'light-filtering', color: '#E8E0D0' },
  { id: 'hc-C7012', code: 'C7012', name: 'White Lace', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C7012-White-Lace-1.jpg', opacity: 'light-filtering', color: '#F8F5EE' },
  { id: 'hc-C7514', code: 'C7514', name: 'Sweet Cream', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C7514-Sweet-Cream-1.jpg.webp', opacity: 'light-filtering', color: '#F5EDD8' },
  { id: 'hc-C7615', code: 'C7615', name: 'Serene', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C7615-Serene-1.jpg.webp', opacity: 'light-filtering', color: '#D8D4CC' },
  { id: 'hc-C7712', code: 'C7712', name: 'Denim', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C7712-Denim.jpg', opacity: 'light-filtering', color: '#506080' },
  { id: 'hc-C7804', code: 'C7804', name: 'Dusty Lilac', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2024/03/C7804-Dusty-Lilac.jpg.webp', opacity: 'light-filtering', color: '#B8A0B0' },
  { id: 'hc-C8001', code: 'C8001', name: 'White Ice', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C8001-White-Ice.jpg', opacity: 'light-filtering', color: '#F5F5F5' },
  { id: 'hc-C8002', code: 'C8002', name: 'Blizzard Fog', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C8002-Blizzad-Fog.jpg.webp', opacity: 'light-filtering', color: '#E0DDD6' },
  { id: 'hc-C8101', code: 'C8101', name: 'Pale Gray', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C8101-Pale-Gray.jpg', opacity: 'light-filtering', color: '#D0D0D0' },
  { id: 'hc-C8401', code: 'C8401', name: 'Rustic Taupe', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C8401-Rustic-Taupe.jpg', opacity: 'light-filtering', color: '#9C8C78' },
  { id: 'hc-C8501', code: 'C8501', name: 'Sweet Custard', collection: 'Portrait Honeycomb', imageUrl: 'https://normanusa.com/app/uploads/2023/03/C8501-Sweet-Custard.jpg.webp', opacity: 'light-filtering', color: '#F0E0B8' },

  // New 2025-2026 collection
  { id: 'hc-C4007', code: 'C4007', name: 'White Dawn', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4007T-White-Dawn-1.jpg', opacity: 'light-filtering', color: '#F8F5EE' },
  { id: 'hc-C4008', code: 'C4008', name: 'Brilliant White', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4008T-Brilliant-White-5.jpg', opacity: 'light-filtering', color: '#FAFAFA' },
  { id: 'hc-C4009', code: 'C4009', name: 'Cotton Cloud', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4009T-Cotton-Cloud-5.jpg.webp', opacity: 'light-filtering', color: '#F5F0E8' },
  { id: 'hc-C4010', code: 'C4010', name: 'Gardenia', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4010T-Gardenia-1.jpg', opacity: 'light-filtering', color: '#F0EAD8' },
  { id: 'hc-C4011', code: 'C4011', name: 'Soft Stone', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4011T-Soft-Stone.jpg', opacity: 'light-filtering', color: '#D0C8BC' },
  { id: 'hc-C4121', code: 'C4121', name: 'Daisy', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4121T-Daisy-3.jpg.webp', opacity: 'light-filtering', color: '#F0E8D0' },
  { id: 'hc-C4122', code: 'C4122', name: 'Silver Satin', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4122T-Silver-Satin.jpg', opacity: 'light-filtering', color: '#C8C4BC' },
  { id: 'hc-C4123', code: 'C4123', name: 'French Silver', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4123T-French-Silver-2.jpg.webp', opacity: 'light-filtering', color: '#B8B4AC' },
  { id: 'hc-C4124', code: 'C4124', name: 'Classic Silver', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4124T-Classic-Silver-4.jpg', opacity: 'light-filtering', color: '#B0ACB0' },
  { id: 'hc-C4125', code: 'C4125', name: 'Power Gray', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4125T-Power-Gray-3.jpg', opacity: 'light-filtering', color: '#707070' },
  { id: 'hc-C4126', code: 'C4126', name: 'Iron Mountain', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4126T-Iron-Mountain-1.jpg', opacity: 'light-filtering', color: '#585858' },
  { id: 'hc-C4127', code: 'C4127', name: 'Orion Gray', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4127T-Orion-Gray-3.jpg', opacity: 'light-filtering', color: '#484848' },
  { id: 'hc-C4128', code: 'C4128', name: 'Fog', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4128T-Fog-1.jpg', opacity: 'light-filtering', color: '#C0C0BC' },
  { id: 'hc-C4129', code: 'C4129', name: 'Seal Gray', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4129T-Seal-Gray-3.jpg', opacity: 'light-filtering', color: '#404040' },
  { id: 'hc-C4130', code: 'C4130', name: 'Silver Dusk', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4130T-Silver-Dusk.jpg.webp', opacity: 'light-filtering', color: '#A8A4A0' },
  { id: 'hc-C4131', code: 'C4131', name: 'Dew', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4131T-Dew.jpg.webp', opacity: 'light-filtering', color: '#D8D4CC' },
  { id: 'hc-C4204', code: 'C4204', name: 'Soft Black', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4204T-Soft-Black-1.jpg.webp', opacity: 'light-filtering', color: '#2A2A2A' },
  { id: 'hc-C4205', code: 'C4205', name: 'Space Gray', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4205T-Space-Gray.jpg', opacity: 'light-filtering', color: '#505050' },
  { id: 'hc-C4420', code: 'C4420', name: 'Natural Tan', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4420T-Natural-Tan-4.jpg', opacity: 'light-filtering', color: '#C0A880' },
  { id: 'hc-C4421', code: 'C4421', name: 'Pale Oak', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4421T-Pale-Oak-3.jpg', opacity: 'light-filtering', color: '#D0C0A8' },
  { id: 'hc-C4422', code: 'C4422', name: 'Whipped Mocha', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4422T-Whipped-Mocha-3.jpg', opacity: 'light-filtering', color: '#B09878' },
  { id: 'hc-C4423', code: 'C4423', name: 'Rue Bourbon', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4423T-Rue-Bourbon-3.jpg', opacity: 'light-filtering', color: '#C4A882' },
  { id: 'hc-C4424', code: 'C4424', name: 'Towny', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4424T-Towny-1.jpg', opacity: 'light-filtering', color: '#A08860' },
  { id: 'hc-C4425', code: 'C4425', name: 'Toffee', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4425T-Toffee-2.jpg', opacity: 'light-filtering', color: '#8B7050' },
  { id: 'hc-C4426', code: 'C4426', name: 'Shady Lane', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4426T-Shady-Lane-1.jpg.webp', opacity: 'light-filtering', color: '#706050' },
  { id: 'hc-C4427', code: 'C4427', name: 'Wheat', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4427T-Wheat-3.jpg', opacity: 'light-filtering', color: '#D0BC98' },
  { id: 'hc-C4517', code: 'C4517', name: 'White Cream', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4517T-White-Cream-3.jpg', opacity: 'light-filtering', color: '#F8F2E8' },
  { id: 'hc-C4609', code: 'C4609', name: 'Florida Keys', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4609T-Florida-Keys.jpg.webp', opacity: 'light-filtering', color: '#70A8A0' },
  { id: 'hc-C4706', code: 'C4706', name: 'Azure Blue', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4706T-Azure-Blue.jpg.webp', opacity: 'light-filtering', color: '#5080B0' },
  { id: 'hc-C4708', code: 'C4708', name: 'Bella Blue', collection: 'Portrait Honeycomb — 2025', imageUrl: 'https://normanusa.com/app/uploads/2025/03/C4708T-Bella-Blue.jpg.webp', opacity: 'light-filtering', color: '#6898C0' },

  // Room Darkening (RD suffix)
  { id: 'hc-C0001', code: 'C0001T', name: 'Eggshell White RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C0001T-Eggshell-White-RD.jpg.webp', opacity: 'room-darkening', color: '#F0ECE2' },
  { id: 'hc-C0002', code: 'C0002T', name: 'Ballet White RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C0002T-Ballet-White-RD.jpg', opacity: 'room-darkening', color: '#F5F0E5' },
  { id: 'hc-C0101', code: 'C0101T', name: 'Moonlight RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C0101T-Moonlight-RD.jpg.webp', opacity: 'room-darkening', color: '#E8E4DC' },
  { id: 'hc-C0301', code: 'C0301T', name: 'Dreamy White RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C0301T-Dreamy-White-RD.jpg', opacity: 'room-darkening', color: '#F8F6F0' },
  { id: 'hc-C0401', code: 'C0401T', name: 'Toasted Pecan RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C0401T-Toasted-Pecan-RD.jpg', opacity: 'room-darkening', color: '#A0845C' },
  { id: 'hc-C0402', code: 'C0402T', name: 'Dark Champagne RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C0402T-Dark-Champagne-RD.jpg', opacity: 'room-darkening', color: '#C8B898' },
  { id: 'hc-C0701', code: 'C0701T', name: 'Country Sky RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C0701T-Country-Sky-RD.jpg', opacity: 'room-darkening', color: '#88A8C0' },
  { id: 'hc-C0908', code: 'C0908T', name: 'Linen Weave RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2020/10/F0908-Linen-Weave-1.jpg', opacity: 'room-darkening', color: '#D8D0C0' },
  { id: 'hc-C4102', code: 'C4102T', name: 'Annapolis Gray RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4102T-Annapolis-Gray-RD.jpg', opacity: 'room-darkening', color: '#808888' },
  { id: 'hc-C4104', code: 'C4104T', name: 'Spring Sky RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4104T-Spring-Sky-RD.jpg', opacity: 'room-darkening', color: '#A0B8C8' },
  { id: 'hc-C4108', code: 'C4108T', name: 'Smokey Blue RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4108T-Smokey-Blue-RD.jpg.webp', opacity: 'room-darkening', color: '#6878A0' },
  { id: 'hc-C4133', code: 'C4133T', name: 'Morning Mist RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4133T-Morning-Mist-RD.jpg', opacity: 'room-darkening', color: '#C0BEB8' },
  { id: 'hc-C4134', code: 'C4134', name: 'Eggplant RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4134T-Eggplant-RD.jpg.webp', opacity: 'room-darkening', color: '#4A2840' },
  { id: 'hc-C4153', code: 'C4153T', name: 'Reflections RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4153T-Reflections-RD.jpg.webp', opacity: 'room-darkening', color: '#B0ACA4' },
  { id: 'hc-C4305', code: 'C4305T', name: 'Morning Blush RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4305T-Morning-Blush-RD.jpg', opacity: 'room-darkening', color: '#D8B0A0' },
  { id: 'hc-C4306', code: 'C4306T', name: 'Pacific Cove RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4306T-Pacific-Cove-RD.jpg.webp', opacity: 'room-darkening', color: '#5890A0' },
  { id: 'hc-C4430', code: 'C4430T', name: 'Cabin RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4430T-Cabin-RD.jpg', opacity: 'room-darkening', color: '#605040' },
  { id: 'hc-C4431', code: 'C4431T', name: 'Provence Cream RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4431T-Provence-Cream-RD.jpg', opacity: 'room-darkening', color: '#F0E8D8' },
  { id: 'hc-C4433', code: 'C4433T', name: 'Pashmina RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4433T-Pashmina-RD.jpg.webp', opacity: 'room-darkening', color: '#C8B8A0' },
  { id: 'hc-C4518', code: 'C4518T', name: 'New Camel RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4518T-New-Camel-RD.jpg.webp', opacity: 'room-darkening', color: '#B09060' },
  { id: 'hc-C4519', code: 'C4519T', name: 'Yellow Bliss RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4519T-Yellow-Bliss-RD.jpg', opacity: 'room-darkening', color: '#E8D080' },
  { id: 'hc-C4520', code: 'C4520T', name: 'Autumn Gold RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4520T-Autumn-Gold-RD.jpg.webp', opacity: 'room-darkening', color: '#C0A050' },
  { id: 'hc-C4521', code: 'C4521T', name: 'River Rock RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4521T-River-Rock-RD.jpg.webp', opacity: 'room-darkening', color: '#908070' },
  { id: 'hc-C4601', code: 'C4601T', name: 'Fernwood RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4601T-Fernwod-RD.jpg.webp', opacity: 'room-darkening', color: '#607050' },
  { id: 'hc-C4610', code: 'C4610T', name: 'Catalina Blue RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4610T-Catalina-Blue-RD.jpg', opacity: 'room-darkening', color: '#385880' },
  { id: 'hc-C4611', code: 'C4611T', name: 'Meadows RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4611T-Meadows-RD.jpg', opacity: 'room-darkening', color: '#508050' },
  { id: 'hc-C4705', code: 'C4705T', name: 'Seaside Blue RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4705T-Seaside-Blue-RD.jpg', opacity: 'room-darkening', color: '#4878A0' },
  { id: 'hc-C4709', code: 'C4709T', name: 'Ocean Air RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4709T-Ocean-Air-RD.jpg.webp', opacity: 'room-darkening', color: '#6898B0' },
  { id: 'hc-C4710', code: 'C4710T', name: 'Blue Flower RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4710T-Blue-Flower-RD.jpg.webp', opacity: 'room-darkening', color: '#5070A0' },
  { id: 'hc-C4711', code: 'C4711T', name: 'Lakeside RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4711T-Lakeside-RD.jpg.webp', opacity: 'room-darkening', color: '#406880' },
  { id: 'hc-C4712', code: 'C4712T', name: 'White Rain RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4712T-White-Rain-RD.jpg.webp', opacity: 'room-darkening', color: '#E8E8E8' },
  { id: 'hc-C4804', code: 'C4804T', name: 'Mulberry RD', collection: 'Portrait Honeycomb — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2026/01/C4804T-Mulberry-RD.jpg', opacity: 'room-darkening', color: '#683850' },

  // Woven/Textured fabrics
  { id: 'hc-F1526', code: 'F1526', name: 'Cotton', collection: 'Portrait Honeycomb — Woven', imageUrl: 'https://normanusa.com/app/uploads/2021/06/F1526-Cotton.jpg.webp', opacity: 'light-filtering', color: '#F0EAE0' },
  { id: 'hc-F1527', code: 'F1527', name: 'Toasted Wheat', collection: 'Portrait Honeycomb — Woven', imageUrl: 'https://normanusa.com/app/uploads/2021/06/F1527-Toasted-Wheat.jpg', opacity: 'light-filtering', color: '#C8B498' },
  { id: 'hc-F1528', code: 'F1528', name: 'Glazed Pecan', collection: 'Portrait Honeycomb — Woven', imageUrl: 'https://normanusa.com/app/uploads/2021/06/F1528-Glazed-Pecan.jpg', opacity: 'light-filtering', color: '#A08860' },
  { id: 'hc-F1531', code: 'F1531', name: 'Dawn', collection: 'Portrait Honeycomb — Woven', imageUrl: 'https://normanusa.com/app/uploads/2021/06/F1531-Dawn.jpg', opacity: 'light-filtering', color: '#E0D8C8' },
  { id: 'hc-F1299', code: 'F1299', name: 'Almond Milk', collection: 'Portrait Honeycomb — Heritage', imageUrl: 'https://normanusa.com/app/uploads/2020/10/F1299-Almond-Milk-1.jpg', opacity: 'light-filtering', color: '#E8DCC8' },
  { id: 'hc-F1300', code: 'F1300', name: 'Flax', collection: 'Portrait Honeycomb — Heritage', imageUrl: 'https://normanusa.com/app/uploads/2020/10/F1300-Flax-1.jpg.webp', opacity: 'light-filtering', color: '#D0C0A0' },
  { id: 'hc-F1302', code: 'F1302', name: 'Khaki', collection: 'Portrait Honeycomb — Heritage', imageUrl: 'https://normanusa.com/app/uploads/2020/10/F1302-Khaki-1.jpg', opacity: 'light-filtering', color: '#A89870' },
  { id: 'hc-F1303', code: 'F1303', name: 'Dune', collection: 'Portrait Honeycomb — Heritage', imageUrl: 'https://normanusa.com/app/uploads/2020/10/F1303-Dune-1.jpg', opacity: 'light-filtering', color: '#B8A888' },
  { id: 'hc-F1283', code: 'F1283', name: 'Coffee', collection: 'Portrait Honeycomb — Heritage', imageUrl: 'https://normanusa.com/app/uploads/2020/10/F1283-Coffee-1.jpg', opacity: 'light-filtering', color: '#604830' },
  { id: 'hc-F1284', code: 'F1284', name: 'Burnt Ember', collection: 'Portrait Honeycomb — Heritage', imageUrl: 'https://normanusa.com/app/uploads/2020/10/F1284-Burnt-Ember-1.jpg', opacity: 'light-filtering', color: '#503020' },
  { id: 'hc-F1285', code: 'F1285', name: 'Black Magic', collection: 'Portrait Honeycomb — Heritage', imageUrl: 'https://normanusa.com/app/uploads/2020/10/F1285-Black-Magic-1.jpg', opacity: 'light-filtering', color: '#1A1A1A' },
];

// ============================================================
// SOLUNA™ ROLLER SWATCHES
// ============================================================
export const ROLLER_SWATCHES: Swatch[] = [
  { id: 'rl-remy-rd-creamy', name: 'Remy RD Creamy Mocha', collection: 'Soluna Roller — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2024/09/Remy-RD-F1756-Creamy-Mocha.jpg', opacity: 'room-darkening', color: '#B8A594' },
  { id: 'rl-francis-rd-oat', name: 'Francis RD Oatmeal', collection: 'Soluna Roller — Room Darkening', imageUrl: 'https://normanusa.com/app/uploads/2024/09/Francis-RD-F1764-Oatmeal.jpg', opacity: 'room-darkening', color: '#D4C8B8' },
  { id: 'rl-hayes-hickory', name: 'Hayes Hickory', collection: 'Soluna Roller — Designer', imageUrl: 'https://normanusa.com/app/uploads/2022/06/Hayes-F0748-Hickory.jpg.webp', opacity: 'light-filtering', color: '#8B7355' },
];

// ============================================================
// PERFECTSHEER™ SWATCHES
// ============================================================
export const PERFECTSHEER_SWATCHES: Swatch[] = [
  { id: 'ps-mineral', name: 'Mineral', collection: 'PerfectSheer', imageUrl: 'https://normanusa.com/app/uploads/2020/05/F1193-Mineral.jpg', opacity: 'light-filtering', color: '#C0B8A8' },
  { id: 'ps-moon', name: 'Moon', collection: 'PerfectSheer', imageUrl: 'https://normanusa.com/app/uploads/2020/05/F1200-Moon.jpg', opacity: 'light-filtering', color: '#E8E0D0' },
];

// ============================================================
// SMARTDRAPE® SWATCHES
// ============================================================
export const SMARTDRAPE_SWATCHES: Swatch[] = [
  { id: 'sd-coronado-gray', name: 'Coronado Gray', collection: 'SmartDrape', imageUrl: 'https://normanusa.com/app/uploads/2020/03/Coronado-F1588-Gray_5000K.jpg.webp', opacity: 'light-filtering', color: '#A0A0A0' },
  { id: 'sd-soft-white', name: 'Soft White', collection: 'SmartDrape', imageUrl: 'https://normanusa.com/app/uploads/2022/06/SmartDrape_F1169-Soft-White.jpg.webp', opacity: 'light-filtering', color: '#F5F2ED' },
  { id: 'sd-charcoal', code: 'F1665', name: 'Charcoal', collection: 'SmartDrape', imageUrl: 'https://normanusa.com/app/uploads/2020/03/F1665-Charcoal.jpg', opacity: 'light-filtering', color: '#404040' },
  { id: 'sd-light-gray', code: 'F1664', name: 'Light Gray', collection: 'SmartDrape', imageUrl: 'https://normanusa.com/app/uploads/2020/03/F1664-Light-Gray.jpg', opacity: 'light-filtering', color: '#C0C0C0' },
  { id: 'sd-white', code: 'F1663', name: 'White', collection: 'SmartDrape', imageUrl: 'https://normanusa.com/app/uploads/2020/03/F1663-White.jpg.webp', opacity: 'light-filtering', color: '#F5F5F5' },
  { id: 'sd-pac-alabaster', code: 'F1870', name: 'Pacific Alabaster', collection: 'SmartDrape — Pacific', imageUrl: 'https://normanusa.com/app/uploads/2025/08/F1870-Pacific-Alabaster.jpg.webp', opacity: 'light-filtering', color: '#F0EAE0' },
  { id: 'sd-pac-silver', code: 'F1869', name: 'Pacific French Silver', collection: 'SmartDrape — Pacific', imageUrl: 'https://normanusa.com/app/uploads/2025/08/F1869-Pacific-French-Silver.jpg.webp', opacity: 'light-filtering', color: '#B8B4A8' },
  { id: 'sd-pac-brown', code: 'F1871', name: 'Pacific Leather Brown', collection: 'SmartDrape — Pacific', imageUrl: 'https://normanusa.com/app/uploads/2025/08/F1871-Pacific-Leather-Brown.jpg.webp', opacity: 'light-filtering', color: '#705840' },
  { id: 'sd-plain-alb', code: 'F1867', name: 'Plain Alabaster', collection: 'SmartDrape — Plain', imageUrl: 'https://normanusa.com/app/uploads/2025/08/F1867-Plain-Alabaster.jpg', opacity: 'light-filtering', color: '#F0EAE0' },
  { id: 'sd-plain-silver', code: 'F1866', name: 'Plain French Silver', collection: 'SmartDrape — Plain', imageUrl: 'https://normanusa.com/app/uploads/2025/08/F1866-Plain-French-Silver.jpg.webp', opacity: 'light-filtering', color: '#B0ACA0' },
];

// ============================================================
// CENTERPIECE™ ROMAN SWATCHES
// ============================================================
export const ROMAN_SWATCHES: Swatch[] = [
  { id: 'rm-riviera-fox', name: 'Riviera Silver Fox', collection: 'Centerpiece Roman', imageUrl: 'https://normanusa.com/app/uploads/2025/08/Riviera-F1713-Silver-Fox.jpg', opacity: 'light-filtering', color: '#A8A8A8' },
  { id: 'rm-ashley-warm', name: 'Ashley Warm White', collection: 'Centerpiece Roman', imageUrl: 'https://normanusa.com/app/uploads/2026/02/Ashley-F2072-Warm-White.jpg', opacity: 'light-filtering', color: '#F8F4EE' },
  { id: 'rm-impressions-ice', name: 'Impressions Ice White', collection: 'Centerpiece Roman', imageUrl: 'https://normanusa.com/app/uploads/2026/02/Impressions-F1794-Ice-White.jpg.webp', opacity: 'light-filtering', color: '#FAFAFA' },
  { id: 'rm-cloud-white', code: 'F1470', name: 'Cloud White', collection: 'Centerpiece Roman', imageUrl: 'https://normanusa.com/app/uploads/2023/09/F1470-Cloud-White.jpg.webp', opacity: 'light-filtering', color: '#F5F2EC' },
];

// ============================================================
// FAUX WOOD BLINDS SWATCHES
// ============================================================
export const FAUX_WOOD_SWATCHES: Swatch[] = [
  { id: 'fw-pearl', name: 'Pearl', collection: 'Ultimate Faux Wood', imageUrl: 'https://normanusa.com/app/uploads/2023/10/Pearl-P006_Smooth.jpg.webp', color: '#F0EDE5' },
  { id: 'fw-storm-gray', name: 'Storm Gray', collection: 'Ultimate Faux Wood', imageUrl: 'https://normanusa.com/app/uploads/2023/10/Storm-Gray-P075_Smooth.jpg', color: '#808890' },
];

// ============================================================
// SYNCHRONY™ VERTICAL SWATCHES
// ============================================================
export const VERTICAL_SWATCHES: Swatch[] = [
  { id: 'sv-linen-metro', name: 'Linen Metropolitan', collection: 'Synchrony Vertical', imageUrl: 'https://normanusa.com/app/uploads/2020/05/Linen-8974-Metropolitan.jpg', color: '#C8BFB0' },
  { id: 'sv-linen-dusty', name: 'Linen Dusty Blue', collection: 'Synchrony Vertical', imageUrl: 'https://normanusa.com/app/uploads/2020/05/Linen-8993-Dusty-Blue.jpg', color: '#8BA0B0' },
];

// ============================================================
// CITYLIGHTS™ ALUMINUM SWATCHES
// ============================================================
export const ALUMINUM_SWATCHES: Swatch[] = [
  { id: 'al-platinum', name: 'Platinum', collection: 'CityLights Aluminum', imageUrl: 'https://normanusa.com/app/uploads/2023/06/7105_Platinum.jpg', color: '#C0C0C0' },
  { id: 'al-moonshine', name: 'Moonshine', collection: 'CityLights Aluminum', imageUrl: 'https://normanusa.com/app/uploads/2023/06/7112_Moonshine.jpg', color: '#E8E4D8' },
];

// ============================================================
// PRODUCT HERO/LIFESTYLE IMAGES
// ============================================================
export const PRODUCT_HEROES: Record<string, string[]> = {
  'portrait-honeycomb': [
    'https://normanusa.com/app/uploads/2022/07/525x762-HC_Motorizated_BottomUp.jpg',
  ],
  'soluna-roller': [
    'https://normanusa.com/app/uploads/2022/06/1440-x-1200-Roller-Fabrics.jpg.webp',
  ],
  'perfectsheer': [
    'https://normanusa.com/app/uploads/2022/06/HERO-1750x700-PefectSheer1.jpg',
  ],
  'smartdrape': [
    'https://normanusa.com/app/uploads/2024/07/525X394-SmartDrape-Center-Opening.jpg',
  ],
  'ultimate-faux-wood': [
    'https://normanusa.com/app/uploads/2020/03/510-x-460-Pb-Icon-2.jpg.webp',
  ],
  'synchrony': [
    'https://normanusa.com/app/uploads/2024/03/HERO-1750-X-700-Synchrony-D.jpg',
  ],
  'citylights': [
    'https://normanusa.com/app/uploads/2023/06/1440-x-1200_RIGHT_Citylight-Aluminum-1.jpg.webp',
  ],
  'shutters': [
    'https://normanusa.com/app/uploads/2020/07/2560-x-1067-HERO-Tall-Windows.jpg',
    'https://normanusa.com/app/uploads/2020/05/InvisibleTilt_02.jpg',
  ],
};

import { LEVOLOR_ALL_SWATCHES, LEVOLOR_SWATCHES_BY_PRODUCT } from './levolor-swatches';

// ============================================================
// ALL SWATCHES (for gallery)
// ============================================================
export const ALL_SWATCHES: Swatch[] = [
  ...HONEYCOMB_SWATCHES,
  ...ROLLER_SWATCHES,
  ...PERFECTSHEER_SWATCHES,
  ...SMARTDRAPE_SWATCHES,
  ...ROMAN_SWATCHES,
  ...FAUX_WOOD_SWATCHES,
  ...VERTICAL_SWATCHES,
  ...ALUMINUM_SWATCHES,
  ...LEVOLOR_ALL_SWATCHES,
];

// Map product ID to swatches
export const SWATCHES_BY_PRODUCT: Record<string, Swatch[]> = {
  // Norman
  'portrait-honeycomb': HONEYCOMB_SWATCHES,
  'soluna-roller': ROLLER_SWATCHES,
  'perfectsheer': PERFECTSHEER_SWATCHES,
  'smartdrape': SMARTDRAPE_SWATCHES,
  'centerpiece-roman': ROMAN_SWATCHES,
  'ultimate-faux-wood': FAUX_WOOD_SWATCHES,
  'smartprivacy-faux-wood': FAUX_WOOD_SWATCHES,
  'normandy-wood': [],
  'synchrony-vertical': VERTICAL_SWATCHES,
  'citylights-aluminum': ALUMINUM_SWATCHES,
  'norman-shutters': [],
  // Levolor
  ...LEVOLOR_SWATCHES_BY_PRODUCT,
};
