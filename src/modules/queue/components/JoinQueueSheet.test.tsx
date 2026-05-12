import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JoinQueueSheet } from './JoinQueueSheet';
import userEvent from '@testing-library/user-event';
import { useUser } from '@clerk/react';

// Mock do Clerk
vi.mock('@clerk/react', () => ({
  useUser: vi.fn(() => ({
    user: {
      id: 'user-123',
      firstName: 'John',
      fullName: 'John Doe',
    },
  })),
}));

describe('JoinQueueSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(useUser).mockReturnValue({
      user: {
        id: 'user-123',
        firstName: 'John',
        fullName: 'John Doe',
      },
    } as any);
  });

  it('renders correctly when open', () => {
    render(<JoinQueueSheet isOpen={true} onClose={vi.fn()} onJoin={vi.fn()} />);
    expect(screen.getByText('Entrar na Fila')).toBeInTheDocument();
  });

  it('returns null when closed', () => {
    const { container } = render(<JoinQueueSheet isOpen={false} onClose={vi.fn()} onJoin={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('pre-fills name from Clerk user', () => {
    render(<JoinQueueSheet isOpen={true} onClose={vi.fn()} onJoin={vi.fn()} />);
    const nameInput = screen.getByLabelText('Seu nome') as HTMLInputElement;
    expect(nameInput.value).toBe('John Doe');
  });

  it('disables submit button if fields are empty', () => {
    // Override the mock to return no name
    vi.mocked(useUser).mockReturnValueOnce({ user: null } as any);
    
    render(<JoinQueueSheet isOpen={true} onClose={vi.fn()} onJoin={vi.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: /confirmar entrada/i });
    expect(submitButton).toBeDisabled();
  });

  it('calls onJoin and saves to localStorage on submit', async () => {
    const onJoinMock = vi.fn();
    const user = userEvent.setup();
    
    render(<JoinQueueSheet isOpen={true} onClose={vi.fn()} onJoin={onJoinMock} />);
    
    // Name is already pre-filled as "John Doe"
    const phoneInput = screen.getByLabelText('WhatsApp');
    
    await user.type(phoneInput, '11999999999');
    
    const submitButton = screen.getByRole('button', { name: /confirmar entrada/i });
    expect(submitButton).not.toBeDisabled();
    
    await user.click(submitButton);
    
    expect(onJoinMock).toHaveBeenCalledWith('John Doe', '(11) 99999-9999', 'user-123');
    expect(localStorage.getItem('@barber:saved_phone')).toBe('(11) 99999-9999');
  });

  it('shows error message if already in queue', () => {
    render(<JoinQueueSheet isOpen={true} onClose={vi.fn()} onJoin={vi.fn()} error="ALREADY_IN_QUEUE" />);
    expect(screen.getByText('Você já está na fila! Aguarde sua vez.')).toBeInTheDocument();
  });
});
