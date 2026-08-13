import React, { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import 'bootstrap-daterangepicker/daterangepicker.css';

// Define the interface for props
interface PredefinedDateRangesProps {
  onDateChange: (start: string, end: string) => void;
}

const PredefinedDateRanges2: React.FC<PredefinedDateRangesProps> = ({ onDateChange }) => {
  const [state, setState] = useState({
    start: moment().subtract(29, 'days'),
    end: moment(),
  });

  const { start, end } = state;

  // Sync initial dates to parent on mount
  useEffect(() => {
    onDateChange(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
  }, []);

  const handleCallback = (start: moment.Moment, end: moment.Moment) => {
    setState({ start, end });
    // Update the parent component whenever a range is selected
    onDateChange(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
  };

  const label = `${start.format('D MMMM, YYYY')} - ${end.format('D MMMM, YYYY')}`;

  return (
    <DateRangePicker
      initialSettings={{
        startDate: start.toDate(),
        endDate: end.toDate(),
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
        className="col-4"
        style={{
          background: '#fff',
          cursor: 'pointer',
          padding: '0.5rem 0.625rem',
          border: '1px solid #E9EDF4',
          width: '100%',
          borderRadius: '5px',
          fontSize: '14px',
          color: '#202C4B',
          height: '38px'
        }}
      >
        <i className="ti ti-calendar"></i>&nbsp;
        <span>{label}</span>
      </div>
    </DateRangePicker>
  );
};

export default PredefinedDateRanges2;