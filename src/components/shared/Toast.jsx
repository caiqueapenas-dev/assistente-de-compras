import { CheckCircle } from "lucide-react";

const Toast = ({ message, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-out z-50">
      <CheckCircle size={20} />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
