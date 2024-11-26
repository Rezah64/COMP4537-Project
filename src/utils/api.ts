export const LLM_API_URL = import.meta.env.VITE_LLM_API_URL || 'http://localhost:3000';
import { api } from '../auth/axios';

if (!LLM_API_URL) {
  console.warn('API_URL is not defined in environment variables. Using localhost instead.');
}

export async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Invalid response format from server');
  }
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  try {
    const response = await fetch(`${LLM_API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

interface ApiResponse {
  response: string;
}

export async function sendMessageToAPI(message: string, email: string | undefined): Promise<ApiResponse> {
  try {
    const response = await fetch(`${LLM_API_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send the message');
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error communicating with the API:', error);
    throw error;
  }
}

export async function incrementCounterAPI(endpoint: string) {
  try {
    api.post('/endpointCounter', {endpoint: endpoint});
  } catch (error) {
    console.error('Error incrementing API call:', error);
  }
};

export async function updateUserName(name: string) {
  try {
    api.patch('/updateName', { name });
  } catch (error) {
    console.log('Error communicating with the API:', error);
    throw error;
  }
}