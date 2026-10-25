import type { ReactNode } from "react";
import { OwnerShell } from "./_components/OwnerShell";
import "./owner.css";
export default function OwnerLayout({children}:{children:ReactNode}) {
  return <OwnerShell>{children}</OwnerShell>;
}
