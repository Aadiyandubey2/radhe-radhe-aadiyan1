import { AppLayout } from "@/components/layout/AppLayout";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { useIncome, useCreateIncome, useUpdateIncome, useDeleteIncome } from "@/hooks/useIncome";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips } from "@/hooks/useTrips";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Trash2, Edit } from "lucide-react";
import { useState } from "react";

export default function Finance() {
  const { data: expenses } = useExpenses();
  const { data: income } = useIncome();
  const { data: vehicles } = useVehicles();
  const { data: trips } = useTrips();
  const { data: clients } = useClients();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();
  
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [editExpenseOpen, setEditExpenseOpen] = useState(false);
  const [editIncomeOpen, setEditIncomeOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);

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

  const handleEditExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateExpense.mutateAsync({
      id: selectedExpense.id,
      category: fd.get("category") as any,
      amount: parseFloat(fd.get("amount") as string),
      description: fd.get("description") as string || null,
      expense_date: fd.get("date") as string,
      vehicle_id: fd.get("vehicle_id") as string || null,
      trip_id: fd.get("trip_id") as string || null,
    });
    setEditExpenseOpen(false);
    setSelectedExpense(null);
  };

  const handleIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await createIncome.mutateAsync({
      amount: parseFloat(fd.get("amount") as string),
      payment_date: fd.get("date") as string || new Date().toISOString().split("T")[0],
      payment_method: fd.get("method") as string || "cash",
      trip_id: fd.get("trip_id") as string || null,
      client_id: fd.get("client_id") as string || null,
      reference_number: fd.get("reference") as string || null,
      notes: fd.get("notes") as string || null,
    });
    setIncomeOpen(false);
  };

  const handleEditIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await updateIncome.mutateAsync({
      id: selectedIncome.id,
      amount: parseFloat(fd.get("amount") as string),
      payment_date: fd.get("date") as string,
      payment_method: fd.get("method") as string,
      trip_id: fd.get("trip_id") as string || null,
      client_id: fd.get("client_id") as string || null,
      reference_number: fd.get("reference") as string || null,
      notes: fd.get("notes") as string || null,
    });
    setEditIncomeOpen(false);
    setSelectedIncome(null);
  };

  const ExpenseForm = ({ expense, onSubmit, isPending, buttonText }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Category *</Label>
        <Select name="category" defaultValue={expense?.category || ""} required>
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
      <div><Label>Amount *</Label><Input name="amount" type="number" defaultValue={expense?.amount} required /></div>
      <div><Label>Date</Label><Input name="date" type="date" defaultValue={expense?.expense_date} /></div>
      <div><Label>Vehicle</Label>
        <Select name="vehicle_id" defaultValue={expense?.vehicle_id || ""}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{vehicles?.map((v) => <SelectItem key={v.id} value={v.id}>{v.vehicle_number}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Trip</Label>
        <Select name="trip_id" defaultValue={expense?.trip_id || ""}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{trips?.map((t) => <SelectItem key={t.id} value={t.id}>{t.trip_number}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Description</Label><Input name="description" defaultValue={expense?.description} /></div>
      <Button type="submit" className="w-full" disabled={isPending}>{isPending ? "Saving..." : buttonText}</Button>
    </form>
  );

  const IncomeForm = ({ inc, onSubmit, isPending, buttonText }: any) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><Label>Amount *</Label><Input name="amount" type="number" defaultValue={inc?.amount} required /></div>
      <div><Label>Date</Label><Input name="date" type="date" defaultValue={inc?.payment_date} /></div>
      <div><Label>Payment Method</Label>
        <Select name="method" defaultValue={inc?.payment_method || "cash"}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Trip</Label>
        <Select name="trip_id" defaultValue={inc?.trip_id || ""}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{trips?.map((t) => <SelectItem key={t.id} value={t.id}>{t.trip_number}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Client</Label>
        <Select name="client_id" defaultValue={inc?.client_id || ""}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{clients?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Reference</Label><Input name="reference" defaultValue={inc?.reference_number} /></div>
      <div><Label>Notes</Label><Input name="notes" defaultValue={inc?.notes} /></div>
      <Button type="submit" className="w-full" disabled={isPending}>{isPending ? "Saving..." : buttonText}</Button>
    </form>
  );

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

      {/* Edit Dialogs */}
      <Dialog open={editExpenseOpen} onOpenChange={(o) => { setEditExpenseOpen(o); if (!o) setSelectedExpense(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
          {selectedExpense && <ExpenseForm expense={selectedExpense} onSubmit={handleEditExpense} isPending={updateExpense.isPending} buttonText="Save Changes" />}
        </DialogContent>
      </Dialog>

      <Dialog open={editIncomeOpen} onOpenChange={(o) => { setEditIncomeOpen(o); if (!o) setSelectedIncome(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Income</DialogTitle></DialogHeader>
          {selectedIncome && <IncomeForm inc={selectedIncome} onSubmit={handleEditIncome} isPending={updateIncome.isPending} buttonText="Save Changes" />}
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="expenses">
        <div className="flex justify-between items-center mb-4">
          <TabsList><TabsTrigger value="expenses">Expenses</TabsTrigger><TabsTrigger value="income">Income</TabsTrigger></TabsList>
          <div className="flex gap-2">
            <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
              <DialogTrigger asChild><Button variant="outline"><ArrowDownRight className="w-4 h-4 mr-2" />Add Expense</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
                <ExpenseForm onSubmit={handleExpense} isPending={createExpense.isPending} buttonText="Add Expense" />
              </DialogContent>
            </Dialog>
            <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
              <DialogTrigger asChild><Button><ArrowUpRight className="w-4 h-4 mr-2" />Add Income</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Income</DialogTitle></DialogHeader>
                <IncomeForm onSubmit={handleIncome} isPending={createIncome.isPending} buttonText="Add Income" />
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
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-destructive">-{formatCurrency(exp.amount)}</p>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedExpense(exp); setEditExpenseOpen(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteExpense.mutate(exp.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-success">+{formatCurrency(inc.amount)}</p>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedIncome(inc); setEditIncomeOpen(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteIncome.mutate(inc.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
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
