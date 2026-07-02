"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { RideList } from "@/components/rides/RideList";

export default function RidesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Corridas"
        subtitle="Histórico e filtros"
        action={
          <Button render={<Link href="/rides/new" />} nativeButton={false} size="sm">
            <Plus className="size-4" />
            Nova
          </Button>
        }
      />
      <RideList />
    </div>
  );
}
