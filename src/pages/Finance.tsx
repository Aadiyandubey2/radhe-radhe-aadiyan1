import { AppLayout } from "@/components/layout/AppLayout";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { useIncome, useCreateIncome, useUpdateIncome, useDeleteIncome } from "@/hooks/useIncome";
import { useVehicles } from "@/hooks/useVehicles";
import { useTrips } from "@/hooks/useTrips";
import { useClients } from "@/hooks/useClients";
import { useDrivers } from "@/hooks/useDrivers";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, Download, Search, Calendar, X, Check } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

type TransactionType = "expense" | "income";

interface UnifiedTransaction {
  id: string;
  type: TransactionType;
  date: string;
  amount: number;
  category?: string;
  paymentMethod?: string;
  tripId?: string | null;
  tripNumber?: string | null;
  vehicleId?: string | null;
  vehicleNumber?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  description?: string | null;
  reference?: string | null;
  originalData: any;
}

interface EditingCell {
  transactionId: string;
  field: string;
  value: string;
}

export default function Finance() {
  const { data: expenses } = useExpenses();
  const { data: income } = useIncome();
  const { data: vehicles } = useVehicles();
  const { data: trips } = useTrips();
  const { data: clients } = useClients();
  const { data: drivers } = useDrivers();
  const { data: expenseCategories } = useCategories("expense_category");
  const { data: paymentMethods } = useCategories("payment_method");

  // Map category names to values
  const normalizeKey = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  const expenseCategoryOptions = (expenseCategories?.length ? expenseCategories : [
    { id: "s1", name: "Fuel" }, { id: "s2", name: "Driver Salary" },
    { id: "s3", name: "Toll & Parking" }, { id: "s4", name: "Maintenance" },
    { id: "s5", name: "Insurance" }, { id: "s6", name: "Permits" },
    { id: "s7", name: "Miscellaneous" },
  ]).map((c: any) => ({ value: normalizeKey(c.name), label: c.name }));

  const paymentMethodOptions = (paymentMethods?.length ? paymentMethods : [
    { id: "p1", name: "Cash" }, { id: "p2", name: "Bank Transfer" },
    { id: "p3", name: "UPI" }, { id: "p4", name: "Cheque" },
  ]).map((c: any) => ({ value: normalizeKey(c.name), label: c.name }));
  
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<UnifiedTransaction | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>("expense");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Search and date range filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  
  // Inline editing state
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Combine expenses and income into unified transactions
  const transactions = useMemo<UnifiedTransaction[]>(() => {
    const expenseRows: UnifiedTransaction[] = (expenses || []).map((e) => ({
      id: e.id,
      type: "expense" as const,
      date: e.expense_date || "",
      amount: Number(e.amount),
      category: e.category,
      tripId: e.trip_id,
      tripNumber: e.trips?.trip_number,
      vehicleId: e.vehicle_id,
      vehicleNumber: e.vehicles?.vehicle_number,
      driverId: e.driver_id,
      driverName: e.drivers?.name,
      description: e.description,
      originalData: e,
    }));

    const incomeRows: UnifiedTransaction[] = (income || []).map((i) => ({
      id: i.id,
      type: "income" as const,
      date: i.payment_date || "",
      amount: Number(i.amount),
      paymentMethod: i.payment_method,
      tripId: i.trip_id,
      tripNumber: i.trips?.trip_number,
      clientId: i.client_id,
      clientName: i.clients?.name,
      description: i.notes,
      reference: i.reference_number,
      originalData: i,
    }));

    let combined = [...expenseRows, ...incomeRows];

    // Filter by type
    if (filterType !== "all") {
      combined = combined.filter((t) => t.type === filterType);
    }

    // Filter by date range
    if (dateFrom) {
      combined = combined.filter((t) => new Date(t.date) >= dateFrom);
    }
    if (dateTo) {
      combined = combined.filter((t) => new Date(t.date) <= dateTo);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter((t) =>
        t.tripNumber?.toLowerCase().includes(q) ||
        t.vehicleNumber?.toLowerCase().includes(q) ||
        t.driverName?.toLowerCase().includes(q) ||
        t.clientName?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.paymentMethod?.toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    }

    // Sort
    combined.sort((a, b) => {
      if (sortField === "date") {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return combined;
  }, [expenses, income, filterType, sortField, sortOrder, searchQuery, dateFrom, dateTo]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

  const totalIncome = income?.reduce((s, i) => s + Number(i.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;
  const netProfit = totalIncome - totalExpenses;

  // Filtered totals
  const filteredIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const filteredExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const handleAddNew = (type: TransactionType) => {
    setTransactionType(type);
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  const handleEdit = (transaction: UnifiedTransaction) => {
    setTransactionType(transaction.type);
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = async (transaction: UnifiedTransaction) => {
    if (transaction.type === "expense") {
      await deleteExpense.mutateAsync(transaction.id);
    } else {
      await deleteIncome.mutateAsync(transaction.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (transactionType === "expense") {
      const expenseData = {
        category: fd.get("category") as any,
        amount: parseFloat(fd.get("amount") as string),
        description: (fd.get("description") as string) || null,
        expense_date: (fd.get("date") as string) || new Date().toISOString().split("T")[0],
        vehicle_id: (fd.get("vehicle_id") as string) || null,
        trip_id: (fd.get("trip_id") as string) || null,
        driver_id: (fd.get("driver_id") as string) || null,
        receipt_url: null,
      };

      if (editingTransaction) {
        await updateExpense.mutateAsync({ id: editingTransaction.id, ...expenseData });
      } else {
        await createExpense.mutateAsync(expenseData);
      }
    } else {
      const incomeData = {
        amount: parseFloat(fd.get("amount") as string),
        payment_date: (fd.get("date") as string) || new Date().toISOString().split("T")[0],
        payment_method: (fd.get("payment_method") as string) || "cash",
        trip_id: (fd.get("trip_id") as string) || null,
        client_id: (fd.get("client_id") as string) || null,
        reference_number: (fd.get("reference") as string) || null,
        notes: (fd.get("description") as string) || null,
      };

      if (editingTransaction) {
        await updateIncome.mutateAsync({ id: editingTransaction.id, ...incomeData });
      } else {
        await createIncome.mutateAsync(incomeData);
      }
    }

    setDialogOpen(false);
    setEditingTransaction(null);
  };

  // Inline edit handlers
  const startEditing = (transaction: UnifiedTransaction, field: string, currentValue: string) => {
    setEditingCell({ transactionId: transaction.id, field, value: currentValue });
  };

  const cancelEditing = () => {
    setEditingCell(null);
  };

  const saveInlineEdit = async (transaction: UnifiedTransaction) => {
    if (!editingCell) return;

    const { field, value } = editingCell;

    if (transaction.type === "expense") {
      const updateData: any = { id: transaction.id };
      if (field === "amount") updateData.amount = parseFloat(value) || 0;
      if (field === "date") updateData.expense_date = value;
      if (field === "description") updateData.description = value || null;
      await updateExpense.mutateAsync(updateData);
    } else {
      const updateData: any = { id: transaction.id };
      if (field === "amount") updateData.amount = parseFloat(value) || 0;
      if (field === "date") updateData.payment_date = value;
      if (field === "description") updateData.notes = value || null;
      await updateIncome.mutateAsync(updateData);
    }

    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, transaction: UnifiedTransaction) => {
    if (e.key === "Enter") {
      saveInlineEdit(transaction);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const exportToCSV = () => {
    const headers = ["Type", "Date", "Amount", "Category/Method", "Trip", "Vehicle", "Driver", "Client", "Description", "Reference"];
    const rows = transactions.map((t) => [
      t.type,
      t.date,
      t.type === "expense" ? -t.amount : t.amount,
      t.type === "expense" ? t.category : t.paymentMethod,
      t.tripNumber || "",
      t.vehicleNumber || "",
      t.driverName || "",
      t.clientName || "",
      t.description || "",
      t.reference || "",
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setFilterType("all");
  };

  const hasActiveFilters = searchQuery || dateFrom || dateTo || filterType !== "all";

  // Editable cell component
  const EditableCell = ({ transaction, field, value, displayValue, className = "" }: {
    transaction: UnifiedTransaction;
    field: string;
    value: string;
    displayValue: React.ReactNode;
    className?: string;
  }) => {
    const isEditing = editingCell?.transactionId === transaction.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type={field === "amount" ? "number" : field === "date" ? "date" : "text"}
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, transaction)}
            onBlur={() => saveInlineEdit(transaction)}
            className="h-7 text-sm py-0 px-1"
          />
        </div>
      );
    }

    return (
      <div
        className={`cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 -mx-1 ${className}`}
        onDoubleClick={() => startEditing(transaction, field, value)}
        title="Double-click to edit"
      >
        {displayValue}
      </div>
    );
  };

  return (
    <AppLayout title="Finance Database" subtitle="All transactions in one place">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {hasActiveFilters ? "Filtered Income" : "Total Income"}
                </p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(hasActiveFilters ? filteredIncome : totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {hasActiveFilters ? "Filtered Expenses" : "Total Expenses"}
                </p>
                <p className="text-xl font-bold text-destructive">
                  {formatCurrency(hasActiveFilters ? filteredExpenses : totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${(hasActiveFilters ? filteredIncome - filteredExpenses : netProfit) >= 0 ? "from-success/10 to-success/5 border-success/20" : "from-destructive/10 to-destructive/5 border-destructive/20"}`}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {hasActiveFilters ? "Filtered Profit" : "Net Profit"}
                </p>
                <p className={`text-xl font-bold ${(hasActiveFilters ? filteredIncome - filteredExpenses : netProfit) >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(hasActiveFilters ? filteredIncome - filteredExpenses : netProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Toolbar */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-col gap-3">
            {/* Search and Date Range */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yy") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    {dateTo ? format(dateTo, "dd/MM/yy") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}
            </div>

            {/* Type filter and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary">{transactions.length} records</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddNew("expense")}>
                  <ArrowDownRight className="w-4 h-4 mr-1" /> Expense
                </Button>
                <Button size="sm" onClick={() => handleAddNew("income")}>
                  <ArrowUpRight className="w-4 h-4 mr-1" /> Income
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spreadsheet Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted" onClick={() => toggleSort("date")}>
                    Date {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted text-right" onClick={() => toggleSort("amount")}>
                    Amount {sortField === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Category / Method</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-20 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {hasActiveFilters ? "No transactions match your filters." : "No transactions yet. Add your first expense or income."}
                    </TableCell>
                  </TableRow>
                )}
                {transactions.map((t) => (
                  <TableRow key={`${t.type}-${t.id}`} className="hover:bg-muted/30">
                    <TableCell>
                      <Badge variant={t.type === "income" ? "default" : "destructive"} className="text-xs">
                        {t.type === "income" ? (
                          <><ArrowUpRight className="w-3 h-3 mr-1" /> In</>
                        ) : (
                          <><ArrowDownRight className="w-3 h-3 mr-1" /> Out</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <EditableCell
                        transaction={t}
                        field="date"
                        value={t.date}
                        displayValue={t.date}
                      />
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                      <EditableCell
                        transaction={t}
                        field="amount"
                        value={t.amount.toString()}
                        displayValue={<>{t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}</>}
                      />
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {t.type === "expense" ? t.category?.replace("_", " ") : t.paymentMethod}
                    </TableCell>
                    <TableCell className="text-sm">{t.tripNumber || "-"}</TableCell>
                    <TableCell className="text-sm">{t.vehicleNumber || "-"}</TableCell>
                    <TableCell className="text-sm">{t.driverName || "-"}</TableCell>
                    <TableCell className="text-sm">{t.clientName || "-"}</TableCell>
                    <TableCell className="text-sm max-w-32">
                      <EditableCell
                        transaction={t}
                        field="description"
                        value={t.description || t.reference || ""}
                        displayValue={<span className="truncate block" title={t.description || ""}>{t.description || t.reference || "-"}</span>}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(t)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        💡 Double-click on Date, Amount, or Description to edit inline
      </p>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit" : "Add"} {transactionType === "expense" ? "Expense" : "Income"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount *</Label>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={editingTransaction?.amount}
                  required
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  name="date"
                  type="date"
                  defaultValue={editingTransaction?.date || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {transactionType === "expense" ? (
              <>
                <div>
                  <Label>Category *</Label>
                  <Select name="category" defaultValue={editingTransaction?.category || ""} required>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {expenseCategoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vehicle</Label>
                    <Select name="vehicle_id" defaultValue={editingTransaction?.vehicleId || ""}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {vehicles?.map((v) => (
                          <SelectItem key={v.id} value={v.id}>{v.vehicle_number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Driver</Label>
                    <Select name="driver_id" defaultValue={editingTransaction?.driverId || ""}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {drivers?.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Payment Method</Label>
                  <Select name="payment_method" defaultValue={editingTransaction?.paymentMethod || "cash"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client</Label>
                    <Select name="client_id" defaultValue={editingTransaction?.clientId || ""}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {clients?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reference #</Label>
                    <Input name="reference" defaultValue={editingTransaction?.reference || ""} />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label>Trip</Label>
              <Select name="trip_id" defaultValue={editingTransaction?.tripId || ""}>
                <SelectTrigger><SelectValue placeholder="Select trip" /></SelectTrigger>
                <SelectContent>
                  {trips?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.trip_number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{transactionType === "expense" ? "Description" : "Notes"}</Label>
              <Input name="description" defaultValue={editingTransaction?.description || ""} />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createExpense.isPending || updateExpense.isPending || createIncome.isPending || updateIncome.isPending}
            >
              {(createExpense.isPending || updateExpense.isPending || createIncome.isPending || updateIncome.isPending)
                ? "Saving..."
                : editingTransaction
                  ? "Save Changes"
                  : `Add ${transactionType === "expense" ? "Expense" : "Income"}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
