'use client';

import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const sections = content.split(/\n\n+/);

  const parseInline = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-bark">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-semibold text-bark">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
  };

  return (
    <div className={`space-y-3 text-stone leading-relaxed ${className}`}>
      {sections.map((section, idx) => {
        const lines = section.split('\n');
        const hasListItems = lines.some((line) => line.trim().match(/^[\-\*•]\s/));

        if (hasListItems) {
          const elements: React.ReactNode[] = [];
          let currentList: React.ReactNode[] = [];

          lines.forEach((line, lineIdx) => {
            if (line.trim().match(/^[\-\*•]\s/)) {
              const cleanLine = line.replace(/^[\s]*[\-\*•]\s/, '');
              currentList.push(
                <li
                  key={`li-${idx}-${lineIdx}`}
                  dangerouslySetInnerHTML={{ __html: parseInline(cleanLine) }}
                  className="ml-1"
                />
              );
            } else {
              if (currentList.length > 0) {
                elements.push(
                  <ul key={`ul-${idx}-${lineIdx}`} className="list-disc pl-5 space-y-1.5 marker:text-earth">
                    {[...currentList]}
                  </ul>
                );
                currentList = [];
              }
              if (line.trim()) {
                elements.push(
                  <p key={`p-${idx}-${lineIdx}`} dangerouslySetInnerHTML={{ __html: parseInline(line) }} />
                );
              }
            }
          });

          if (currentList.length > 0) {
            elements.push(
              <ul key={`ul-end-${idx}`} className="list-disc pl-5 space-y-1.5 marker:text-earth">
                {currentList}
              </ul>
            );
          }

          return <div key={idx}>{elements}</div>;
        }

        return <p key={idx} dangerouslySetInnerHTML={{ __html: parseInline(section) }} />;
      })}
    </div>
  );
};



