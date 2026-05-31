/**
 * Norman® Order Specifications — MIRRORS THE DEALER PORTAL EXACTLY
 * 
 * Each product has a set of required fields that must be filled in
 * to generate a valid manufacturer order. These fields map 1:1 to
 * the Norman dealer portal entry screens.
 * 
 * AI AGENT PROCESSING:
 * The completed order form from a customer produces a JSON payload
 * that can be entered directly into Norman's dealer portal by an
 * AI agent — no human translation needed.
 */

// ============================================================
// COMMON TYPES
// ============================================================

export type MountType = 'inside' | 'outside';
export type ControlSide = 'left' | 'right';
export type Opacity = 'sheer' | 'light_filtering' | 'room_darkening' | 'blackout';

export interface OrderField {
  id: string;
  label: string;
  portalLabel: string;     // Exact label used in Norman portal
  type: 'select' | 'number' | 'text' | 'boolean' | 'color';
  required: boolean;
  priority: 'essential' | 'optional';  // essential = shown upfront, optional = behind "More Options"
  options?: { value: string; label: string; portalValue: string; surcharge?: number; surchargeType?: 'flat' | 'percent' }[];
  min?: number;
  max?: number;
  step?: number;
  default?: string | number | boolean;
  helpText?: string;
  dependsOn?: { field: string; value: string | string[] };  // Show only when dependency met
  portalSection?: string;  // Which section of the portal this maps to
  surcharge?: number;      // Flat upcharge applied when a boolean field is enabled
  displayHint?: 'image-card' | 'dropdown' | 'radio' | 'swatch';  // How the picker should render this field
}

// ============================================================
// PORTRAIT™ HONEYCOMB SHADES
// ============================================================

