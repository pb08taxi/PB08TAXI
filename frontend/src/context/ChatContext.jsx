import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext({
  isOpen: false,
  chatTarget: null,
  openChat: () => {},
  closeChat: () => {},
});

export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState(null);

  const openChat = (target) => {
    if (!target || !target.phone) return;
    setChatTarget({
      name: target.name || 'User',
      role: target.role || 'Customer', // 'Customer' | 'Driver'
      phone: target.phone,
      taxiReg: target.taxiReg || null,
      carName: target.carName || null,
      customerId: target.customerId || null,
      bookingRef: target.bookingRef || null,
      initialMessage: target.initialMessage || '',
    });
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <ChatContext.Provider value={{ isOpen, chatTarget, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useOpenWAChat = () => useContext(ChatContext);
