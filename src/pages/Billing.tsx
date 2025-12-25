import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrips } from "@/hooks/useTrips";
import { useClients } from "@/hooks/useClients";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncome } from "@/hooks/useIncome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Download, Search, Filter, Receipt, User, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ClientBill {
  clientId: string;
  clientName: string;
  companyName?: string;
  gstNumber?: string;
  address?: string;
  trips: any[];
  totalFare: number;
  totalPaid: number;
  totalExpenses: number;
  balance: number;
}

export default function Billing() {
  const { data: trips } = useTrips();
  const { data: clients } = useClients();
  const { data: expenses } = useExpenses();
  const { data: income } = useIncome();
  
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewBill, setViewBill] = useState<ClientBill | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

  // Calculate client-wise bills
  const clientBills: ClientBill[] = (clients || []).map((client) => {
    const clientTrips = (trips || []).filter((t) => t.client_id === client.id);
    const clientIncome = (income || []).filter((i) => i.client_id === client.id);
    const clientExpenses = (expenses || []).filter((e) => 
      clientTrips.some((t) => t.id === e.trip_id)
    );

    const totalFare = clientTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0);
    const totalPaid = clientIncome.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = clientExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      clientId: client.id,
      clientName: client.name,
      companyName: client.company_name,
      gstNumber: client.gst_number,
      address: client.address,
      trips: clientTrips,
      totalFare,
      totalPaid,
      totalExpenses,
      balance: totalFare - totalPaid,
    };
  }).filter((b) => b.trips.length > 0);

  // Filter bills
  let filteredBills = clientBills;
  if (selectedClient) {
    filteredBills = filteredBills.filter((b) => b.clientId === selectedClient);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredBills = filteredBills.filter((b) =>
      b.clientName.toLowerCase().includes(q) ||
      b.companyName?.toLowerCase().includes(q)
    );
  }

  const generateBillHTML = (bill: ClientBill) => {
    const today = format(new Date(), "dd/MM/yyyy");
    const billNo = `BILL-${Date.now().toString(36).toUpperCase()}`;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bill - ${bill.clientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .header h1 { color: #2563eb; font-size: 28px; }
    .header p { color: #666; margin-top: 5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .info-box { flex: 1; }
    .info-box h3 { font-size: 14px; color: #666; margin-bottom: 5px; }
    .info-box p { font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    .text-right { text-align: right; }
    .total-row { background: #f9fafb; font-weight: 600; }
    .summary { margin-top: 30px; border-top: 2px solid #333; padding-top: 20px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .summary-row.total { font-size: 18px; font-weight: 700; color: #2563eb; border-bottom: none; margin-top: 10px; }
    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>FleetPro Transport</h1>
    <p>Transport & Logistics Management</p>
  </div>
  
  <div class="info-row">
    <div class="info-box">
      <h3>बिल प्राप्तकर्ता / Bill To:</h3>
      <p><strong>${bill.clientName}</strong></p>
      ${bill.companyName ? `<p>${bill.companyName}</p>` : ""}
      ${bill.gstNumber ? `<p>GST: ${bill.gstNumber}</p>` : ""}
      ${bill.address ? `<p>${bill.address}</p>` : ""}
    </div>
    <div class="info-box" style="text-align: right;">
      <h3>बिल विवरण / Bill Details:</h3>
      <p><strong>Bill No:</strong> ${billNo}</p>
      <p><strong>Date:</strong> ${today}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Trip No / यात्रा</th>
        <th>From / से</th>
        <th>To / तक</th>
        <th>Date / दिनांक</th>
        <th class="text-right">Amount / राशि</th>
      </tr>
    </thead>
    <tbody>
      ${bill.trips.map((t) => `
        <tr>
          <td>${t.trip_number}</td>
          <td>${t.pickup_location}</td>
          <td>${t.drop_location}</td>
          <td>${t.start_date ? format(new Date(t.start_date), "dd/MM/yyyy") : "-"}</td>
          <td class="text-right">₹${(t.fare_amount || 0).toLocaleString("en-IN")}</td>
        </tr>
      `).join("")}
      <tr class="total-row">
        <td colspan="4"><strong>कुल राशि / Total Amount</strong></td>
        <td class="text-right"><strong>₹${bill.totalFare.toLocaleString("en-IN")}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row">
      <span>कुल किराया / Total Fare:</span>
      <span>₹${bill.totalFare.toLocaleString("en-IN")}</span>
    </div>
    <div class="summary-row">
      <span>भुगतान प्राप्त / Amount Paid:</span>
      <span>₹${bill.totalPaid.toLocaleString("en-IN")}</span>
    </div>
    <div class="summary-row total">
      <span>शेष राशि / Balance Due:</span>
      <span>₹${bill.balance.toLocaleString("en-IN")}</span>
    </div>
  </div>

  <div class="footer">
    <p>यह एक कंप्यूटर जनित बिल है / This is a computer generated bill</p>
    <p>Generated by FleetPro Transport Management System</p>
  </div>
</body>
</html>`;
  };

  const printBill = (bill: ClientBill) => {
    setGenerating(bill.clientId);
    const html = generateBillHTML(bill);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        setGenerating(null);
      }, 500);
    } else {
      toast.error("Please allow popups to print bills");
      setGenerating(null);
    }
  };

  const downloadBill = (bill: ClientBill) => {
    const html = generateBillHTML(bill);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bill_${bill.clientName.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Bill downloaded successfully");
  };

  // Summary stats
  const totalBilled = clientBills.reduce((s, b) => s + b.totalFare, 0);
  const totalReceived = clientBills.reduce((s, b) => s + b.totalPaid, 0);
  const totalPending = clientBills.reduce((s, b) => s + b.balance, 0);

  return (
    <AppLayout title="Billing" subtitle="Client bills and invoices / ग्राहक बिल">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Billed / कुल बिल</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalBilled)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <IndianRupee className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Received / प्राप्त</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totalReceived)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending / बकाया</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients / ग्राहक खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedClient} onValueChange={(v) => setSelectedClient(v === "all" ? "" : v)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Client Bills / ग्राहक बिल
            <Badge variant="secondary" className="ml-2">{filteredBills.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Client / ग्राहक</TableHead>
                  <TableHead className="text-center">Trips / यात्राएं</TableHead>
                  <TableHead className="text-right">Total / कुल</TableHead>
                  <TableHead className="text-right">Paid / भुगतान</TableHead>
                  <TableHead className="text-right">Balance / बकाया</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No bills found. Create trips with clients to generate bills.
                    </TableCell>
                  </TableRow>
                )}
                {filteredBills.map((bill) => (
                  <TableRow key={bill.clientId} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{bill.clientName}</p>
                          {bill.companyName && (
                            <p className="text-xs text-muted-foreground">{bill.companyName}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{bill.trips.length}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(bill.totalFare)}
                    </TableCell>
                    <TableCell className="text-right text-success">
                      {formatCurrency(bill.totalPaid)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={bill.balance > 0 ? "text-warning font-semibold" : "text-success"}>
                        {formatCurrency(bill.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewBill(bill)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printBill(bill)}
                          disabled={generating === bill.clientId}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => downloadBill(bill)}
                        >
                          <Download className="w-4 h-4" />
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

      {/* Bill Preview Dialog */}
      <Dialog open={!!viewBill} onOpenChange={() => setViewBill(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Preview - {viewBill?.clientName}</DialogTitle>
          </DialogHeader>
          {viewBill && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Client / ग्राहक</p>
                  <p className="font-medium">{viewBill.clientName}</p>
                  {viewBill.companyName && <p className="text-sm">{viewBill.companyName}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Balance Due / बकाया</p>
                  <p className={`text-2xl font-bold ${viewBill.balance > 0 ? "text-warning" : "text-success"}`}>
                    {formatCurrency(viewBill.balance)}
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewBill.trips.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono">{t.trip_number}</TableCell>
                      <TableCell className="text-sm">
                        {t.pickup_location} → {t.drop_location}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(t.fare_amount || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between">
                  <span>Total Fare / कुल किराया:</span>
                  <span className="font-medium">{formatCurrency(viewBill.totalFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid / भुगतान:</span>
                  <span className="text-success">{formatCurrency(viewBill.totalPaid)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-semibold">Balance Due / बकाया:</span>
                  <span className={`font-bold text-lg ${viewBill.balance > 0 ? "text-warning" : "text-success"}`}>
                    {formatCurrency(viewBill.balance)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => printBill(viewBill)}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
                <Button onClick={() => downloadBill(viewBill)}>
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
