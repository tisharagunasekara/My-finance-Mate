import axios from 'axios';

interface TransactionData {
  type: string;
  category: string;
  amount: number;
  date: string;  // Assuming date is a string (you can adjust it if it's a Date object)
  notes?: string;
}

export const saveTransaction = async (user: string, data: TransactionData) => {
  console.log('Saving transaction:', data);
  try {
    const response = await axios.post("http://localhost:5000/api/transactions", {
      userId:user,    // user will be sent as part of the body
      ...data, // spread the rest of the transaction data into the body
    });

    // Response data will be returned directly from the response object
    return response.data;
  } catch (error) {
    console.error(error);

    // Check if error is an instance of AxiosError for better error handling
    if (axios.isAxiosError(error)) {
      throw new Error('Axios error: ' + (error.response?.data || error.message));  // Handles Axios-specific errors
    } else {
      throw new Error('Error saving transaction');
    }
  }
};

export const getTransactionsByUserId = async (userId: string) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/transactions/${userId}`);
    return response.data; // Returns all transactions for the user
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching transactions');
  }

  
};
export const deleteTransactionById = async (transactionId: string) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/transactions/${transactionId}`);
    return response.data; // Return the deletion result (optional)
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete transaction");
  }
};