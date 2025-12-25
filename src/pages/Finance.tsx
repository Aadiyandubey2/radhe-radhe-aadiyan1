import { AppLayout } from "@/components/layout/AppLayout";
import { useExpenses, useCreateExpense } from "@/hooks/useExpenses";
import { useIncome, useCreateIncome } from "@/hooks/useIncome";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips } from "@/hooks/useTrips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";

export default function Finance() {
  const { data: expenses } = useExpenses();
  const { data: income } = useIncome();
  const { data: vehicles } = useVehicles();
  const { data: trips } = useTrips();
  const createExpense = useCreateExpense();
  const createIncome = useCreateIncome();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  const formatCurrency = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
  const totalIncome = income?.reduce((s, i) => s + Number(i.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;

  const handleExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createExpense.mutateAsync({
      category: fd.get("category") as any,
      amount: parseFloat(fd.get("amount") as string),
      description: fd.get("description") as string || null,
      expense_date: fd.get("date") as string || new Date().toISOString().split("T")[0],
      vehicle_id: fd.get("vehicle_id") as string || null,
      trip_id: fd.get("trip_id") as string || null,
      driver_id: null,
      receipt_url: null,
    });
    setExpenseOpen(false);
  };

  const handleIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createIncome.mutateAsync({
      amount: parseFloat(fd.get("amount") as string),
      payment_date: fd.get("date") as string || new Date().toISOString().split("T")[0],
      payment_method: fd.get("method") as string || "cash",
      trip_id: fd.get("trip_id") as string || null,
      client_id: null,
      reference_number: fd.get("reference") as string || null,
      notes: fd.get("notes") as string || null,
    });
    setIncomeOpen(false);
  };

  return (
    <AppLayout title="Finance" subtitle="Track income and expenses">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10"><TrendingUp className="w-6 h-6 text-success" /></div>
              <div><p className="text-sm text-muted-foreground">Total Income</p><p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10"><TrendingDown className="w-6 h-6 text-destructive" /></div>
              <div><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${totalIncome - totalExpenses >= 0 ? "from-success/10 to-success/5" : "from-destructive/10 to-destructive/5"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10"><Wallet className="w-6 h-6 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground">Net Profit</p><p className="text-2xl font-bold">{formatCurrency(totalIncome - totalExpenses)}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses">
        <div className="flex justify-between items-center mb-4">
          <TabsList><TabsTrigger value="expenses">Expenses</TabsTrigger><TabsTrigger value="income">Income</TabsTrigger></TabsList>
          <div className="flex gap-2">
            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
              <DialogTrigger asChild><Button variant="outline"><ArrowDownRight className="w-4 h-4 mr-2" />Add Expense</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
                <form onSubmit={handleExpense} className="space-y-4">
                  <div><Label>Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fuel">Fuel</SelectItem>
                        <SelectItem value="driver_salary">Driver Salary</SelectItem>
                        <SelectItem value="toll_parking">Toll & Parking</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="permits">Permits</SelectItem>
                        <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Amount *</Label><Input name="amount" type="number" required /></div>
                  <div><Label>Date</Label><Input name="date" type="date" /></div>
                  <div><Label>Vehicle</Label>
                    <Select name="vehicle_id"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{vehicles?.map((v) => <SelectItem key={v.id} value={v.id}>{v.vehicle_number}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Description</Label><Input name="description" /></div>
                  <Button type="submit" className="w-full">{createExpense.isPending ? "Adding..." : "Add Expense"}</Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
              <DialogTrigger asChild><Button><ArrowUpRight className="w-4 h-4 mr-2" />Add Income</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Income</DialogTitle></DialogHeader>
                <form onSubmit={handleIncome} className="space-y-4">
                  <div><Label>Amount *</Label><Input name="amount" type="number" required /></div>
                  <div><Label>Date</Label><Input name="date" type="date" /></div>
                  <div><Label>Payment Method</Label>
                    <Select name="method" defaultValue="cash"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="bank">Bank Transfer</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="cheque">Cheque</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Trip</Label>
                    <Select name="trip_id"><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{trips?.map((t) => <SelectItem key={t.id} value={t.id}>{t.trip_number}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Reference</Label><Input name="reference" /></div>
                  <Button type="submit" className="w-full">{createIncome.isPending ? "Adding..." : "Add Income"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="expenses">
          <Card><CardContent className="pt-6">
            <div className="space-y-3">
              {expenses?.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><ArrowDownRight className="w-5 h-5 text-destructive" /></div>
                    <div><p className="font-medium capitalize">{exp.category.replace("_", " ")}</p><p className="text-sm text-muted-foreground">{exp.expense_date} • {exp.vehicles?.vehicle_number || "General"}</p></div>
                  </div>
                  <p className="font-semibold text-destructive">-{formatCurrency(exp.amount)}</p>
                </div>
              ))}
              {expenses?.length === 0 && <p className="text-center py-8 text-muted-foreground">No expenses recorded</p>}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="income">
          <Card><CardContent className="pt-6">
            <div className="space-y-3">
              {income?.map((inc) => (
                <div key={inc.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><ArrowUpRight className="w-5 h-5 text-success" /></div>
                    <div><p className="font-medium">{inc.trips?.trip_number || "Direct Payment"}</p><p className="text-sm text-muted-foreground">{inc.payment_date} • {inc.payment_method}</p></div>
                  </div>
                  <p className="font-semibold text-success">+{formatCurrency(inc.amount)}</p>
                </div>
              ))}
              {income?.length === 0 && <p className="text-center py-8 text-muted-foreground">No income recorded</p>}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
