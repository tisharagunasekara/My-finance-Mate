import { useState, useEffect } from 'react';
import { FaMicrophone, FaRegCalendarAlt, FaChartBar, FaArrowRight } from 'react-icons/fa';
import { BiLineChart, BiPieChart, BiBarChart } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from "../components/Footer";

const Home = () => {
  const [chartData] = useState({
    expenses: [30, 40, 25, 60, 70, 55, 65],
    income: [50, 60, 45, 80, 90, 75, 85],
    savings: [20, 30, 15, 40, 50, 35, 45],
  });
  
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 min-h-screen text-white">
      {/* Hero Section - Modern with animated text and graphics */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 px-4 md:px-12 min-h-[80vh] overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-[10%] right-[15%] w-24 h-24 rounded-full bg-blue-300 opacity-20"
          animate={{ 
            y: [0, -15, 0], 
            scale: [1, 1.1, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 5 
          }}
        />
        <motion.div 
          className="absolute bottom-[20%] left-[10%] w-32 h-32 rounded-full bg-indigo-300 opacity-20"
          animate={{ 
            y: [0, 20, 0], 
            scale: [1, 1.2, 1] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 7 
          }}
        />
        
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-white">Smart Finance Management</span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-300">
            Powered by Your Voice
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl mb-8 max-w-2xl text-blue-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Track finances, set budgets, and achieve your goals with AI-powered voice commands. Your financial journey, simplified.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link to="/register">
            <button className="bg-gradient-to-r from-teal-400 to-cyan-400 px-8 py-4 rounded-lg hover:shadow-lg hover:shadow-teal-500/30 font-semibold text-lg transition duration-300 flex items-center justify-center w-full sm:w-auto">
              Get Started Free <FaArrowRight className="ml-2" />
            </button>
          </Link>
          <button className="border-2 border-white px-8 py-3.5 rounded-lg hover:bg-white hover:text-indigo-700 font-medium transition duration-300 w-full sm:w-auto">
            Watch Demo
          </button>
        </motion.div>
        
        {/* Voice Command Demo */}
        <motion.div 
          className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-4xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="text-2xl font-semibold mb-3">Try Voice Commands</h3>
              <p className="text-blue-100">Say: "Add expense $45 for groceries"</p>
            </div>
            <button
              className="p-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition duration-300 relative group"
            >
              <FaMicrophone size={24} />
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-75"
                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Animated Analysis Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-900 to-blue-900">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Powerful Financial Analysis</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Visualize your financial data with interactive charts and get AI-powered insights to improve your financial health.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Chart 1 - Line Chart */}
            <motion.div 
              className="bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Monthly Expenses</h3>
                <BiLineChart size={24} className="text-teal-400" />
              </div>
              <div className="h-48 relative flex items-end justify-around">
                {chartData.expenses.map((value, index) => (
                  <motion.div 
                    key={index}
                    className="bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-sm w-8"
                    style={{ height: `${value}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: isVisible ? `${value}%` : 0 }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 1, ease: "easeOut" }}
                  />
                ))}
              </div>
              <div className="mt-4 text-sm text-blue-200">
                <p className="flex justify-between">
                  <span>Jan</span>
                  <span>Jul</span>
                </p>
              </div>
            </motion.div>

            {/* Chart 2 - Pie Chart */}
            <motion.div 
              className="bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Budget Categories</h3>
                <BiPieChart size={24} className="text-cyan-400" />
              </div>
              <div className="relative h-48 flex items-center justify-center">
                <motion.div 
                  className="w-32 h-32 rounded-full border-8 border-cyan-500"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: isVisible ? 1 : 0 }}
                  transition={{ delay: 0.6, duration: 1 }}
                >
                  <motion.div 
                    className="absolute top-0 left-1/2 w-[calc(100%-16px)] h-[calc(100%-16px)] border-t-8 border-r-8 border-cyan-300 rounded-tr-full"
                    style={{ transformOrigin: "bottom left" }}
                    initial={{ rotate: 0, opacity: 0 }}
                    animate={{ rotate: 90, opacity: isVisible ? 1 : 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                  />
                  <motion.div 
                    className="absolute bottom-0 left-0 w-[calc(100%-16px)] h-[calc(100%-16px)] border-l-8 border-b-8 border-blue-500 rounded-bl-full"
                    style={{ transformOrigin: "top right" }}
                    initial={{ rotate: 0, opacity: 0 }}
                    animate={{ rotate: -90, opacity: isVisible ? 1 : 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  />
                </motion.div>
              </div>
              <div className="mt-4 text-sm text-blue-200 grid grid-cols-3 gap-2">
                <div className="flex items-center"><span className="block w-3 h-3 bg-cyan-500 mr-2"></span>Housing</div>
                <div className="flex items-center"><span className="block w-3 h-3 bg-cyan-300 mr-2"></span>Food</div>
                <div className="flex items-center"><span className="block w-3 h-3 bg-blue-500 mr-2"></span>Other</div>
              </div>
            </motion.div>

            {/* Chart 3 - Progress Chart */}
            <motion.div 
              className="bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Saving Goals</h3>
                <BiBarChart size={24} className="text-blue-400" />
              </div>
              <div className="space-y-6 h-48 flex flex-col justify-center">
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Emergency Fund</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={{ width: "0%" }}
                      animate={{ width: isVisible ? "75%" : "0%" }}
                      transition={{ delay: 0.8, duration: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Vacation</span>
                    <span>45%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={{ width: "0%" }}
                      animate={{ width: isVisible ? "45%" : "0%" }}
                      transition={{ delay: 1, duration: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>New Car</span>
                    <span>30%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={{ width: "0%" }}
                      animate={{ width: isVisible ? "30%" : "0%" }}
                      transition={{ delay: 1.2, duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Modernized */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-800 to-indigo-900">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Advanced Features</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Take control of your finances with our powerful yet easy-to-use features.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-blue-600 rounded-2xl group-hover:bg-blue-500 transition duration-300">
                  <FaMicrophone className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center">Voice Command Tracking</h3>
              <p className="text-center text-blue-100">Just speak naturally to log transactions, check balances, or update budgets with our powerful AI voice assistant.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-blue-600 rounded-2xl group-hover:bg-blue-500 transition duration-300">
                  <FaRegCalendarAlt className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center">Smart Categorization</h3>
              <p className="text-center text-blue-100">Our AI automatically categorizes your transactions for easier tracking and provides personalized insights.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-blue-600 rounded-2xl group-hover:bg-blue-500 transition duration-300">
                  <FaChartBar className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center">Financial Insights</h3>
              <p className="text-center text-blue-100">Get actionable insights about your spending patterns and personalized recommendations to improve your finances.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-900 to-blue-900">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">What Our Users Say</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of users who have transformed their financial health with FinanceMate.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              className="bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm p-8 rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 mr-4"></div>
                <div>
                  <h4 className="font-medium">Sarah Johnson</h4>
                  <p className="text-sm text-blue-200">Marketing Director</p>
                </div>
              </div>
              <p className="text-blue-100">"FinanceMate has completely changed how I manage my finances. The voice command feature saves me so much time!"</p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              className="bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm p-8 rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 mr-4"></div>
                <div>
                  <h4 className="font-medium">Michael Reynolds</h4>
                  <p className="text-sm text-blue-200">Software Engineer</p>
                </div>
              </div>
              <p className="text-blue-100">"I love how the app automatically categorizes my expenses and gives me insights on my spending habits. It's like having a financial advisor!"</p>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              className="bg-white bg-opacity-5 backdrop-filter backdrop-blur-sm p-8 rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 mr-4"></div>
                <div>
                  <h4 className="font-medium">Emily Chen</h4>
                  <p className="text-sm text-blue-200">Small Business Owner</p>
                </div>
              </div>
              <p className="text-blue-100">"The goal tracking feature helped me save for my business expansion. The visual analytics make it easy to see my progress."</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Transform Your Finances?</h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join FinanceMate today and experience the future of personal finance management with AI-powered insights and voice commands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <button className="bg-white text-indigo-700 px-8 py-4 rounded-lg hover:shadow-lg transition duration-300 font-semibold text-lg min-w-[200px]">
                  Get Started Free
                </button>
              </Link>
              <Link to="/login">
                <button className="border-2 border-white px-8 py-3.5 rounded-lg hover:bg-white hover:text-indigo-700 transition duration-300 font-medium text-lg min-w-[200px]">
                  Sign In
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
