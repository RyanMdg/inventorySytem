// import { OpenAI } from 'openai';
import supabase from '../../../public/Backend2/config/SupabaseClient.js';
import { getAuthUserAndBranch } from '../../../public/js/Authentication/auth-utils.js';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_MODEL = 'openai/gpt-3.5-turbo'; // You can change to other models supported by OpenRouter

class AIAgent {
  constructor() {
    this.conversationHistory = [];
    this.context = {};
  }

  async initialize() {
    try {
      // Initialize any necessary connections or state
      return true;
    } catch (error) {
      console.error('Failed to initialize AI Agent:', error);
      return false;
    }
  }

  async processMessage(message) {
    try {
      let context = '';
      const lowerMsg = message.toLowerCase();
      const { branchId } =await getAuthUserAndBranch();

      // Sales today logic
      if (lowerMsg.includes('sales today')) {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from('reciepts_summary_table')
          .select('total, created_at, status, branch_id')
          .gte('created_at', today + 'T00:00:00.000Z')
          .lte('created_at', today + 'T23:59:59.999Z')
          .eq('status', 'Completed')
          .eq('branch_id', branchId);
        if (error) {
          context = "I'm unable to retrieve today's sales data due to a database error.";
        } else {
          const totalSales = data.reduce((sum, row) => sum + (row.total || 0), 0);
          context = `Today's sales for your branch are ₱${totalSales}.`;
        }
      }

      // Inventory logic
      if (lowerMsg.includes('inventory')) {
        const { data, error } = await supabase
          .from('inventory_table')
          .select('raw_mats, quantity, unit, status')
          .eq('branch_id', branchId);
        if (error) {
          context = "I could not retrieve your inventory due to a database error.";
        } else {
          if (data.length === 0) {
            context = "No inventory data found for your branch.";
          } else {
            // Summarize inventory as a string (show up to 10 items)
            const summary = data.slice(0, 10).map(row =>
              `${row.raw_mats}: ${row.quantity} ${row.unit} (${row.status})`
            ).join('; ');
            context = `Current inventory for your branch: ${summary}${data.length > 10 ? ' ...and more.' : ''}`;
          }
        }
      }

      // Build the prompt for the AI
      const messages = [];
      if (context) {
        messages.push({ role: 'system', content: context });
      }
      // Add previous conversation history
      for (const msg of this.conversationHistory) {
        messages.push(msg);
      }
      // Add the new user message
      messages.push({ role: 'user', content: message });

      // Call OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': document.title || 'Affotako AI Assistant'
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: messages,
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (!response.ok || !data.choices || !data.choices[0]?.message?.content) {
        let errorMsg = data.error?.message || 'No valid response from OpenRouter API.';
        throw new Error(errorMsg);
      }

      const aiResponse = data.choices[0].message.content;
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({ role: 'assistant', content: aiResponse });

      await this.storeConversation(message, aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  async storeConversation(userMessage, aiResponse) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_message: userMessage,
            ai_response: aiResponse,
            timestamp: new Date().toISOString(),
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing conversation:', error);
      throw error;
    }
  }

  async getConversationHistory() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }

  clearContext() {
    this.context = {};
    this.conversationHistory = [];
  }
}

export default AIAgent; 