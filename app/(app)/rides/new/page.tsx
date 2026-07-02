import { PageHeader } from "@/components/layout/PageHeader";
import { RideForm } from "@/components/rides/RideForm";

export default function NewRidePage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Nova corrida" subtitle="Registre em poucos toques" />
      <RideForm />
    </div>
  );
}
