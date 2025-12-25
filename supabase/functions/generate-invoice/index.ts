import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  tripId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { tripId }: InvoiceRequest = await req.json();

    // Fetch trip with related data
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select(`
        *,
        vehicles(vehicle_number, vehicle_type, make, model),
        drivers(name, phone),
        clients(name, company_name, phone, email, gst_number, billing_address)
      `)
      .eq("id", tripId)
      .eq("user_id", user.id)
      .single();

    if (tripError || !trip) {
      throw new Error("Trip not found");
    }

    // Fetch company profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Generate HTML invoice
    const invoiceHtml = generateInvoiceHtml(trip, profile);

    console.log("Invoice generated for trip:", tripId);

    return new Response(JSON.stringify({ html: invoiceHtml, trip }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateInvoiceHtml(trip: any, profile: any): string {
  const invoiceDate = new Date().toLocaleDateString("en-IN");
  const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN");
  const balanceDue = (trip.fare_amount || 0) - (trip.advance_amount || 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${trip.trip_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
    .company-info h1 { font-size: 28px; color: #2563eb; margin-bottom: 5px; }
    .company-info p { font-size: 12px; color: #666; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 36px; color: #2563eb; letter-spacing: 2px; }
    .invoice-title p { font-size: 14px; color: #666; margin-top: 5px; }
    .meta-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .meta-box { background: #f8fafc; padding: 20px; border-radius: 8px; width: 48%; }
    .meta-box h3 { font-size: 12px; text-transform: uppercase; color: #2563eb; margin-bottom: 10px; letter-spacing: 1px; }
    .meta-box p { font-size: 14px; margin-bottom: 5px; }
    .meta-box strong { color: #1e293b; }
    .trip-details { margin-bottom: 30px; }
    .trip-details h3 { font-size: 16px; color: #2563eb; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .detail-item { background: #f8fafc; padding: 12px; border-radius: 6px; }
    .detail-item label { font-size: 11px; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px; }
    .detail-item span { font-size: 14px; font-weight: 600; color: #1e293b; }
    .pricing-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .pricing-table th, .pricing-table td { padding: 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .pricing-table th { background: #2563eb; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .pricing-table td { font-size: 14px; }
    .pricing-table .amount { text-align: right; font-weight: 600; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .totals-row.total { font-size: 18px; font-weight: 700; color: #2563eb; border-bottom: none; background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-partial { background: #dbeafe; color: #1e40af; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="company-info">
        <h1>${profile?.company_name || "Transport Company"}</h1>
        <p>${profile?.address || ""}</p>
        <p>Phone: ${profile?.phone || "N/A"} | Email: ${profile?.email || "N/A"}</p>
        ${profile?.gst_number ? `<p>GST: ${profile.gst_number}</p>` : ""}
      </div>
      <div class="invoice-title">
        <h2>INVOICE</h2>
        <p><strong>${trip.trip_number}</strong></p>
        <p>Date: ${invoiceDate}</p>
        <p>Due: ${dueDate}</p>
      </div>
    </div>

    <div class="meta-section">
      <div class="meta-box">
        <h3>Bill To</h3>
        <p><strong>${trip.clients?.name || "Walk-in Customer"}</strong></p>
        ${trip.clients?.company_name ? `<p>${trip.clients.company_name}</p>` : ""}
        ${trip.clients?.billing_address ? `<p>${trip.clients.billing_address}</p>` : ""}
        ${trip.clients?.phone ? `<p>Phone: ${trip.clients.phone}</p>` : ""}
        ${trip.clients?.gst_number ? `<p>GST: ${trip.clients.gst_number}</p>` : ""}
      </div>
      <div class="meta-box">
        <h3>Trip Info</h3>
        <p><strong>Vehicle:</strong> ${trip.vehicles?.vehicle_number || "N/A"}</p>
        <p><strong>Driver:</strong> ${trip.drivers?.name || "N/A"}</p>
        <p><strong>Start:</strong> ${trip.start_date ? new Date(trip.start_date).toLocaleDateString("en-IN") : "N/A"}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${trip.payment_status}">${trip.payment_status}</span></p>
      </div>
    </div>

    <div class="trip-details">
      <h3>Trip Details</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <label>Pickup Location</label>
          <span>${trip.pickup_location}</span>
        </div>
        <div class="detail-item">
          <label>Drop Location</label>
          <span>${trip.drop_location}</span>
        </div>
        <div class="detail-item">
          <label>Goods Type</label>
          <span>${trip.goods_type || "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>Weight</label>
          <span>${trip.weight || "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>Distance</label>
          <span>${trip.distance_km ? `${trip.distance_km} km` : "N/A"}</span>
        </div>
        <div class="detail-item">
          <label>Vehicle Type</label>
          <span>${trip.vehicles?.vehicle_type || "N/A"}</span>
        </div>
      </div>
    </div>

    <table class="pricing-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Transportation Charges (${trip.pickup_location} → ${trip.drop_location})</td>
          <td class="amount">₹${(trip.fare_amount || 0).toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>₹${(trip.fare_amount || 0).toLocaleString("en-IN")}</span>
      </div>
      <div class="totals-row">
        <span>Advance Paid</span>
        <span>- ₹${(trip.advance_amount || 0).toLocaleString("en-IN")}</span>
      </div>
      <div class="totals-row total">
        <span>Balance Due</span>
        <span>₹${balanceDue.toLocaleString("en-IN")}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>${trip.notes ? `Note: ${trip.notes}` : ""}</p>
    </div>
  </div>
</body>
</html>
  `;
}
