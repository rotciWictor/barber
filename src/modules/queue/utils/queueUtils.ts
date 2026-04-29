export function getEstimatedWait(position: number, avgTime: number): string {
  const minutes = position * avgTime;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
}

export function getWhatsAppLink(phone: string): string {
  return `https://wa.me/${phone}`;
}

export function formatJoinedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