export const HONEYCOMB_ORDER_FIELDS: OrderField[] = [
  // PRODUCT SELECTION
  {
    id: 'cellSize',
    label: 'Cell Size',
    portalLabel: 'Cell Size',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    options: [
      { value: '3_8', label: '3/8" Single Cell', portalValue: '3/8" Single Cell' },
      { value: '9_16_single', label: '9/16" Single Cell', portalValue: '9/16" Single Cell' },
      { value: '9_16_double', label: '9/16" Double Cell', portalValue: '9/16" Double Cell' },
      { value: '3_4_single', label: '3/4" Single Cell', portalValue: '3/4" Single Cell' },
      { value: '3_4_double', label: '3/4" Double Cell', portalValue: '3/4" Double Cell' },
      { value: '1_1_4_single', label: '1-1/4" Single Cell', portalValue: '1-1/4" Single Cell' },
    ],
    helpText: 'Smaller cells for a sleeker look, larger cells for better insulation',
  },
  {
    id: 'opacity',
    label: 'Light Control',
    portalLabel: 'Opacity',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Fabric',
    options: [
      { value: 'sheer', label: 'Sheer — Softened light, see-through', portalValue: 'Sheer' },
      { value: 'light_filtering', label: 'Light Filtering — Blocks UV, soft glow', portalValue: 'Light Filtering' },
      { value: 'room_darkening', label: 'Room Darkening — Near blackout', portalValue: 'Room Darkening' },
    ],
    helpText: 'Bedrooms → Room Darkening. Living rooms → Light Filtering. Dining → Sheer.',
  },
  {
    id: 'fabricCollection',
    label: 'Fabric Collection',
    portalLabel: 'Fabric Collection',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Fabric',
    options: [
      { value: 'classic', label: 'Classic Solids', portalValue: 'Classic' },
      { value: 'designer', label: 'Designer Collection', portalValue: 'Designer' },
      { value: 'woven', label: 'Woven Textures', portalValue: 'Woven' },
      { value: 'heritage', label: 'Heritage Linen', portalValue: 'Heritage' },
      { value: 'flame_resistant', label: 'Flame Resistant', portalValue: 'Flame Resistant' },
    ],
  },
  {
    id: 'fabricColor',
    label: 'Color',
    portalLabel: 'Fabric Color',
    type: 'color',
    required: true,
    priority: 'essential',
    portalSection: 'Fabric',
    helpText: 'Select from digital swatches or request a physical sample',
  },

  // LIFT SYSTEM
  {
    id: 'liftSystem',
    label: 'Lift System',
    portalLabel: 'Lift System',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'smartrise_cordless', label: 'SmartRise™ Cordless — Push up/pull down', portalValue: 'SmartRise Cordless' },
      { value: 'smartfit', label: 'SmartFit® — Top-down/bottom-up, no cords', portalValue: 'SmartFit' },
      { value: 'smartfit_frame', label: 'SmartFit® with Frame — For french doors/skylights', portalValue: 'SmartFit with Frame', surcharge: 15, surchargeType: 'percent' },
      { value: 'smartrelease', label: 'SmartRelease™ — Gentle tug to lower', portalValue: 'SmartRelease' },
      { value: 'continuous_cord_loop', label: 'Continuous Cord Loop', portalValue: 'Continuous Cord Loop' },
      { value: 'motorized', label: 'Norman® Smart Motorization', portalValue: 'Smart Motorization', surcharge: 250, surchargeType: 'flat' },
    ],
    helpText: 'Cordless is safest for kids and pets. Motorized for hard-to-reach windows.',
  },

  // MEASUREMENTS
  {
    id: 'mountType',
    label: 'Mount Type',
    portalLabel: 'Mount Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Measurements',
    options: [
      { value: 'inside', label: 'Inside Mount — Fits inside the window frame', portalValue: 'Inside Mount' },
      { value: 'outside', label: 'Outside Mount — Mounts on wall above window', portalValue: 'Outside Mount' },
    ],
    helpText: 'Inside mount looks cleaner. Outside mount better for shallow windows.',
  },
  {
    id: 'width',
    label: 'Width',
    portalLabel: 'Width',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 6,
    max: 144,
    step: 0.125,
    portalSection: 'Measurements',
    helpText: 'Use the smallest measurement if top and bottom differ',
  },
  {
    id: 'height',
    label: 'Height',
    portalLabel: 'Height',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 6,
    max: 120,
    step: 0.125,
    portalSection: 'Measurements',
    helpText: 'Use the smallest measurement if left and right differ',
  },

  // OPTIONS
  {
    id: 'controlSide',
    label: 'Control Side',
    portalLabel: 'Cord/Control Position',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'right', label: 'Right (standard)', portalValue: 'Right' },
      { value: 'left', label: 'Left', portalValue: 'Left' },
    ],
    default: 'right',
    dependsOn: { field: 'liftSystem', value: ['continuous_cord_loop', 'smartrelease'] },
  },
  {
    id: 'headrailColor',
    label: 'Headrail Color',
    portalLabel: 'Headrail Color',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: 'matching', label: 'Match Fabric (standard)', portalValue: 'Matching' },
      { value: 'white', label: 'White', portalValue: 'White' },
      { value: 'off_white', label: 'Off-White', portalValue: 'Off White' },
    ],
    default: 'matching',
  },
  {
    id: 'bottomRailStyle',
    label: 'Bottom Rail',
    portalLabel: 'Bottom Rail Style',
    type: 'select',
    required: false,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: 'standard', label: 'Standard (flat)', portalValue: 'Standard' },
      { value: 'contoured', label: 'Contoured', portalValue: 'Contoured' },
    ],
    default: 'standard',
  },
  {
    id: 'valance',
    label: 'Valance',
    portalLabel: 'Valance Type',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: 'fabric_wrapped', label: 'Fabric-Wrapped Valance (standard)', portalValue: 'Fabric Wrapped' },
      { value: 'no_valance', label: 'No Valance', portalValue: 'No Valance' },
    ],
    default: 'fabric_wrapped',
  },
  {
    id: 'dayNight',
    label: 'Day & Night Option',
    portalLabel: 'Day/Night',
    type: 'boolean',
    required: false,
    priority: 'optional',
    default: false,
    portalSection: 'Options',
    helpText: 'Two fabrics in one shade — switch between light filtering and room darkening',
  },
  {
    id: 'dayNightTopFabric',
    label: 'Day/Night Top Fabric',
    portalLabel: 'Day/Night Top Fabric',
    type: 'color',
    required: true,
    priority: 'optional',
    portalSection: 'Options',
    dependsOn: { field: 'dayNight', value: ['true'] },
  },
  {
    id: 'specialtyShape',
    label: 'Specialty Shape',
    portalLabel: 'Specialty Shape',
    type: 'select',
    required: false,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: 'none', label: 'None (rectangular)', portalValue: 'None' },
      { value: 'arch', label: 'Arch Top', portalValue: 'Arch', surcharge: 30, surchargeType: 'percent' },
      { value: 'angle_top', label: 'Angle Top', portalValue: 'Angle Top', surcharge: 25, surchargeType: 'percent' },
      { value: 'skylight', label: 'Skylight', portalValue: 'Skylight', surcharge: 20, surchargeType: 'percent' },
    ],
    default: 'none',
  },
  {
    id: 'multipleOnHeadrail',
    label: 'Multiple Shades on One Headrail',
    portalLabel: 'Shades on Headrail',
    type: 'select',
    required: false,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: '1', label: '1 shade (standard)', portalValue: '1' },
      { value: '2', label: '2 shades on 1 headrail', portalValue: '2 on 1', surcharge: 40, surchargeType: 'flat' },
      { value: '3', label: '3 shades on 1 headrail', portalValue: '3 on 1', surcharge: 60, surchargeType: 'flat' },
    ],
    default: '1',
    helpText: 'For extra-wide windows — multiple shades joined on one headrail',
  },
  {
    id: 'holdDownBrackets',
    label: 'Hold Down Brackets',
    portalLabel: 'Hold Down Brackets',
    type: 'boolean',
    required: false,
    priority: 'optional',
    default: false,
    portalSection: 'Options',
    helpText: 'For doors — keeps shade in place when door opens',
  },
];

// ============================================================
// SOLUNA™ ROLLER SHADES
// ============================================================

