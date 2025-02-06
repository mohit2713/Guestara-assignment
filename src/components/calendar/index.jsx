import React, { useState, useEffect } from 'react';
import TimelineGrid from '../calendar/TimelineGrid';
import DatePickerPopup from '../calendar/DatePickerPopup';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { LOCAL_STORAGE_KEYS, saveToLocalStorage, getFromLocalStorage } from '../../utils/localStorage';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [events, setEvents] = useState(() => {
    // Initialize events from localStorage or empty array
    return getFromLocalStorage(LOCAL_STORAGE_KEYS.EVENTS, []);
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  
  const resources = Array.from({ length: 15 }, (_, index) => ({
    id: String.fromCharCode(65 + index),
    name: `Resource ${String.fromCharCode(65 + index)}`
  }));

  // Save events to localStorage whenever they change
  useEffect(() => {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.EVENTS, events);
  }, [events]);

  const handleAddEvent = (newEvent) => {
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents, newEvent];
      return updatedEvents;
    });
  };

  const handleUpdateEvent = (updatedEvent) => {
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
      return updatedEvents;
    });
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(prevEvents => {
      const updatedEvents = prevEvents.filter(event => event.id !== eventId);
      return updatedEvents;
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <div>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-2xl text-blue-500 font-normal hover:text-blue-400"
          >
            {format(currentDate, 'MMMM yyyy')}
          </button>
          
          {showDatePicker && (
            <DatePickerPopup
              selectedDate={currentDate}
              onDateSelect={(date) => {
                setCurrentDate(date);
                setShowDatePicker(false);
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>
        <div className="flex items-center">
          <button 
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeftIcon className="w-5 h-5 text-blue-500" />
          </button>
          <button 
            onClick={handleToday}
            className="text-blue-500 hover:text-blue-400 px-4"
          >
            Today
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRightIcon className="w-5 h-5 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto">
        <TimelineGrid 
          currentDate={currentDate} 
          resources={resources}
          events={events}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      </div>
    </div>
  );
};

export default Calendar;