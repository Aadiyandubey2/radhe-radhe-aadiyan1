import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAnalyticsWithRange } from "@/hooks/useAnalyticsWithRange";
import { useTrips } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { TimeRangeSelector, TimeRange } from "@/components/TimeRangeSelector";
import {
  Truck,
  Users,
  Route,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(217, 91%, 60%)", "hsl(262, 83%, 58%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function Dashboard() {
  const { data: analytics, isLoading } = useAnalytics();
  const { data: trips } = useTrips();
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const { data: trendData } = useAnalyticsWithRange(timeRange);

  useEffect(() => {
    // Show onboarding if user hasn't completed it
    const hasCompletedOnboarding = localStorage.getItem("rrt_onboarding_complete");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("rrt_onboarding_complete", "true");
    setShowOnboarding(false);
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem("rrt_onboarding_complete");
    setShowOnboarding(true);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success";
      case "running":
        return "bg-primary/10 text-primary";
      case "assigned":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Calculate real stats from data
  const activeVehicles = vehicles?.filter(v => v.status === "active").length || 0;
  const activeDrivers = drivers?.filter((d: any) => d.is_active).length || 0;
  const totalTrips = trips?.length || 0;
  const completedTrips = trips?.filter(t => t.status === "completed").length || 0;

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Loading your fleet data...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back! Here's your fleet overview">
      {/* Onboarding Guide */}
      {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}

      {/* Restart Tutorial Button */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestartTutorial}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restart Tutorial
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Income"
          value={formatCurrency(analytics?.totalIncome || 0)}
          icon={<Wallet className="w-6 h-6" />}
          variant="success"
        />
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(analytics?.totalExpenses || 0)}
          icon={<TrendingDown className="w-6 h-6" />}
          variant="warning"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(analytics?.netProfit || 0)}
          icon={<TrendingUp className="w-6 h-6" />}
          variant={(analytics?.netProfit || 0) >= 0 ? "success" : "destructive"}
        />
        <StatsCard
          title="Pending Payments"
          value={formatCurrency(analytics?.pendingPayments || 0)}
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Vehicles"
          value={activeVehicles}
          icon={<Truck className="w-6 h-6" />}
        />
        <StatsCard
          title="Active Drivers"
          value={activeDrivers}
          icon={<Users className="w-6 h-6" />}
        />
        <StatsCard
          title="Total Trips"
          value={totalTrips}
          icon={<Route className="w-6 h-6" />}
        />
        <StatsCard
          title="Completed Trips"
          value={completedTrips}
          icon={<CheckCircle className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="font-display">Revenue & Expenses Trend</CardTitle>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {(trendData?.length || 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData || []}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" className="text-muted-foreground" tick={{ fontSize: 11 }} />
                    <YAxis className="text-muted-foreground" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="hsl(142, 76%, 36%)"
                      fill="url(#incomeGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="hsl(0, 84%, 60%)"
                      fill="url(#expenseGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Add income and expenses to see trends</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Expenses Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {(analytics?.expensesByCategory?.length || 0) > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie
                        data={analytics?.expensesByCategory || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="category"
                      >
                        {(analytics?.expensesByCategory || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {(analytics?.expensesByCategory || []).slice(0, 4).map((item, i) => (
                      <div key={item.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="text-muted-foreground">{item.category}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Add expenses to see breakdown</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips & Vehicle Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Recent Trips</CardTitle>
            <Badge variant="secondary">{trips?.length || 0} total</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(trips || []).slice(0, 5).map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Route className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{trip.trip_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {trip.pickup_location} → {trip.drop_location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                    <p className="text-sm font-medium mt-1">{formatCurrency(trip.fare_amount)}</p>
                  </div>
                </div>
              ))}
              {(!trips || trips.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Route className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trips yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Vehicle Performance</CardTitle>
            <Badge variant="secondary">{vehicles?.length || 0} vehicles</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(analytics?.vehicleWiseProfits || []).slice(0, 5).map((vehicle) => (
                <div
                  key={vehicle.vehicle}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{vehicle.vehicle}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.trips} trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        vehicle.profit >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {formatCurrency(vehicle.profit)}
                    </p>
                    {vehicle.profit >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-success inline" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive inline" />
                    )}
                  </div>
                </div>
              ))}
              {(!analytics?.vehicleWiseProfits || analytics.vehicleWiseProfits.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Add vehicles to see performance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
