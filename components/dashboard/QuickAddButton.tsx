"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Car, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function QuickAddButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-24 right-4 z-40 size-14 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-6" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Adicionar</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 p-4 pt-0">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                setOpen(false);
                router.push("/rides/new");
              }}
            >
              <Car className="size-6" />
              Corrida
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => {
                setOpen(false);
                router.push("/finances?add=expense");
              }}
            >
              <Receipt className="size-6" />
              Despesa
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
