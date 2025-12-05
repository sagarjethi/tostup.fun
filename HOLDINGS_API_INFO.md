# Holdings Data Source Information

## API Endpoint

**Backend API:** `GET /api/positions`
- **Location:** `apps/backend/src/index.ts` (line ~562)
- **Frontend Call:** `http://localhost:3001/api/positions`

## Exchange API

**Aster Futures API:**
- **Base URL:** `https://fapi.asterdex.com`
- **Endpoint:** `GET /fapi/v2/positionRisk`
- **Authentication:** API Key + Secret (signed requests)

## Account Identification

**Current API Credentials:**
- **API Key:** `1f52bbe2b48e7a7b491f7976eb14a8fd9f9700290609f2ada268b306b1ccb83f`
- **API Secret:** `4c6d441b23f2979c25e5fba72e61320e6226d3ec08ef6015b5d19e2e047abd51`
- **Base URL:** `https://fapi.asterdex.com`

**Account Address:**
The holdings are associated with the Aster exchange account that corresponds to these API credentials. The account is identified by:
- The API Key/Secret pair
- Aster exchange account ID (returned in API responses)

## Data Flow

```
Frontend (Dashboard.tsx)
  ↓
GET /api/positions
  ↓
Backend (index.ts)
  ↓
asterClient.getPositions()
  ↓
Aster API: GET /fapi/v2/positionRisk
  ↓
Returns positions for the account associated with API credentials
```

## Where Holdings Come From

1. **Frontend:** `apps/web/src/components/Dashboard.tsx` (line ~58-67)
   - Fetches from `http://localhost:3001/api/positions`
   - Polls every 5 seconds

2. **Backend API:** `apps/backend/src/index.ts` (line ~562-580)
   - Calls `asterClient.getPositions()`
   - Filters active positions (non-zero quantity)
   - Maps to frontend format

3. **Aster Client:** `apps/backend/src/market/aster-client.ts` (line ~105-109)
   - Makes signed request to Aster API
   - Uses API key/secret from config

4. **Aster Exchange:** `https://fapi.asterdex.com/fapi/v2/positionRisk`
   - Returns positions for the authenticated account

## To Add/Modify Holdings

**To change which account's holdings are shown:**

1. **Update API Credentials** in `.env` file:
   ```
   ASTER_API_KEY=your_new_api_key
   ASTER_API_SECRET=your_new_api_secret
   ```

2. **Or use connected wallet address:**
   - The frontend now shows the connected wallet address (from RainbowKit)
   - Holdings come from Aster exchange account (not blockchain wallet)
   - To link them, you'd need to:
     - Store wallet address → Aster API key mapping
     - Or use a different API that supports wallet-based queries

## Account Address Display

The wallet address shown in the Holdings panel comes from:
1. **Connected Wallet** (RainbowKit) - if user connects wallet
2. **API Response** - if Aster API returns account identifier
3. **Current:** Shows "Not Connected" if no wallet connected

## API Response Structure

**Aster API Response:**
```json
[
  {
    "symbol": "BTCUSDT",
    "positionAmt": "0.001",
    "entryPrice": "89706.40",
    "markPrice": "89750.00",
    "unrealizedProfit": "0.05",
    "leverage": "2"
  }
]
```

**Backend Transform:**
```typescript
{
  symbol: "BTCUSDT",
  qty: 0.001,
  entryPrice: 89706.40,
  side: "LONG",
  leverage: 2,
  pnl: 0.05
}
```

