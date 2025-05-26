import AIAgent from './aiAgent.js';

class AIAgentUI {
  constructor() {
    this.agent = new AIAgent();
    this.messages = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.agent.initialize();
      this.setupEventListeners();
      await this.loadConversationHistory();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AI Agent UI:', error);
    }
  }

  setupEventListeners() {
    const sendButton = document.getElementById('sendMessage');
    const messageInput = document.getElementById('messageInput');
    const clearButton = document.getElementById('clearChat');

    if (sendButton && messageInput) {
      sendButton.addEventListener('click', () => this.handleSendMessage());
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSendMessage();
        }
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', () => this.handleClearChat());
    }
  }

  async handleSendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;

    // Clear input
    messageInput.value = '';

    // Add user message to UI
    this.addMessageToUI('user', message);

    try {
      // Show loading state
      const loadingMessage = this.addMessageToUI('assistant', 'Thinking...');
      
      // Get AI response
      const response = await this.agent.processMessage(message);
      
      // Remove loading message
      this.removeLastMessage();
      
      // Add AI response to UI
      this.addMessageToUI('assistant', response);
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessageToUI('error', 'Sorry, I encountered an error. Please try again.');
    }
  }

  addMessageToUI(role, content) {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return null;

    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${role === 'user' ? 'text-right' : ''}`;

    const messageBubble = document.createElement('div');
    messageBubble.className = `inline-block p-3 rounded-lg ${
      role === 'user' 
        ? 'bg-[#B60205] text-white' 
        : role === 'error'
        ? 'bg-red-100 text-red-800'
        : 'bg-gray-100 text-gray-800'
    }`;
    messageBubble.textContent = content;

    messageDiv.appendChild(messageBubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageDiv;
  }

  removeLastMessage() {
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer && messagesContainer.lastChild) {
      messagesContainer.removeChild(messagesContainer.lastChild);
    }
  }

  async loadConversationHistory() {
    try {
      const history = await this.agent.getConversationHistory();
      history.reverse().forEach(conversation => {
        this.addMessageToUI('user', conversation.user_message);
        this.addMessageToUI('assistant', conversation.ai_response);
      });
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  handleClearChat() {
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    this.agent.clearContext();
  }
}

// Initialize AI Agent UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const aiAgentUI = new AIAgentUI();
  aiAgentUI.initialize();
}); 