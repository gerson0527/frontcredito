import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSpanishQuotes, type Quote } from '../services/quotes.service';

export function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const fetchedQuotes = await getSpanishQuotes();
        setQuotes(fetchedQuotes);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar las frases motivacionales');
        setIsLoading(false);
      }
    }
    loadQuotes();
  }, []);

  useEffect(() => {
    if (quotes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % quotes.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="login-loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="login-error-text text-white">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <blockquote className="quote-text text-2xl font-light italic text-white">
            "{quotes[currentIndex]?.text}"
            <footer className="quote-author text-lg mt-2 text-white">- {quotes[currentIndex]?.author}</footer>
          </blockquote>
        </motion.div>
      </AnimatePresence> 
    </div>
  );
}