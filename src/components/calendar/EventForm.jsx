import { useState } from 'react';
import { format } from 'date-fns';

const EventForm = ({ event, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date ? format(new Date(event.date), 'yyyy-MM-dd') : '',
    color: event?.color || '#3B82F6',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...event,
      ...formData,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          className="mt-1 block w-full"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EventForm; 