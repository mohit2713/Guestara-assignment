import React, { useState, useEffect } from 'react';

const EventModal = ({ event, onSave, onClose, onDelete }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update form when event is selected for editing
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      // Convert time format if needed (e.g., "9:00 AM" to "09:00")
      setStartTime(event.startTime || '09:00');
      setEndTime(event.endTime || '10:00');
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Preserve all existing event data and only update what changed
    const updatedEvent = {
      ...(event || {}), // Keep all existing event data if editing
      title,
      startTime,
      endTime,
    };

    onSave(updatedEvent);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(event.id);
    onClose();
  };

  const formatTimeForInput = (time) => {
    if (!time) return '';
    // Handle different time formats if needed
    return time.includes('AM') || time.includes('PM') 
      ? convertTo24Hour(time) 
      : time;
  };

  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {showDeleteConfirm ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Delete Event</h2>
            <p className="mb-4">Are you sure you want to delete this event?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {event ? 'Edit Event' : 'New Event'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  value={formatTimeForInput(startTime)}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  value={formatTimeForInput(endTime)}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border rounded-md p-2"
                  required
                />
              </div>
              <div className="flex justify-between">
                {event && ( // Only show delete button for existing events
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
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
          </>
        )}
      </div>
    </div>
  );
};

export default EventModal; 