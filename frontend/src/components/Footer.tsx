import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-500 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="text-3xl font-bold">FinanceMate</div>
            <p className="text-sm">
              Empowering you to take control of your financial journey with ease and convenience. Track, analyze, and manage your finances with voice commands.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="hover:text-gray-300 focus:text-gray-400" aria-label="Go to Home">Home</a></li>
              <li><a href="#features" className="hover:text-gray-300 focus:text-gray-400" aria-label="View Features">Features</a></li>
              <li><a href="#pricing" className="hover:text-gray-300 focus:text-gray-400" aria-label="View Pricing">Pricing</a></li>
              <li><a href="#contact" className="hover:text-gray-300 focus:text-gray-400" aria-label="Contact Us">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <ul className="space-y-2">
              <li>Email: <a href="mailto:contact@financemate.com" className="hover:text-gray-300 focus:text-gray-400" aria-label="Send an email to FinanceMate">contact@financemate.com</a></li>
              <li>Phone: +1 234 567 890</li>
              <li>Address: 123 Finance St, City, Country</li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-white hover:text-gray-300 focus:text-gray-400" aria-label="Follow us on Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-labelledby="facebook-icon">
                  <title id="facebook-icon">Facebook Icon</title>
                  <path d="M22.23 2.87C21.47 2.68 20.91 3.12 20.5 3.5l-.02.02c-.2.18-.36.39-.51.64-.2.28-.37.6-.5.91-.45 1.04-.75 2.14-.97 3.24-.2.85-.41 1.74-.69 2.58-.37 1.1-.81 2.13-1.28 3.15-.45 1-.95 2.02-1.47 3.02-.64 1.3-1.25 2.58-1.9 3.84-.64 1.28-1.28 2.58-1.91 3.89-.3.61-.6 1.23-.9 1.84-.4.86-.75 1.77-.97 2.68-.2.56-.34 1.12-.46 1.69-.01.07-.03.13-.04.2-.12.41-.26.83-.47 1.23-.23.42-.49.81-.81 1.14-.21.23-.45.45-.71.67-.23.19-.49.38-.76.56-.43.26-.89.47-1.35.68-.78.36-1.59.65-2.41.95-.38.14-.77.28-1.16.43-.14.09-.29.16-.44.24-.34.17-.68.35-1.03.51-.55.26-1.1.52-1.65.77-.26.13-.52.28-.78.42-.2.11-.42.22-.62.34-.5.29-.99.6-1.5.91-.29.21-.58.43-.88.64-.12.08-.24.17-.36.26-.23.15-.47.31-.71.46-.42.32-.86.64-1.29.98-.17.14-.35.27-.52.41-.28.23-.55.46-.82.7-.22.19-.44.38-.66.58-.21.18-.43.36-.65.55-.46.38-.94.75-1.42 1.13-.23.21-.48.43-.73.65-.39.34-.78.68-1.18 1.02-.26.24-.53.47-.79.72-.44.41-.89.82-1.34 1.23-.09.09-.18.19-.28.29-.03.03-.06.06-.09.1-.58.55-1.18 1.1-1.76 1.66-.69.71-1.39 1.44-2.08 2.15-.47.56-.96 1.13-1.43 1.7.68-.72 1.3-1.47 1.91-2.25-.2-.41-.38-.84-.56-1.27-.61-1.15-1.25-2.3-1.89-3.45-.29-.53-.58-1.06-.89-1.58-.61-.99-1.31-1.94-2.02-2.92-.58-.75-1.23-1.49-1.89-2.23-1.48-1.64-3.07-3.27-4.57-4.91-.59-.69-1.17-1.4-1.75-2.1-.29-.37-.58-.74-.88-1.12-1.59-1.96-3.18-3.93-4.77-5.9-.3-.35-.62-.7-.92-1.06-.71-.76-1.42-1.53-2.14-2.31-.71-.78-1.44-1.55-2.17-2.32-.6-.66-1.2-1.33-1.8-2.01-.47-.49-.94-.97-1.42-1.46-.65-.76-1.31-1.53-1.96-2.31.32.6-.22.93-.56 1.33z" />
                </svg>
              </a>
              <a href="https://instagram.com" className="text-white hover:text-gray-300 focus:text-gray-400" aria-label="Follow us on Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-labelledby="instagram-icon">
                  <title id="instagram-icon">Instagram Icon</title>
                  <path d="M12 2a10 10 0 11-10 10A10.03 10.03 0 0112 2zm0 18a8 8 0 10-8-8 8 8 0 008 8z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} FinanceMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
