import type { ReactNode } from 'react';

export function CalendarSyncControl({
  action,
  children,
}: {
  action: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <form action={action}>
      <button className="button button-secondary" type="submit">
        {children}
      </button>
    </form>
  );
}
