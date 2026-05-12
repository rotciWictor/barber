export function getEstimatedWait(position: number, avgTime: number): string {
  const minutes = position * avgTime;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
}

export function getWhatsAppLink(phone: string): string {
  return `https://wa.me/55${phone}`;
}

export function formatJoinedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── WhatsApp Notification Deep Links ─────────────────────────

type NotificationType = 'called' | 'next' | 'removed';

const notificationTemplates: Record<NotificationType, (name: string) => string> = {
  called: (name) => `Oi ${name}! 🪒 Sua vez chegou! Pode vir que estamos te esperando. ✂️`,
  next: (name) => `Oi ${name}! Você é o próximo da fila 💈 Fique por perto!`,
  removed: (name) => `Oi ${name}, você foi removido da fila. Qualquer coisa, entre de novo pelo app!`,
};

/**
 * Gera um link wa.me com mensagem pré-preenchida para notificar o cliente.
 * O barbeiro clica → WhatsApp abre → só precisa apertar "Enviar".
 * Mínimo absoluto de toques possível de graça (2: clicar + enviar).
 */
export function getWhatsAppNotifyLink(
  phone: string,
  customerName: string,
  type: NotificationType,
): string {
  const message = notificationTemplates[type](customerName);
  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Formata telefone brasileiro para exibição.
 * Ex: "11999999999" → "(11) 99999-9999"
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
