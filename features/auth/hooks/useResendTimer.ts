import { useCallback, useEffect, useRef, useState } from "react";
import { RESEND_OTP_SECONDS } from "@constants/config";

/** Countdown used to disable/enable the "Resend code" action on the OTP
 * screen. Call `restart()` right after a code is (re)sent. */
export function useResendTimer(initialSeconds: number = RESEND_OTP_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const restart = useCallback(() => {
    clear();
    setSecondsLeft(initialSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clear, initialSeconds]);

  useEffect(() => {
    restart();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { secondsLeft, canResend: secondsLeft === 0, restart };
}
