import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Package, Printer, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { NORMAN_DEALER_NUMBER } from '@/lib/constants';
import { buildSupplierOrderCsv } from '@/lib/supplier-order-export';

type FulfillmentStatus = 'ready_for_review' | 'submitted' | 'in_production' | 'shipped' | 'blocked' | 'cancelled';

interface OrderItem {
  id: string;
  line_number: number;
  product_name: string;
  product_family: string;
  supplier_name: string;
  supplier_sku: string;
  room_name: string | null;
  mount_type: string;
  width: number;
  height: number;
  product_options: Record<string, string>;
  supplier_cost: number;
  broker_fee: number;
  customer_price: number;
}

interface FulfillmentJob {
  status: FulfillmentStatus;
  supplier_name: string;
  supplier_order_ref: string | null;
  last_error: string | null;
  ready_at: string | null;
  submitted_at: string | null;
}

interface AdminOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  shipping_address: Record<string, string> | null;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  tracking_number: string | null;
  estimated_delivery: string | null;
  order_items: OrderItem[];
  fulfillment_jobs: FulfillmentJob[];
}

const STATUSES: Array<{ value: FulfillmentStatus; label: string }> = [
  { value: 'ready_for_review', label: 'Ready for review' },
  { value: 'submitted', label: 'Submitted to supplier' },
  { value: 'in_production', label: 'In production' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrderDetail() {
  const { orderId = '' } = useParams();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<FulfillmentStatus>('ready_for_review');
  const [supplierRef, setSupplierRef] = useState('');
  const [tracking, setTracking] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const loadOrder = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('orders')
      .select('id, order_number, created_at, status, payment_status, contact_name, contact_email, contact_phone, shipping_address, subtotal, shipping_total, tax_total, grand_total, tracking_number, estimated_delivery, order_items(id, line_number, product_name, product_family, supplier_name, supplier_sku, room_name, mount_type, width, height, product_options, supplier_cost, broker_fee, customer_price), fulfillment_jobs(status, supplier_name, supplier_order_ref, last_error, ready_at, submitted_at)')
      .eq('id', orderId)
      .single();
    if (loadError || !data) {
      setError(loadError?.message || 'Order not found.');
      setLoading(false);
      return;
    }

    const next = data as unknown as AdminOrder;
    next.order_items = [...(next.order_items || [])].sort((left, right) => left.line_number - right.line_number);
    setOrder(next);
    const fulfillment = next.fulfillment_jobs?.[0];
    if (fulfillment) {
      setStatus(fulfillment.status);
      setSupplierRef(fulfillment.supplier_order_ref || '');
    }
    setTracking(next.tracking_number || '');
    setEstimatedDelivery(next.estimated_delivery || '');
    setError('');
    setLoading(false);
  }, [orderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.rpc('admin_update_fulfillment', {
      p_order_id: orderId,
      p_status: status,
      p_supplier_order_ref: supplierRef || null,
      p_tracking_number: tracking || null,
      p_estimated_delivery: estimatedDelivery || null,
    });
    if (updateError) setError(updateError.message);
    else await loadOrder();
    setSaving(false);
  };

  const downloadSupplierWorksheet = () => {
    if (!order) return;
    const csv = buildSupplierOrderCsv({
      orderNumber: order.order_number,
      dealerNumber: NORMAN_DEALER_NUMBER,
      customerName: order.contact_name || '',
      customerEmail: order.contact_email || '',
      customerPhone: order.contact_phone || '',
      shippingAddress: order.shipping_address || {},
      items: order.order_items.map((item) => ({
        lineNumber: item.line_number,
        roomName: item.room_name || '',
        productName: item.product_name,
        supplierName: item.supplier_name,
        supplierSku: item.supplier_sku,
        mountType: item.mount_type,
        width: Number(item.width),
        height: Number(item.height),
        options: item.product_options || {},
        supplierCost: Number(item.supplier_cost),
      })),
    });
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${order.order_number}-supplier-worksheet.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (!order) return <div className="min-h-screen bg-gray-50 p-8"><Link to="/admin" className="text-sm font-semibold text-blue-600">Back to admin</Link><p className="mt-6 text-red-600">{error}</p></div>;

  const fulfillment = order.fulfillment_jobs?.[0];
  const supplierCost = order.order_items.reduce((sum, item) => sum + Number(item.supplier_cost), 0);
  const brokerFee = order.order_items.reduce((sum, item) => sum + Number(item.broker_fee), 0);
  const address = order.shipping_address || {};

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white print:hidden"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6"><Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600"><ArrowLeft className="h-4 w-4" /> Admin</Link><span className="font-mono text-sm font-semibold">{order.order_number}</span></div></header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Order</p><h1 className="mt-1 text-3xl font-bold">Fulfillment detail</h1><p className="mt-2 text-sm text-gray-500">Placed {new Date(order.created_at).toLocaleString()}</p></div>
          <div className="flex flex-wrap gap-2"><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{order.payment_status}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{fulfillment?.status || 'not queued'}</span><button type="button" onClick={downloadSupplierWorksheet} className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-semibold print:hidden"><Download className="h-3.5 w-3.5" /> Supplier worksheet</button><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-semibold print:hidden"><Printer className="h-3.5 w-3.5" /> Print</button></div>
        </div>

        {error && <div role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <div className="space-y-6">
            <Card><CardContent className="p-5"><h2 className="flex items-center gap-2 font-semibold"><Package className="h-4 w-4 text-blue-600" /> Exact order specifications</h2><p className="mt-1 text-xs text-gray-500">Norman dealer {NORMAN_DEALER_NUMBER} · review every line before supplier release</p><div className="mt-4 space-y-4">{order.order_items.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Line {item.line_number} · {item.room_name || 'Room not named'}</p><h3 className="mt-1 text-lg font-bold">{item.product_name}</h3><p className="mt-1 text-sm text-gray-500">{item.width}&quot; W × {item.height}&quot; H · {item.mount_type} mount</p><div className="mt-3 flex flex-wrap gap-2">{Object.values(item.product_options || {}).map((value) => <span key={value} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{value}</span>)}</div></div><div className="text-sm sm:text-right"><p className="font-mono text-xs text-gray-500">{item.supplier_name} · {item.supplier_sku}</p><p className="mt-2">Cost <strong>${Number(item.supplier_cost).toFixed(2)}</strong></p><p>10% <strong>${Number(item.broker_fee).toFixed(2)}</strong></p><p className="mt-1 text-lg font-bold">${Number(item.customer_price).toFixed(2)}</p></div></div></div>)}</div></CardContent></Card>
            <Card><CardContent className="p-5"><h2 className="font-semibold">Customer and shipping</h2><div className="mt-4 grid gap-5 text-sm sm:grid-cols-2"><div><p className="font-semibold">{order.contact_name}</p><p className="mt-1 text-gray-500">{order.contact_email}<br />{order.contact_phone}</p></div><div><p className="font-semibold">Ship to</p><p className="mt-1 text-gray-500">{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{address.city}, {address.state} {address.zip}</p></div></div></CardContent></Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            <Card><CardContent className="p-5"><h2 className="font-semibold">Order money</h2><div className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-500">Supplier cost</span><strong>${supplierCost.toFixed(2)}</strong></div><div className="flex justify-between"><span className="text-gray-500">SnapShades 10%</span><strong>${brokerFee.toFixed(2)}</strong></div><div className="flex justify-between"><span className="text-gray-500">Shipping</span><strong>${Number(order.shipping_total).toFixed(2)}</strong></div><div className="flex justify-between"><span className="text-gray-500">Tax</span><strong>${Number(order.tax_total).toFixed(2)}</strong></div><div className="flex justify-between border-t pt-3 text-lg"><span>Total paid</span><strong>${Number(order.grand_total).toFixed(2)}</strong></div></div></CardContent></Card>
            <Card><CardContent className="p-5"><h2 className="flex items-center gap-2 font-semibold"><Truck className="h-4 w-4 text-blue-600" /> Fulfillment</h2>{fulfillment ? <form onSubmit={save} className="mt-4 space-y-4"><label className="block text-sm font-medium">Status<select value={status} onChange={(event) => setStatus(event.target.value as FulfillmentStatus)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5">{STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="block text-sm font-medium">Supplier order reference<input value={supplierRef} onChange={(event) => setSupplierRef(event.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" placeholder="Supplier PO / WO" /></label>{status === 'shipped' && <><label className="block text-sm font-medium">Tracking number<input required value={tracking} onChange={(event) => setTracking(event.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" /></label><label className="block text-sm font-medium">Estimated delivery<input type="date" value={estimatedDelivery} onChange={(event) => setEstimatedDelivery(event.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5" /></label></>}<Button type="submit" disabled={saving} className="w-full rounded-xl bg-blue-600 text-white">{saving ? 'Saving…' : <><CheckCircle2 className="mr-2 h-4 w-4" /> Save fulfillment status</>}</Button>{fulfillment.last_error && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{fulfillment.last_error}</p>}</form> : <p className="mt-4 text-sm text-red-600">This paid order has no fulfillment job. Do not submit it until the queue is repaired.</p>}</CardContent></Card>
          </div>
        </div>
      </main>
    </div>
  );
}
