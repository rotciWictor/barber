import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NotifyDialog } from './NotifyDialog';
import type { QueueEntry } from '../../../types/queue';

const mockCalledEntry: QueueEntry = {
  id: '1',
  barbershop_id: 'shop-1',
  customer_name: 'John',
  whatsapp: { phone: '11999999999' },
  status: 'waiting',
  joined_at: new Date().toISOString(),
};

const mockNextEntry: QueueEntry = {
  id: '2',
  barbershop_id: 'shop-1',
  customer_name: 'Maria',
  whatsapp: { phone: '11988888888' },
  status: 'waiting',
  joined_at: new Date().toISOString(),
};

describe('NotifyDialog', () => {
  it('returns null when closed', () => {
    const { container } = render(
      <NotifyDialog isOpen={false} onClose={() => {}} calledEntry={mockCalledEntry} nextEntry={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows only the called entry button if nextEntry is null', () => {
    render(
      <NotifyDialog isOpen={true} onClose={() => {}} calledEntry={mockCalledEntry} nextEntry={null} />
    );
    
    expect(screen.getByText(/Avisar John/i)).toBeInTheDocument();
    expect(screen.queryByText(/Avisar Maria/i)).not.toBeInTheDocument();
  });

  it('shows both buttons if both entries are provided', () => {
    render(
      <NotifyDialog isOpen={true} onClose={() => {}} calledEntry={mockCalledEntry} nextEntry={mockNextEntry} />
    );
    
    expect(screen.getByText(/Avisar John/i)).toBeInTheDocument();
    expect(screen.getByText(/Avisar Maria/i)).toBeInTheDocument();
  });

  it('shows no customers message if both are null', () => {
    render(
      <NotifyDialog isOpen={true} onClose={() => {}} calledEntry={null} nextEntry={null} />
    );
    
    expect(screen.getByText('Nenhum cliente para notificar.')).toBeInTheDocument();
  });
});
