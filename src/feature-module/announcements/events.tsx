import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import CommonSelect from "../../core/common/commonSelect";
import {
  classes,
  eventCategory,
  sections,
} from "../../core/common/selectoption/selectoption";
import { DatePicker } from "antd";
import { all_routes } from "../router/all_routes";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { TimePicker } from "antd";
import { useReactToPrint } from 'react-to-print';
import { QRCodeCanvas } from 'qrcode.react';
import html2pdf from 'html2pdf.js';
import Barcode from 'react-barcode';
import { CompnayIcon, BrandName, PoweredBy } from '../../environment'

interface EventDetails {
  title: string;
}

const Events = () => {
  const routes = all_routes;
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    title: "",
  });
  const calendarRef = useRef(null);

  const handleDateClick = () => {
    setShowAddEventModal(true);
  };

  const handleEventClick = (info: any) => {
    setEventDetails({
      title: info.event.title,
    });
    setShowEventDetailsModal(true);
  };

  const handleAddEventClose = () => setShowAddEventModal(false);
  const handleEventDetailsClose = () => setShowEventDetailsModal(false);

  const onChange = (time: Dayjs, timeString: string | string[]) => {
    console.log(time, timeString);
  };

  const events = [
    {
      title: "Summer Vacation",
      backgroundColor: "#FDE9ED",
      start: new Date(Date.now() - 168000000).toISOString().slice(0, 10),
    },
    {
      title: "Parents, Teacher Meet",
      backgroundColor: "#E7F1FC",
      start: new Date(Date.now() + 338000000).toISOString().slice(0, 10),
    },
    {
      title: "Admission Camp",
      backgroundColor: "#E6F9FF",
      start: new Date(Date.now() - 338000000).toISOString().slice(0, 10),
    },
    {
      title: "Activity - Training",
      backgroundColor: "#E8F9E8",
      start: new Date(Date.now() + 68000000).toISOString().slice(0, 10),
    },
  ];


  return (
    <div>
      {/* Page Wrapper */}


      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <LandscapeFeeVoucher />
          <BulkFeeVouchers />
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="mb-1">Events</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">Announcement</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Events
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="pe-1 mb-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-top">Refresh</Tooltip>}
                >
                  <Link
                    to="#"
                    className="btn btn-outline-light bg-white btn-icon me-1"
                  >
                    <i className="ti ti-refresh" />
                  </Link>
                </OverlayTrigger>
              </div>
              <div className="pe-1 mb-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="tooltip-top">Print</Tooltip>}
                >
                  <button
                    type="button"
                    className="btn btn-outline-light bg-white btn-icon me-1"
                  >
                    <i className="ti ti-printer" />
                  </button>
                </OverlayTrigger>
              </div>
              <div className="mb-2">
                <Link
                  to="#"
                  className="btn btn-light d-flex align-items-center"
                >
                  <i className="ti ti-calendar-up me-2" />
                  Sync with Google Calendar
                </Link>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            {/* Event Calendar */}
            <div className="col-xl-8 col-xxl-9 theiaStickySidebar">
              <div className="stickybar">
                <div className="card">
                  <div className="card-body">
                    <FullCalendar
                      plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                      ]}
                      initialView="dayGridMonth"
                      events={events}
                      headerToolbar={{
                        start: "title",
                        center: "dayGridMonth,dayGridWeek,dayGridDay",
                        end: "custombtn",
                      }}
                      customButtons={{
                        custombtn: {
                          text: "Add New Event",
                          click: handleDateClick,
                        },
                      }}
                      eventClick={handleEventClick}
                      ref={calendarRef}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* /Event Calendar */}
            {/* Event List */}
            <div className="col-xl-4 col-xxl-3 theiaStickySidebar">
              <div className="stickybar">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-3">Events</h5>
                  <div className="dropdown mb-3">
                    <Link
                      to="#"
                      className="btn btn-outline-light dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      All Category
                    </Link>
                    <ul className="dropdown-menu p-3">
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1 d-flex align-items-center"
                        >
                          <i className="ti ti-circle-filled fs-8 text-warning me-2" />
                          Celebration
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1 d-flex align-items-center"
                        >
                          <i className="ti ti-circle-filled fs-8 text-success me-2" />
                          Training
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1 d-flex align-items-center"
                        >
                          <i className="ti ti-circle-filled fs-8 text-info me-2" />
                          Meeting
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1 d-flex align-items-center"
                        >
                          <i className="ti ti-circle-filled fs-8 text-danger me-2" />
                          Holidays
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1 d-flex align-items-center"
                        >
                          <i className="ti ti-circle-filled fs-8 text-pending me-2" />
                          Camp
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Event Item */}
                <div className="border-start border-info border-3 shadow-sm p-3 mb-3 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-3 bg-primary-transparent flex-shrink-0">
                      <i className="ti ti-users-group text-info fs-20" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Parents, Teacher Meet</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        15 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-0 fs-12">
                      <i className="ti ti-clock me-1" />
                      09:10AM - 10:50PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-01.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-07.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-02.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
                {/* Event Item */}
                <div className="border-start border-danger border-3 shadow-sm p-3 mb-3 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-2 bg-danger-transparent flex-shrink-0">
                      <i className="ti ti-vacuum-cleaner fs-24" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Summer Vacation</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        07 July 2024 - 08 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-12 mb-0">
                      <i className="ti ti-clock me-1" />
                      09:10 AM - 10:50 PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-11.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-13.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
                {/* Event Item */}
                <div className="border-start border-info border-3 shadow-sm p-3 mb-3 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-2 bg-info-transparent flex-shrink-0">
                      <i className="ti ti-user-edit fs-20" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Staff Meeting</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        10 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-12 mb-0">
                      <i className="ti ti-clock me-1" />
                      09:10AM - 10:50PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-05.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-06.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-07.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
                {/* Event Item */}
                <div className="border-start border-secondary border-3 shadow-sm p-3 mb-3 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-2 bg-secondary-transparent flex-shrink-0">
                      <i className="ti ti-campfire fs-20" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Admission Camp</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        10 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-12 mb-0">
                      <i className="ti ti-clock me-1" />
                      09:10AM - 10:50PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-04.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-05.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-10.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
                {/* Event Item */}
                <div className="border-start border-success border-3 shadow-sm p-3 mb-4 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-2 bg-success-transparent flex-shrink-0">
                      <i className="ti ti-clipboard-heart fs-20" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Activity Training</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        26 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-12 mb-0">
                      <i className="ti ti-clock me-1" />
                      09:10AM - 10:50PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/teachers/teacher-02.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/teachers/teacher-05.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/teachers/teacher-06.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* Event Item */}
                <div className="border-start border-info border-3 shadow-sm p-3 mb-3 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-3 bg-primary-transparent flex-shrink-0">
                      <i className="ti ti-users-group text-info fs-20" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Parents, Teacher Meet</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        15 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-0 fs-12">
                      <i className="ti ti-clock me-1" />
                      09:10AM - 10:50PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-01.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-07.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-02.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
                {/* Event Item */}
                <div className="border-start border-danger border-3 shadow-sm p-3 mb-3 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-2 bg-danger-transparent flex-shrink-0">
                      <i className="ti ti-vacuum-cleaner fs-24" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Summer Vacation</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        07 July 2024 - 08 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-12 mb-0">
                      <i className="ti ti-clock me-1" />
                      09:10 AM - 10:50 PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-11.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-13.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
                {/* Event Item */}
                <div className="border-start border-info border-3 shadow-sm p-3 mb-3 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-2 bg-info-transparent flex-shrink-0">
                      <i className="ti ti-user-edit fs-20" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Staff Meeting</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        10 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-12 mb-0">
                      <i className="ti ti-clock me-1" />
                      09:10AM - 10:50PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-05.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-06.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-07.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
                {/* Event Item */}
                <div className="border-start border-secondary border-3 shadow-sm p-3 mb-3 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-2 bg-secondary-transparent flex-shrink-0">
                      <i className="ti ti-campfire fs-20" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Admission Camp</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        10 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-12 mb-0">
                      <i className="ti ti-clock me-1" />
                      09:10AM - 10:50PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-04.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-05.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/parents/parent-10.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
                {/* Event Item */}
                <div className="border-start border-success border-3 shadow-sm p-3 mb-4 bg-white">
                  <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <span className="avatar p-1 me-2 bg-success-transparent flex-shrink-0">
                      <i className="ti ti-clipboard-heart fs-20" />
                    </span>
                    <div className="flex-fill">
                      <h6 className="mb-1">Activity Training</h6>
                      <p className="fs-12">
                        <i className="ti ti-calendar me-1" />
                        26 July 2024
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="fs-12 mb-0">
                      <i className="ti ti-clock me-1" />
                      09:10AM - 10:50PM
                    </p>
                    <div className="avatar-list-stacked avatar-group-sm">
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/teachers/teacher-02.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/teachers/teacher-05.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                      <span className="avatar border-0">
                        <ImageWithBasePath
                          src="assets/img/teachers/teacher-06.jpg"
                          className="rounded"
                          alt="img"
                        />
                      </span>
                    </div>
                  </div>
                </div>
                {/* /Event Item */}
              </div>
              {/* /Event List */}
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Add Event */}
      <Modal show={showAddEventModal} onHide={handleAddEventClose}>
        <div className="modal-header">
          <h4 className="modal-title">New Event</h4>
          <button
            type="button"
            className="btn-close custom-btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <form>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-12">
                <div>
                  <label className="form-label">Event For</label>
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="form-check me-3 mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="event"
                        id="all"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="all">
                        All
                      </label>
                    </div>
                    <div className="form-check me-3 mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="event"
                        id="students"
                      />
                      <label className="form-check-label" htmlFor="students">
                        Students
                      </label>
                    </div>
                    <div className="form-check me-3 mb-3">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="event"
                        id="staffs"
                      />
                      <label className="form-check-label" htmlFor="staffs">
                        Staffs
                      </label>
                    </div>
                  </div>
                </div>
                <div className="all-content" id="all-student">
                  <div className="mb-3">
                    <label className="form-label">Classes</label>
                    <CommonSelect
                      className="select"
                      options={classes}
                      defaultValue={classes[0]}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sections</label>
                    <CommonSelect
                      className="select"
                      options={sections}
                      defaultValue={sections[0]}
                    />
                  </div>
                </div>
                <div className="all-content" id="all-staffs">
                  <div className="mb-3">
                    <div className="bg-light-500 p-3 pb-2 rounded">
                      <label className="form-label">Role</label>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-check form-check-sm mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                            Admin
                          </div>
                          <div className="form-check form-check-sm mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultChecked
                            />
                            Teacher
                          </div>
                          <div className="form-check form-check-sm mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                            Driver
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-check-sm mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                            Accountant
                          </div>
                          <div className="form-check form-check-sm mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                            Librarian
                          </div>
                          <div className="form-check form-check-sm mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                            Receptionist
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">All Teachers</label>
                    <select className="select">
                      <option>Select</option>
                      <option>I</option>
                      <option>II</option>
                      <option>III</option>
                      <option>IV</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Title"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Event Category</label>
                <CommonSelect
                  className="select"
                  options={eventCategory}
                  defaultValue={eventCategory[0]}
                />
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <div className="date-pic">
                    <DatePicker
                      className="form-control datetimepicker"
                      placeholder="Select Date"
                    />

                    <span className="cal-icon">
                      <i className="ti ti-calendar" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <div className="date-pic">
                    <DatePicker
                      className="form-control datetimepicker"
                      placeholder="Select Date"
                    />

                    <span className="cal-icon">
                      <i className="ti ti-calendar" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Start Time</label>
                  <div className="date-pic">
                    <TimePicker
                      placeholder="11:00 AM"
                      className="form-control timepicker"
                      onChange={onChange}
                      defaultValue={dayjs("00:00:00", "HH:mm:ss")}
                    />
                    <span className="cal-icon">
                      <i className="ti ti-clock" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">End Time</label>
                  <div className="date-pic">
                    <TimePicker
                      placeholder="11:00 AM"
                      className="form-control timepicker"
                      onChange={onChange}
                      defaultValue={dayjs("00:00:00", "HH:mm:ss")}
                    />
                    <span className="cal-icon">
                      <i className="ti ti-clock" />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <div className="bg-light p-3 pb-2 rounded">
                    <div className="mb-3">
                      <label className="form-label">Attachment</label>
                      <p>Upload size of 4MB, Accepted Format PDF</p>
                    </div>
                    <div className="d-flex align-items-center flex-wrap">
                      <div className="btn btn-primary drag-upload-btn mb-2 me-2">
                        <i className="ti ti-file-upload me-1" />
                        Upload
                        <input
                          type="file"
                          className="form-control image_sign"
                          multiple
                        />
                      </div>
                      <p className="mb-2">Fees_Structure.pdf</p>
                    </div>
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    defaultValue={
                      "Meeting with Staffs on the Quality Improvement s and completion of syllabus before the August,  enhance the students health issue"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Link to="#" className="btn btn-light me-2" data-bs-dismiss="modal">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
      {/* /Add Event */}
      {/* Event Details */}
      <Modal show={showEventDetailsModal} onHide={handleEventDetailsClose}>
        <div className="modal-header justify-content-between">
          <span className="d-inline-flex align-items-center">
            <i className="ti ti-circle-filled fs-8 me-1 text-info" />
            Meeting
          </span>
          <div className="d-flex align-items-center">
            <Link to="#" className="me-1 fs-18">
              <i className="ti ti-edit-circle" />
            </Link>
            <Link to="#" className="me-1 fs-18">
              <i className="ti ti-trash-x" />
            </Link>
            <Link to="#" className="fs-18" data-bs-dismiss="modal">
              <i className="ti ti-x" />
            </Link>
          </div>
        </div>
        <div className="modal-body pb-0">
          <div className="d-flex align-items-center mb-3">
            <span className="avatar avatar-xl bg-primary-transparent me-3 flex-shrink-0">
              <i className="ti ti-users-group fs-30" />
            </span>
            <div>
              <h3 id="eventTitle" className="mb-1">
                {eventDetails.title}
              </h3>
              <div className="d-flex align-items-center flex-wrap">
                <p className="me-3 mb-0">
                  <i className="ti ti-calendar me-1" />
                  10 July 2024
                </p>
                <p>
                  <i className="ti ti-calendar me-1" />
                  09:10AM - 10:50PM
                </p>
              </div>
            </div>
          </div>
          <div className="bg-light-400 p-3 rounded mb-3">
            <p>
              Meeting with Staffs on the Quality Improvement s and completion of
              syllabus before the August, enhance the students health issue
            </p>
          </div>
          <div className="d-flex align-items-center justify-content-between flex-wrap">
            <div className="avatar-list-stacked avatar-group-sm d-flex mb-3">
              <span className="avatar">
                <ImageWithBasePath
                  src="assets/img/teachers/teacher-01.jpg"
                  alt="img"
                />
              </span>
              <span className="avatar">
                <ImageWithBasePath
                  src="assets/img/teachers/teacher-02.jpg"
                  alt="img"
                />
              </span>
              <span className="avatar">
                <ImageWithBasePath
                  src="assets/img/teachers/teacher-03.jpg"
                  alt="img"
                />
              </span>
              <Link className="avatar bg-white text-default" to="#">
                +67
              </Link>
            </div>
            <div className="mb-3">
              <p className="mb-1">Event For</p>
              <h6>All Classes, All Sections</h6>
            </div>
          </div>
        </div>
      </Modal>
      {/* /Event Details */}
    </div>
  );
};

