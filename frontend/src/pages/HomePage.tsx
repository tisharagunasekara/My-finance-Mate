import { FaMicrophone, FaRegCalendarAlt, FaChartBar } from 'react-icons/fa'; // Import icons
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="bg-gradient-to-r from-blue-400 to-teal-400 min-h-screen text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center p-12">
        <h1 className="text-5xl font-bold mb-4">Manage Your Finances Effortlessly with FinanceMate</h1>
        <p className="text-xl mb-6">Track income and expenses using voice commands with ease. Stay in control of your financial health.</p>
        <div className="flex space-x-4">
          <button className="bg-blue-600 px-8 py-3 rounded-full hover:bg-blue-500 transition duration-300">Get Started</button>
          <button className="border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-blue-600 transition duration-300">Learn More</button>
        </div>
        {/* Voice Command Button */}
        <button
          // onClick={handleVoiceCommand} // Add your voice command handler
          className="mt-6 p-4 rounded-full bg-white text-blue-600 hover:bg-gray-200 transition duration-300"
        >
          <FaMicrophone size={24} /> {/* Voice command icon */}
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 px-4 bg-white text-black">
        <h2 className="text-3xl font-semibold text-center mb-8">Amazing Features to Make Financial Tracking Simple</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 border rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <div className="flex items-center justify-center mb-4">
              <FaMicrophone className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Voice Command Tracking</h3>
            <p>Log income and expenses using voice commands.</p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 border rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <div className="flex items-center justify-center mb-4">
              <FaRegCalendarAlt className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Automatic Categorization</h3>
            <p>Automatically categorize your transactions for easier tracking.</p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 border rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
            <div className="flex items-center justify-center mb-4">
              <FaChartBar className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Financial Insights</h3>
            <p>Get actionable insights about your spending and savings trends.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-6 bg-blue-50 text-gray-800">
  <h2 className="text-4xl font-bold text-center mb-12 text-blue-600">How FinanceMate Works</h2>
  <div className="flex flex-col md:flex-row justify-around items-center text-center space-y-12 md:space-y-0">
    {/* Step 1 */}
    <div className="w-full md:w-1/3 bg-white text-gray-800 p-8 rounded-lg shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out hover:scale-105">
      <div className="flex justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold mb-4">Step 1</h3>
      <p className="text-lg text-gray-600">Create an Account and Get Started</p>
    </div>

    {/* Step 2 */}
    <div className="w-full md:w-1/3 bg-white text-gray-800 p-8 rounded-lg shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out hover:scale-105">
      <div className="flex justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 9.3l-6-4.7-1.8 2.6 4.1 2.9h-7l-2.3-2.1 2.1-2.8-2.7-2.1-2.2 2.9 2.6 2.3h-6l1.7 2.7 5.7-4.2 4.1 3.1z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold mb-4">Step 2</h3>
      <p className="text-lg text-gray-600">Use Voice to Log Transactions with Ease</p>
    </div>

    {/* Step 3 */}
    <div className="w-full md:w-1/3 bg-white text-gray-800 p-8 rounded-lg shadow-xl hover:shadow-2xl transform transition-all duration-300 ease-in-out hover:scale-105">
      <div className="flex justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-teal-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm0 18c-1.7 0-3.3-.6-4.5-1.7l1.2-1.5c.8.6 1.8 1 2.8 1.1 1.7 0 3.3-.6 4.5-1.7l1.2 1.5c-1.4 1.1-3.2 1.7-5 1.7z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold mb-4">Step 3</h3>
      <p className="text-lg text-gray-600">Track and Get Insights in Real-Time</p>
    </div>
  </div>
</section>


      <Footer />
    </div>
  );
};

export default Home;
