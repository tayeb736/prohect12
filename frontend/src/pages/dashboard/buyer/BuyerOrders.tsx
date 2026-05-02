import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import './BuyerOrders.css';

const BuyerOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);

  const fetchOrders = async () => {
    try {
      const [ordersRes, rentalsRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/rentals/my-rentals')
      ]);
      setOrders(ordersRes.data || []);
      setRentals(rentalsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch buyer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmDelivery = async (subOrderId: string) => {
    if (!window.confirm('Are you sure you have received this order?')) return;
    try {
      await api.post(`/orders/${subOrderId}/confirm-delivery`);
      alert('Delivery confirmed successfully. Funds have been released to the seller.');
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm delivery');
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(p)) + ' DZD';

  if (loading) return <div>Loading your orders...</div>;

  // Flatten the orders into sub-orders for easier display since sellers are per sub-order
  const myOrders = [
    ...orders.flatMap(o => o.subOrders.map((so: any) => ({
      id: so.id,
      parentOrderId: o.id,
      store: so.store?.name || 'Unknown Store',
      date: new Date(o.createdAt).toLocaleDateString(),
      total: so.subtotal,
      status: so.status,
      type: 'SALE',
      items: so.items
    }))),
    ...rentals.map(r => ({
      id: r.id,
      store: r.items?.[0]?.product?.store?.name || 'Unknown Store',
      date: new Date(r.createdAt).toLocaleDateString(),
      total: r.totalRentAmount + r.depositAmount,
      status: r.status,
      type: 'RENTAL',
      items: r.items
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="buyer-orders">
      <div className="page-header">
        <h1>My Orders & Rentals</h1>
        <p>Track and manage your medical equipment purchases and rentals.</p>
      </div>

      {trackingOrder && (
        <div className="tracking-modal-overlay" onClick={() => setTrackingOrder(null)}>
          <div className="tracking-modal" onClick={e => e.stopPropagation()}>
            <div className="tracking-header">
              <h3>Track Order #{trackingOrder.id.substring(0,8).toUpperCase()}</h3>
              <button onClick={() => setTrackingOrder(null)}>&times;</button>
            </div>
            <div className="tracking-body">
              <div className="tracking-timeline">
                <div className={`step ${['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(trackingOrder.status) ? 'active' : ''}`}>
                  <div className="icon"><i className="fas fa-receipt"></i></div>
                  <div className="label">Order Placed</div>
                  <div className="date">Aug 12</div>
                </div>
                <div className={`step ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(trackingOrder.status) ? 'active' : ''}`}>
                  <div className="icon"><i className="fas fa-box-open"></i></div>
                  <div className="label">Processing</div>
                  <div className="date">Aug 13</div>
                </div>
                <div className={`step ${['SHIPPED', 'DELIVERED'].includes(trackingOrder.status) ? 'active' : ''}`}>
                  <div className="icon"><i className="fas fa-truck"></i></div>
                  <div className="label">Shipped</div>
                  <div className="date">Aug 14</div>
                </div>
                <div className={`step ${['DELIVERED'].includes(trackingOrder.status) ? 'active' : ''}`}>
                  <div className="icon"><i className="fas fa-check-circle"></i></div>
                  <div className="label">Delivered</div>
                  <div className="date">Pending</div>
                </div>
              </div>
              <div className="tracking-details">
                <p><strong>Carrier:</strong> DHL Express Algeria</p>
                <p><strong>Tracking Number:</strong> MEDI-${Math.floor(Math.random()*900000 + 100000)}</p>
                <p><strong>Shipping To:</strong> Cité 2000 Logements, Algiers, Algeria</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="orders-list">
        {myOrders.length === 0 ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>No orders found.</div>
        ) : (
          myOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="main-info">
                  <span className="order-number">Order #{order.id.substring(0,8).toUpperCase()}</span>
                  <span className="order-date">Placed on {order.date}</span>
                  <span className="type-badge" style={{marginLeft: '10px', fontSize: '0.8rem', padding: '2px 6px', background: '#eee', borderRadius: '4px'}}>{order.type}</span>
                </div>
                <div className={`status-pill ${order.status.toLowerCase()}`}>
                  {order.status}
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="item-row">
                    <div className="item-details">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-vendor">Sold by: {order.store}</span>
                    </div>
                    <div className="item-price">
                      <span>{item.quantity} x {formatPrice(item.unitPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="total-pay">
                  <span>Total Amount:</span>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
                <div className="order-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      const printWindow = window.open('', '', 'height=600,width=800');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Invoice #${order.id.substring(0,8).toUpperCase()}</title>
                              <style>
                                body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                                h1 { margin: 0; color: #2563eb; }
                                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                th { background-color: #f8fafc; }
                                .total { font-size: 1.2rem; font-weight: bold; text-align: right; }
                                .footer { margin-top: 50px; font-size: 0.9rem; color: #64748b; text-align: center; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <div>
                                  <h1>MediShop PRO</h1>
                                  <p>Official Tax Invoice</p>
                                </div>
                                <div style="text-align: right;">
                                  <strong>Invoice #:</strong> INV-${order.id.substring(0,8).toUpperCase()}<br/>
                                  <strong>Date:</strong> ${order.date}<br/>
                                  <strong>Seller:</strong> ${order.store}
                                </div>
                              </div>
                              
                              <h3>Order Details (${order.type})</h3>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Item Name</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${order.items.map((item: any) => `
                                    <tr>
                                      <td>${item.productName}</td>
                                      <td>${item.quantity}</td>
                                      <td>${formatPrice(item.unitPrice)}</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>
                              
                              <div class="total">
                                Total Amount Paid: ${formatPrice(order.total)}
                              </div>
                              
                              <div class="footer">
                                Thank you for shopping with MediShop PRO. This is a computer generated invoice and requires no signature.<br/>
                                Tax ID: 0000000000000000 | Contact: support@medishop.dz
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => { printWindow.print(); }, 500);
                      }
                    }}
                  >
                    <i className="fas fa-file-pdf"></i> Download Invoice
                  </button>
                  {order.type === 'SALE' && order.status === 'SHIPPED' && (
                    <button className="btn-primary" onClick={() => handleConfirmDelivery(order.id)}>Confirm Delivery</button>
                  )}
                  {order.type === 'SALE' && order.status === 'PENDING' && (
                    <button className="btn-primary" onClick={() => setTrackingOrder(order)}>Track Order</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuyerOrders;
