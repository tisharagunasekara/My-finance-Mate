import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaInfoCircle } from 'react-icons/fa';
import Button from '../components/Button';
import { useAuth } from '../hook/useAuth';
import { saveTransaction } from '../services/transactionService';
import { formatCurrency, getSriLankaDate } from '../utils/formatters';

/**
 * VoiceEnablePage - A component that allows users to create transactions using voice commands
 * Uses the Web Speech API to convert speech to text and extract transaction details
 */
const VoiceEnablePage = () => {
  // State for tracking microphone and recognition status
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // State for storing extracted transaction data from voice input
  const [recognizedData, setRecognizedData] = useState<{
    type?: string;
    category?: string;
    amount?: number;
    date?: string;
    notes?: string;
  }>({});
  
  // State for user feedback messages
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  
  // Use ref to persist the recognition object between renders
  // This prevents recreation of the speech recognition instance on every render
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Initialize speech recognition on component mount
  useEffect(() => {
    // Check browser compatibility - try standard API first, then webkit prefix
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      // Browser supports speech recognition
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition settings
      recognitionRef.current.continuous = true;  // Don't stop after first result
      recognitionRef.current.interimResults = true;  // Show results as they're being processed
      
      // Event handlers for the recognition process
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setMessage('Listening...');
      };
      
      recognitionRef.current.onresult = (event) => {
        // Get the latest transcript from the recognition results
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        // Process the transcript to extract transaction details
        processVoiceCommand(transcriptText);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setMessage(`Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setMessage('Listening stopped');
      };
    } else {
      // Browser does not support speech recognition
      setMessage('Speech recognition is not supported in this browser');
    }
    
    // Cleanup function to stop recognition when component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  /**
   * Toggle the speech recognition on/off
   * Handles starting and stopping the microphone capture
   */
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setMessage('Speech recognition not available');
      return;
    }
    
    if (isListening) {
      // Currently listening, so stop
      recognitionRef.current.stop();
      setIsListening(false);
      setMessage('Microphone stopped');
    } else {
      // Clear previous data before starting new session
      setTranscript('');
      setRecognizedData({});
      setMessage('Starting microphone...');
      
      // Start recognition with a small delay to avoid potential race conditions
      setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (err) {
          console.error('Failed to start recognition:', err);
          setMessage('Failed to start microphone. Please try again.');
        }
      }, 100);
    }
  };
  
  /**
   * Process the voice command to extract transaction details
   * Uses pattern matching and keyword detection to identify transaction properties
   * @param command - The transcript text to analyze
   */
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Extract transaction type with improved phrase detection
    // Look for keywords that indicate income or expense
    if (lowerCommand.includes('income') || 
        lowerCommand.includes('earning') || 
        lowerCommand.includes('received') || 
        lowerCommand.includes('got paid') || 
        lowerCommand.includes('earned') || 
        lowerCommand.includes('salary') || 
        lowerCommand.includes('profit')) {
      setRecognizedData(prev => ({ ...prev, type: 'income' }));
    } else if (lowerCommand.includes('expense') || 
               lowerCommand.includes('spent') || 
               lowerCommand.includes('paid') ||
               lowerCommand.includes('buy') || 
               lowerCommand.includes('bought') || 
               lowerCommand.includes('cost') || 
               lowerCommand.includes('payment')) {
      setRecognizedData(prev => ({ ...prev, type: 'expense' }));
    }
    
    // Define common spending and income categories
    const categories = [
      'groceries', 'rent', 'salary', 'food', 'transportation', 
      'entertainment', 'utilities', 'healthcare', 'education', 
      'shopping', 'dining', 'restaurant', 'clothing', 'travel', 
      'insurance', 'internet', 'phone', 'electricity', 'water', 
      'gas', 'maintenance', 'repair', 'gift', 'donation'
    ];
    
    // Check if any category is mentioned in the transcript
    categories.forEach(category => {
      if (lowerCommand.includes(category)) {
        setRecognizedData(prev => ({ ...prev, category }));
      }
    });
    
    // Extract amount using regex pattern
    // Handles various formats like $50, 50 dollars, 50 USD
    const amountPattern = /(\$|USD\.?|USD)?\s?(\d+(\.\d{1,2})?)\s?(dollars|USD)?/i;
    const amountMatch = lowerCommand.match(amountPattern);
    
    if (amountMatch && amountMatch[2]) {
      setRecognizedData(prev => ({ ...prev, amount: parseFloat(amountMatch[2]) }));
    }
    
    // Extract date - check for relative dates (yesterday, today)
    // or default to current date in Sri Lanka timezone
    if (lowerCommand.includes('yesterday')) {
      // Calculate yesterday's date in Sri Lanka timezone
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Colombo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      
      const dateFormatter = new Intl.DateTimeFormat('en-LK', options);
      const parts = dateFormatter.formatToParts(yesterday);
      
      const year = parts.find(part => part.type === 'year')?.value;
      const month = parts.find(part => part.type === 'month')?.value;
      const day = parts.find(part => part.type === 'day')?.value;
      
      setRecognizedData(prev => ({ ...prev, date: `${year}-${month}-${day}` }));
    } else {
      // Default to today's date in Sri Lankan timezone
      const slDate = getSriLankaDate();
      setRecognizedData(prev => ({ ...prev, date: slDate }));
    }
    
    // Extract notes - look for specific keywords followed by text
    const notesPattern = /(note|notes|description|comment)s?:?\s+([^$.]+)/i;
    const notesMatch = lowerCommand.match(notesPattern);
    
    if (notesMatch && notesMatch[2]) {
      setRecognizedData(prev => ({ ...prev, notes: notesMatch[2].trim() }));
    }
  };
  
  /**
   * Save the extracted transaction data to the database
   * Validates the data before submitting
   */
  const handleSaveTransaction = async () => {
    // Verify that we have the minimum required data
    if (!user || !recognizedData.type || !recognizedData.category || !recognizedData.amount) {
      setMessage('Incomplete transaction data. Please try again.');
      return;
    }
    
    try {
      // Submit transaction to the server
      await saveTransaction(user, {
        type: recognizedData.type,
        category: recognizedData.category,
        amount: recognizedData.amount,
        date: recognizedData.date || getSriLankaDate(),
        notes: recognizedData.notes || `Added via voice command: ${transcript}`
      });
      
      // Success message and reset state
      setMessage('Transaction saved successfully!');
      setTranscript('');
      setRecognizedData({});
    } catch (error) {
      console.error('Error saving transaction:', error);
      setMessage('Failed to save transaction. Please try again.');
    }
  };

  // Component UI rendering
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Voice Command</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex justify-center mb-6">
          <Button
            onClick={toggleListening}
            variant="primary"
            className={`p-6 rounded-full transition-colors duration-300 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            icon={isListening ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
            text={isListening ? "Stop" : "Start"} 
          />
        </div>
        
        <p className="text-center text-gray-600 mb-4">
          {isListening ? 'Listening... Click the button to stop' : 'Click the microphone to start speaking'}
        </p>
        
        {message && (
          <div className={`text-center p-2 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {message}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
            <FaInfoCircle />
            Voice Command Tips:
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Speak naturally and include the following information for best results:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li><span className="font-medium">Type:</span> Say "income" or "expense" (e.g., "I received an income" or "I spent money on")</li>
            <li><span className="font-medium">Amount:</span> Mention the amount (e.g., "50 dollars" or "$1000")</li>
            <li><span className="font-medium">Category:</span> Include a category (e.g., "groceries", "salary", "utilities")</li>
            <li><span className="font-medium">Date:</span> Specify "yesterday" or today's date will be used by default</li>
            <li><span className="font-medium">Notes:</span> Add notes by saying "note: your description here"</li>
          </ul>
        </div>
      </div>
      
      {transcript && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">Recognized Speech:</h2>
          <p className="p-4 bg-gray-100 rounded">{transcript}</p>
        </div>
      )}
      
      {Object.keys(recognizedData).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Extracted Transaction:</h2>
          <div className="grid grid-cols-2 gap-4">
            {recognizedData.type && (
              <div className={`p-3 rounded-lg ${
                recognizedData.type === 'income' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className="font-medium">Type:</p>
                <p className="capitalize text-lg font-semibold">
                  {recognizedData.type === 'income' ? '💰 Income' : '💸 Expense'}
                </p>
              </div>
            )}
            
            {recognizedData.category && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="font-medium">Category:</p>
                <p className="capitalize text-lg">{recognizedData.category}</p>
              </div>
            )}
            
            {recognizedData.amount !== undefined && (
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <p className="font-medium">Amount:</p>
                <p className="text-lg font-semibold">${recognizedData.amount.toFixed(2)}</p>
              </div>
            )}
            
            {recognizedData.date && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <p className="font-medium">Date (Sri Lanka):</p>
                <p className="text-lg">{recognizedData.date}</p>
              </div>
            )}

            {recognizedData.notes && (
              <div className="col-span-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium">Notes:</p>
                <p>{recognizedData.notes}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <Button
              text="Save Transaction"
              onClick={handleSaveTransaction}
              disabled={!recognizedData.type || !recognizedData.category || !recognizedData.amount}
              className="px-8 py-3"
            />
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Voice Command Examples:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>"I spent 50 dollars on groceries yesterday"</li>
          <li>"I received 1000 USD salary today"</li>
          <li>"Add expense of 25 dollars for entertainment note: movie tickets"</li>
          <li>"Record income of 100 dollars from freelance work"</li>
          <li>"Payment of $150 for utilities yesterday"</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceEnablePage;