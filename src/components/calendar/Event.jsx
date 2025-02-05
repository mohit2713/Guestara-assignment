import React, { useState, useRef } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const Event = ({ event, onDelete, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const eventRef = useRef(null);
  const initialPosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    const rect = eventRef.current.getBoundingClientRect();
    
    setIsDragging(true);
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    initialPosition.current = {
      x: rect.left,
      y: rect.top
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const x = e.clientX - offset.x;
    const y = e.clientY - offset.y;

    eventRef.current.style.transform = `translate(${x}px, ${y}px)`;
    eventRef.current.style.zIndex = 1000;
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;

    setIsDragging(false);
    
    // Get the element under the cursor
    const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
    const cell = elemBelow?.closest('.calendar-cell');
    
    if (cell) {
      const resourceId = cell.dataset.resourceId;
      const date = cell.dataset.date;
      const cellRect = cell.getBoundingClientRect();
      const relativeY = e.clientY - cellRect.top;

      if (onUpdate) {
        onUpdate({
          ...event,
          resourceId,
          startDate: date,
          top: relativeY
        });
      }
    } else {
      // Reset position if not dropped on a valid cell
      eventRef.current.style.transform = 'translate(0, 0)';
    }

    eventRef.current.style.zIndex = 'auto';
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={eventRef}
      className={`absolute left-1 right-1 rounded-md select-none cursor-move
        ${isDragging ? 'shadow-lg opacity-90' : ''} 
        transition-shadow duration-200`}
      style={{
        backgroundColor: event.color || '#3B82F6',
        top: event.top || 0,
        height: event.height || 60,
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="p-2 text-white h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium truncate">{event.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event);
            }}
            className="text-white hover:text-red-200 ml-2"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs">
          {event.startTime} - {event.endTime}
        </div>
      </div>
    </div>
  );
};

export default Event;
