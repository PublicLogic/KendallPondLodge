import type { ReactNode } from "react";
import { lockGuidebook } from "@/app/guidebook/access/actions";
import { Icon } from "@/app/_components/Icons";
import { GuidebookNav } from "./GuidebookNav";
import { GuidebookTopbar } from "./GuidebookTopbar";

export function GuidebookShell({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="guide-dashboard guide-shell-app">
      <div className="guide-dashboard-shell guide-shell-frame">
        <GuidebookTopbar />
        <div className="guide-shell-body">
          <GuidebookNav />
          <section className="guide-shell-content">
            <div className="guide-shell-content-inner">
              <div className="guide-shell-content-actions">
                <form action={lockGuidebook}>
                  <button className="guide-dashboard-close-button" type="submit" aria-label="Close Guidebook session">
                    <Icon name="shield" size={16} />
                    <span>Close session</span>
                  </button>
                </form>
              </div>
              <div className="guide-shell-mobile-actions">
                <form action={lockGuidebook}>
                  <button className="guide-dashboard-close-button" type="submit" aria-label="Close Guidebook session">
                    <Icon name="shield" size={16} />
                    <span>Close session</span>
                  </button>
                </form>
              </div>
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