export const ROLLER_ORDER_FIELDS: OrderField[] = [
  {
    id: 'fabricGroup',
    label: 'Fabric Group',
    portalLabel: 'Fabric Group',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    options: [
      { value: 'group1', label: 'Group 1 — Essential', portalValue: 'Group 1' },
      { value: 'group2', label: 'Group 2 — Designer', portalValue: 'Group 2' },
      { value: 'group3', label: 'Group 3 — Premium', portalValue: 'Group 3' },
      { value: 'group4', label: 'Group 4 — Luxury', portalValue: 'Group 4' },
      { value: 'group5', label: 'Group 5 — Exclusive', portalValue: 'Group 5' },
    ],
  },
  {
    id: 'opacity',
    label: 'Light Control',
    portalLabel: 'Opacity',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Fabric',
    options: [
      { value: 'sheer', label: 'Sheer — See-through, UV protection', portalValue: 'Sheer' },
      { value: 'light_filtering', label: 'Light Filtering — Soft glow', portalValue: 'Light Filtering' },
      { value: 'room_darkening', label: 'Room Darkening — Near blackout', portalValue: 'Room Darkening' },
    ],
  },
  {
    id: 'fabricColor',
    label: 'Fabric Color',
    portalLabel: 'Fabric Color',
    type: 'color',
    required: true,
    priority: 'essential',
    portalSection: 'Fabric',
  },
  {
    id: 'rollType',
    label: 'Roll Direction',
    portalLabel: 'Roll Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'standard', label: 'Standard Roll — Fabric behind roller', portalValue: 'Standard Roll' },
      { value: 'reverse', label: 'Reverse Roll — Fabric in front', portalValue: 'Reverse Roll' },
    ],
    default: 'standard',
    helpText: 'Reverse roll sits closer to window, better light blockage at edges',
  },
  {
    id: 'liftSystem',
    label: 'Lift System',
    portalLabel: 'Lift System',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'clutch', label: 'Clutch (chain)', portalValue: 'Clutch' },
      { value: 'spring_assist', label: 'Spring Assist Cordless', portalValue: 'Spring Assist' },
      { value: 'motorized', label: 'Norman® Smart Motorization', portalValue: 'Smart Motorization', surcharge: 250, surchargeType: 'flat' },
    ],
  },
  {
    id: 'controlSide',
    label: 'Chain/Control Side',
    portalLabel: 'Control Position',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'right', label: 'Right', portalValue: 'Right' },
      { value: 'left', label: 'Left', portalValue: 'Left' },
    ],
    default: 'right',
    dependsOn: { field: 'liftSystem', value: ['clutch'] },
  },
  {
    id: 'hemBar',
    label: 'Hem Bar Style',
    portalLabel: 'Hem Bar',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: 'standard', label: 'Standard — Sewn-in weight bar', portalValue: 'Standard' },
      { value: 'contoured', label: 'Contoured — Rounded bottom', portalValue: 'Contoured' },
      { value: 'flat', label: 'Flat — Square bottom', portalValue: 'Flat' },
    ],
    default: 'standard',
  },
  {
    id: 'valanceType',
    label: 'Valance / Cassette',
    portalLabel: 'Valance Type',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: 'open_roll', label: 'Open Roll — No cover', portalValue: 'Open Roll' },
      { value: 'cassette_3', label: '3" Cassette — Sleek cover', portalValue: '3" Cassette', surcharge: 25, surchargeType: 'flat' },
      { value: 'cassette_4', label: '4" Cassette — For larger shades', portalValue: '4" Cassette', surcharge: 35, surchargeType: 'flat' },
      { value: 'fascia', label: 'Fabric-Wrapped Fascia', portalValue: 'Fascia', surcharge: 20, surchargeType: 'flat' },
    ],
    default: 'open_roll',
    helpText: 'Cassettes cover the roller tube for a finished look',
  },
  {
    id: 'mountType',
    label: 'Mount Type',
    portalLabel: 'Mount Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Measurements',
    options: [
      { value: 'inside', label: 'Inside Mount', portalValue: 'Inside Mount' },
      { value: 'outside', label: 'Outside Mount', portalValue: 'Outside Mount' },
      { value: 'ceiling', label: 'Ceiling Mount', portalValue: 'Ceiling Mount' },
    ],
  },
  {
    id: 'width',
    label: 'Width',
    portalLabel: 'Width',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 12,
    max: 120,
    step: 0.125,
    portalSection: 'Measurements',
  },
  {
    id: 'height',
    label: 'Height / Drop',
    portalLabel: 'Height',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 12,
    max: 120,
    step: 0.125,
    portalSection: 'Measurements',
  },
  {
    id: 'multipleOnHeadrail',
    label: 'Linked Shades',
    portalLabel: 'Shades on Tube',
    type: 'select',
    required: false,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: '1', label: '1 shade (standard)', portalValue: '1' },
      { value: '2', label: '2 shades linked', portalValue: '2 Linked', surcharge: 30, surchargeType: 'flat' },
      { value: '3', label: '3 shades linked', portalValue: '3 Linked', surcharge: 50, surchargeType: 'flat' },
    ],
    default: '1',
  },
];

// ============================================================
// PLANTATION SHUTTERS (all lines)
// ============================================================

