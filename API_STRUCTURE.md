# API Structure for Improved Reports

## Sender Report API Endpoint
**GET** `/report/sender-aggregation`

### Expected Response Structure
```json
[
  {
    "senderId": "SENDER001",
    "senderName": "John Doe",
    "senderPhoneNumber": "+91-9876543210",
    "senderAddress": "123 Main Street, City",
    "state": "Maharashtra",
    "noOfConsignments": 5,
    "totalAmount": 2500.00,
    "consignments": [
      {
        "consignmentId": "CONS001",
        "description": "Electronics package",
        "status": "Delivered",
        "category": "Electronics",
        "weight": "2.5",
        "distance": "150",
        "totalAmount": 500.00,
        "paymentStatus": "Paid"
      }
    ],
    "consignmentStatus": "Active",
    "paymentStatus": "Paid"
  }
]
```

## Traveler Report API Endpoint
**GET** `/report/traveler-aggregation`

### Expected Response Structure
```json
[
  {
    "travelerId": "TRAVELER001",
    "travelerName": "Jane Smith",
    "phoneNo": "+91-9876543211",
    "address": "456 Oak Avenue, City",
    "state": "Karnataka",
    "noOfConsignments": 3,
    "totalAmount": 1800.00,
    "consignments": [
      {
        "consignmentId": "CONS002",
        "description": "Documents package",
        "status": "In Transit",
        "expectedEarning": 300.00,
        "distance": "200",
        "category": "Documents",
        "pickup": "Mumbai",
        "delivery": "Bangalore",
        "senderPhoneNumber": "+91-9876543210"
      }
    ],
    "consignmentStatus": "Active",
    "paymentStatus": "Pending"
  }
]
```

## Backend Implementation Guide

### For Sender Report Aggregation
```javascript
// Using the provided models
const ConsignmentRequestHistory = require('./models/ConsignmentRequestHistory');
const User = require('./models/User');

app.get('/report/sender-aggregation', async (req, res) => {
  try {
    const senderData = await ConsignmentRequestHistory.aggregate([
      {
        $group: {
          _id: '$senderPhoneNumber',
          senderId: { $first: '$senderPhoneNumber' },
          senderName: { $first: '$senderName' },
          senderPhoneNumber: { $first: '$senderPhoneNumber' },
          senderAddress: { $first: '$senderFullAddress' },
          state: { $first: '$state' },
          noOfConsignments: { $sum: 1 },
          totalAmount: { $sum: '$expectedEarning' },
          consignments: {
            $push: {
              consignmentId: '$consignmentId',
              description: '$description',
              status: '$status',
              category: '$category',
              weight: '$weight',
              distance: '$distance',
              totalAmount: '$expectedEarning',
              paymentStatus: '$paymentStatus'
            }
          },
          consignmentStatus: { $first: '$status' },
          paymentStatus: { $first: '$paymentStatus' }
        }
      }
    ]);

    res.json(senderData);
  } catch (error) {
    console.error('Error fetching sender aggregation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### For Traveler Report Aggregation
```javascript
// Using the provided models
const ConsignmentRequestHistory = require('./models/ConsignmentRequestHistory');
const TravelDetails = require('./models/TravelDetails');

app.get('/report/traveler-aggregation', async (req, res) => {
  try {
    const travelerData = await ConsignmentRequestHistory.aggregate([
      {
        $unwind: '$traveldetails'
      },
      {
        $group: {
          _id: '$traveldetails.phoneNumber',
          travelerId: { $first: '$traveldetails.phoneNumber' },
          travelerName: { $first: '$traveldetails.username' },
          phoneNo: { $first: '$traveldetails.phoneNumber' },
          address: { $first: '$traveldetails.address' },
          state: { $first: '$traveldetails.state' },
          noOfConsignments: { $sum: 1 },
          totalAmount: { $sum: '$expectedEarning' },
          consignments: {
            $push: {
              consignmentId: '$consignmentId',
              description: '$description',
              status: '$status',
              expectedEarning: '$expectedEarning',
              distance: '$distance',
              category: '$category',
              pickup: '$pickupLocation',
              delivery: '$deliveryLocation',
              senderPhoneNumber: '$senderPhoneNumber'
            }
          },
          consignmentStatus: { $first: '$status' },
          paymentStatus: { $first: '$paymentStatus' }
        }
      }
    ]);

    res.json(travelerData);
  } catch (error) {
    console.error('Error fetching traveler aggregation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Key Features of the Improved Reports

1. **Simplified Table Structure**: Both reports now have exactly 10 columns matching the spreadsheet specifications
2. **Aggregated Data**: Data is grouped by sender/traveler to show summary information
3. **Consignment Details**: Clickable buttons to view detailed consignment information
4. **Export Functionality**: CSV export with the exact column headers from the spreadsheets
5. **Search and Filter**: Enhanced search capabilities and status filtering
6. **Responsive Design**: Mobile-friendly table layout
7. **Status Indicators**: Color-coded status and payment badges

## Column Mapping

### Sender Report Columns:
1. Sender Id
2. Name
3. Phone No
4. Address
5. State
6. No of Consignment
7. Total Amount
8. Sender's Consignment
9. Status of Consignment
10. Payment

### Traveler Report Columns:
1. Traveler Id
2. Name
3. Phone No
4. Address
5. State
6. No of Consignment
7. Total Amount
8. Traveler's Consignment
9. Status of Consignment
10. Payment 