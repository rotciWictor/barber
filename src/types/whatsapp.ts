/**
 * Identidade WhatsApp (Híbrida).
 * Hoje usamos `phone` para gerar links wa.me/.
 * O campo `uid` está preparado para a API do WhatsApp Business (futuro).
 */
export interface WhatsAppContact {
  /** Número formatado com DDI, ex: "5511999999999" */
  phone: string;
  /** UID do WhatsApp Business API (uso futuro) */
  uid?: string;
}
