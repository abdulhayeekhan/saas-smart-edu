import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import 'bootstrap-daterangepicker/daterangepicker.css';

interface PredefinedDateRangesProps {
  onDateChange: (start: string, end: string) => void;
}

const PredefinedDateRanges2: React.FC<PredefinedDateRangesProps> = ({ onDateChange }) => {
  const [state, setState] = useState<{
    start: moment.Moment | null;
    end: moment.Moment | null;
  }>({
    start: null,
    end: null,
  });

  const { start, end } = state;

  useEffect(() => {
    if (!start || !end) {
      onDateChange('', '');
    }
  }, []);

  const handleCallback = (start: moment.Moment, end: moment.Moment) => {
    setState({ start, end });
    onDateChange(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
  };

  // --- NEW: Clear Function ---
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the DatePicker from opening when clicking Clear
    setState({ start: null, end: null });
    onDateChange('', '');
  };

  const label = (start && end) 
    ? `${start.format('D MMMM, YYYY')} - ${end.format('D MMMM, YYYY')}`
    : "Select Date Range";

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <DateRangePicker
        initialSettings={{
          startDate: start ? start.toDate() : moment().toDate(),
          endDate: end ? end.toDate() : moment().toDate(),
          alwaysShowCalendars: true,
          ranges: {
            Today: [moment().toDate(), moment().toDate()],
            Yesterday: [moment().subtract(1, 'days').toDate(), moment().subtract(1, 'days').toDate()],
            'Last 7 Days': [moment().subtract(6, 'days').toDate(), moment().toDate()],
            'Last 30 Days': [moment().subtract(29, 'days').toDate(), moment().toDate()],
            'This Month': [moment().startOf('month').toDate(), moment().endOf('month').toDate()],
            'Last Month': [
              moment().subtract(1, 'month').startOf('month').toDate(),
              moment().subtract(1, 'month').endOf('month').toDate(),
            ],
          },
        }}
        onCallback={handleCallback}
      >
        <div
          id="reportrange"
          style={{
            background: '#fff',
            cursor: 'pointer',
            padding: '0.5rem 2.5rem 0.5rem 0.625rem', // Added right padding for the X
            border: '1px solid #E9EDF4',
            width: '100%',
            borderRadius: '5px',
            fontSize: '14px',
            color: start ? '#202C4B' : '#ADADAD',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <i className="ti ti-calendar me-2"></i>
          <span>{label}</span>
        </div>
      </DateRangePicker>

      {/* --- NEW: Clear Button (Visible only when dates are selected) --- */}
      {start && (
        <div 
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: '#ff4d4f', // Reddish color for clear
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px'
          }}
          title="Clear Dates"
        >
          <i className="ti ti-x" style={{ fontSize: '16px', fontWeight: 'bold' }}></i>
        </div>
      )}
    </div>
  );
};

export default PredefinedDateRanges2;