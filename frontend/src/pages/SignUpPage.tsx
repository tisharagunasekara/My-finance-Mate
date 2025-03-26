import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { AiOutlineUser, AiOutlineMail, AiOutlineLock, AiOutlineEyeInvisible, AiOutlineEye, AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

const SignUp = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  }>({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check password strength when password changes
    if (formData.password) {
      const hasMinLength = formData.password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      
      // Calculate score (0-4)
      let score = 0;
      if (hasMinLength) score++;
      if (hasUpperCase && hasLowerCase) score++;
      if (hasNumber) score++;
      if (hasSpecialChar) score++;
      
      setPasswordStrength({
        score,
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar
      });
    } else {
      setPasswordStrength({
        score: 0,
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
      });
    }
  }, [formData.password]);
  
  const getStrengthText = () => {
    const { score } = passwordStrength;
    if (score === 0) return "Very Weak";
    if (score === 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
  };
  
  const getStrengthColor = () => {
    const { score } = passwordStrength;
    if (score === 0) return "bg-red-500";
    if (score === 1) return "bg-red-400";
    if (score === 2) return "bg-yellow-500";
    if (score === 3) return "bg-green-400";
    return "bg-green-500";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the error for this field as user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 20) {
      newErrors.username = "Username cannot exceed 20 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (passwordStrength.score < 2) {
      newErrors.password = "Password is too weak";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      await registerUser(formData.username, formData.email, formData.password);
      // Show success message
      navigate("/login", { state: { registrationSuccess: true } });
    } catch (error: any) {
      console.error("Registration failed", error);
      
      if (error.response) {
        // Handle specific error cases
        if (error.response.data.message.includes("email")) {
          setErrors({ email: error.response.data.message || "This email is already registered" });
        } else if (error.response.data.message.includes("username")) {
          setErrors({ username: error.response.data.message || "This username is already taken" });
        } else {
          setErrors({ general: error.response.data.message || "Registration failed" });
        }
      } else if (error.request) {
        setErrors({ general: "Unable to connect to the server. Please check your internet connection." });
      } else {
        setErrors({ general: "An error occurred. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create an account</h2>
          <p className="text-sm text-gray-600 mb-6">Join us and take control of your finances</p>
        </div>
        
        {errors.general && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <p>{errors.general}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                className={`pl-10 appearance-none block w-full px-3 py-3 border ${
                  errors.username ? "border-red-300" : "border-gray-300"
                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="johndoe"
              />
            </div>
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 appearance-none block w-full px-3 py-3 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`pl-10 appearance-none block w-full px-3 py-3 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible className="h-5 w-5" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">Password strength: {getStrengthText()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${getStrengthColor()} h-2 rounded-full transition-all duration-300`} style={{ width: `${(passwordStrength.score / 4) * 100}%` }}></div>
                </div>
                <ul className="mt-2 text-xs space-y-1">
                  <li className="flex items-center">
                    {passwordStrength.hasMinLength ? (
                      <AiOutlineCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <AiOutlineCloseCircle className="h-4 w-4 text-gray-500 mr-1" />
                    )}
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    {passwordStrength.hasUpperCase && passwordStrength.hasLowerCase ? (
                      <AiOutlineCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <AiOutlineCloseCircle className="h-4 w-4 text-gray-500 mr-1" />
                    )}
                    Upper and lowercase letters
                  </li>
                  <li className="flex items-center">
                    {passwordStrength.hasNumber ? (
                      <AiOutlineCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <AiOutlineCloseCircle className="h-4 w-4 text-gray-500 mr-1" />
                    )}
                    At least one number
                  </li>
                  <li className="flex items-center">
                    {passwordStrength.hasSpecialChar ? (
                      <AiOutlineCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <AiOutlineCloseCircle className="h-4 w-4 text-gray-500 mr-1" />
                    )}
                    At least one special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pl-10 appearance-none block w-full px-3 py-3 border ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <AiOutlineEyeInvisible className="h-5 w-5" />
                  ) : (
                    <AiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