export const SHUTTER_ORDER_FIELDS: OrderField[] = [
  {
    id: 'shutterLine',
    label: 'Product Line',
    portalLabel: 'Product Line',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    options: [
      { value: 'woodlore', label: 'Woodlore® — Engineered Composite', portalValue: 'Woodlore' },
      { value: 'woodlore_plus', label: 'Woodlore® Plus — Polymer Composite', portalValue: 'Woodlore Plus' },
      { value: 'woodlore_plus_aqua', label: 'Woodlore® Plus AquaShield™ — Waterproof', portalValue: 'Woodlore Plus AquaShield' },
      { value: 'brightwood', label: 'Brightwood™ — Premium Engineered Wood', portalValue: 'Brightwood' },
      { value: 'normandy_painted', label: 'Normandy® Painted — Real Hardwood', portalValue: 'Normandy Painted' },
      { value: 'normandy_stained', label: 'Normandy® Stained — Real Hardwood', portalValue: 'Normandy Stained' },
    ],
  },
  {
    id: 'louverSize',
    label: 'Louver Size',
    portalLabel: 'Louver Size',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    options: [
      { value: '2_5', label: '2-1/2"', portalValue: '2.5"' },
      { value: '3_5', label: '3-1/2"', portalValue: '3.5"' },
      { value: '4_5', label: '4-1/2"', portalValue: '4.5"' },
    ],
    helpText: 'Larger louvers = more view, fewer louvers. 3.5" is most popular.',
  },
  {
    id: 'color',
    label: 'Color / Finish',
    portalLabel: 'Color',
    type: 'color',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    helpText: 'Painted: whites, creams, grays. Stained: natural wood tones.',
  },
  {
    id: 'tiltType',
    label: 'Tilt System',
    portalLabel: 'Tilt Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'tilt_rod', label: 'Standard Tilt Rod — Visible center rod', portalValue: 'Tilt Rod' },
      { value: 'invisible_tilt', label: 'InvisibleTilt® — Hidden tilt, clean look', portalValue: 'InvisibleTilt', surcharge: 20, surchargeType: 'flat' },
      { value: 'auto_tilt', label: 'AutoTilt — Motorized tilt per panel', portalValue: 'AutoTilt', surcharge: 70, surchargeType: 'flat' },
    ],
  },
  {
    id: 'frameType',
    label: 'Frame Style',
    portalLabel: 'Frame Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Frame',
    options: [
      { value: 'z_frame', label: 'Z Frame — Standard inside mount', portalValue: 'Z Frame' },
      { value: 'l_frame_half', label: 'L Frame 1/2" — Slim buildout', portalValue: 'L Frame 1/2"', surcharge: 5, surchargeType: 'percent' },
      { value: 'l_frame_1', label: 'L Frame 1" — Standard buildout', portalValue: 'L Frame 1"', surcharge: 5, surchargeType: 'percent' },
      { value: 'deco_frame', label: 'Deco Frame — Decorative profile', portalValue: 'Deco Frame', surcharge: 10, surchargeType: 'percent' },
      { value: 'no_frame', label: 'No Frame — Direct mount', portalValue: 'No Frame' },
    ],
  },
  {
    id: 'panelConfig',
    label: 'Panel Configuration',
    portalLabel: 'Panel Configuration',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Configuration',
    options: [
      { value: 'bi_fold_2', label: '2 Panels — Bi-fold', portalValue: '2 Panel Bi-Fold' },
      { value: 'bi_fold_3', label: '3 Panels — Bi-fold', portalValue: '3 Panel Bi-Fold' },
      { value: 'bi_fold_4', label: '4 Panels — Bi-fold', portalValue: '4 Panel Bi-Fold' },
      { value: 'single_left', label: 'Single Panel — Hinged Left', portalValue: 'Single Hinged Left' },
      { value: 'single_right', label: 'Single Panel — Hinged Right', portalValue: 'Single Hinged Right' },
      { value: 'bypass_2', label: 'Bypass Track — 2 Panels', portalValue: 'Bypass 2 Panel', surcharge: 40, surchargeType: 'percent' },
      { value: 'bypass_3', label: 'Bypass Track — 3 Panels', portalValue: 'Bypass 3 Panel', surcharge: 40, surchargeType: 'percent' },
      { value: 'cafe', label: 'Café Style — Half-height', portalValue: 'Cafe', surcharge: 30, surchargeType: 'percent' },
    ],
    helpText: 'Bi-fold is most common. Bypass for sliding doors. Café for kitchen/bath.',
  },
  {
    id: 'dividerRail',
    label: 'Divider Rail',
    portalLabel: 'Divider Rail',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Configuration',
    options: [
      { value: 'none', label: 'No Divider Rail', portalValue: 'None' },
      { value: 'standard', label: 'Standard Divider Rail', portalValue: 'Standard' },
      { value: 'custom_position', label: 'Custom Position Divider Rail', portalValue: 'Custom', surcharge: 21, surchargeType: 'flat' },
    ],
    helpText: 'Divider rail lets you tilt top and bottom louvers independently',
  },
  {
    id: 'dividerRailPosition',
    label: 'Divider Rail Height (from bottom)',
    portalLabel: 'Divider Rail Position',
    type: 'number',
    required: true,
    priority: 'optional',
    min: 12,
    max: 96,
    step: 0.125,
    portalSection: 'Configuration',
    dependsOn: { field: 'dividerRail', value: ['standard', 'custom_position'] },
    helpText: 'Inches from bottom of shutter to divider rail',
  },
  {
    id: 'hingeColor',
    label: 'Hinge Color',
    portalLabel: 'Hinge Color',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: 'matching', label: 'Match Frame (standard)', portalValue: 'Matching' },
      { value: 'stainless', label: 'Stainless Steel', portalValue: 'Stainless Steel', surcharge: 5, surchargeType: 'percent' },
    ],
    default: 'matching',
  },
  {
    id: 'width',
    label: 'Width',
    portalLabel: 'Width',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 8,
    max: 144,
    step: 0.125,
    portalSection: 'Measurements',
  },
  {
    id: 'height',
    label: 'Height',
    portalLabel: 'Height',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 8,
    max: 120,
    step: 0.125,
    portalSection: 'Measurements',
  },
  {
    id: 'mountType',
    label: 'Mount Type',
    portalLabel: 'Mount Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Measurements',
    options: [
      { value: 'inside', label: 'Inside Mount', portalValue: 'Inside Mount' },
      { value: 'outside', label: 'Outside Mount', portalValue: 'Outside Mount' },
    ],
  },
];

