/**
 * Subtle aurora / mesh-gradient background that drifts slowly behind glass cards.
 * Pointer-events disabled; sits fixed behind app content.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* base wash */}
      <div className="absolute inset-0 bg-background" />
      {/* aurora blobs */}
      <div
        className="absolute -top-1/3 -left-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-40 blur-3xl animate-[float-a_22s_ease-in-out_infinite] dark:opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--primary) 55%, transparent), transparent 65%)",
        }}
      />
      <div
        className="absolute top-1/4 -right-1/4 h-[55vmax] w-[55vmax] rounded-full opacity-35 blur-3xl animate-[float-b_28s_ease-in-out_infinite] dark:opacity-25"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, color-mix(in oklab, var(--info) 60%, transparent), transparent 65%)",
        }}
      />
      <div
        className="absolute -bottom-1/4 left-1/4 h-[50vmax] w-[50vmax] rounded-full opacity-30 blur-3xl animate-[float-c_34s_ease-in-out_infinite] dark:opacity-25"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--accent-foreground) 45%, transparent), transparent 65%)",
        }}
      />
      {/* fine grain to kill banding */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}
