import type { ReactNode } from "react";
import { GuidebookShell } from "../_components/GuidebookShell";

export default function GuidebookDashboardLayout({ children }: { children: ReactNode }) {
  return <GuidebookShell>{children}</GuidebookShell>;
}
