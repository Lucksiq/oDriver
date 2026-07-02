import { PageHeader } from "@/components/layout/PageHeader";
import { GoalsPanel } from "@/components/goals/GoalsPanel";

export default function GoalsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Metas" subtitle="Acompanhe seu progresso" />
      <GoalsPanel />
    </div>
  );
}
