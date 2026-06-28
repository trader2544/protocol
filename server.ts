import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export const app = express();
const PORT = 3000;

app.use(express.json());

// API Route - Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

// API Route - Create NOWPayments payment
app.post("/api/nowpayments/create", async (req, res) => {
  try {
    const { amount, pay_currency, email } = req.body;
    if (!amount || !pay_currency || !email) {
      return res.status(400).json({ error: "Missing required fields: amount, pay_currency, email" });
    }

    const apiKey = "AFZWGY8-T7V4SCJ-JSE4FE5-SW4SM3C";
    
    // Determine host origin for IPN callback dynamically
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    const nowpaymentsBody = {
      price_amount: Number(amount),
      price_currency: "usd",
      pay_currency: pay_currency.toLowerCase(),
      ipn_callback_url: `${origin}/api/nowpayments/ipn`,
      order_id: `${email.replace(/[@.]/g, "_")}_${Date.now()}`,
      order_description: `Add funds for ${email}`
    };

    console.log("Creating NOWPayments transaction:", nowpaymentsBody);

    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nowpaymentsBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("NOWPayments API responded with error:", errText);
      return res.status(response.status).json({ error: `NOWPayments error: ${errText}` });
    }

    const data = await response.json();
    console.log("NOWPayments payment created successfully:", data);

    // Write pending payment to Supabase if database is configured
    const isConfigured = supabaseUrl && supabaseUrl !== "https://placeholder-project.supabase.co" && supabaseKey && supabaseKey !== "placeholder-anon-key";
    if (isConfigured) {
      try {
        const { error } = await supabase
          .from("payments")
          .insert({
            user_email: email,
            amount: Number(amount),
            crypto_method: pay_currency.toUpperCase(),
            transaction_hash: data.payment_id?.toString() || "",
            status: "Pending"
          });
        if (error) {
          console.error("Failed to insert pending payment in database:", error);
        } else {
          console.log("Inserted pending payment record in Supabase.");
        }
      } catch (dbErr) {
        console.error("Supabase payment log error:", dbErr);
      }
    }

    return res.json({
      payment_id: data.payment_id,
      payment_status: data.payment_status || "waiting",
      pay_address: data.pay_address,
      pay_amount: data.pay_amount,
      pay_currency: data.pay_currency,
      price_amount: data.price_amount,
      price_currency: data.price_currency,
      created_at: data.created_at
    });
  } catch (err: any) {
    console.error("Error in /api/nowpayments/create:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// API Route - Check and Update NOWPayments Status
app.get("/api/nowpayments/status/:payment_id", async (req, res) => {
  try {
    const { payment_id } = req.params;
    if (!payment_id) {
      return res.status(400).json({ error: "Missing payment_id parameter" });
    }

    const apiKey = "AFZWGY8-T7V4SCJ-JSE4FE5-SW4SM3C";
    console.log(`Checking status for payment: ${payment_id}`);

    const response = await fetch(`https://api.nowpayments.io/v1/payment/${payment_id}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("NOWPayments status request failed:", errText);
      return res.status(response.status).json({ error: `NOWPayments status check failed: ${errText}` });
    }

    const data = await response.json();
    const paymentStatus = data.payment_status; // "waiting", "confirming", "confirmed", "sending", "finished", "failed", "expired"
    const priceAmount = Number(data.price_amount || 0);
    
    let email = "";
    if (data.order_description && data.order_description.startsWith("Add funds for ")) {
      email = data.order_description.replace("Add funds for ", "").trim();
    }

    let credited = false;
    const isConfigured = supabaseUrl && supabaseUrl !== "https://placeholder-project.supabase.co" && supabaseKey && supabaseKey !== "placeholder-anon-key";

    console.log(`NOWPayments status for ${payment_id}: ${paymentStatus}. Email associated: ${email}`);

    // Process if payment is finished / confirmed
    if ((paymentStatus === "finished" || paymentStatus === "confirmed") && email) {
      if (isConfigured) {
        // Check if already approved/credited
        const { data: payRecord } = await supabase
          .from("payments")
          .select("*")
          .eq("transaction_hash", payment_id.toString())
          .maybeSingle();

        if (payRecord && payRecord.status !== "Approved") {
          // Update payment record to Approved
          await supabase
            .from("payments")
            .update({ status: "Approved" })
            .eq("transaction_hash", payment_id.toString());

          // Get profile and credit
          const { data: profile } = await supabase
            .from("profiles")
            .select("balance, crab_rating")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (profile) {
            const currentBalance = Number(profile.balance || 0);
            const currentRating = Number(profile.crab_rating || 5);
            const newBalance = currentBalance + priceAmount;
            const newRating = currentRating + 15;

            await supabase
              .from("profiles")
              .update({
                balance: newBalance,
                crab_rating: newRating,
                account_status: "active"
              })
              .eq("email", email.toLowerCase());

            credited = true;
            console.log(`Credited user ${email} with $${priceAmount} via Supabase DB update.`);
          }
        } else if (payRecord && payRecord.status === "Approved") {
          credited = true;
        } else if (!payRecord) {
          // Insert missing record as approved
          await supabase
            .from("payments")
            .insert({
              user_email: email,
              amount: priceAmount,
              crypto_method: (data.pay_currency || "BTC").toUpperCase(),
              transaction_hash: payment_id.toString(),
              status: "Approved"
            });

          const { data: profile } = await supabase
            .from("profiles")
            .select("balance, crab_rating")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (profile) {
            const newBalance = Number(profile.balance || 0) + priceAmount;
            const newRating = Number(profile.crab_rating || 5) + 15;
            await supabase
              .from("profiles")
              .update({
                balance: newBalance,
                crab_rating: newRating,
                account_status: "active"
              })
              .eq("email", email.toLowerCase());

            credited = true;
            console.log(`Created & credited user ${email} with $${priceAmount} (missing record).`);
          }
        }
      } else {
        // No Supabase, trust client local storage fallback
        credited = true;
      }
    }

    return res.json({
      payment_id: data.payment_id,
      payment_status: paymentStatus,
      pay_address: data.pay_address,
      pay_amount: data.pay_amount,
      pay_currency: data.pay_currency,
      price_amount: priceAmount,
      price_currency: data.price_currency,
      credited,
      email
    });
  } catch (err: any) {
    console.error("Error in /api/nowpayments/status:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// API Route - NOWPayments IPN Callback Webhook
app.post("/api/nowpayments/ipn", async (req, res) => {
  try {
    console.log("Received NOWPayments IPN request payload:", req.body);
    const { payment_id, payment_status, price_amount, pay_currency } = req.body;

    if (!payment_id) {
      return res.status(400).send("Missing payment_id");
    }

    // To guarantee safety from malicious calls, verify the details directly with NOWPayments API
    const apiKey = "AFZWGY8-T7V4SCJ-JSE4FE5-SW4SM3C";
    const verifyResponse = await fetch(`https://api.nowpayments.io/v1/payment/${payment_id}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey
      }
    });

    if (!verifyResponse.ok) {
      console.error(`[IPN] Verification fetch failed for ${payment_id}: ${verifyResponse.statusText}`);
      return res.status(400).send("Verification failed");
    }

    const verifiedData = await verifyResponse.json();
    const verifiedStatus = verifiedData.payment_status;
    const verifiedPrice = Number(verifiedData.price_amount || 0);

    let email = "";
    if (verifiedData.order_description && verifiedData.order_description.startsWith("Add funds for ")) {
      email = verifiedData.order_description.replace("Add funds for ", "").trim();
    }

    console.log(`[IPN Webhook] Verified payment ${payment_id} status: ${verifiedStatus}. User: ${email}`);

    if ((verifiedStatus === "finished" || verifiedStatus === "confirmed") && email) {
      const isConfigured = supabaseUrl && supabaseUrl !== "https://placeholder-project.supabase.co" && supabaseKey && supabaseKey !== "placeholder-anon-key";
      
      if (isConfigured) {
        const { data: payRecord } = await supabase
          .from("payments")
          .select("*")
          .eq("transaction_hash", payment_id.toString())
          .maybeSingle();

        if (payRecord && payRecord.status !== "Approved") {
          await supabase
            .from("payments")
            .update({ status: "Approved" })
            .eq("transaction_hash", payment_id.toString());

          const { data: profile } = await supabase
            .from("profiles")
            .select("balance, crab_rating")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (profile) {
            const currentBalance = Number(profile.balance || 0);
            const currentRating = Number(profile.crab_rating || 5);
            const newBalance = currentBalance + verifiedPrice;
            const newRating = currentRating + 15;

            await supabase
              .from("profiles")
              .update({
                balance: newBalance,
                crab_rating: newRating,
                account_status: "active"
              })
              .eq("email", email.toLowerCase());

            console.log(`[IPN Webhook] DB Credited user ${email} with $${verifiedPrice}`);
          }
        } else if (!payRecord) {
          await supabase
            .from("payments")
            .insert({
              user_email: email,
              amount: verifiedPrice,
              crypto_method: (verifiedData.pay_currency || "BTC").toUpperCase(),
              transaction_hash: payment_id.toString(),
              status: "Approved"
            });

          const { data: profile } = await supabase
            .from("profiles")
            .select("balance, crab_rating")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (profile) {
            const newBalance = Number(profile.balance || 0) + verifiedPrice;
            const newRating = Number(profile.crab_rating || 5) + 15;
            await supabase
              .from("profiles")
              .update({
                balance: newBalance,
                crab_rating: newRating,
                account_status: "active"
              })
              .eq("email", email.toLowerCase());

            console.log(`[IPN Webhook] DB Created & credited user ${email} with $${verifiedPrice}`);
          }
        }
      } else {
        console.log(`[IPN Webhook] User balance verified for ${email} of $${verifiedPrice}, but database is not configured.`);
      }
    }

    return res.status(200).send("OK");
  } catch (err: any) {
    console.error("IPN handle error:", err);
    return res.status(500).send("Internal server error");
  }
});

// Startup logic
async function startServer() {
  // Serve Vite in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only start listening if NOT in a serverless environment like Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is booted up on port ${PORT}`);
    });
  }
}

startServer();
