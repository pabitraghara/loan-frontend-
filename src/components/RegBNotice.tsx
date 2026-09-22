/**
 * Regulation B notice. Must render immediately above the income section,
 * before any income field.
 */
export function RegBNotice({ text }: { text: string }) {
  return (
    <p
      role="note"
      className="rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
    >
      {text}
    </p>
  );
}
