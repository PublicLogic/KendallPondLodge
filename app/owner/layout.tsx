import type { ReactNode } from "react";
import { OwnerShell } from "./_components/OwnerShell";
import "./owner.css";
export const metadata = { robots: { index: false, follow: false } };
export default function OwnerLayout({children}:{children:ReactNode}) {
  return <OwnerShell>{children}</OwnerShell>;
}
