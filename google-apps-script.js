/**
 * JOAmedic Google Apps Script Webhook
 * 
 * Instructions:
 * 1. Go to https://script.google.com and create a new project.
 * 2. Paste this code.
 * 3. Add your Spreadsheet ID below.
 * 4. Click Deploy -> New Deployment.
 * 5. Type: Web App, Execute as: Me, Who has access: Anyone.
 * 6. Copy the Web App URL and set it as VITE_GOOGLE_WEBHOOK_URL in your app.
 */

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Orders';

function setup() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Order ID', 'Order Date', 'Customer Name', 'Phone', 'Email',
      'Country', 'City', 'Address', 'Items', 'Total Price', 'Status', 'Notes'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Validation Layer
    if (!data.orderId || !data.customerName) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const rowData = [
      data.orderId,
      data.date,
      data.customerName,
      data.phone,
      data.email,
      data.country,
      data.city,
      data.address,
      data.items, // JSON String
      data.totalPrice,
      data.status,
      data.notes
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Order added successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    // Error Handling & Logging
    console.error("Webhook Error: " + err.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
