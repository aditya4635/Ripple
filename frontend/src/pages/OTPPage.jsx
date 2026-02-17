import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import AuthImagePattern from "../components/shared/AuthImagePattern";
import { Loader2, Mail, MessageSquare, RefreshCw } from "lucide-react";
import MouseFollowerLight from "../components/shared/MouseFollowerLight";
import AuthErrorAlert from "../components/shared/AuthErrorAlert";

const OTPPage = () => {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyEmail, resendOTP, isVerifying, authError, clearAuthError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    clearAuthError();
    if (!email) {
      navigate("/signup");
    }
  }, [clearAuthError, email, navigate]);

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      const success = await verifyEmail({ email, otp });
      if (success) navigate("/");
    }
  };

  const handleResendOTP = async () => {
    const success = await resendOTP(email);
    if (success) {
      setCountdown(60);
      setCanResend(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <MouseFollowerLight />
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2 tracking-tight">Verify Your Email</h1>
              <p className="text-base-content/60">Enter the 6-digit code sent to your email</p>
            </div>
          </div>

          {authError && <AuthErrorAlert message={authError} />}

          <div className="bg-base-200/50 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-base-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    OTP Code
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-center text-2xl tracking-widest font-bold
                  bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="divider">OR</div>

              <button
                type="button"
                onClick={handleResendOTP}
                className="btn btn-outline w-full"
                disabled={!canResend}
              >
                <RefreshCw className={`size-5 ${!canResend ? "" : "hover:rotate-180 transition-transform duration-500"}`} />
                {canResend ? "Resend OTP" : `Resend in ${countdown}s`}
              </button>
            </form>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Email Verification"
        subtitle="Enter the code we sent to your email to activate your account."
      />
    </div>
  );
};

export default OTPPage;
