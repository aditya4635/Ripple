import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/shared/AuthImagePattern";
import toast from "react-hot-toast";
import MouseFollowerSprinkles from "../components/shared/MouseFollowerLight";
import AuthErrorAlert from "../components/shared/AuthErrorAlert";
import GoogleSignInButton from "../components/shared/GoogleSignInButton";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp, authError, clearAuthError, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) return toast.error("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const result = await signup(formData);
    if (result.success) {
      navigate("/otp", { state: { email: result.email } });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const success = await googleLogin(credentialResponse.access_token);
    if (success) {
      navigate("/");
    }
  };

  return (
    <>
    <MouseFollowerSprinkles />
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 bg-base-100">
        <div className="w-full max-w-md space-y-8 bg-base-200/50 px-8 py-10 rounded-3xl shadow-xl border border-base-300 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-all duration-300"
              >
                <MessageSquare className="size-7 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mt-4 tracking-tight">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          <AuthErrorAlert message={authError} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40 group-hover:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10 bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40 group-hover:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40 group-hover:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10 bg-base-100 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Your Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40 hover:text-primary transition-colors" />
                  ) : (
                    <Eye className="size-5 text-base-content/40 hover:text-primary transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg text-lg font-medium" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="divider text-base-content/60 my-6">OR CONTINUE WITH</div>

          <div className="space-y-3">
            <GoogleSignInButton onSuccess={handleGoogleSuccess} mode="signup" />
            <p className="text-xs text-center text-base-content/60">
              Quick and secure registration with your Google account
            </p>
          </div>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
    </>
  );
};
export default SignUpPage;
