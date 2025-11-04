/**
 * Spacing and sizing constants
 * Centralized size values for consistent layout
 */

export const LAYOUT_SPACING = {
  /** Standard tier spacing in infrastructure diagrams */
  TIER_SPACING: 400,
  /** Start X position for diagrams */
  DIAGRAM_START_X: 100,
  /** Start Y position for node layouts */
  NODE_START_Y: 150,
  /** Vertical spacing between nodes */
  NODE_SPACING_Y: 200,
  /** Tier label offset */
  TIER_LABEL_OFFSET: -80,
} as const;

export const NODE_SIZES = {
  /** Minimum width for custom nodes */
  MIN_WIDTH: 180,
  /** Icon container size */
  ICON_SIZE: 40,
  /** Icon width/height */
  ICON_DIMENSION: 24,
  /** Handle size */
  HANDLE_SIZE: 8,
  /** Handle border width */
  HANDLE_BORDER: 2,
} as const;

export const EDGE_STYLES = {
  /** Edge stroke width */
  STROKE_WIDTH: 2,
  /** Border radius for smooth step paths */
  BORDER_RADIUS: 8,
  /** Dash array pattern */
  DASH_ARRAY: '8,8',
  /** Background grid gap */
  GRID_GAP: 16,
  /** Background grid dot size */
  GRID_DOT_SIZE: 1,
} as const;

export const COMPONENT_HEIGHTS = {
  /** Minimum timeline height */
  TIMELINE_MIN: 400,
  /** Maximum timeline height (vh) */
  TIMELINE_MAX_VH: 80,
  /** Gradient overlay height */
  GRADIENT_HEIGHT: 60,
  /** Minimum screen height for hero section */
  HERO_MIN_HEIGHT: 800,
} as const;

export const Z_INDEX = {
  /** Base layer for edges and backgrounds */
  BASE: 0,
  /** Layer for controls and overlays */
  CONTROLS: 4,
  /** Layer for labels */
  LABELS: 5,
  /** Layer for nodes and important UI elements */
  NODES: 10,
  /** Layer for modals and popovers */
  POPOVER: 50,
  /** Layer for sticky headers */
  HEADER: 99,
  /** Layer for mobile navigation */
  MOBILE_NAV: 100,
  /** Layer for tooltips and highest priority elements */
  TOOLTIP: 101,
} as const;
