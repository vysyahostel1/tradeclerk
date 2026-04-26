"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function SubscriptionPlans() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      price: 0,
      desc: "Basic access",
      features: ["5 reports/month", "Basic search", "Community access"],
    },
    {
      name: "Pro Research",
      price: billing === "monthly" ? 29 : 24,
      desc: "For serious investors",
      features: [
        "Unlimited reports",
        "Advanced analytics",
        "Priority support",
        "PDF downloads",
        "Early access",
      ],
      popular: true,
    },
    {
      name: "Analyst Premium",
      price: billing === "monthly" ? 99 : 79,
      desc: "For professionals",
      features: [
        "Everything in Pro",
        "Publish reports",
        "Revenue sharing",
        "Subscriber management",
        "Dedicated support",
      ],
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex justify-center">
          <Tabs value={billing} onValueChange={(v) => setBilling(v as "monthly" | "yearly")}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-4 ${
                (plan as any).popular
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-border"
              }`}
            >
              <h3 className="text-sm font-semibold">{plan.name}</h3>
              <p className="text-2xl font-bold">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground">✓ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
