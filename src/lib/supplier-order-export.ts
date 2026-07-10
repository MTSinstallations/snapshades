export interface SupplierWorksheetItem {
  lineNumber: number;
  roomName: string;
  productName: string;
  supplierName: string;
  supplierSku: string;
  mountType: string;
  width: number;
  height: number;
  options: Record<string, string>;
  supplierCost: number;
}

export interface SupplierWorksheet {
  orderNumber: string;
  dealerNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Record<string, string>;
  items: SupplierWorksheetItem[];
}

function csv(value: unknown): string {
  const normalized = String(value ?? '');
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

/** Human-review worksheet; intentionally not advertised as a portal import. */
export function buildSupplierOrderCsv(order: SupplierWorksheet): string {
  const address = order.shippingAddress;
  const headers = [
    'Order', 'Dealer', 'Line', 'Supplier', 'Product', 'Supplier variant', 'Room',
    'Mount', 'Width (in)', 'Height (in)', 'Color', 'Color code', 'Light control',
    'Construction', 'Cell size', 'Fabric group', 'Lift system', 'Roll type',
    'Finish', 'Tilt type', 'Headrail', 'Route holes', 'Slat size', 'Tilt side', 'Supplier cost', 'Customer',
    'Customer email', 'Customer phone', 'Ship to',
  ];
  const shipTo = [address.line1, address.line2, address.city, address.state, address.zip].filter(Boolean).join(', ');
  const rows = order.items.map((item) => [
    order.orderNumber,
    order.dealerNumber,
    item.lineNumber,
    item.supplierName,
    item.productName,
    item.supplierSku,
    item.roomName,
    item.mountType,
    item.width,
    item.height,
    item.options.color,
    item.options.colorCode,
    item.options.lightControl,
    item.options.construction,
    item.options.cellSize,
    item.options.fabricGroup,
    item.options.liftSystem,
    item.options.rollType,
    item.options.finish,
    item.options.tiltType,
    item.options.headrail,
    item.options.routeHoles,
    item.options.slatSize,
    item.options.controlSide,
    item.supplierCost.toFixed(2),
    order.customerName,
    order.customerEmail,
    order.customerPhone,
    shipTo,
  ]);
  return [headers, ...rows].map((row) => row.map(csv).join(',')).join('\n');
}
