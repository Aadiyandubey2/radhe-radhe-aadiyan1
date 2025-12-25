import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(217, 91%, 60%)", "hsl(262, 83%, 58%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(180, 70%, 45%)", "hsl(320, 70%, 50%)"];

export default function Analytics() {
  const { data: analytics, isLoading } = useAnalytics();
  const formatCurrency = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
  const formatShort = (v: number) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
    return `₹${v}`;
  };

  if (isLoading) {
    return (
      <AppLayout title="Analytics" subtitle="Loading insights...">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </AppLayout>
    );
  }

  const hasMonthlyData = (analytics?.monthlyTrends?.length || 0) > 0;
  const hasExpenseData = (analytics?.expensesByCategory?.length || 0) > 0;
  const hasVehicleData = (analytics?.vehicleWiseProfits?.length || 0) > 0;

  return (
    <AppLayout title="Analytics" subtitle="Business insights / व्यापार विश्लेषण">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue vs Expenses */}
        <Card>
          <CardHeader><CardTitle className="text-base sm:text-lg">Monthly Revenue vs Expenses / मासिक आय बनाम खर्च</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              {hasMonthlyData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={formatShort} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} 
                      formatter={(v: number) => formatCurrency(v)} 
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="income" name="Income / आय" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses / खर्च" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                  <p>Add income and expenses to see monthly trends<br/>आय और खर्च जोड़ें</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base sm:text-lg">Expense Distribution / खर्च वितरण</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              {hasExpenseData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={analytics?.expensesByCategory || []} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={40}
                      outerRadius={80} 
                      paddingAngle={2}
                      dataKey="amount" 
                      nameKey="category" 
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(analytics?.expensesByCategory || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                  <p>Add expenses to see distribution<br/>खर्च जोड़ें</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Performance */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base sm:text-lg">Vehicle Performance / वाहन प्रदर्शन</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              {hasVehicleData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.vehicleWiseProfits || []} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tickFormatter={formatShort} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="vehicle" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="profit" name="Profit / लाभ" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                  <p>Add vehicles and trips to see performance<br/>वाहन और यात्राएं जोड़ें</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
