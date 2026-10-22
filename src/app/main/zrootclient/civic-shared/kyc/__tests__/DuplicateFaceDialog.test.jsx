import { render, screen, fireEvent } from '@testing-library/react';
import DuplicateFaceDialog, {
  DUPLICATE_FACE_BODY,
  DUPLICATE_FACE_TITLE,
  isDuplicateFaceError,
} from '../DuplicateFaceDialog';

describe('isDuplicateFaceError', () => {
  it('is true only for the 409 auth-service returns when a face already belongs to another account', () => {
    expect(isDuplicateFaceError({ response: { status: 409 } })).toBe(true);
  });

  it('is false for other failures (network, 400, 403, 500) and for missing/odd errors', () => {
    expect(isDuplicateFaceError({ response: { status: 400 } })).toBe(false);
    expect(isDuplicateFaceError({ response: { status: 403 } })).toBe(false);
    expect(isDuplicateFaceError({ response: { status: 500 } })).toBe(false);
    expect(isDuplicateFaceError(new Error('Network Error'))).toBe(false);
    expect(isDuplicateFaceError(undefined)).toBe(false);
    expect(isDuplicateFaceError(null)).toBe(false);
  });
});

describe('DuplicateFaceDialog', () => {
  it('shows the title and explanation when open, without naming any account', () => {
    render(<DuplicateFaceDialog open onClose={jest.fn()} />);
    expect(screen.getByText(DUPLICATE_FACE_TITLE)).toBeInTheDocument();
    expect(screen.getByText(DUPLICATE_FACE_BODY)).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(<DuplicateFaceDialog open={false} onClose={jest.fn()} />);
    expect(screen.queryByText(DUPLICATE_FACE_TITLE)).not.toBeInTheDocument();
  });

  it('calls onClose when the user taps "Got it"', () => {
    const onClose = jest.fn();
    render(<DuplicateFaceDialog open onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
