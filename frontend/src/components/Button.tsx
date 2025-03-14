import { ReactNode } from "react";

type ButtonProps = {
  text?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "warning" | "icon";
  icon?: ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  loading = false,
  variant = "primary",
  icon,
}) => {
  const baseStyles = "px-4 py-2 rounded-lg transition duration-300 font-semibold flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    warning: "bg-yellow-500 text-black hover:bg-yellow-600",
    icon: "bg-transparent text-gray-700 hover:text-gray-900 p-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? "bg-gray-400 cursor-not-allowed" : ""} ${className}`}
    >
      {loading ? "Loading..." : icon ? icon : text}
    </button>
  );
};

export default Button;
