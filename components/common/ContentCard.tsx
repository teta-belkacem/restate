import React, { ReactNode } from 'react';

interface ContentCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * A reusable card component for content sections with an enhanced shadow
 */
const ContentCard: React.FC<ContentCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 mb-6 ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      {children}
    </div>
  );
};

export default ContentCard;
