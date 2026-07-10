import { buildSupplierOrderCsv } from './supplier-order-export';

describe('buildSupplierOrderCsv', () => {
  it('creates a supplier-review worksheet with exact order codes and escaped addresses', () => {
    const result = buildSupplierOrderCsv({
      orderNumber: 'SS-260709-0001',
      dealerNumber: 'R00508',
      customerName: 'Taylor Customer',
      customerEmail: 'taylor@example.com',
      customerPhone: '805-555-0100',
      shippingAddress: { line1: '123 Main St', city: 'Ventura', state: 'CA', zip: '93001' },
      items: [{
        lineNumber: 1,
        roomName: 'Living room',
        productName: 'Faux Wood Blinds',
        supplierName: 'Norman®',
        supplierSku: 'ultimate-faux-2-25',
        mountType: 'inside',
        width: 36,
        height: 48,
        options: { color: 'Pearl', colorCode: 'P006', lightControl: 'Tilting slats', construction: 'Faux Wood', liftSystem: 'Cordless', finish: 'Smooth', tiltType: 'Wand', headrail: 'PolyDeco valance-free', routeHoles: 'SmartPrivacy concealed', slatSize: '2½"', controlSide: 'Left' },
        supplierCost: 80.1,
      }],
    });

    expect(result).toContain('SS-260709-0001,R00508,1,Norman®');
    expect(result).toContain('P006,Tilting slats,Faux Wood,,,Cordless,,Smooth,Wand,PolyDeco valance-free,SmartPrivacy concealed,"2½""",Left,80.10');
    expect(result).toContain('"123 Main St, Ventura, CA, 93001"');
  });
});