// ============================================================
// ONYX SHUTTERS — From ONYX Shutter Reference Guide 2026
// ============================================================

export const ONYX_SHUTTER_ORDER_FIELDS: OrderField[] = [
  {
    id: 'material',
    label: 'Material',
    portalLabel: 'Material',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    options: [
      { value: 'basswood', label: 'Premium Basswood — Natural beauty & strength', portalValue: 'Basswood' },
      { value: 'sycamore', label: 'Sycamore — Sustainable, lightweight hardwood', portalValue: 'Sycamore' },
      { value: 'polyvinyl', label: 'Polyvinyl — Moisture-resistant, durable', portalValue: 'Polyvinyl' },
      { value: 'us_polyvinyl', label: 'U.S. Made Polyvinyl — Domestic precision', portalValue: 'US Polyvinyl' },
      { value: 'mdf_hybrid', label: 'MDF Hybrid — MDF louvers, wood stiles, PVC frame', portalValue: 'MDF Hybrid' },
    ],
    helpText: 'Polyvinyl recommended for kitchens/bathrooms. Basswood & Sycamore for living areas.',
  },
  {
    id: 'louverSize',
    label: 'Louver Size',
    portalLabel: 'Louver Size',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    options: [
      { value: '2_5', label: '2-1/2"', portalValue: '2.5"' },
      { value: '3_5', label: '3-1/2"', portalValue: '3.5"' },
      { value: '4_5', label: '4-1/2"', portalValue: '4.5"' },
    ],
    helpText: 'Larger louvers = more view, fewer louvers. 3.5" is most popular.',
  },
  {
    id: 'color',
    label: 'Color / Finish',
    portalLabel: 'Color',
    type: 'color',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    helpText: 'Color options vary by material. Contact for stain options on Basswood/Sycamore.',
  },
  {
    id: 'tiltRod',
    label: 'Tilt Rod Style',
    portalLabel: 'Tilt Rod',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'standard', label: 'Standard — Centered on panel front', portalValue: 'Standard' },
      { value: 'offset', label: 'Offset — 2" from louver ends, hinged side', portalValue: 'Offset' },
      { value: 'hidden', label: 'Hidden — Back edge, flush when closed', portalValue: 'Hidden' },
    ],
    helpText: 'Hidden tilt rods over 40" require a split for proper function.',
  },
  {
    id: 'frameType',
    label: 'Frame Style',
    portalLabel: 'Frame Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Frame',
    options: [
      { value: 'z_trim', label: 'Z Frame Trim — Inside mount', portalValue: 'Z Frame Trim' },
      { value: 'z_fine', label: 'Z Frame Fine — Inside mount', portalValue: 'Z Frame Fine' },
      { value: 'z_crown', label: 'Z Frame Crown — Inside mount', portalValue: 'Z Frame Crown' },
      { value: 'z_crest', label: 'Z Crest — Inside mount', portalValue: 'Z Crest' },
      { value: 'l_frame', label: 'L Frame — Outside mount', portalValue: 'L Frame' },
      { value: 'l_frame_bullnose', label: 'L Frame Bullnose — Outside or inside mount', portalValue: 'L Frame Bullnose' },
      { value: 'decor_2', label: 'Decor Frame 2" — Outside mount', portalValue: 'Decor Frame 2"' },
      { value: 'decor_3', label: 'Decor Frame 3" — Outside mount', portalValue: 'Decor Frame 3"' },
    ],
    helpText: 'Z frames for inside mount, L/Decor frames for outside mount. U.S. Made Polyvinyl available in Z Trim, L Frame, and Z Crest.',
  },
  {
    id: 'panelConfig',
    label: 'Panel Configuration',
    portalLabel: 'Panel Configuration',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Configuration',
    options: [
      { value: 'single_left', label: 'Single Panel — Left hinge', portalValue: 'Single L' },
      { value: 'single_right', label: 'Single Panel — Right hinge', portalValue: 'Single R' },
      { value: 'two_lr', label: 'Two Panel — Left/Right', portalValue: '2 Panel LR' },
      { value: 'two_ll', label: 'Two Panel — Both Left', portalValue: '2 Panel LL' },
      { value: 'two_rr', label: 'Two Panel — Both Right', portalValue: '2 Panel RR' },
      { value: 'four_llrr', label: 'Four Panel — LLRR', portalValue: '4 Panel LLRR' },
      { value: 'bi_fold_2', label: 'Bi-fold — 2 Panels', portalValue: 'Bi-Fold 2 Panel' },
      { value: 'bi_fold_4', label: 'Bi-fold — 4 Panels', portalValue: 'Bi-Fold 4 Panel' },
      { value: 'bypass', label: 'Bypass Track', portalValue: 'Bypass' },
      { value: 'french_door', label: 'French Door', portalValue: 'French Door' },
      { value: 'double_hung', label: 'Double Hung', portalValue: 'Double Hung' },
    ],
    helpText: 'Single max 35"+frame. Two panel max 70"+frame. Bypass for sliding doors.',
  },
  {
    id: 'dividerRail',
    label: 'Divider Rail',
    portalLabel: 'Divider Rail',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Configuration',
    options: [
      { value: 'none', label: 'No Divider Rail', portalValue: 'None' },
      { value: 'centered', label: 'Centered Divider Rail', portalValue: 'Centered' },
      { value: 'custom', label: 'Custom Position', portalValue: 'Custom' },
    ],
    helpText: 'Over 60": 1 rail recommended. Over 72": 1 required. Over 100": 2 required.',
  },
  {
    id: 'dividerRailPosition',
    label: 'Divider Rail Height (from bottom)',
    portalLabel: 'Divider Rail Position',
    type: 'number',
    required: true,
    priority: 'optional',
    min: 12,
    max: 120,
    step: 0.125,
    portalSection: 'Configuration',
    dependsOn: { field: 'dividerRail', value: ['centered', 'custom'] },
    helpText: 'Inches from bottom of shutter to divider rail midpoint. Position tolerance: ±1.75" (3.5" louvers), ±2.25" (4.5" louvers).',
  },
  {
    id: 'specialtyShape',
    label: 'Specialty Shape',
    portalLabel: 'Custom Shape',
    type: 'select',
    required: false,
    priority: 'optional',
    portalSection: 'Configuration',
    options: [
      { value: 'none', label: 'Standard Rectangle', portalValue: 'None' },
      { value: 'sunburst_half', label: 'Sunburst Half Circle', portalValue: 'Sunburst Half Circle' },
      { value: 'elongated_eyebrow', label: 'Elongated Eyebrow', portalValue: 'Elongated Eyebrow' },
      { value: 'eyebrow', label: 'Eyebrow', portalValue: 'Eyebrow' },
      { value: 'arch_top', label: 'Arch Top (built-in arch)', portalValue: 'Arch Top' },
      { value: 'oval', label: 'Oval', portalValue: 'Oval' },
      { value: 'octagon', label: 'Octagon', portalValue: 'Octagon' },
      { value: 'quarterburst', label: 'Quarterburst', portalValue: 'Quarterburst' },
      { value: 'half_rake', label: 'Half Rake', portalValue: 'Half Rake' },
      { value: 'full_rake', label: 'Full Rake', portalValue: 'Full Rake' },
    ],
    helpText: 'Custom shapes require ~8 weeks. Physical template or detailed drawing needed.',
    default: 'none',
  },
  {
    id: 'width',
    label: 'Width',
    portalLabel: 'Width',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 8,
    max: 144,
    step: 0.0625,
    portalSection: 'Measurements',
    helpText: 'Inside mount: use smallest of 3 measurements, round down to 1/16". Outside mount: use largest, round up to 1/16".',
  },
  {
    id: 'height',
    label: 'Height',
    portalLabel: 'Height',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 16,
    max: 144,
    step: 0.0625,
    portalSection: 'Measurements',
    helpText: 'Wood max 144". Vinyl max 84". Measure in 3 places.',
  },
  {
    id: 'mountType',
    label: 'Mount Type',
    portalLabel: 'Mount Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Measurements',
    options: [
      { value: 'inside', label: 'Inside Mount', portalValue: 'Inside Mount' },
      { value: 'outside', label: 'Outside Mount', portalValue: 'Outside Mount' },
    ],
    helpText: 'Check diagonals for squareness. If difference > 3/8", use outside mount.',
  },
];

