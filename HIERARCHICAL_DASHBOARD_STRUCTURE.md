# Hierarchical Multi-Party CRM Dashboard Structure

## Complete Role Hierarchy

### 1. **SuperAdmin** (Platform-wide)
- **Username:** `demo_superadmin`
- **Password:** `Demo@12345`
- **Route:** `/superadmin`
- **Dashboard:** `SuperAdminDashboard.tsx`
- **Scope:** Platform-wide management
- **Permissions:** All permissions across all organizations

---

### 2. **State Admin** (State-level)
- **Username:** `demo_state_admin`
- **Password:** `Demo@12345`
- **Email:** `state_admin@bjp.delhi.com`
- **Route:** `/dashboard/state`
- **Dashboard:** `AdminStateDashboard.tsx`
- **Scope:** Delhi (entire state)
- **Shows:** All zones, districts, constituencies in the state
- **Permissions:** Full admin rights within assigned state

---

### 3. **Zone Admin** (Zone-level)
- **Username:** `demo_zone_admin`
- **Password:** `Demo@12345`
- **Email:** `zone_admin@bjp.delhi.com`
- **Route:** `/dashboard/zone` ✅ NEW
- **Dashboard:** `ZoneAdminDashboard.tsx` ✅ NEW
- **Scope:** North Delhi Zone
- **Shows:** All districts within the zone
- **Permissions:** Manage all districts, constituencies, and booths in zone

---

### 4. **District Admin** (District-level)
- **Username:** `demo_district_admin`
- **Password:** `Demo@12345`
- **Email:** `district_admin@bjp.delhi.com`
- **Route:** `/dashboard/district`
- **Dashboard:** `ManagerDistrictDashboard.tsx`
- **Scope:** Central Delhi District
- **Shows:** All constituencies within the district
- **Permissions:** Manage all constituencies and booths in district

---

### 5. **Constituency Admin** (Constituency-level)
- **Username:** `demo_constituency_admin`
- **Password:** `Demo@12345`
- **Email:** `constituency_admin@bjp.delhi.com`
- **Route:** `/dashboard/constituency`
- **Dashboard:** `AnalystConstituencyDashboard.tsx`
- **Scope:** Chandni Chowk Constituency
- **Shows:** All booths within the constituency
- **Permissions:** Manage all booths in constituency

---

### 6. **Booth Admin** (Booth-level)
- **Username:** `demo_booth_admin`
- **Password:** `Demo@12345`
- **Email:** `booth_admin@bjp.delhi.com`
- **Route:** `/dashboard/booth`
- **Dashboard:** `UserBoothDashboard.tsx`
- **Scope:** Booth #101
- **Shows:** Field workers at the booth
- **Permissions:** Manage field workers at booth level

---

### 7. **Analyst** (Read-only observer)
- **Username:** `demo_analyst`
- **Password:** `Demo@12345`
- **Email:** `analyst@bjp.delhi.com`
- **Route:** `/dashboard/viewer`
- **Dashboard:** `ViewerDashboard.tsx`
- **Scope:** Read-only across assigned area
- **Shows:** Analytics and reports (no editing)
- **Permissions:** View-only access

---

## Dashboard Features by Role

### State Admin Dashboard
- **Title:** "Delhi State Dashboard"
- **Shows:**
  - State-wide sentiment
  - All zones in state
  - Aggregated district data
  - State-level alerts
  - State-wide trending topics

### Zone Admin Dashboard ✅ NEW
- **Title:** "North Delhi Zone Dashboard"
- **Shows:**
  - Zone-wide sentiment
  - All districts in zone (4-5 districts)
  - Aggregated constituency data
  - Zone-level alerts
  - District performance charts

### District Admin Dashboard
- **Title:** "Central Delhi District Dashboard"
- **Shows:**
  - District-wide sentiment
  - All constituencies in district (5-8 constituencies)
  - Ward performance
  - District-level alerts
  - Constituency rankings

