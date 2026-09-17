
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { ArrowLeft } from 'lucide-react';

interface OtpVerificationProps {
  userId: string;
  expiresAt: string;
  title: string;
  description: string;
  isLoading: boolean;
  isResending: boolean;
  error: string | null;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

function getRemainingSeconds(
  expiresAt: string,
): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(expiresAt).getTime() -
        Date.now()) /
        1000,
    ),
  );
}

function OtpVerification({
  userId,
  expiresAt,
  title,
  description,
  isLoading,
  isResending,
  error,
  onVerify,
  onResend,
  onBack,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState('');

  const [remainingSeconds, setRemainingSeconds] =
    useState(
      getRemainingSeconds(expiresAt),
    );

  useEffect(() => {
    setRemainingSeconds(
      getRemainingSeconds(expiresAt),
    );

    const intervalId = window.setInterval(() => {
      setRemainingSeconds(
        getRemainingSeconds(expiresAt),
      );
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [expiresAt]);

  function handleOtpChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value =
      event.target.value.replace(/\D/g, '');

    if (value.length <= 6) {
      setOtp(value);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (otp.length !== 6) {
      return;
    }

    await onVerify(otp);
  }

  async function handleResend() {
    setOtp('');
    await onResend();
  }

  const isExpired =
    remainingSeconds === 0;

  const isBusy =
    isLoading || isResending;

  const minutes = Math.floor(
    remainingSeconds / 60,
  );

  const seconds =
    remainingSeconds % 60;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onBack}
        disabled={isBusy}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor={`otp-${userId}`}
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Enter OTP
          </label>

          <input
            id={`otp-${userId}`}
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit OTP"
            disabled={isBusy}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={
            otp.length !== 6 ||
            isBusy
          }
          className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? 'Verifying OTP...'
            : 'Verify OTP'}
        </button>

        <div className="text-center">
          {!isExpired ? (
            <p className="text-sm text-gray-500">
              OTP expires in{' '}
              <span className="font-medium text-gray-900">
                {minutes}:
                {seconds
                  .toString()
                  .padStart(2, '0')}
              </span>
            </p>
          ) : (
            <p className="mb-2 text-sm text-red-600">
              OTP has expired.
            </p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={
              !isExpired ||
              isBusy
            }
            className="text-sm font-medium text-gray-900 underline transition hover:text-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
          >
            {isResending
              ? 'Sending OTP...'
              : 'Resend OTP'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OtpVerification;

