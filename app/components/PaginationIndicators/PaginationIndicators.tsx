'use client';

import { useState, useEffect } from 'react';

interface PaginationIndicatorsProps {
  totalPages?: number;
}

const PaginationIndicators = ({ totalPages = 5 }: PaginationIndicatorsProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Get viewport height
      const viewportHeight = window.innerHeight;
      
      // Calculate which section we're on based on scroll position
      const scrollPosition = window.scrollY + viewportHeight / 2;
      
      // Get total document height
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate progress percentage
      const progress = scrollPosition / (documentHeight - viewportHeight);
      
      // Determine current page based on progress
      const page = Math.min(
        Math.floor(progress * totalPages),
        totalPages - 1
      );
      
      setCurrentPage(page);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalPages]);

  const handlePageClick = (pageIndex: number) => {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const sectionHeight = (documentHeight - viewportHeight) / totalPages;
    const scrollPosition = sectionHeight * pageIndex;
    
    window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
  };

  return (
    <div className="hidden lg:flex flex-col gap-3 fixed right-8 top-1/2 -translate-y-1/2 z-40">
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => handlePageClick(index)}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            index === currentPage
              ? 'bg-blue-600 w-3 h-3'
              : 'bg-gray-300 hover:bg-gray-400'
          }`}
          aria-label={`Go to page ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default PaginationIndicators;