export default Events;

interface VoucherData {
  id: number;
  school: string;
  campus: string;
  voucherNo: string;
  studentName: string;
  studentImage: string;
  fatherName: string;
  regNo: string;
  grade: string;
  month: string;
  dueDate: string;
  validityDate: string;
  bankName: string;
  accTitle: string;
  iban: string;
  tuitionFee: number;
  annualCharges: number;
  discount: number;
  totalPayable: number;
}

const LandscapeFeeVoucher: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  const vouchersData: VoucherData[] = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    school: "DAR-E-ARQAM CENTRAL REGIONS",
    campus: "KAMEER ADA",
    voucherNo: (2758 + i).toString(),
    studentName: i % 2 === 0 ? "AZALFA AFSAR" : "ZAYN MALIK",
    studentImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSygpGdRqX58iOJ-TZIbP_Rp6s1WWCUNw-neA&s",
    fatherName: i % 2 === 0 ? "MUHAMMAD AFSAR" : "MALIK AFSAR",
    regNo: `SKT-PAS-2026-0943`,
    grade: i % 2 === 0 ? "GRADE-6" : "GRADE-7",
    month: "Jan-2026",
    dueDate: "2026-01-10",
    validityDate: "2026-01-20",
    bankName: "SONERI BANK LIMITED",
    accTitle: "Dar-e-Arqam School",
    iban: "PK18SONE0025920016205622",
    tuitionFee: 24000,
    annualCharges: 10000,
    discount: i % 2 === 0 ? 24000 : 5000,
    totalPayable: i % 2 === 0 ? 10000 : 30000,
  }));

  const downloadPDF = () => {
    const element = contentRef.current;
    if (!element) return;
    const opt = {
      margin: 0,
      filename: 'Vouchers_Batch.pdf',
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { scale: 4, useCORS: true, logging: false, letterRendering: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const },
      pagebreak: { mode: 'css' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handlePrintAll = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const VoucherSection: React.FC<{ title: string; data: any }> = ({ title, data }) => (
    <div style={{
      width: '33.333%',
      padding: '8mm 6mm',
      borderRight: title !== 'PARENT COPY' ? '1px dashed #000' : 'none',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxSizing: 'border-box',
      fontSize: '10.5px',
      backgroundColor: '#fff',
      WebkitPrintColorAdjust: 'exact',
      color: '#000',
      fontFamily: "'Inter', sans-serif",
      letterSpacing: '-0.01em'
    }}>
      {/* Header Section with Logo */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '4px'
        }}>
          {/* Company Logo */}
          <img
            src={`/${CompnayIcon}`} // Replace with your actual logo URL or import
            alt="Logo"
            style={{
              width: '40px',
              height: '60px',
              objectFit: 'contain'
            }}
          />

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontFamily: "'RevuenCustom', sans-serif", fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {data.school}
            </h2>
            <p style={{ margin: 0, fontFamily: "'RevuenCustom', sans-serif", fontSize: '12px', fontWeight: 500 }}>{data.campus}</p>
          </div>
        </div>

        {/* Curved Title Box */}
        <div style={{
          border: '2px solid #000',
          padding: '4px',
          fontWeight: 700,
          textAlign: 'center',
          textTransform: 'uppercase',
          fontSize: '11px',
          borderRadius: '6px'
        }}>
          {title}
        </div>
      </div>

      {/* Barcode */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <Barcode renderer="svg" value={data.voucherNo} width={0.8} height={25} fontSize={10} margin={0} lineColor="#000" />
      </div>

      {/* Student Details Row */}
      <div style={{ display: 'flex', marginBottom: '10px', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, lineHeight: '1.5' }}>
          <strong>Voucher No:</strong> {data.voucherNo} <br />
          <strong>Student:</strong> <span style={{ fontWeight: 700, fontSize: '11px' }}>{data.studentName}</span> <br />
          <strong>Father:</strong> {data.fatherName} <br />
          <strong>Reg #:</strong> {data.regNo} <br />
          <strong>Grade:</strong> {data.grade} <br />
          <strong>Month:</strong> {data.month}
        </div>

        {/* Curved Image Box */}
        <div style={{ border: '1.5px solid #000', padding: '1px', borderRadius: '4px', overflow: 'hidden' }}>
          <img src={data.studentImage} alt="Profile" style={{ width: '55px', height: '60px', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      {/* Fee Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', color: '#000' }}>
        <thead>
          <tr style={{ borderBottom: '2.5px solid #000' }}>
            <th align="left" style={{ padding: '4px 0', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Description</th>
            <th align="right" style={{ padding: '4px 0', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase' }}>Amount</th>
          </tr>
        </thead>
        <tbody style={{ fontWeight: 500 }}>
          {[...Array(1)].map((_, i) => (
            <React.Fragment key={i}>
              <tr>
                <td style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}>Tuition Fee</td>
                <td align="right" style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}>{data.tuitionFee.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}>Annual Charges</td>
                <td align="right" style={{ padding: '3px 0', borderBottom: '1px solid #eee' }}>{data.annualCharges.toLocaleString()}</td>
              </tr>
            </React.Fragment>
          ))}

          {/* Discount Row */}
          <tr>
            <td style={{ padding: '4px 0', borderBottom: '1px solid #ddd' }}><strong>Discount</strong></td>
            <td align="right" style={{ padding: '4px 0', borderBottom: '1px solid #ddd' }}><strong>({data.discount.toLocaleString()})</strong></td>
          </tr>

          {/* Total Payable Row */}
          <tr style={{ fontSize: '13px' }}>
            <td style={{ padding: '6px 0' }}><strong>Amount payable:</strong></td>
            <td align="right" style={{ padding: '6px 0' }}><strong style={{ fontSize: '14px' }}>{data.totalPayable.toLocaleString()}</strong></td>
          </tr>
          <tr style={{ fontSize: '10px' }}>
            <td style={{ borderBottom: '2.5px solid #000' }}><strong>Amount Paid:</strong></td>
            <td align="right" style={{borderBottom: '2.5px solid #000' }}><strong style={{ fontSize: '10px' }}>{data.totalPayable.toLocaleString()}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* Curved Due Date Box */}
      <div style={{
        border: '2px solid #000',
        padding: '8px',
        marginBottom: '10px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 800 }}>DUE DATE: {data.dueDate}</div>
        <div style={{ fontSize: '11px', fontWeight: 600 }}>VALID FOR BANK: {data.validityDate}</div>
      </div>

      {/* Curved Bank Details Section */}
      <div style={{
        fontSize: '9px',
        border: '1.5px solid #000',
        padding: '8px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px'
      }}>
        <div style={{ lineHeight: '1.6' }}>
          <strong style={{ fontSize: '10px', textTransform: 'uppercase' }}>Bank Details</strong><br />
          Bank: {data.bankName}<br />
          Title: {data.accTitle}<br />
          IBAN: <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '10px' }}>{data.iban}</span>
        </div>
        <QRCodeCanvas value={`ID:${data.regNo}|VNO:${data.voucherNo}`} size={50} level="H" fgColor="#000" />
      </div>

      {/* Fee Instructions */}
      <div style={{ fontSize: '7.8px', lineHeight: '1.3', fontWeight: 500 }}>
        1: Fee paid after the due date is subject to a fine.<br />
        2: Name would be struck off on non-payment.<br />
        3: Ensuring the timely receipt of fee voucher is the responsibility of parents.<br />
        4: Parents must retain their copy for future reference.<br />
        5: Fee once paid is non-transferable and non-refundable.<br />
        6: Fee will be accepted through HBL Connect / 1-Link.<br />
        7: Fee will be increased every academic year.<br />
        8: <strong>We reserve all legal rights and remedies.</strong>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '9px', borderTop: '1px solid #000', paddingTop: '5px', fontWeight: 600 }}>
        Powered by <span style={{ fontWeight: 800 }}>www.smartedu.site</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: '#525659', minHeight: '100vh' }}>
      <style>{`
        @media screen {
          .voucher-page {
            background: white;
            display: flex;
            margin: 20px auto;
            box-shadow: 0 0 20px rgba(0,0,0,0.4);
            width: 297mm;
            height: 210mm;
          }
        }

        @media print {
          /* 1. Force Landscape and Strip Margins */
          @page {
            size: landscape;
            margin: 0 !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important; /* Allow body to span multiple pages  */
            overflow: visible !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden;
          }

          #print-area, #print-area * {
            visibility: visible !important;
          }

          #print-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 297mm !important;
          }

          .voucher-page {
            width: 297mm !important;
            /* 2. Safety Buffer: Set to 200mm (A4 is 210mm) to prevent blank pages  */
            height: 200mm !important; 
            display: flex !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important; /* Lock content inside the safety zone  */
          }

          /* 3. Logic: Only break pages AFTER vouchers that are NOT the last one  */
          .voucher-page:not(:last-child) {
            page-break-after: always !important;
            break-after: page !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={handlePrint}
          style={{ padding: '12px 24px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Print Vouchers
        </button>
      </div>

      <div id="print-area" ref={contentRef}>
        {vouchersData.map((student) => (
          <div key={student.id} className="voucher-page">
            <VoucherSection title="BANK COPY" data={student} />
            <VoucherSection title="SCHOOL COPY" data={student} />
            <VoucherSection title="PARENT COPY" data={student} />
          </div>
        ))}
      </div>
    </div>
  );
};


// interface VoucherData {
//   id: string;
//   school: string;
//   campus: string;
//   voucherNo: string;
//   studentName: string;
//   studentImage: string;
//   fatherName: string;
//   regNo: string;
//   grade: string;
//   month: string;
//   dueDate: string;
//   validityDate: string;
//   bankName: string;
//   accTitle: string;
//   iban: string;
//   tuitionFee: number;
//   annualCharges: number;
//   discount: number;
//   totalPayable: number;
// }

const BulkFeeVouchers: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Example Data
  const students: VoucherData[] = [
    {
      id: 1,
      school: "DAR-E-ARQAM CENTRAL REGIONS",
      campus: "KAMEER ADA",
      voucherNo: "2758",
      studentName: "AZALFA AFSAR",
      studentImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSygpGdRqX58iOJ-TZIbP_Rp6s1WWCUNw-neA&s",
      fatherName: "MUHAMMAD AFSAR",
      regNo: "CB-139",
      grade: "YEAR-6",
      month: "Jan-2026",
      dueDate: "2026-01-10",
      validityDate: "2026-01-20",
      bankName: "SONERI BANK LIMITED",
      accTitle: "HINT EDU-TECH LIMITED",
      iban: "PK18SONE0025920016205622",
      tuitionFee: 24000,
      annualCharges: 10000,
      discount: 24000,
      totalPayable: 10000,
    },
    {
      id: 2,
      school: "DAR-E-ARQAM CENTRAL REGIONS",
      campus: "KAMEER ADA",
      voucherNo: "2758",
      studentName: "AZALFA AFSAR",
      studentImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSygpGdRqX58iOJ-TZIbP_Rp6s1WWCUNw-neA&s",
      fatherName: "MUHAMMAD AFSAR",
      regNo: "CB-139",
      grade: "YEAR-6",
      month: "Jan-2026",
      dueDate: "2026-01-10",
      validityDate: "2026-01-20",
      bankName: "SONERI BANK LIMITED",
      accTitle: "HINT EDU-TECH LIMITED",
      iban: "PK18SONE0025920016205622",
      tuitionFee: 24000,
      annualCharges: 10000,
      discount: 24000,
      totalPayable: 10000,
    }
    // Add more student objects here...
  ];

  const downloadBulkPDF = () => {
    const element = contentRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Bulk_Vouchers.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'landscape' as const },
      // FIX 1: Use 'avoid-all' to stop unnecessary breaks
      pagebreak: { mode: ['css', 'legacy'], after: '.page-break' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const VoucherSection: React.FC<{ title: string; student: VoucherData }> = ({ title, student }) => (
    <div style={{
      width: '33.33%',
      padding: '10px',
      borderRight: title !== 'PARENT/STUDENT COPY' ? '1px dashed #000' : 'none',
      fontSize: '10px',
      display: 'flex',
      flexDirection: 'column',
      height: '209mm', // FIX 2: Reduced by 1mm to ensure it fits strictly inside A4
      boxSizing: 'border-box',
      backgroundColor: '#fff',
    }}>
      {/* Header, Barcode, Details, Table, etc. (Keep your existing layout here) */}
      <div style={{ textAlign: 'center', marginBottom: '5px' }}>
        <h2 style={{ margin: 0, fontSize: '14px' }}>{student.school}</h2>
        <div style={{ border: '2px solid #000', padding: '3px', marginTop: '5px', fontWeight: 'bold' }}>{title}</div>
      </div>

      <div style={{ textAlign: 'center', margin: '5px 0' }}><Barcode value={student.voucherNo} width={0.8} height={20} fontSize={10} margin={0} /></div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <strong>Voucher:</strong> {student.voucherNo} <br />
          <strong>Student:</strong> {student.studentName} <br />
          <strong>Reg #:</strong> {student.regNo} <br />
          <strong>Month:</strong> {student.month}
        </div>
        <img src={student.studentImage} alt="Pic" style={{ width: '50px', height: '55px', objectFit: 'cover', border: '1px solid #ddd' }} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead style={{ borderBottom: '2px solid #000' }}><tr><th>Detail</th><th align="right">Amount</th></tr></thead>
        <tbody>
          <tr><td>Tuition Fee</td><td align="right">{student.tuitionFee.toLocaleString()}</td></tr>
          <tr><td>Annual Charges</td><td align="right">{student.annualCharges.toLocaleString()}</td></tr>
          <tr style={{ borderTop: '2px solid #000', fontSize: '12px' }}><td><strong>Payable</strong></td><td align="right"><strong>Rs. {student.totalPayable.toLocaleString()}</strong></td></tr>
        </tbody>
      </table>

      <div style={{ border: '2px solid #000', padding: '5px', textAlign: 'center', marginBottom: '8px', backgroundColor: '#f9f9f9' }}>
        <div style={{ color: 'red' }}><strong>DUE DATE: {student.dueDate}</strong></div>
        <div><strong>VALID FOR BANK: {student.validityDate}</strong></div>
      </div>

      <div style={{ border: '1px solid #000', padding: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '9px' }}><strong>BANK DETAILS:</strong><br />{student.bankName}<br />IBAN: {student.iban}</div>
        <QRCodeCanvas value={student.voucherNo} size={45} />
      </div>

      <div style={{ fontSize: '7.5px', lineHeight: '1.2' }}>
        1: Fee paid after the due date is subject to a fine.<br />
        2: Name would be struck off on non-payment.<br />
        3: Ensuring the timely receipt of fee voucher is the responsibility of parents.<br />
        4: Parents must retain their copy of the paid fee voucher in safe custody for future reference.<br />
        5: Fee once paid is non-transferable and non-refundable.<br />
        6: Fee will not be accepted without PayPro appplication.<br />
        7: Fee will be increased every academic year.<br />
        8: We reserve all legal rights and remedies.
      </div>

      <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '9px', borderTop: '1px solid #eee', paddingTop: '4px' }}>
        Powered by <strong>www.smartedu.site</strong>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <button onClick={downloadBulkPDF} style={{ padding: '12px 25px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        Download Vouchers
      </button>

      <div ref={contentRef} style={{ backgroundColor: '#fff' }}>
        {students.map((student, index) => (
          <div
            key={student.id}
            className="page-break" // Used by the 'after' option in html2pdf
            style={{
              width: '297mm',
              height: '210mm',
              display: 'flex',
              backgroundColor: '#fff',
              margin: '0 auto',
              // FIX 3: Add page break ONLY if it is NOT the last student
              pageBreakAfter: index === students.length - 1 ? 'auto' : 'always',
              overflow: 'hidden'
            }}
          >
            <VoucherSection title="BANK COPY" student={student} />
            <VoucherSection title="SCHOOL COPY" student={student} />
            <VoucherSection title="PARENT/STUDENT COPY" student={student} />
          </div>
        ))}
      </div>
    </div>
  );
};
