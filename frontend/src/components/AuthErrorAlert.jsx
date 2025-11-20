import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const AuthErrorAlert = ({ message }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="alert alert-error shadow-lg mb-6 rounded-xl border border-error/20 bg-error/10 text-error-content"
    >
      <AlertCircle className="w-6 h-6 shrink-0 stroke-current" />
      <span className="font-medium text-sm">{message}</span>
    </motion.div>
  );
};

export default AuthErrorAlert;
