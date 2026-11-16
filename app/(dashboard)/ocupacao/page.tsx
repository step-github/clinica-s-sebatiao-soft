import type { Metadata } from "next";
import { OccupancyView } from "@/components/occupancy/occupancy-view";

export const metadata: Metadata = {
  title: "Ocupação · Clínica São Sebastião",
};

export default function OcupacaoPage() {
  return <OccupancyView />;
}
