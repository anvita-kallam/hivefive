import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { Calendar, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

  // Helper function to convert hex color to RGB and calculate brightness
  const getColorBrightness = (hexColor) => {
    // Remove # if present
    const hex = hexColor.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate brightness using relative luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness;
  };

  // Helper function to get text color based on background
  const getTextColor = (backgroundColor) => {
    const brightness = getColorBrightness(backgroundColor);
    return brightness > 128 ? '#2D1B00' : '#FFFFFF';
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
      <div className="honey-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#2D1B00]" />
            <h2 className="text-[#2D1B00] text-xl font-medium">My Calendar</h2>
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setEditingEvent(null);
              setShowAddModal(true);
            }}
            className="bg-[rgba(245,230,211,0.6)] backdrop-blur-sm hover:bg-[rgba(245,230,211,0.8)] text-[#2D1B00] border border-[#2D1B00]/20 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>

      {/* Calendar Header */}
        <div className="mb-3 flex items-center justify-center gap-4">
          <button
            onClick={handlePreviousMonth}
            className="text-[#2D1B00] hover:text-[#6B4E00] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-[#2D1B00] min-w-[200px] text-center font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={handleNextMonth}
            className="text-[#2D1B00] hover:text-[#6B4E00] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="text-center text-[#2D1B00] py-1 text-xs font-medium">
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
                    min-h-[60px] p-1.5 rounded-lg border cursor-pointer backdrop-blur-sm transition-colors
                    ${isCurrentMonth 
                      ? isToday
                        ? 'bg-[rgba(255,195,11,0.3)] border-[#C17D3A] border-2'
                        : dayEvents.length > 0
                        ? 'bg-[rgba(245,230,211,0.6)] border-[#C17D3A] border-2'
                        : 'bg-[rgba(245,230,211,0.5)] border-[#2D1B00]/20'
                      : 'bg-[rgba(230,200,150,0.3)] border-[#2D1B00]/10 opacity-50'
                    }
                  `}
                >
                  <div className={`text-[#2D1B00] text-xs font-medium mb-0.5 ${!isCurrentMonth ? 'opacity-50' : isToday ? 'font-bold' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(eventItem => {
                      const eventColor = eventItem.color || '#C17D3A';
                      const textColor = getTextColor(eventColor);
                      
                      return (
                        <div
                          key={eventItem._id}
                          className="backdrop-blur-sm text-xs px-1.5 py-0.5 rounded cursor-pointer hover:opacity-90 transition-opacity font-medium truncate border border-black/10"
                          style={{ 
                            backgroundColor: eventColor,
                            color: textColor
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(eventItem, e);
                          }}
                          title={`${eventItem.title} - Click to edit`}
                        >
                          {format(new Date(eventItem.startTime), 'h:mm a')} {eventItem.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-[#6B4E00] font-medium">
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
        className="honey-card rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#2D1B00] text-xl font-medium">
                {event ? 'Edit Event' : 'Add Event'}
              </h3>
              <button
                onClick={onClose}
                className="text-[#2D1B00] hover:text-[#6B4E00] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#2D1B00] mb-1 font-medium">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-[#2D1B00]/20 rounded-lg bg-[rgba(255,249,230,0.6)] text-[#2D1B00] focus:outline-none focus:ring-2 focus:ring-[#C17D3A]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-[#2D1B00] mb-1 font-medium">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-[#2D1B00]/20 rounded-lg bg-[rgba(255,249,230,0.6)] text-[#2D1B00] focus:outline-none focus:ring-2 focus:ring-[#C17D3A]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#2D1B00] mb-1 font-medium">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-[#2D1B00]/20 rounded-lg bg-[rgba(255,249,230,0.6)] text-[#2D1B00] focus:outline-none focus:ring-2 focus:ring-[#C17D3A]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#2D1B00] mb-1 font-medium">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-[#2D1B00]/20 rounded-lg bg-[rgba(255,249,230,0.6)] text-[#2D1B00] focus:outline-none focus:ring-2 focus:ring-[#C17D3A]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#2D1B00] mb-1 font-medium">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-[#2D1B00]/20 rounded-lg bg-[rgba(255,249,230,0.6)] text-[#2D1B00] focus:outline-none focus:ring-2 focus:ring-[#C17D3A]/50"
                />
              </div>

              <div>
                <label className="block text-sm text-[#2D1B00] mb-1 font-medium">
                  Color
                </label>
                         <div className="flex gap-2 flex-wrap">
                           {[
                             '#FFC30B', // Bright yellow
                             '#FF8C00', // Orange
                             '#C17D3A', // Brown
                             '#10B981', // Green
                             '#3B82F6', // Blue
                             '#8B5CF6', // Purple
                             '#EF4444', // Red
                             '#EC4899'  // Pink
                           ].map(color => (
                             <button
                               key={color}
                               type="button"
                               onClick={() => setFormData({ ...formData, color })}
                               className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                 formData.color === color 
                                   ? 'ring-2 ring-[#2D1B00] ring-offset-2 scale-110' 
                                   : 'border-[#2D1B00]/30 hover:border-[#2D1B00]/60'
                               }`}
                               style={{ backgroundColor: color }}
                               title={color}
                             />
                           ))}
                           <input
                             type="color"
                             value={formData.color}
                             onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                             className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#2D1B00]/30 hover:border-[#2D1B00]/60"
                           />
                         </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={formData.allDay}
                  onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                  className="w-4 h-4 text-[#C17D3A] border-[#2D1B00]/20 rounded focus:ring-[#C17D3A]"
                />
                <label htmlFor="allDay" className="ml-2 text-sm text-[#2D1B00] font-medium">
                  All day event
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-[#2D1B00]/20 text-[#2D1B00] rounded-lg hover:bg-[rgba(245,230,211,0.8)] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[rgba(193,125,58,0.8)] hover:bg-[rgba(193,125,58,0.9)] text-[#2D1B00] border border-[#2D1B00]/20 backdrop-blur-sm rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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

