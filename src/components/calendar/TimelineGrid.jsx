import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import Event from './Event';
import AlertDialog from '../common/AlertDialog';

const TimelineGrid = ({ currentDate, resources, events, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const gridRef = useRef(null);

  const EVENT_HEIGHT = 60;
  const MIN_CELL_HEIGHT = 120;
  const PADDING = 4;

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

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

  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteAlert(true);
  };

  return (
    <div 
      ref={gridRef} 
      className="relative overflow-auto"
    >
      <div className="grid" style={{
        gridTemplateColumns: `200px repeat(${daysInMonth.length}, minmax(120px, 1fr))`,
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
              isToday(day) ? 'bg-blue-50' : ''
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
          const rowHeight = getRowHeight(resource.id);
          
          return (
            <React.Fragment key={resource.id}>
              {/* Resource name cell */}
              <div 
                className="sticky left-0 z-10 bg-white border-b border-r p-2"
                style={{ height: `${rowHeight}px` }}
              >
                <span className="font-medium">{resource.name}</span>
              </div>

              {/* Day cells */}
              {daysInMonth.map((day) => (
                <div
                  key={`${resource.id}-${day}`}
                  className="calendar-cell relative border-b border-r"
                  style={{ 
                    height: `${rowHeight}px`,
                    minWidth: '120px',
                    padding: `${PADDING}px`
                  }}
                  data-resource-id={resource.id}
                  data-date={format(day, 'yyyy-MM-dd')}
                  onClick={(e) => handleCellClick(e, resource.id, day)}
                >
                  {events
                    .filter(event => 
                      event.resourceId === resource.id && 
                      format(new Date(event.startDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                    )
                    .map(event => (
                      <Event
                        key={event.id}
                        event={{
                          ...event,
                          height: EVENT_HEIGHT
                        }}
                        onDelete={() => handleDeleteEvent(event)}
                        onUpdate={onUpdateEvent}
                      />
                    ))}
                </div>
              ))}
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
    </div>
  );
};

export default TimelineGrid;

