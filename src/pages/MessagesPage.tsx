import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { 
  Search, Send, Phone, Video, Paperclip, MoreVertical,
  ArrowLeft, Smile, Image
} from 'lucide-react';
import { usePageLoading } from '../hooks/usePageLoading';
import { useToast } from '../context/ToastContext';
import { LoadingScreen } from '../components/ui';

export default function MessagesPage() {
  const { currentUser } = useApp();
  const { conversations, addMessage, readConversation } = useData();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const loading = usePageLoading();
  const { addToast } = useToast();

  const currentConv = conversations.find(c => c.id === selectedConversation);

  const filteredConversations = conversations.filter(c => 
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    try {
      addMessage(selectedConversation, {
        senderId: currentUser?.id || '1',
        senderName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Kofi Mensah',
        content: messageInput,
        timestamp: new Date(),
        type: 'text'
      });
      setMessageInput('');
    } catch {
      addToast("Erreur lors de l'envoi du message", 'error');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (loading) return <LoadingScreen message="Chargement..." />;
  return (
    <div className="h-[calc(100vh-8rem)] dark:bg-gray-800 bg-white rounded-2xl shadow-sm border dark:border-gray-700 border-gray-100 overflow-hidden flex">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r dark:border-gray-700 border-gray-100 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Search */}
        <div className="p-4 border-b dark:border-gray-700 border-gray-100">
          <h2 className="text-lg font-semibold dark:text-gray-100 text-gray-800 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 dark:bg-gray-800/50 bg-gray-50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedConversation(conv.id);
                setShowMobileChat(true);
                readConversation(conv.id);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 dark:hover:bg-gray-700 hover:bg-gray-50 transition-colors ${
                selectedConversation === conv.id ? 'dark:bg-blue-900/30 bg-blue-50' : ''
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="dark:text-blue-400 text-blue-600 font-medium">
                    {conv.participantName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className={`truncate ${conv.unread > 0 ? 'font-semibold dark:text-gray-100 text-gray-800' : 'font-medium dark:text-gray-300 text-gray-600'}`}>
                    {conv.participantName}
                  </span>
                  <span className="text-xs dark:text-gray-500 text-gray-400 flex-shrink-0 ml-2">{formatTime(conv.lastMessageTime)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs dark:text-gray-400 text-gray-500 truncate">{conv.participantPosition}</p>
                  {conv.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {currentConv && (
        <div className={`flex-1 flex flex-col ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700 border-gray-100">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} className="dark:text-gray-300 text-gray-600" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="dark:text-blue-400 text-blue-600 font-medium text-sm">
                    {currentConv.participantName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {currentConv.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <p className="font-medium dark:text-gray-100 text-gray-800">{currentConv.participantName}</p>
                <p className="text-xs dark:text-gray-400 text-gray-500">
                  {currentConv.online ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone size={18} className="dark:text-gray-400 text-gray-500" />
              </button>
              <button className="p-2 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Video size={18} className="dark:text-gray-400 text-gray-500" />
              </button>
              <button className="p-2 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical size={18} className="dark:text-gray-400 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentConv.messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMe ? 'order-1' : ''}`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:text-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <p className={`text-xs dark:text-gray-500 text-gray-400 mt-1 ${isMe ? 'text-right' : ''}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <div className="border-t dark:border-gray-700 border-gray-100 p-3">
            <div className="flex items-center space-x-2">
              <button className="p-2 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip size={18} className="dark:text-gray-400 text-gray-500" />
              </button>
              <button className="p-2 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Image size={18} className="dark:text-gray-400 text-gray-500" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm"
              />
              <button className="p-2 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Smile size={18} className="dark:text-gray-400 text-gray-500" />
              </button>
              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentConv && (
        <div className="flex-1 hidden md:flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 dark:bg-blue-900/30 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-gray-100 text-gray-800 mb-1">Sélectionnez une conversation</h3>
            <p className="dark:text-gray-400 text-gray-500 text-sm">Choisissez un contact pour commencer à discuter</p>
          </div>
        </div>
      )}
    </div>
  );
}
