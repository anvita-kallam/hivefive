import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { Calendar, Plus, ChevronLeft, ChevronRight, X, Bee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

function SimpleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const queryClient = useQueryClient();

  // Get start and end of month for querying events
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weekStart = startOfWeek(monthStart);
  const weekEnd = endOfWeek(monthEnd);

  // Fetch events for the current month
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['userCalendarEvents', monthStart.toISOString(), monthEnd.toISOString()],
    queryFn: async () => {
      const response = await api.get('/user-calendar', {
        params: {
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString()
        }
      });
      return response.data;
    }
  });

  // Create mutation for adding events
  const addEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await api.post('/user-calendar', eventData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userCalendarEvents']);
      setShowAddModal(false);
      setSelectedDate(null);
    }
  });

  // Update mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }) => {
      const response = await api.put(`/user-calendar/${id}`, eventData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userCalendarEvents']);
      setEditingEvent(null);
      setShowAddModal(false);
    }
  });

  // Delete mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/user-calendar/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userCalendarEvents']);
    }
  });

  // Get calendar days
  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [weekStart, weekEnd]);

  // Get events for a specific day
  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      return isSameDay(eventStart, day);
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setEditingEvent(null);
    setShowAddModal(true);
  };

  const handleEditEvent = (eventItem, e) => {
    e.stopPropagation();
    setEditingEvent(eventItem);
    setSelectedDate(new Date(eventItem.startTime));
    setShowAddModal(true);
  };

  const handleDeleteEvent = async (eventId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const handleSubmitEvent = (eventData) => {
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent._id, ...eventData });
    } else {
      addEventMutation.mutate(eventData);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="honey-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Bee className="w-6 h-6 text-honey-brown bee-icon" />
          <Calendar className="w-6 h-6 text-honey-amber" />
          <h2 className="text-2xl font-bold honey-text text-honey-brown">My Calendar</h2>
        </div>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setEditingEvent(null);
            setShowAddModal(true);
          }}
          className="honey-drop-button buzz-hover flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <Bee className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-[80px] p-2 border border-gray-200 rounded-lg cursor-pointer
                hover:bg-gray-50 transition-colors
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isToday ? 'ring-2 ring-primary-500' : ''}
              `}
            >
              <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map(eventItem => (
                  <div
                    key={eventItem._id}
                    className="text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: eventItem.color || '#3B82F6' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(eventItem, e);
                    }}
                    title={`${eventItem.title} - Click to edit`}
                  >
                    {format(new Date(eventItem.startTime), 'h:mm a')} - {eventItem.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <EventModal
            selectedDate={selectedDate}
            event={editingEvent}
            onClose={() => {
              setShowAddModal(false);
              setEditingEvent(null);
              setSelectedDate(null);
            }}
            onSubmit={handleSubmitEvent}
            isLoading={addEventMutation.isLoading || updateEventMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EventModal({ selectedDate, event, onClose, onSubmit, isLoading }) {
  // Helper function to create date with hours without mutating
  const createDateWithHours = (date, hours, minutes = 0) => {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const getInitialFormData = () => {
    if (event) {
      return {
        title: event.title || '',
        description: event.description || '',
        startTime: format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"),
        location: event.location || '',
        color: event.color || '#3B82F6',
        allDay: event.allDay || false
      };
    }
    if (selectedDate) {
      return {
        title: '',
        description: '',
        startTime: format(createDateWithHours(new Date(selectedDate), 9), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(createDateWithHours(new Date(selectedDate), 10), "yyyy-MM-dd'T'HH:mm"),
        location: '',
        color: '#3B82F6',
        allDay: false
      };
    }
    return {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      color: '#3B82F6',
      allDay: false
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Update form data when event or selectedDate changes
  useEffect(() => {
    const newFormData = getInitialFormData();
    setFormData(newFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?._id, event?.startTime, selectedDate?.toISOString()]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      location: formData.location,
      color: formData.color,
      allDay: formData.allDay
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {event ? 'Edit Event' : 'Add Event'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-2">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full ${formData.color === color ? 'ring-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
              All day event
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : event ? 'Update' : 'Add Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default SimpleCalendar;

