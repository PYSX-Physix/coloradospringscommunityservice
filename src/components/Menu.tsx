import React from 'react';
import { createPortal } from 'react-dom';

interface MenuPortalProps {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: 'left' | 'right';
  width?: number | string;
  gap?: number;
}

/**
 * Renders dropdown/popover content in a portal attached to document.body,
 * positioned relative to the trigger element. Avoids clipping caused by
 * `overflow: hidden` / `overflow-y: auto` ancestors, and keeps the menu
 * within the viewport (flips above the trigger or clamps horizontally
 * when there isn't enough room).
 */
export function MenuPortal({ open, onClose, triggerRef, children, align = 'right', width = 192, gap = 4 }: MenuPortalProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; visible: boolean }>({ top: 0, left: 0, visible: false });

  const reposition = React.useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const margin = 8;

    let left = align === 'right' ? rect.right - menuRect.width : rect.left;
    left = Math.min(Math.max(left, margin), viewportW - menuRect.width - margin);

    let top = rect.bottom + gap;
    if (top + menuRect.height > viewportH - margin) {
      const above = rect.top - menuRect.height - gap;
      top = above >= margin ? above : Math.max(margin, viewportH - menuRect.height - margin);
    }

    setPos({ top, left, visible: true });
  }, [align, gap, triggerRef]);

  React.useLayoutEffect(() => {
    if (!open) { setPos(p => ({ ...p, visible: false })); return; }
    reposition();
  }, [open, reposition]);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    };
    const handleReposition = () => reposition();
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open, onClose, reposition, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width,
        zIndex: 1000,
        visibility: pos.visible ? 'visible' : 'hidden',
      }}
      className="bg-neutral-800 border border-neutral-400 rounded-xl shadow-2xl overflow-hidden"
    >
      {children}
    </div>,
    document.body
  );
}

interface MenuItemButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
  danger?: boolean;
}

export function MenuItemButton({ icon: Icon, danger, className = '', children, ...rest }: MenuItemButtonProps) {
  return (
    <button
      {...rest}
      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-gray-700 ${danger ? 'text-red-400' : 'text-gray-300'} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}

interface MenuItemLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ElementType;
  danger?: boolean;
}

export function MenuItemLink({ icon: Icon, danger, className = '', children, ...rest }: MenuItemLinkProps) {
  return (
    <a
      {...rest}
      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-gray-700 ${danger ? 'text-red-400' : 'text-gray-300'} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </a>
  );
}

export function MenuDivider() {
  return <div className="border-t border-neutral-700" />;
}