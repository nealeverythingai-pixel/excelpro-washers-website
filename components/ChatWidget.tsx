"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  options?: { label: string; action: string }[];
};

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    id: "init",
    text: "Hi there! 👋 Welcome to ExcelPro Washers. How can I help you today?",
    sender: "bot",
    options: [
      { label: "Get a Quote", action: "quote" },
      { label: "Our Services", action: "services" },
      { label: "Contact Info", action: "contact" },
    ],
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([initialMessage]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleOptionClick = (action: string, label: string) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: label,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botMsg: Message;

      switch (action) {
        case "quote":
          botMsg = {
            id: Date.now().toString() + "b",
            text: "Great! The fastest way to get a quote is to fill out our online form. It takes less than a minute.",
            sender: "bot",
            options: [
              { label: "Open Quote Form", action: "open_form" },
              { label: "Back to Menu", action: "menu" },
            ],
          };
          break;
        case "services":
          botMsg = {
            id: Date.now().toString() + "b",
            text: "We specialize in:\n• Interior Window Cleaning\n• Post-Reno Cleaning\n• Commercial Maintenance\n\nMinimum visit is $200.",
            sender: "bot",
            options: [
              { label: "Get a Quote", action: "quote" },
              { label: "Back to Menu", action: "menu" },
            ],
          };
          break;
        case "contact":
          botMsg = {
            id: Date.now().toString() + "b",
            text: `You can reach us at:\n📞 ${siteConfig.business.phone}\n📧 ${siteConfig.business.email}`,
            sender: "bot",
            options: [
              { label: "Call Now", action: "call" },
              { label: "Back to Menu", action: "menu" },
            ],
          };
          break;
        case "open_form":
          window.open(siteConfig.business.googleFormUrl, "_blank");
          botMsg = {
            id: Date.now().toString() + "b",
            text: "I've opened the form for you! Let me know if you need anything else.",
            sender: "bot",
            options: [{ label: "Back to Menu", action: "menu" }],
          };
          break;
        case "call":
          window.location.href = `tel:${siteConfig.business.phone}`;
          botMsg = {
            id: Date.now().toString() + "b",
            text: "Calling now...",
            sender: "bot",
            options: [{ label: "Back to Menu", action: "menu" }],
          };
          break;
        case "menu":
          botMsg = initialMessage;
          break;
        default:
          botMsg = {
            id: Date.now().toString() + "b",
            text: "I'm not sure about that. Would you like to speak to a human?",
            sender: "bot",
            options: [
              { label: "Call Us", action: "call" },
              { label: "Back to Menu", action: "menu" },
            ],
          };
      }
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/sales") || pathname?.startsWith("/contractor")) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="bg-primary-600 dark:bg-primary-700 p-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1.5 rounded-full">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">ExcelPro Assistant</h3>
                  <p className="text-xs text-primary-100">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap",
                      msg.sender === "user"
                        ? "bg-primary-600 text-white rounded-br-none"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-100 dark:border-gray-600 rounded-bl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                  {msg.options && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.options.map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleOptionClick(option.action, option.label)}
                          className="text-xs bg-white dark:bg-gray-700 border border-primary-200 dark:border-gray-600 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="self-start bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 z-50 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
}
