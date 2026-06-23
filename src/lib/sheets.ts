import { Order } from '../types';

/**
 * 1. Webhook Approach (For anonymous checkouts)
 */
export async function sendOrderToWebhook(order: Order) {
  const webhookUrl = import.meta.env.VITE_GOOGLE_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.warn("No webhook URL configured. Order saved locally but not sent to Sheets.");
    return false;
  }

  try {
    const payload = {
      orderId: order.id,
      date: new Date(order.createdAt).toISOString(),
      customerName: order.customerInfo.fullName,
      phone: order.customerInfo.phone,
      email: (order.customerInfo as any).email || '',
      country: order.customerInfo.country,
      city: order.customerInfo.city,
      address: order.customerInfo.address,
      items: JSON.stringify(order.items),
      totalPrice: order.total,
      status: order.status,
      notes: order.customerInfo.notes
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      }
    });
    
    return true;
  } catch (err) {
    console.error("Webhook sync failed:", err);
    return false;
  }
}

/**
 * 2. Direct Sync Approach (For Admins using Workspace Integration)
 */
export async function syncOrdersToSheetDirectly(orders: Order[], accessToken: string) {
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
  if (!sheetId || sheetId === 'YOUR_SPREADSHEET_ID_HERE') {
    throw new Error('Please configure VITE_GOOGLE_SHEET_ID in your environment variables.');
  }

  // Format orders to sheets rows
  const rows = orders.map(o => [
    o.id,
    new Date(o.createdAt).toLocaleString('ar-DZ'),
    o.customerInfo.fullName,
    o.customerInfo.phone,
    o.customerInfo.country,
    o.customerInfo.city,
    o.customerInfo.address,
    o.items.map(i => `${i.quantity}x ${i.color} (${i.size})`).join(', '),
    o.total,
    o.status,
    o.trackingNumber || '',
    o.customerInfo.notes || ''
  ]);

  const body = {
    values: rows
  };

  try {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Google Sheets API Error: ${error.error.message}`);
    }

    return true;
  } catch (err) {
    console.error("Direct Sheet sync failed:", err);
    throw err;
  }
}
