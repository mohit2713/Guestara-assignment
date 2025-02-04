import React, { useState } from 'react';
import { format } from 'date-fns';

const EventModal = ({ 
  event, 
  startDate, 
  endDate, 
  resourceId, 
  onSave, 
  onClose, 
  onDelete 
}) => {
  const [title, setTitle] = useState(event?.title || 'New event');
  const [startTime, setStartTime] = useState(event?.startTime || '09:00');
  const [endTime, setEndTime] = useState(event?.endTime || '17:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Convert times to 12-hour format for display
      const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return format(date, 'h:mm a');
      };

      const eventData = {
        id: event?.id || Date.now().toString(),
        title,
        startDate: format(startDate || new Date(), 'yyyy-MM-dd'),
        endDate: format(endDate || startDate || new Date(), 'yyyy-MM-dd'),
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        resourceId,
        color: event?.color || '#3B82F6'
      };

      console.log('Saving event:', eventData); // Debug log
      onSave(eventData);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please check the time format.');
    }
  };

  const handleTimeChange = (type, value) => {
    try {
      if (type === 'start') {
        setStartTime(value);
      } else {
        setEndTime(value);
      }
    } catch (error) {
      console.error(`Error setting ${type} time:`, error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {event ? 'Edit Event' : 'New Event'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              {onDelete && event && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(event.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal; 