// ============================================================
// BRAND → PRODUCT FIELDS MAP
// ============================================================

export interface BrandInfo {
  id: string;
  name: string;
  description: string;
  logoColor: string;  // for UI accent
}

export const BRANDS: Record<string, BrandInfo> = {
  norman: {
    id: 'norman',
    name: 'Norman',
    description: 'Premium shutters & window treatments since 1985',
    logoColor: '#1e3a5f',
  },
  levolor: {
    id: 'levolor',
    name: 'Levolor',
    description: 'Trusted window coverings — quality blinds & shades since 1914',
    logoColor: '#c41230',
  },
  onyx: {
    id: 'onyx',
    name: 'Onyx',
    description: 'Family-owned manufacturer — shutters, shades & more',
    logoColor: '#3d3d3d',
  },
};

import {
  LEVOLOR_CELLULAR_ORDER_FIELDS,
  LEVOLOR_ROLLER_ORDER_FIELDS,
  LEVOLOR_ROMAN_ORDER_FIELDS,
  LEVOLOR_FAUX_WOOD_ORDER_FIELDS,
  LEVOLOR_REAL_WOOD_ORDER_FIELDS,
  LEVOLOR_RIVIERA_METAL_ORDER_FIELDS,
  LEVOLOR_BANDED_ORDER_FIELDS,
  LEVOLOR_SOFT_VERTICAL_ORDER_FIELDS,
} from './levolor-order-specs';

