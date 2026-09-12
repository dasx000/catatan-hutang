"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useLinkStatus } from "next/link";

function subscribe() {
  return () => {};
}
function getSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

/**
 * Dipasang sebagai child dari <Link>. Base-nya (position/DOM) ada di <body>
 * lewat portal, jadi tampil sebagai bar tipis di atas layar, bukan di
 * dalam link itu sendiri — meski status pending-nya tetap diambil dari
 * konteks <Link> terdekat (syarat useLinkStatus).
 *
 * Portal ke document.body cuma dibuat setelah mount. Pakai
 * useSyncExternalStore (bukan useEffect+setState) supaya render pertama di
 * client sama persis dengan hasil SSR (false/null) tanpa memicu hydration
 * mismatch maupun cascading render.
 */
export function NavProgress() {
  const { pending } = useLinkStatus();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 overflow-hidden"
    >
      {pending && (
        <div className="h-full w-1/3 animate-[nav-progress-slide_0.9s_ease-in-out_infinite] rounded-full bg-white shadow-clay-sm" />
      )}
    </div>,
    document.body
  );
}
