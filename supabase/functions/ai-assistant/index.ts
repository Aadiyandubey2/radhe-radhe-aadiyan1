import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    const { action, message, context } = await req.json();

    // Fetch user's data for context
    const [vehicles, drivers, clients, trips, expenses, income] = await Promise.all([
      supabase.from("vehicles").select("*").eq("user_id", user.id),
      supabase.from("drivers").select("*").eq("user_id", user.id),
      supabase.from("clients").select("*").eq("user_id", user.id),
      supabase.from("trips").select("*, vehicles(vehicle_number), drivers(name), clients(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("expenses").select("*").eq("user_id", user.id).order("expense_date", { ascending: false }).limit(50),
      supabase.from("income").select("*").eq("user_id", user.id).order("payment_date", { ascending: false }).limit(50),
    ]);

    const dataContext = {
      vehicles: vehicles.data || [],
      drivers: drivers.data || [],
      clients: clients.data || [],
      recentTrips: trips.data || [],
      recentExpenses: expenses.data || [],
      recentIncome: income.data || [],
    };

    const systemPrompt = `You are FleetPro AI, an intelligent transport management assistant. You help manage a fleet of vehicles, drivers, trips, clients, and finances.

CURRENT DATA CONTEXT:
- Vehicles: ${dataContext.vehicles.length} (${dataContext.vehicles.filter(v => v.status === 'active').length} active)
- Drivers: ${dataContext.drivers.length} (${dataContext.drivers.filter(d => d.is_active).length} active)
- Clients: ${dataContext.clients.length}
- Recent Trips: ${dataContext.recentTrips.length}

Available Vehicles: ${JSON.stringify(dataContext.vehicles.map(v => ({ id: v.id, number: v.vehicle_number, type: v.vehicle_type, status: v.status })))}
Available Drivers: ${JSON.stringify(dataContext.drivers.map(d => ({ id: d.id, name: d.name, phone: d.phone, active: d.is_active })))}
Clients: ${JSON.stringify(dataContext.clients.map(c => ({ id: c.id, name: c.name, company: c.company_name })))}
Recent Trips: ${JSON.stringify(dataContext.recentTrips.slice(0, 10).map(t => ({ id: t.id, number: t.trip_number, status: t.status, pickup: t.pickup_location, drop: t.drop_location, fare: t.fare_amount })))}

CAPABILITIES:
1. TRIP CREATION: Suggest optimal vehicle and driver based on goods type, distance, and availability
2. DATA ANALYSIS: Analyze expenses, income, trip patterns, and provide insights
3. RECOMMENDATIONS: Suggest best vehicle for routes, identify cost savings, predict maintenance needs
4. FORM AUTOFILL: Suggest values for forms based on patterns and history

When user asks to CREATE something, respond with a JSON action like:
{"action": "create_trip", "data": {"pickup_location": "...", "drop_location": "...", "suggested_vehicle_id": "...", "suggested_driver_id": "...", "suggested_fare": 0, "reason": "..."}}
{"action": "create_expense", "data": {"category": "...", "amount": 0, "description": "..."}}

For ANALYSIS, provide clear insights with numbers and actionable recommendations.

Always be helpful, concise, and proactive. If you need more info, ask specific questions.`;

    let userPrompt = message;
    if (action === "suggest_trip") {
      userPrompt = `Based on this trip request, suggest the best vehicle and driver: ${message}
Consider: vehicle availability, driver experience, route optimization.`;
    } else if (action === "analyze") {
      userPrompt = `Analyze this data and provide insights: ${message}
Include: trends, anomalies, cost-saving opportunities, recommendations.`;
    } else if (action === "autofill") {
      userPrompt = `Based on historical data and patterns, suggest values for this form: ${message}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service unavailable");
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content || "I couldn't process your request.";

    console.log("AI Response:", aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: dataContext,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("AI Assistant error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
