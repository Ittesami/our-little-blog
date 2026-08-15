import { format } from "date-fns";

interface MessageData {
  text: string;
  date: string;
}

export default function MessageOfDay({ message }: { message: MessageData | null }) {
  if (!message) return null;

  return (
    <div className="mb-10 rounded-3xl border border-border bg-surface p-6 shadow-sm">
      <p className="font-heading text-2xl text-pink-dark">A little note for today ♡</p>
      <p className="mt-2 whitespace-pre-wrap text-lg leading-relaxed">{message.text}</p>
      <p className="mt-3 text-xs text-muted">{format(new Date(message.date), "EEEE, MMMM d, yyyy")}</p>
    </div>
  );
}
