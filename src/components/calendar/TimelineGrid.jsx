import React, { useState, useRef } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, differenceInDays, parseISO, addDays, parse, isSameDay } from 'date-fns';
import EventModal from '../Calendar/EventModal';

const TimelineGrid = ({ currentDate, resources, events, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const gridRef = useRef(null);

  const HOUR_HEIGHT = 40;
  const MINUTES_PER_PIXEL = 0.5; // Adjust this to control drag sensitivity

  // Updated event colors with opacity variations
  const eventColors = [
    { bg: 'rgba(65, 105, 225, 0.8)', hover: 'rgba(65, 105, 225, 1)' }, // Royal Blue
    { bg: 'rgba(80, 200, 120, 0.8)', hover: 'rgba(80, 200, 120, 1)' }, // Emerald Green
    { bg: 'rgba(255, 107, 107, 0.8)', hover: 'rgba(255, 107, 107, 1)' }, // Coral Red
    { bg: 'rgba(147, 112, 219, 0.8)', hover: 'rgba(147, 112, 219, 1)' }, // Medium Purple
    { bg: 'rgba(32, 178, 170, 0.8)', hover: 'rgba(32, 178, 170, 1)' }, // Light Sea Green
    { bg: 'rgba(255, 140, 0, 0.8)', hover: 'rgba(255, 140, 0, 1)' }, // Dark Orange
    { bg: 'rgba(186, 85, 211, 0.8)', hover: 'rgba(186, 85, 211, 1)' }, // Medium Orchid
    { bg: 'rgba(70, 130, 180, 0.8)', hover: 'rgba(70, 130, 180, 1)' }, // Steel Blue
  ];

  const getEventColor = (eventId) => {
    const colorIndex = eventId % eventColors.length;
    return eventColors[colorIndex];
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handleMouseDown = (resourceId, date) => {
    // Only start drag if not clicking on an existing event
    setIsDragging(true);
    setDragStart({ resourceId, date });
    setDragEnd({ resourceId, date });
    setSelectedResource(resourceId);
  };

  const handleMouseMove = (resourceId, date) => {
    if (isDragging) {
      setDragEnd({ resourceId, date });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Only show modal if we have valid start and end dates
      if (dragStart && dragEnd) {
        setShowEventModal(true);
      }
    }
  };

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedResource(event.resourceId);
    setShowEventModal(true);
  };

  const formatDate = (date) => {
    if (!date) return null;
    // Handle both Date objects and string dates
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  };

  const handleSaveEvent = (eventData) => {
    try {
      if (selectedEvent) {
        onUpdateEvent({
          ...selectedEvent,
          ...eventData,
        });
      } else {
        onAddEvent({
          ...eventData,
          resourceId: selectedResource,
          startDate: format(dragStart?.date || new Date(), 'yyyy-MM-dd'),
          endDate: format(dragEnd?.date || dragStart?.date || new Date(), 'yyyy-MM-dd'),
        });
      }
      setShowEventModal(false);
      setSelectedEvent(null);
      setDragStart(null);
      setDragEnd(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Grid layout constants
  const RESOURCE_COLUMN_WIDTH = 200; // Increased width for resource names
  const MIN_CELL_WIDTH = 70; // Minimum width for day cells
  const BASE_ROW_HEIGHT = 60;
  const EVENT_HEIGHT = 36;
  const EVENT_SPACING = 8;
  const CELL_PADDING = 4;

  // Calculate maximum events in any cell for each resource
  const getResourceMaxEvents = (resourceId) => {
    const resourceEvents = events.filter(event => event.resourceId === resourceId);
    const eventsByDay = {};
    
    resourceEvents.forEach(event => {
      const day = format(new Date(event.startDate), 'yyyy-MM-dd');
      eventsByDay[day] = (eventsByDay[day] || 0) + 1;
    });

    return Math.max(1, ...Object.values(eventsByDay));
  };

  const calculateEventPosition = (eventIndex) => {
    return CELL_PADDING + (eventIndex * (EVENT_HEIGHT + EVENT_SPACING));
  };

  const handleEventDragStart = (e, event) => {
    e.stopPropagation();
    setDraggedEvent(event);
    
    // Store initial position and time
    const initialX = e.clientX;
    const [hours, minutes] = event.startTime.split(':').map(Number);
    setDragStart({
      x: initialX,
      initialMinutes: hours * 60 + minutes
    });
  };

  const handleEventDrag = (e, resourceId) => {
    if (!draggedEvent || !dragStart) return;

    // Calculate time adjustment based on drag distance
    const deltaX = e.clientX - dragStart.x;
    const minutesDelta = Math.round(deltaX * MINUTES_PER_PIXEL);
    
    // Update time
    let newMinutes = dragStart.initialMinutes + minutesDelta;
    newMinutes = Math.max(0, Math.min(23 * 60 + 59, newMinutes));
    
    const newHours = Math.floor(newMinutes / 60);
    const newMins = newMinutes % 60;

    // Create updated event with new time
    const updatedEvent = {
      ...draggedEvent,
      startTime: `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`,
      resourceId
    };
    
    setDraggedEvent(updatedEvent);
  };

  const handleEventDragEnd = () => {
    if (draggedEvent) {
      onUpdateEvent(draggedEvent);
    }
    setDraggedEvent(null);
    setDragStart(null);
  };

  const renderEvent = (event, resourceId) => {
    const isBeingDragged = draggedEvent?.id === event.id;
    const displayEvent = isBeingDragged ? draggedEvent : event;
    const [startHour, startMinute] = displayEvent.startTime.split(':').map(Number);
    const top = (startHour + startMinute / 60) * HOUR_HEIGHT;

    return (
      <div
        key={event.id}
        draggable
        className="absolute left-1 right-1 rounded-md cursor-move"
        style={{
          top: `${top}px`,
          height: '60px',
          backgroundColor: event.color || '#3B82F6',
          opacity: isBeingDragged ? 0.7 : 1,
          zIndex: isBeingDragged ? 100 : 10
        }}
        onClick={() => {
          setSelectedEvent(event);
          setShowEventModal(true);
        }}
        onDragStart={(e) => handleEventDragStart(e, event)}
        onDrag={(e) => handleEventDrag(e, resourceId)}
        onDragEnd={handleEventDragEnd}
      >
        <div className="p-1 text-white h-full flex flex-col justify-between">
          <div className="text-sm font-medium truncate">
            {displayEvent.title}
          </div>
          <div className="text-xs">
            {displayEvent.startTime} - {displayEvent.endTime}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="relative overflow-x-auto" 
      ref={gridRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
      }}
    >
      <div className="grid" style={{
        gridTemplateColumns: `${RESOURCE_COLUMN_WIDTH}px repeat(${daysInMonth.length}, minmax(${MIN_CELL_WIDTH}px, 1fr))`,
        width: `max-content` // Ensures grid takes full width of content
      }}>
        {/* Header Row */}
        <div 
          className="sticky left-0 z-20 bg-white border-b border-r h-14"
          style={{ width: RESOURCE_COLUMN_WIDTH }}
        >
          {/* Empty cell above resources */}
        </div>

        {/* Date Headers */}
        {daysInMonth.map((day) => (
          <div 
            key={day.toString()} 
            className={`border-b border-r p-2 h-14 ${
              isToday(day) ? 'bg-blue-50' : ''
            }`}
            style={{ minWidth: MIN_CELL_WIDTH }}
          >
            <div className="text-center">
              <div className="text-sm font-medium">{format(day, 'd')}</div>
              <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
            </div>
          </div>
        ))}

        {resources.map((resource) => {
          const maxEventsInRow = getResourceMaxEvents(resource.id);
          const rowHeight = Math.max(
            BASE_ROW_HEIGHT, 
            CELL_PADDING * 2 + (maxEventsInRow * (EVENT_HEIGHT + EVENT_SPACING))
          );

          return (
            <React.Fragment key={resource.id}>
              {/* Resource name cell */}
              <div 
                className="sticky left-0 z-10 bg-white border-b border-r pl-2 pt-1 flex"
                style={{ 
                  height: `${rowHeight}px`,
                  width: RESOURCE_COLUMN_WIDTH
                }}
              >
                <span className="font-medium text-sm truncate">{resource.name}</span>
              </div>

              {/* Day cells */}
              {daysInMonth.map((day) => {
                const cellEvents = events.filter(event => {
                  try {
                    const eventStartDate = formatDate(event.startDate);
                    return event.resourceId === resource.id && 
                           eventStartDate === formatDate(day);
                  } catch (error) {
                    console.error('Error filtering events:', error);
                    return false;
                  }
                });

                return (
                  <div
                    key={`${resource.id}-${day}`}
                    className="border-b border-r p-1 relative"
                    style={{ 
                      height: `${rowHeight}px`,
                      minWidth: MIN_CELL_WIDTH
                    }}
                    onMouseDown={(e) => {
                      if (!e.target.closest('.event-item')) {
                        handleMouseDown(resource.id, day);
                      }
                    }}
                    onMouseMove={() => handleMouseMove(resource.id, day)}
                  >
                    {cellEvents.map((event, index) => {
                      try {
                        const eventColor = getEventColor(event.id);
                        const top = calculateEventPosition(index);
                        const width = event.startDate && event.endDate
                          ? (differenceInDays(
                              new Date(event.endDate),
                              new Date(event.startDate)
                            ) + 1) * 100
                          : 100;
                        
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(e, event)}
                            className="event-item absolute left-0.5 right-0.5 rounded-md px-2 py-1 
                              text-sm cursor-pointer transition-all duration-200 ease-in-out
                              hover:shadow-md"
                            style={{ 
                              backgroundColor: eventColor.bg,
                              width: `${width}%`,
                              height: `${EVENT_HEIGHT}px`,
                              top: `${top}px`,
                              zIndex: isDragging ? 10 : index + 1,
                              opacity: 0.9,
                            }}
                          >
                            <div className="flex flex-col justify-center h-full overflow-hidden">
                              <span className="font-medium text-xs truncate">{event.title}</span>
                              <span className="text-[10px] opacity-90 truncate">
                                {event.startTime || ''} - {event.endTime || ''}
                              </span>
                            </div>
                          </div>
                        );
                      } catch (error) {
                        console.error('Error rendering event:', error);
                        return null;
                      }
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          startDate={dragStart?.date}
          endDate={dragEnd?.date}
          resourceId={selectedResource}
          onSave={handleSaveEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setDragStart(null);
            setDragEnd(null);
          }}
          onDelete={selectedEvent ? onDeleteEvent : undefined}
          getEventColor={getEventColor}
        />
      )}
    </div>
  );
};

export default TimelineGrid;

