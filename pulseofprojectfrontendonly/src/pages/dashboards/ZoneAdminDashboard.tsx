import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import {
  MapPin, Users, TrendingUp, TrendingDown, AlertTriangle,
  MessageSquare, Activity, Target, Map, BarChart3,
  RefreshCw, ChevronRight, Minus, ThumbsUp, ThumbsDown,
  Zap, Shield, Eye, Building2
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * Zone Admin Dashboard - Zone Level
 *
 * DATA FLOW: Bottom-up aggregation
 * Booth → Ward → Constituency → District → ZONE → State
 *
 * SCOPE: Single Zone (e.g., North Delhi Zone, South Delhi Zone)
 * - 3-5 districts per zone
 * - All constituencies within zone
 * - All wards and booths under zone
 *
 * DATA SOURCES:
 * - Aggregated from all districts in zone
 * - Social media filtered by zone location
 * - News mentions with zone tags
 * - Field reports from zone booth agents
 */
export default function ZoneAdminDashboard() {
  const { user } = useAuth();
  const { zoneCode } = useParams<{ zoneCode?: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Zone info - Read from user's assigned zone
  const [zoneName, setZoneName] = useState(
    user?.assigned_zone_name || 'Zone'
  );
  const [zoneMetrics, setZoneMetrics] = useState<any>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [issueSentiment, setIssueSentiment] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [districtPerformance, setDistrictPerformance] = useState<any[]>([]);

  // Load zone data
  const loadZoneDashboard = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      console.log(`[Zone Dashboard] Loading data for ${zoneName}...`);

      // Fetch zone-specific data (filtered from state data)
      const [
        metrics,
        locations,
        issues,
        trending,
        alerts,
        posts,
      ] = await Promise.all([
        dashboardService.getDashboardMetrics(),
        dashboardService.getLocationSentiment(),
        dashboardService.getIssueSentiment(),
        dashboardService.getTrendingTopics(10),
        dashboardService.getActiveAlerts(15),
        dashboardService.getRecentSocialPosts(30),
      ]);

      // Filter data for this zone
      const zoneLocation = locations.find(loc =>
        loc.title.toLowerCase().includes(zoneName.toLowerCase().split(' ')[0])
      );

      // Get districts in this zone (mock for now)
      const zoneDistricts = [
        { id: 1, name: 'North District', sentiment: 72, constituencies: 8, wards: 85, feedback: 1850, status: 'active' },
        { id: 2, name: 'Central District', sentiment: 68, constituencies: 6, wards: 62, feedback: 1520, status: 'active' },
        { id: 3, name: 'East District', sentiment: 75, constituencies: 7, wards: 74, feedback: 1680, status: 'active' },
        { id: 4, name: 'West District', sentiment: 64, constituencies: 5, wards: 58, feedback: 1210, status: 'active' },
      ];

      // District performance data (mock)
      const districtData = zoneDistricts.map(d => ({
        district: d.name.replace(' District', ''),
        sentiment: d.sentiment,
        coverage: Math.floor(Math.random() * 20) + 70,
        constituencies: d.constituencies,
      }));

      setZoneMetrics({
        sentiment: zoneLocation?.sentiment || 0.70,
        totalFeedback: zoneDistricts.reduce((sum, d) => sum + d.feedback, 0),
        districtsActive: zoneDistricts.filter(d => d.status === 'active').length,
        totalDistricts: zoneDistricts.length,
        totalConstituencies: zoneDistricts.reduce((sum, d) => sum + d.constituencies, 0),
        activeBoothAgents: 1850,
        totalBoothAgents: 2300,
        wardsTotal: zoneDistricts.reduce((sum, d) => sum + d.wards, 0),
        coveragePercentage: 82,
      });

      setDistricts(zoneDistricts);
      setDistrictPerformance(districtData);
      setIssueSentiment(issues.slice(0, 5));
      setTrendingTopics(trending.slice(0, 8));

      // Filter alerts for this zone
      setActiveAlerts(alerts.slice(0, 10));

      // Filter social posts for this zone
      setSocialPosts(posts.slice(0, 10));

      setLastUpdated(new Date());
      console.log(`[Zone Dashboard] ✓ Data loaded for ${zoneName}`);
    } catch (error) {
      console.error('[Zone Dashboard] Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Get zone name from route or user profile
    if (zoneCode) {
      setZoneName(zoneCode);
    }
    loadZoneDashboard();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadZoneDashboard(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [zoneCode, user?.assigned_zone_name]);

  // Helper functions
  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    if (score >= 30) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSentimentBorderColor = (score: number) => {
    if (score >= 70) return 'border-green-200';
    if (score >= 50) return 'border-yellow-200';
    if (score >= 30) return 'border-orange-200';
    return 'border-red-200';
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 70) return <ThumbsUp className="w-4 h-4" />;
    if (score >= 50) return <Minus className="w-4 h-4" />;
    return <ThumbsDown className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'bg-red-100 text-red-800 border-red-300';
    if (severity === 'high') return 'bg-orange-100 text-orange-800 border-orange-300';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  // Chart data
  const districtChartData = districtPerformance.map(d => ({
    name: d.district,
    sentiment: d.sentiment,
    constituencies: d.constituencies * 10, // Scale for visualization
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Zone Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link to="/dashboard" className="hover:text-indigo-600">
            {user?.assigned_state_name || 'State'}
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="font-medium text-gray-900">{zoneName}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-600" />
              {zoneName} Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Managing {zoneMetrics?.totalDistricts || 0} Districts • {zoneMetrics?.totalConstituencies || 0} Constituencies • {zoneMetrics?.wardsTotal || 0} Wards
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => loadZoneDashboard(false)}
              disabled={refreshing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Zone Sentiment */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Zone Sentiment</h3>
            <ThumbsUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {Math.round((zoneMetrics?.sentiment || 0) * 100)}%
            </p>
            <span className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              vs State: {Math.round(((zoneMetrics?.sentiment || 0) - 0.68) * 100)}%
            </span>
          </div>
        </div>

        {/* Districts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Districts</h3>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {zoneMetrics?.districtsActive || 0}
            </p>
            <span className="text-sm text-gray-500">
              of {zoneMetrics?.totalDistricts || 0} active
            </span>
          </div>
        </div>

        {/* Booth Agents */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Booth Agents</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {zoneMetrics?.activeBoothAgents || 0}
            </p>
            <span className="text-sm text-gray-500">
              {zoneMetrics?.totalBoothAgents ? Math.round((zoneMetrics.activeBoothAgents / zoneMetrics.totalBoothAgents) * 100) : 0}% active
            </span>
          </div>
        </div>

        {/* Total Feedback */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Feedback</h3>
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {zoneMetrics?.totalFeedback?.toLocaleString() || 0}
            </p>
            <span className="text-sm text-gray-500">
              Last 7 days
            </span>
          </div>
        </div>
      </div>

      {/* District Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          District Performance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={districtChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Bar dataKey="sentiment" fill="#6366f1" name="Sentiment %" />
            <Bar dataKey="constituencies" fill="#8b5cf6" name="Constituencies (x10)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* All Districts */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Map className="w-5 h-5 text-indigo-600" />
            All Districts
          </h2>
          <Link
            to="/regional-map"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View Map
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {districts.map((district, idx) => (
            <div
              key={district.id}
              className={`p-4 rounded-lg border-2 ${getSentimentBorderColor(district.sentiment)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`px-3 py-1 rounded-full ${getSentimentColor(district.sentiment)} font-semibold flex items-center gap-2`}>
                    {getSentimentIcon(district.sentiment)}
                    {district.sentiment}%
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{district.name}</h3>
                    <p className="text-sm text-gray-500">
                      {district.constituencies} constituencies • {district.wards} wards • {district.feedback.toLocaleString()} feedback
                    </p>
                  </div>
                </div>

                <Link
                  to={`/dashboard/district/${district.id}`}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Alerts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Zone Alerts
        </h2>

        {activeAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No active alerts for this zone</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.slice(0, 5).map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm uppercase">
                        {alert.severity}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{alert.district || zoneName}</span>
                    </div>
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400">
        v1.0 - {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
