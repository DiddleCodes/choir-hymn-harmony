// Utility functions for text formatting

export const toSentenceCase = (text: string): string => {
  if (!text) return text;
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Capitalize the first word
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      // Keep certain words lowercase unless they're proper nouns
      const keepLowercase = ['and', 'or', 'but', 'nor', 'for', 'so', 'yet', 'a', 'an', 'the', 'in', 'on', 'at', 'by', 'to', 'of', 'for', 'with'];
      
      if (keepLowercase.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-primary/20 text-primary rounded px-1">$1</mark>');
};
