import type { Metadata } from "next";
import { ReportView } from "@/components/report/report-view";

export const metadata: Metadata = {
  title: "Relatório de atividade · Clínica São Sebastião",
};

export default function RelatorioAtividadePage() {
  return <ReportView />;
}
