"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RideForm } from "@/components/rides/RideForm";
import { BatchRideForm } from "@/components/rides/BatchRideForm";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function NewRidePage() {
  const [mode, setMode] = useState<"single" | "batch">("single");

  return (
    <div className="space-y-4">
      <PageHeader title="Nova corrida" subtitle="Registre em poucos toques" />

      <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "batch")}>
        <TabsList className="w-full">
          <TabsTrigger value="single" className="flex-1">
            Avulsa
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex-1">
            Agrupada
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "single" ? <RideForm /> : <BatchRideForm />}
    </div>
  );
}