/** Maps product category slug → available brands → their order fields */
export const BRAND_PRODUCT_FIELDS: Record<string, Record<string, OrderField[]>> = {
  'norman-shutters': {
    norman: SHUTTER_ORDER_FIELDS,
    onyx: ONYX_SHUTTER_ORDER_FIELDS,
  },
};

// ============================================================
// FAUX WOOD BLINDS
// ============================================================

export const FAUX_WOOD_ORDER_FIELDS: OrderField[] = [
  {
    id: 'slatSize',
    label: 'Slat Size',
    portalLabel: 'Slat Size',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
    options: [
      { value: '2', label: '2" — Standard', portalValue: '2"' },
      { value: '2_5', label: '2-1/2" — Wider view', portalValue: '2.5"' },
    ],
  },
  {
    id: 'finish',
    label: 'Finish',
    portalLabel: 'Finish',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Product',
    options: [
      { value: 'smooth', label: 'Smooth — Clean modern look', portalValue: 'Smooth' },
      { value: 'woodgrain', label: 'Woodgrain — Textured wood look', portalValue: 'Woodgrain' },
    ],
  },
  {
    id: 'color',
    label: 'Color',
    portalLabel: 'Color',
    type: 'color',
    required: true,
    priority: 'essential',
    portalSection: 'Product',
  },
  {
    id: 'liftSystem',
    label: 'Lift System',
    portalLabel: 'Lift System',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'cordless', label: 'SmartPrivacy™ Cordless', portalValue: 'Cordless' },
      { value: 'cord', label: 'Standard Cord', portalValue: 'Cord' },
      { value: 'motorized', label: 'Motorized', portalValue: 'Motorized', surcharge: 200, surchargeType: 'flat' },
    ],
  },
  {
    id: 'tiltType',
    label: 'Tilt Control',
    portalLabel: 'Tilt Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'wand', label: 'Wand Tilt — Twist to tilt', portalValue: 'Wand' },
      { value: 'cord', label: 'Cord Tilt', portalValue: 'Cord' },
    ],
    default: 'wand',
  },
  {
    id: 'controlSide',
    label: 'Control Side',
    portalLabel: 'Cord/Wand Position',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Options',
    options: [
      { value: 'right', label: 'Right', portalValue: 'Right' },
      { value: 'left', label: 'Left', portalValue: 'Left' },
    ],
    default: 'right',
  },
  {
    id: 'valance',
    label: 'Valance',
    portalLabel: 'Valance',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: '2_5_crown', label: '2-1/2" Crown Valance (standard)', portalValue: '2.5" Crown' },
      { value: '3_crown', label: '3" Crown Valance', portalValue: '3" Crown' },
      { value: 'no_valance', label: 'No Valance', portalValue: 'No Valance' },
    ],
    default: '2_5_crown',
  },
  {
    id: 'routeHoles',
    label: 'Route Holes',
    portalLabel: 'Route Holes',
    type: 'select',
    required: true,
    priority: 'optional',
    portalSection: 'Options',
    options: [
      { value: 'standard', label: 'Standard Route — Visible holes in slats', portalValue: 'Standard Route' },
      { value: 'routeless', label: 'Routeless — No holes, better light block', portalValue: 'Routeless', surcharge: 10, surchargeType: 'percent' },
    ],
    default: 'standard',
  },
  {
    id: 'mountType',
    label: 'Mount Type',
    portalLabel: 'Mount Type',
    type: 'select',
    required: true,
    priority: 'essential',
    portalSection: 'Measurements',
    options: [
      { value: 'inside', label: 'Inside Mount', portalValue: 'Inside Mount' },
      { value: 'outside', label: 'Outside Mount', portalValue: 'Outside Mount' },
    ],
  },
  {
    id: 'width',
    label: 'Width',
    portalLabel: 'Width',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 6,
    max: 96,
    step: 0.125,
    portalSection: 'Measurements',
  },
  {
    id: 'height',
    label: 'Height',
    portalLabel: 'Height',
    type: 'number',
    required: true,
    priority: 'essential',
    min: 6,
    max: 96,
    step: 0.125,
    portalSection: 'Measurements',
  },
];

// ============================================================
// PRODUCT → FIELDS MAP
// ============================================================

