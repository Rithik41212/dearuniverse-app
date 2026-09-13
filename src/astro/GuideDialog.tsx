import { useEffect, useRef, type ReactNode } from "react";

export default function GuideDialog({ open, onDismiss, titleId, children, className = "" }: {
  open: boolean; onDismiss: () => void; titleId: string; children: ReactNode; className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
  }, [open]);
  return <dialog ref={dialog} className={`guide-dialog ${className}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onDismiss(); }}>
    {children}
  </dialog>;
}
