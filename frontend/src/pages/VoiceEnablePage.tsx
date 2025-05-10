import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaInfoCircle, FaCheckCircle, FaTimes, FaHistory, FaSearch, FaRedo, FaEdit, FaCheck } from 'react-icons/fa';
import Button from '../components/Button';
import { useAuth } from '../hook/useAuth';
import { saveTransaction } from '../services/transactionService';
import { formatCurrency, getSriLankaDate } from '../utils/formatters';
import { toast } from 'react-toastify';

// Define a type for voice command history items
interface VoiceCommandHistoryItem {
  id: string;
  transcript: string;
  timestamp: Date;
  transactionData: {
    type?: string;
    category?: string;
    amount?: number;
    date?: string;
    notes?: string;
    description?: string;
  };
}

// Define confidence score interface
interface ConfidenceScores {
  type?: number;
  category?: number; 
  amount?: number;
  date?: number;
  notes?: number;
}

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
    description?: string;
  }>({});
  
  // State for confidence scores
  const [confidenceScores, setConfidenceScores] = useState<ConfidenceScores>({});

  // State for transaction confirmation and editing
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for user feedback messages
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  
  // Voice command history state
  const [commandHistory, setCommandHistory] = useState<VoiceCommandHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<VoiceCommandHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Animation state for voice waveform
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(10).fill(3));
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
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
        // Start audio visualization
        startAudioVisualization();
      };
      
      recognitionRef.current.onresult = (event) => {
        // Get the latest transcript from the recognition results
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        const confidence = event.results[current][0].confidence;
        
        setTranscript(transcriptText);
        
        // Process the transcript to extract transaction details
        processVoiceCommand(transcriptText, confidence);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setMessage(`Error: ${event.error}`);
        setIsListening(false);
        // Stop audio visualization
        stopAudioVisualization();
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setMessage('Listening stopped');
        // Stop audio visualization
        stopAudioVisualization();
      };
    } else {
      // Browser does not support speech recognition
      setMessage('Speech recognition is not supported in this browser');
    }
    
    // Load command history from localStorage on component mount
    loadCommandHistory();
    
    // Cleanup function to stop recognition when component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopAudioVisualization();
      
      // Clean up audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Update filtered history whenever search term or command history changes
  useEffect(() => {
    filterCommandHistory();
  }, [searchTerm, commandHistory]);
  
  // Setup audio visualization
  const startAudioVisualization = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      
      // Connect microphone stream to analyser
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Setup data array for visualization
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // Start animation loop
      updateWaveform();
    } catch (error) {
      console.error('Error accessing microphone for visualization', error);
    }
  };
  
  const updateWaveform = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    // Get frequency data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate average levels and normalize
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    
    const average = sum / dataArrayRef.current.length;
    const normalized = Math.min(Math.max(average / 128, 0), 1);
    
    // Create random waveform based on audio level
    const newLevels = audioLevel.map(() => {
      const randomFactor = Math.random() * 0.5 + 0.5;
      return Math.max(1, Math.floor(normalized * 15 * randomFactor));
    });
    
    setAudioLevel(newLevels);
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(updateWaveform);
  };
  
  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Reset audio levels
    setAudioLevel(Array(10).fill(3));
  };
  
  // Load command history from localStorage
  const loadCommandHistory = () => {
    try {
      const savedHistory = localStorage.getItem('voiceCommandHistory');
      if (savedHistory) {
        // Parse and convert timestamp strings back to Date objects
        const parsedHistory = JSON.parse(savedHistory);
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setCommandHistory(historyWithDates);
      }
    } catch (error) {
      console.error('Failed to load command history', error);
    }
  };
  
  // Save command history to localStorage
  const saveCommandHistory = (history: VoiceCommandHistoryItem[]) => {
    try {
      localStorage.setItem('voiceCommandHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save command history', error);
    }
  };
  
  // Add a command to history
  const addToCommandHistory = (transcript: string, transactionData: any) => {
    // Create a new history item
    const newHistoryItem: VoiceCommandHistoryItem = {
      id: Date.now().toString(),
      transcript,
      timestamp: new Date(),
      transactionData: { ...transactionData }
    };
    
    // Update history state and save to localStorage
    const updatedHistory = [newHistoryItem, ...commandHistory].slice(0, 20); // Keep only 20 most recent
    setCommandHistory(updatedHistory);
    saveCommandHistory(updatedHistory);
  };
  
  // Filter command history based on search term
  const filterCommandHistory = () => {
    if (!searchTerm.trim()) {
      setFilteredHistory([...commandHistory]);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = commandHistory.filter(item => 
      item.transcript.toLowerCase().includes(lowerSearchTerm) ||
      item.transactionData.type?.toLowerCase().includes(lowerSearchTerm) ||
      item.transactionData.category?.toLowerCase().includes(lowerSearchTerm) ||
      item.transactionData.description?.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredHistory(filtered);
  };
  
  // Reuse a command from history
  const reuseCommand = (historyItem: VoiceCommandHistoryItem) => {
    setTranscript(historyItem.transcript);
    setRecognizedData(historyItem.transactionData);
    setShowHistory(false);
    toast.info('Previous command loaded. You can now confirm and save it.');
  };
  
  // Toggle the display of command history
  const toggleHistoryPanel = () => {
    setShowHistory(!showHistory);
  };
  
  // Toggle edit mode for manual data correction
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // Handle form field changes in edit mode
  const handleFormChange = (field: string, value: string | number) => {
    setRecognizedData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Calculate confidence color based on score
  const getConfidenceColor = (score?: number): string => {
    if (!score) return 'bg-gray-200';
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Format confidence score as percentage
  const formatConfidence = (score?: number): string => {
    return score ? `${Math.round(score * 100)}%` : 'N/A';
  };

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
      setConfidenceScores({});
      setIsConfirming(false);
      setIsEditing(false);
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
   * @param baseConfidence - Base confidence score from speech recognition
   */
  const processVoiceCommand = (command: string, baseConfidence: number) => {
    const lowerCommand = command.toLowerCase();
    const newConfidenceScores: ConfidenceScores = {};
    
    // Extract transaction type with improved phrase detection
    // Look for keywords that indicate income or expense
    const incomeKeywords = ['income', 'earning', 'received', 'got paid', 'earned', 'salary', 'profit'];
    const expenseKeywords = ['expense', 'spent', 'paid', 'buy', 'bought', 'cost', 'payment'];
    
    let typeMatch = false;
    let typeConfidence = 0;
    
    // Check for income keywords
    for (const keyword of incomeKeywords) {
      if (lowerCommand.includes(keyword)) {
        typeMatch = true;
        setRecognizedData(prev => ({ ...prev, type: 'income' }));
        // Calculate higher confidence for exact matches or longer keywords
        const matchFactor = lowerCommand.includes(` ${keyword} `) ? 1.2 : 1;
        const lengthFactor = keyword.length > 5 ? 1.1 : 1;
        typeConfidence = Math.min(baseConfidence * matchFactor * lengthFactor, 1);
        break;
      }
    }
    
    // Check for expense keywords if no income match
    if (!typeMatch) {
      for (const keyword of expenseKeywords) {
        if (lowerCommand.includes(keyword)) {
          setRecognizedData(prev => ({ ...prev, type: 'expense' }));
          // Calculate higher confidence for exact matches or longer keywords
          const matchFactor = lowerCommand.includes(` ${keyword} `) ? 1.2 : 1;
          const lengthFactor = keyword.length > 5 ? 1.1 : 1;
          typeConfidence = Math.min(baseConfidence * matchFactor * lengthFactor, 1);
          break;
        }
      }
    }
    
    // Update confidence score for type
    if (typeConfidence > 0) {
      newConfidenceScores.type = typeConfidence;
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
    let categoryMatch = false;
    let categoryConfidence = 0;
    
    categories.forEach(category => {
      if (lowerCommand.includes(category)) {
        setRecognizedData(prev => ({ ...prev, category }));
        categoryMatch = true;
        
        // Calculate confidence based on how prominently the category appears
        const exactMatch = lowerCommand.includes(` ${category} `);
        const categoryMatchFactor = exactMatch ? 1.2 : 1;
        categoryConfidence = Math.min(baseConfidence * categoryMatchFactor, 1);
      }
    });
    
    // Update confidence score for category
    if (categoryConfidence > 0) {
      newConfidenceScores.category = categoryConfidence;
    }
    
    // Extract amount using regex pattern
    // Handles various formats like $50, 50 dollars, 50 USD
    const amountPattern = /(\$|USD\.?|USD)?\s?(\d+(\.\d{1,2})?)\s?(dollars|USD)?/i;
    const amountMatch = lowerCommand.match(amountPattern);
    
    if (amountMatch && amountMatch[2]) {
      const extractedAmount = parseFloat(amountMatch[2]);
      setRecognizedData(prev => ({ ...prev, amount: extractedAmount }));
      
      // Calculate confidence for amount based on format clarity
      const hasCurrency = Boolean(amountMatch[1] || amountMatch[4]);
      const isCleanNumber = /^\d+(\.\d{2})?$/.test(amountMatch[2]);
      const amountMatchFactor = hasCurrency ? 1.2 : 1;
      const amountFormatFactor = isCleanNumber ? 1.1 : 1;
      
      newConfidenceScores.amount = Math.min(baseConfidence * amountMatchFactor * amountFormatFactor, 1);
    }
    
    // Extract date - check for relative dates (yesterday, today)
    // or default to current date in Sri Lanka timezone
    let dateConfidence = 0.7; // Default confidence for current date
    
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
      dateConfidence = baseConfidence * 1.1; // Higher confidence since explicitly mentioned
    } else {
      // Default to today's date in Sri Lankan timezone
      const slDate = getSriLankaDate();
      setRecognizedData(prev => ({ ...prev, date: slDate }));
      // Use lower confidence since date wasn't explicitly mentioned
    }
    
    // Update confidence score for date
    newConfidenceScores.date = Math.min(dateConfidence, 1);
    
    // Extract notes - look for specific keywords followed by text
    const notesPattern = /(note|notes|description|comment)s?:?\s+([^$.]+)/i;
    const notesMatch = lowerCommand.match(notesPattern);
    
    if (notesMatch && notesMatch[2]) {
      const extractedNotes = notesMatch[2].trim();
      setRecognizedData(prev => ({ ...prev, notes: extractedNotes }));
      
      // Calculate confidence for notes based on clarity of keyword
      const notesMatchFactor = lowerCommand.includes(`${notesMatch[1]}:`) ? 1.2 : 1;
      newConfidenceScores.notes = Math.min(baseConfidence * notesMatchFactor, 1);
    }
    
    // Set description using category or summary of command (required field for DB)
    const shortCommand = lowerCommand.substring(0, 50).trim();
    setRecognizedData(prev => {
      const category = prev.category ? prev.category : 'transaction';
      return { 
        ...prev, 
        description: prev.notes ? prev.notes.substring(0, 50) : `Voice ${prev.type || 'transaction'} for ${category}`
      };
    });
    
    // Update confidence scores state
    setConfidenceScores(newConfidenceScores);
  };

  /**
   * Prepare transaction data for confirmation before saving
   */
  const handlePrepareTransaction = () => {
    // Verify that we have the minimum required data
    if (!user || !recognizedData.type || !recognizedData.category || !recognizedData.amount) {
      setMessage('Incomplete transaction data. Please try again.');
      return;
    }

    // Enter confirmation mode
    setIsConfirming(true);
    setIsEditing(false);
  };
  
  /**
   * Save the extracted transaction data to the database
   * Validates the data before submitting
   */
  const handleSaveTransaction = async () => {
    // Verify that we have the minimum required data again (just to be safe)
    if (!user || !recognizedData.type || !recognizedData.category || !recognizedData.amount) {
      setMessage('Incomplete transaction data. Please try again.');
      return;
    }
    
    try {
      // Ensure all required fields are present
      const transactionData = {
        type: recognizedData.type,
        category: recognizedData.category,
        amount: recognizedData.amount,
        date: recognizedData.date || getSriLankaDate(),
        description: recognizedData.description || `Voice ${recognizedData.type} for ${recognizedData.category}`,
        notes: recognizedData.notes || `Added via voice command: ${transcript}`
      };

      // Submit transaction to the server
      await saveTransaction(user, transactionData);
      
      // Add to command history
      addToCommandHistory(transcript, recognizedData);
      
      // Success message and reset state
      toast.success('Transaction saved successfully!');
      setMessage('Transaction saved successfully!');
      setTranscript('');
      setRecognizedData({});
      setConfidenceScores({});
      setIsConfirming(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction. Please try again.');
      setMessage('Failed to save transaction. Please try again.');
    }
  };

  // User canceled the transaction
  const handleCancelTransaction = () => {
    setIsConfirming(false);
    setIsEditing(false);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-LK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Component UI rendering
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Voice Command</h1>
      
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <Button
          onClick={toggleHistoryPanel}
          variant="secondary"
          className="flex items-center gap-2 px-4 py-2"
          icon={<FaHistory />}
          text={showHistory ? "Hide History" : "Show History"} 
        />
      </div>
      
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
        
        {isListening && (
          <div className="flex justify-center items-end h-16 my-4 space-x-1">
            {audioLevel.map((level, index) => (
              <div 
                key={index}
                className="w-2 bg-blue-500 rounded-t transition-all duration-50 ease-in-out"
                style={{ height: `${level * 4}px` }}
              ></div>
            ))}
          </div>
        )}
        
        <p className="text-center text-gray-600 mb-4">
          {isListening ? 'Listening... Click the button to stop' : 'Click the microphone to start speaking'}
        </p>
        
        {message && (
          <div className={`text-center p-2 rounded mb-4 ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
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
      
      {/* Voice Command History Panel */}
      {showHistory && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaHistory />
            Voice Command History
          </h2>
          
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search voice commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {filteredHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No voice commands in history.</p>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredHistory.map((item) => (
                <div key={item.id} className="py-3 hover:bg-gray-50 px-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">
                      {formatDate(item.timestamp)}
                    </div>
                    <Button
                      onClick={() => reuseCommand(item)}
                      variant="text"
                      className="text-blue-600 hover:text-blue-800 p-1 flex items-center gap-1 text-sm"
                      icon={<FaRedo size={12} />}
                      text="Reuse"
                    />
                  </div>
                  <p className="text-gray-800 font-medium">"{item.transcript}"</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {item.transactionData.type && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.transactionData.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.transactionData.type}
                      </span>
                    )}
                    {item.transactionData.category && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {item.transactionData.category}
                      </span>
                    )}
                    {item.transactionData.amount !== undefined && (
                      <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                        ${item.transactionData.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {transcript && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">Recognized Speech:</h2>
          <p className="p-4 bg-gray-100 rounded">{transcript}</p>
        </div>
      )}
      
      {Object.keys(recognizedData).length > 0 && !isConfirming && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Extracted Transaction:</h2>
            <Button
              onClick={toggleEditMode}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1 text-sm"
              icon={isEditing ? <FaCheck size={14} /> : <FaEdit size={14} />}
              text={isEditing ? "Done Editing" : "Edit Data"}
            />
          </div>
          
          {!isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {recognizedData.type && (
                <div className={`p-3 rounded-lg ${
                  recognizedData.type === 'income' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">Type:</p>
                    {confidenceScores.type && (
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidenceScores.type)} mr-1`}></div>
                        <span className="text-xs text-gray-500">{formatConfidence(confidenceScores.type)}</span>
                      </div>
                    )}
                  </div>
                  <p className="capitalize text-lg font-semibold">
                    {recognizedData.type === 'income' ? '💰 Income' : '💸 Expense'}
                  </p>
                </div>
              )}
              
              {recognizedData.category && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">Category:</p>
                    {confidenceScores.category && (
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidenceScores.category)} mr-1`}></div>
                        <span className="text-xs text-gray-500">{formatConfidence(confidenceScores.category)}</span>
                      </div>
                    )}
                  </div>
                  <p className="capitalize text-lg">{recognizedData.category}</p>
                </div>
              )}
              
              {recognizedData.amount !== undefined && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">Amount:</p>
                    {confidenceScores.amount && (
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidenceScores.amount)} mr-1`}></div>
                        <span className="text-xs text-gray-500">{formatConfidence(confidenceScores.amount)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-lg font-semibold">${recognizedData.amount.toFixed(2)}</p>
                </div>
              )}
              
              {recognizedData.date && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">Date (Sri Lanka):</p>
                    {confidenceScores.date && (
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidenceScores.date)} mr-1`}></div>
                        <span className="text-xs text-gray-500">{formatConfidence(confidenceScores.date)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-lg">{recognizedData.date}</p>
                </div>
              )}

              {recognizedData.notes && (
                <div className="col-span-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">Notes:</p>
                    {confidenceScores.notes && (
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidenceScores.notes)} mr-1`}></div>
                        <span className="text-xs text-gray-500">{formatConfidence(confidenceScores.notes)}</span>
                      </div>
                    )}
                  </div>
                  <p>{recognizedData.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={recognizedData.type || ''}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={recognizedData.category || ''}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={recognizedData.amount || ''}
                    onChange={(e) => handleFormChange('amount', parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={recognizedData.date || ''}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={recognizedData.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={recognizedData.notes || ''}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                ></textarea>
              </div>
              <p className="text-sm text-gray-500 italic mt-2">
                Make any needed corrections to the fields above before confirming the transaction.
              </p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Button
              text="Confirm Transaction"
              onClick={handlePrepareTransaction}
              disabled={!recognizedData.type || !recognizedData.category || !recognizedData.amount}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
            />
          </div>
        </div>
      )}

      {/* Confirmation Panel */}
      {isConfirming && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border-2 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-800">Confirm Transaction</h2>
            <div className="flex space-x-2">
              <Button 
                text="Cancel" 
                onClick={handleCancelTransaction}
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
                icon={<FaTimes className="mr-1" />}
              />
              <Button 
                text="Save to Database" 
                onClick={handleSaveTransaction}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
                icon={<FaCheckCircle className="mr-1" />}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="font-medium text-blue-800 mb-2">The following transaction will be saved:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><span className="font-medium">Type:</span> {recognizedData.type}</li>
              <li><span className="font-medium">Category:</span> {recognizedData.category}</li>
              <li><span className="font-medium">Amount:</span> ${recognizedData.amount?.toFixed(2)}</li>
              <li><span className="font-medium">Date:</span> {recognizedData.date}</li>
              <li><span className="font-medium">Description:</span> {recognizedData.description}</li>
              {recognizedData.notes && <li><span className="font-medium">Notes:</span> {recognizedData.notes}</li>}
            </ul>
          </div>

          <p className="text-sm text-gray-500 italic">
            Please review the transaction details above before saving to the database.
          </p>
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