export const PRODUCT_ORDER_FIELDS: Record<string, OrderField[]> = {
  // Norman
  'portrait-honeycomb': HONEYCOMB_ORDER_FIELDS,
  'portrait-honeycomb-shades': HONEYCOMB_ORDER_FIELDS,
  'soluna-roller': ROLLER_ORDER_FIELDS,
  'soluna-roller-shades': ROLLER_ORDER_FIELDS,
  'norman-shutters': SHUTTER_ORDER_FIELDS,
  'plantation-shutters': SHUTTER_ORDER_FIELDS,
  'ultimate-faux-wood': FAUX_WOOD_ORDER_FIELDS,
  'ultimate-faux-wood-blinds': FAUX_WOOD_ORDER_FIELDS,
  'smartprivacy-faux-wood': FAUX_WOOD_ORDER_FIELDS,
  'smartprivacy-faux-wood-blinds': FAUX_WOOD_ORDER_FIELDS,
  'centerpiece-roman-shades': ROLLER_ORDER_FIELDS,
  'synchrony-vertical-blinds': FAUX_WOOD_ORDER_FIELDS,
  'citylights-aluminum-blinds': FAUX_WOOD_ORDER_FIELDS,
  'perfectsheer-shades': ROLLER_ORDER_FIELDS,
  'smartdrape-shades': ROLLER_ORDER_FIELDS,
  'normandy-wood-blinds': FAUX_WOOD_ORDER_FIELDS,
  // Levolor
  'levolor-cellular': LEVOLOR_CELLULAR_ORDER_FIELDS,
  'levolor-roller': LEVOLOR_ROLLER_ORDER_FIELDS,
  'levolor-roman': LEVOLOR_ROMAN_ORDER_FIELDS,
  'levolor-faux-wood': LEVOLOR_FAUX_WOOD_ORDER_FIELDS,
  'levolor-real-wood': LEVOLOR_REAL_WOOD_ORDER_FIELDS,
  'levolor-riviera-metal': LEVOLOR_RIVIERA_METAL_ORDER_FIELDS,
  'levolor-banded': LEVOLOR_BANDED_ORDER_FIELDS,
  'levolor-soft-vertical': LEVOLOR_SOFT_VERTICAL_ORDER_FIELDS,
};

// ============================================================
// ORDER FORM GENERATION (for AI agent processing)
// ============================================================

export interface NormanOrderLine {
  lineNumber: number;
  room: string;
  windowName: string;
  productLine: string;          // e.g., "Portrait Honeycomb"
  portalProductCode: string;    // Maps to Norman portal product selector
  specifications: Record<string, string>;  // portalLabel → portalValue
  measurements: {
    width: number;
    height: number;
    mountType: string;
  };
  quantity: number;
  retailPrice: number;
  dealerCost: number;
  customerPrice: number;
}

export interface NormanOrderPayload {
  orderNumber: string;        // SnapShades order number
  dealerNumber: string;       // Norman dealer number (R00508)
  customerName: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  lines: NormanOrderLine[];
  totalRetail: number;
  totalDealerCost: number;
  rushOrder: boolean;
  specialInstructions?: string;
  createdAt: string;
}

/**
 * Generate the Norman portal-ready order payload from customer selections.
 * This is what the AI agent uses to fill in the portal forms.
 */
export function generateNormanOrderPayload(
  orderNumber: string,
  customerName: string,
  shippingAddress: NormanOrderPayload['shippingAddress'],
  windowConfigs: {
    room: string;
    windowName: string;
    productSlug: string;
    selections: Record<string, string | number | boolean>;
    retailPrice: number;
  }[],
): NormanOrderPayload {
  const lines: NormanOrderLine[] = windowConfigs.map((config, i) => {
    const fields = PRODUCT_ORDER_FIELDS[config.productSlug] || [];
    const specifications: Record<string, string> = {};

    for (const field of fields) {
      const value = config.selections[field.id];
      if (value === undefined || value === null) continue;

      if (field.type === 'select' && field.options) {
        const option = field.options.find(o => o.value === String(value));
        if (option) {
          specifications[field.portalLabel] = option.portalValue;
        }
      } else if (field.type === 'boolean') {
        specifications[field.portalLabel] = value ? 'Yes' : 'No';
      } else if (field.type === 'number') {
        specifications[field.portalLabel] = String(value);
      } else {
        specifications[field.portalLabel] = String(value);
      }
    }

    return {
      lineNumber: i + 1,
      room: config.room,
      windowName: config.windowName,
      productLine: config.productSlug,
      portalProductCode: config.productSlug,
      specifications,
      measurements: {
        width: Number(config.selections.width) || 0,
        height: Number(config.selections.height) || 0,
        mountType: String(config.selections.mountType || 'inside'),
      },
      quantity: 1,
      retailPrice: config.retailPrice,
      dealerCost: config.retailPrice * 0.36,
      customerPrice: config.retailPrice,
    };
  });

  return {
    orderNumber,
    dealerNumber: 'R00508',
    customerName,
    shippingAddress,
    lines,
    totalRetail: lines.reduce((sum, l) => sum + l.retailPrice, 0),
    totalDealerCost: lines.reduce((sum, l) => sum + l.dealerCost, 0),
    rushOrder: false,
    createdAt: new Date().toISOString(),
  };
}
