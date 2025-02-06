import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import Event from '../Calendar/Event';
import AlertDialog from '../common/AlertDialog';
import EventModal from '../Calendar/EventModal';
import EventDetailsModal from '../Calendar/EventDetailsModal';


const EVENT_COLORS = [
  { bg: '#3B82F6', hover: '#2563EB' }, // Blue
  { bg: '#EF4444', hover: '#DC2626' }, // Red
  { bg: '#10B981', hover: '#059669' }, // Green
  { bg: '#F59E0B', hover: '#D97706' }, // Yellow
  { bg: '#8B5CF6', hover: '#7C3AED' }, // Purple
  { bg: '#EC4899', hover: '#DB2777' }, // Pink
  { bg: '#6366F1', hover: '#4F46E5' }, // Indigo
  { bg: '#14B8A6', hover: '#0D9488' }, // Teal
];

const calculateCellHeight = (events) => {
  if (!events || !events.length) return BASE_ROW_HEIGHT;
  
  const totalEventHeight = events.length * (EVENT_HEIGHT + EVENT_SPACING);
  const heightWithPadding = CELL_PADDING * 2 + totalEventHeight;
  
  return Math.max(BASE_ROW_HEIGHT, heightWithPadding);
};

const TimelineGrid = ({ currentDate, resources, events, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const gridRef = useRef(null);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const EVENT_HEIGHT = 40;
  const MIN_CELL_HEIGHT = 80;
  const PADDING = 4;
  const BASE_ROW_HEIGHT = 80;
  const EVENT_SPACING = 4;
  const CELL_PADDING = 8;
  const MIN_CELL_WIDTH = 80;
  const RESOURCE_COLUMN_WIDTH = 190;

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');

  // Calculate row height based on maximum events in any cell of the row
  const getRowHeight = (resourceId) => {
    const resourceEvents = events.filter(event => event.resourceId === resourceId);
    let maxEventsInCell = 0;

    daysInMonth.forEach(day => {
      const cellEvents = resourceEvents.filter(event => 
        format(new Date(event.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      maxEventsInCell = Math.max(maxEventsInCell, cellEvents.length);
    });

    const height = Math.max(
      MIN_CELL_HEIGHT,
      (maxEventsInCell * EVENT_HEIGHT) + ((maxEventsInCell + 1) * PADDING)
    );
    
    return height;
  };

  // Find next available position in cell
  const findAvailablePosition = (cellEvents) => {
    let position = PADDING;
    const occupiedRanges = cellEvents.map(event => ({
      start: event.top,
      end: event.top + EVENT_HEIGHT
    })).sort((a, b) => a.start - b.start);

    for (let range of occupiedRanges) {
      if (position + EVENT_HEIGHT <= range.start) {
        return position;
      }
      position = range.end + PADDING;
    }

    return position;
  };

  const handleCellClick = (e, resourceId, date) => {
    e.stopPropagation();
    
    // Get events in this cell
    const cellEvents = events.filter(event => 
      event.resourceId === resourceId && 
      format(new Date(event.startDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    // Find next available position
    const newEventTop = findAvailablePosition(cellEvents);

    // Create new event
    const newEvent = {
      id: Date.now().toString(),
      title: 'New Event',
      startDate: format(date, 'yyyy-MM-dd'),
      endDate: format(date, 'yyyy-MM-dd'),
      resourceId: resourceId,
      startTime: '09:00',
      endTime: '10:00',
      top: newEventTop,
      height: EVENT_HEIGHT,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    onAddEvent(newEvent);
  };

  const handleDeleteEvent = (eventId) => {
    onDeleteEvent(eventId);
  };

  const handleEventDragStart = (e, event) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', event.id);
    setDraggedEvent(event);
  };

  const handleCellDragOver = (e, resourceId, date) => {
    e.preventDefault();
    
    const existingEvents = events.filter(event => 
      event.resourceId === resourceId && 
      formatDate(event.startDate) === formatDate(date) &&
      event.id !== draggedEvent?.id
    );

    if (existingEvents.length === 0) {
      setDragOverCell({ resourceId, date });
    } else {
      setDragOverCell(null);
    }
  };

  const handleCellDragLeave = () => {
    setDragOverCell(null);
  };

  const handleCellDrop = (e, resourceId, date) => {
    e.preventDefault();
    if (!draggedEvent) return;

    const updatedEvent = {
      ...draggedEvent,
      resourceId,
      startDate: format(date, 'yyyy-MM-dd')
    };

    onUpdateEvent(updatedEvent);
    setDraggedEvent(null);
    setDragOverCell(null);
  };

  const handleSaveEvent = (eventData) => {
    try {
      if (selectedEvent) {
        // Update existing event while preserving position and date
        onUpdateEvent({
          ...selectedEvent,
          ...eventData,
          resourceId: selectedEvent.resourceId,
          startDate: selectedEvent.startDate,
          endDate: selectedEvent.endDate,
        });
      } else {
        // Create new event with a string ID (more reliable for localStorage)
        const newEvent = {
          id: `event_${Date.now()}`,
          ...eventData,
          resourceId: selectedResource,
          startDate: format(dragStart?.date || new Date(), 'yyyy-MM-dd'),
          endDate: format(dragEnd?.date || dragStart?.date || new Date(), 'yyyy-MM-dd'),
        };

        onAddEvent(newEvent);
      }

      setShowEventModal(false);
      setSelectedEvent(null);
      setDragStart(null);
      setDragEnd(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const formatTimeWithAMPM = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderEvent = (event, resourceId) => {
    const isBeingDragged = draggedEvent?.id === event.id;
    const displayEvent = isBeingDragged ? draggedEvent : event;
    const eventColor = getEventColor(event.id);

    return (
      <div
        draggable="true"
        className="h-full rounded-md cursor-move select-none overflow-hidden shadow-sm hover:shadow-md transition-all group relative"
        style={{
          backgroundColor: eventColor.bg,
          opacity: isBeingDragged ? 0.7 : 1,
          zIndex: isBeingDragged ? 100 : 10,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedEvent(event);
          setShowDetailsModal(true);
        }}
        onDragStart={(e) => handleEventDragStart(e, event)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = eventColor.hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = eventColor.bg;
        }}
      >
        <div className="px-2 py-1 text-white h-full flex flex-col justify-between">
          <div className="text-sm font-medium truncate">
            {displayEvent.title}
          </div>
          <div className="text-xs opacity-75 truncate">
            {formatTimeWithAMPM(displayEvent.startTime)} - {formatTimeWithAMPM(displayEvent.endTime)}
          </div>
        </div>

        {/* Tooltip without caret */}
        <div className="absolute invisible group-hover:visible bg-gray-900 text-white p-2 rounded-md shadow-lg z-50 
                        whitespace-nowrap left-1/2 transform -translate-x-1/2 -translate-y-full -top-1
                        text-sm pointer-events-none">
          <div className="font-medium mb-1">{displayEvent.title}</div>
          <div className="text-xs">
            {formatTimeWithAMPM(displayEvent.startTime)} - {formatTimeWithAMPM(displayEvent.endTime)}
          </div>
        </div>
      </div>
    );
  };

  const getEventColor = (eventId) => {
    const colorIndex = typeof eventId === 'number' 
      ? eventId % EVENT_COLORS.length 
      : Math.abs(hashString(eventId)) % EVENT_COLORS.length;
    return EVENT_COLORS[colorIndex];
  };

  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  const getResourceMaxEvents = (resourceId) => {
    const resourceEvents = events.filter(event => event.resourceId === resourceId);
    const eventsByDay = {};
    
    resourceEvents.forEach(event => {
      const day = format(new Date(event.startDate), 'yyyy-MM-dd');
      eventsByDay[day] = (eventsByDay[day] || 0) + 1;
    });

    return Math.max(1, ...Object.values(eventsByDay));
  };

  return (
    <div 
      ref={gridRef} 
      className="relative overflow-auto"
    >
      <div className="grid" style={{
        gridTemplateColumns: `${RESOURCE_COLUMN_WIDTH}px repeat(${daysInMonth.length}, minmax(${MIN_CELL_WIDTH}px, 1fr))`,
        width: 'max-content'
      }}>
        {/* Header Row */}
        <div className="sticky left-0 z-20 bg-white border-b border-r h-14">
          {/* Empty cell above resources */}
        </div>

        {/* Date Headers */}
        {daysInMonth.map((day) => (
          <div 
            key={day.toString()} 
            className={`border-b border-r p-2 h-14 ${
              isToday(day) ? 'bg-blue-300' : ''
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">{format(day, 'd')}</div>
              <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
            </div>
          </div>
        ))}

        {/* Resource Rows */}
        {resources.map((resource) => {
          // Get all events for this resource
          const resourceEvents = events.filter(event => event.resourceId === resource.id);
          
          // Find the maximum number of events in any cell for this resource
          const maxEventsInRow = Math.max(
            ...daysInMonth.map(day => {
              const cellEvents = resourceEvents.filter(event => 
                formatDate(event.startDate) === formatDate(day)
              );
              return cellEvents.length;
            })
          );

          // Calculate row height based on maximum events
          const rowHeight = Math.max(
            BASE_ROW_HEIGHT,
            CELL_PADDING * 2 + (maxEventsInRow * (EVENT_HEIGHT + EVENT_SPACING))
          );

          return (
            <React.Fragment key={resource.id}>
              {/* Resource header cell */}
              <div 
                className="sticky left-0 z-20 bg-white border-b border-r pl-2 pt-1 flex"
                style={{ 
                  height: `${rowHeight}px`,
                  width: RESOURCE_COLUMN_WIDTH,
                  boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                }}
              >
                <span className="font-medium text-sm truncate">{resource.name}</span>
              </div>

              {/* Day cells */}
              {daysInMonth.map((day) => {
                const cellEvents = events.filter(event => 
                  event.resourceId === resource.id && 
                  formatDate(event.startDate) === formatDate(day)
                );

                return (
                  <div
                    key={`${resource.id}-${day}`}
                    className={`border-b border-r relative ${
                      dragOverCell?.resourceId === resource.id && 
                      isSameDay(dragOverCell?.date, day) ? 'bg-blue-50' : ''
                    }`}
                    style={{ 
                      height: `${rowHeight}px`,
                      minWidth: MIN_CELL_WIDTH,
                      marginLeft: 0
                    }}
                    onClick={() => {
                      if (!isDragging) {
                        setSelectedResource(resource.id);
                        setDragStart({ resourceId: resource.id, date: day });
                        setShowEventModal(true);
                      }
                    }}
                    onDragOver={(e) => handleCellDragOver(e, resource.id, day)}
                    onDragLeave={handleCellDragLeave}
                    onDrop={(e) => handleCellDrop(e, resource.id, day)}
                  >
                    <div className="absolute inset-0 p-1">
                      {cellEvents.map((event, index) => (
                        <div
                          key={event.id}
                          style={{
                            position: 'absolute',
                            top: `${CELL_PADDING + (index * (EVENT_HEIGHT + EVENT_SPACING))}px`,
                            left: '4px',
                            right: '4px',
                            height: `${EVENT_HEIGHT}px`,
                            maxWidth: '100%'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderEvent(event, resource.id)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {/* Delete Alert Dialog */}
      {showDeleteAlert && (
        <AlertDialog
          title="Delete Event"
          message="Are you sure you want to delete this event?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => {
            onDeleteEvent(eventToDelete.id);
            setShowDeleteAlert(false);
            setEventToDelete(null);
          }}
          onCancel={() => {
            setShowDeleteAlert(false);
            setEventToDelete(null);
          }}
        />
      )}

      {showDetailsModal && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEventModal(true);
          }}
        />
      )}

      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default TimelineGrid;

