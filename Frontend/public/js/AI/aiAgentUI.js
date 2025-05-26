import AIAgent from './aiAgent.js';

class AIAgentUI {
  constructor() {
    this.agent = new AIAgent();
    this.messages = [];
    this.initialized = false;
    this.isOpen = false;
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
    const chatToggle = document.getElementById('chatToggle');
    const minimizeChat = document.getElementById('minimizeChat');
    const chatWindow = document.getElementById('chatWindow');
    const clearButton = document.getElementById('clearChat');

    // Chat toggle functionality
    if (chatToggle && chatWindow && minimizeChat) {
      chatToggle.addEventListener('click', () => this.toggleChat());
      minimizeChat.addEventListener('click', () => this.toggleChat());
    }

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

    // Add welcome message
    this.addMessageToUI('assistant', 'Hello! How can I assist you today?');
  }

  toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const chatToggle = document.getElementById('chatToggle');
    
    if (!this.isOpen) {
      // Opening chat
      chatWindow.classList.remove('hidden', 'scale-95', 'opacity-0');
      chatWindow.classList.add('scale-100', 'opacity-100');
      chatToggle.classList.add('rotate-180');
    } else {
      // Closing chat
      chatWindow.classList.add('scale-95', 'opacity-0');
      chatToggle.classList.remove('rotate-180');
      setTimeout(() => {
        chatWindow.classList.add('hidden');
      }, 300);
    }
    
    this.isOpen = !this.isOpen;
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
    messageBubble.className = `inline-block p-3 rounded-lg max-w-[80%] ${
      role === 'user' 
        ? 'bg-[#B60205] text-white ml-auto' 
        : role === 'error'
        ? 'bg-red-100 text-red-800'
        : 'bg-white shadow-md text-gray-800'
    }`;
    
    // Add typing animation for assistant messages
    if (role === 'assistant' && content === 'Thinking...') {
      messageBubble.innerHTML = '<div class="flex gap-1"><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div></div>';
    } else {
      messageBubble.textContent = content;
    }

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
      if (history && history.length > 0) {
        history.reverse().forEach(conversation => {
          this.addMessageToUI('user', conversation.user_message);
          this.addMessageToUI('assistant', conversation.ai_response);
        });
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  }

  async handleClearChat() {
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    try {
      await this.agent.deleteConversationHistory();
    } catch (error) {
      this.addMessageToUI('error', 'Failed to clear chat history.');
    }
    // Optionally, show a fresh welcome message
    this.addMessageToUI('assistant', 'Hello! How can I assist you today?');
  }
}

// Initialize AI Agent UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const aiAgentUI = new AIAgentUI();
  aiAgentUI.initialize();
}); 