### Constituency Admin Dashboard
- **Title:** "Chandni Chowk Constituency Dashboard"
- **Shows:**
  - Constituency-wide sentiment
  - All booths in constituency
  - Booth-level analytics
  - Field worker performance
  - Voter feedback trends

### Booth Admin Dashboard
- **Title:** "Booth #101 Dashboard"
- **Shows:**
  - Booth-level metrics
  - Field workers assigned to booth
  - Daily collection targets
  - Voter interactions
  - Local alerts

### Analyst Dashboard
- **Title:** "Analytics Dashboard"
- **Shows:**
  - Read-only reports
  - Charts and graphs
  - Sentiment analysis
  - Trends and insights
  - No editing capabilities

---

## Visual Differences Between Dashboards

| Role | Color Theme | Icon | Breadcrumb |
|------|-------------|------|------------|
| State Admin | Purple/Indigo | `🏛️ Building` | Delhi |
| Zone Admin | Blue/Indigo | `🏢 Building2` | Delhi > North Zone |
| District Admin | Purple | `📊 BarChart3` | Delhi > North Zone > Central District |
| Constituency Admin | Teal | `🎯 Target` | ... > Chandni Chowk |
| Booth Admin | Green | `👥 Users` | ... > Booth #101 |
| Analyst | Gray | `👁️ Eye` | [Area Name] (Read-only) |

---

## Testing Instructions

### 1. Restart Frontend
```bash
cd "/Users/apple/1 imo backups/pulseofproject python 3/pulseofprojectfrontendonly"
npm run dev
```

### 2. Test Each Role

**Test Zone Admin (NEW):**
```
1. Go to: http://localhost:5173/login
2. Login with: demo_zone_admin / Demo@12345
3. Expected: Redirects to /dashboard/zone
4. Should show: "North Delhi Zone (Delhi) Dashboard"
5. Shows: List of districts in the zone
```

**Test District Admin:**
```
1. Login with: demo_district_admin / Demo@12345
2. Expected: Redirects to /dashboard/district
3. Should show: "Central Delhi District Dashboard"
4. Shows: List of constituencies in the district
```

**Test Constituency Admin:**
```
1. Login with: demo_constituency_admin / Demo@12345
2. Expected: Redirects to /dashboard/constituency
3. Should show: "Chandni Chowk Constituency Dashboard"
4. Shows: List of booths in the constituency
```

**Test Booth Admin:**
```
1. Login with: demo_booth_admin / Demo@12345
2. Expected: Redirects to /dashboard/booth
3. Should show: "Booth #101 Dashboard"
4. Shows: Field workers at the booth
```

---

## API Endpoints Used

Each dashboard fetches data from:
- `GET /api/profile/me/` - Get user's assigned scope
- `GET /api/dashboard/metrics` - Get aggregated metrics
- `GET /api/dashboard/locations` - Get location-based sentiment
- `GET /api/dashboard/issues` - Get issue-wise sentiment
- `GET /api/dashboard/alerts` - Get active alerts

Data is filtered based on user's assigned geographic scope (state/zone/district/constituency/booth).

---

## Files Changed

### Backend
- `api/serializers.py` - Added geographic assignment fields

### Frontend
- `src/pages/dashboards/ZoneAdminDashboard.tsx` ✅ NEW
- `src/components/RoleBasedDashboard.tsx` - Updated routing
- `src/App.tsx` - Added new routes
- `src/contexts/AuthContext.tsx` - Added geographic fields
- `src/utils/permissions.ts` - Added hierarchical roles

---

## Next Steps (Optional)

1. **Connect to real backend data** - Replace mock data with actual API calls
2. **Add drill-down navigation** - Click district → see district dashboard
3. **Add map views** - Interactive geographic map for each level
4. **Add export features** - Export reports as PDF/Excel
5. **Add real-time updates** - WebSocket for live data refresh
6. **Add user creation** - Allow admins to create sub-users

---

**Version:** v1.1 - Hierarchical Dashboards Complete
**Date:** 2025-11-20
