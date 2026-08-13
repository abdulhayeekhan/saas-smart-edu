import { DatePicker, Spin } from "antd";
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import PredefinedDateRanges from "../../core/common/datePicker";
import CommonSelect from "../../core/common/commonSelect";
import {
  messageTo,
  transactionDate,
  usePermission
} from "../../core/common/selectoption/selectoption";
import useRegionsList from "../../core/common/selectoption/master/useRegions"
import { all_routes } from "../router/all_routes";
import { useRolesList } from "../../core/common/selectoption/rolerights/useRolesList"
import TooltipOption from "../../core/common/tooltipOption";
import { AddNotice, EditNotice, GetAllNotices, GetNoticeById, NoticeFilter, Notice, DeleteNotice } from '../../store/apps/noticeBoard';
import type { RootState, AppDispatch } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import moment from "moment";
import toast from 'react-hot-toast'

interface NoticeResponse {
  data: Notice[];
}

interface OptionItem {
  value: number;
  label: string;
}

interface UserData {
  accessToken: string;
  refreshToken: string;
  id: number;
  userLevel: number;
  userLevelId: number;
  roleId: number;
  roleName: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  contactNumber: string;
  isEnabled: boolean;
  createdAt: string;
  modifiedAt: string | null;
  createdBy: string | null;
  modifiedBy: string | null;
}

interface UserResponse {
  status: boolean;
  message: string;
  data: UserData;
}




const NoticeBoard = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const userInfoString = localStorage.getItem("userData");
  const { data, totalCount, pageSize, currentPage, loading, error } = useSelector((state: RootState) => state.notice);

  
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const events = data.map(item => {
    const noticeDate = item.noticeDate.slice(0, 10);

    let backgroundColor = "#FDE9ED"; // default
    if (noticeDate < today) {
      backgroundColor = "#fdadbdff"; // past
    } else if (noticeDate > today) {
      backgroundColor = "#b8d8faff"; // future
    } else {
      backgroundColor = "#c1f8c1ff"; // today
    }

    return {
      id: String(item.id),
      title: item.title,
      start: noticeDate,
      backgroundColor,
    };
  });

  const [filter, setFilter] = useState<NoticeFilter>({
    pageNo: 1,
    pageSize: 25,
    search: '',
    isEnabled: true
  })

  useEffect(() => {
    dispatch(GetAllNotices(filter))
  }, [dispatch, filter])
  const userInfo: UserResponse | null = userInfoString
    ? JSON.parse(userInfoString)
    : null;


  const rolesId = userInfo?.data?.roleId;
  const userLevel = userInfo?.data?.userLevel;
  const visibleNotices = data.filter((notice) => {
    // 1. If Level 1 or 2, show everything (don't filter)
    if (userLevel === 1 || userLevel === 2) {
      return true;
    }

    // 2. If Level 3, filter based on roleId
    if (userLevel === 3) {
      if (!notice.messageTo) return false; // Safety check if messageTo is empty

      // Split "3,9,10" into ["3", "9", "10"]
      const allowedRoles = notice.messageTo.split(",");

      // Check if the current user's roleId exists in that list
      return allowedRoles.includes(String(rolesId));
    }

    // Fallback: hide if level is unknown
    return false;
  });
  const isLoginUser = userInfo?.data?.id ?? 3;
  const hasPermission = usePermission("Notice Board");
  const calendarRef = useRef(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closeDeleteBtnRef = useRef<HTMLAnchorElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);

  const RegionsList = useRegionsList()
  const rolesList = useRolesList(3)
  const filtered: OptionItem[] = RegionsList.filter((item: { value: any }) => item.value !== null);
  const filteredRoles: OptionItem[] = rolesList.filter((item: { value: any }) => item.value !== '');
  const [noticeAddInfo, setNoticeAddInfo] = useState<Notice>({
    title: '',
    noticeDate: '',
    gradeId: null,
    campusId: null,
    publishedAt: '',
    message: '',
    messageTo: '',
    attachmentLink: '',
    regions: '',
    isEnabled: true,
    createdBy: isLoginUser,
    createdAt: new Date().toISOString()
  })
  const handleNoticeInfoChange = (field: keyof Notice, value: any) => {
    if (field === "noticeDate" || field === "publishedAt" || field === "createdAt" || field === "modifiedAt") {
      value = new Date(value).toISOString();
    }
    setNoticeAddInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }
  const [editLoading, setEditLoading] = useState(false)
  const handleEventClick = async (info: any) => {
    const id = parseInt(info.event.id, 10)
    const response = await dispatch(GetNoticeById(id))
    if (response?.payload) {
      setSingleNotification(response?.payload as Notice)
    }
  };



  const [noticeEditInfo, setNoticeEditInfo] = useState<Notice>({
    id: 0,
    title: '',
    noticeDate: '',
    gradeId: null,
    campusId: null,
    publishedAt: '',
    message: '',
    messageTo: '',
    attachmentLink: '',
    regions: '',
    isEnabled: true,
    modifiedBy: isLoginUser,
    modifiedAt: new Date().toISOString()
  })

  const GetEditSingleNotification = async (id: number) => {
    setEditLoading(true)
    try {
      const response = await dispatch(GetNoticeById(id))
      if (response?.payload) {
        const data = response.payload as Notice

        const {
          createdUser,
          modifiedUser,
          modifiedBy,
          modifiedAt,
          ...cleanData
        } = data   // Remove unwanted fields

        const updatedData: Notice = {
          ...cleanData,
          modifiedBy: isLoginUser,
          modifiedAt: new Date().toISOString(),
        };

        setNoticeEditInfo(updatedData)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setEditLoading(false)
    }
  }
  const handleNoticeEditInfoChange = (field: keyof Notice, value: any) => {
    if (field === "noticeDate" || field === "publishedAt" || field === "createdAt" || field === "modifiedAt") {
      value = new Date(value).toISOString();
    }
    setNoticeEditInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const handleMultiCheckbox = (field: "messageTo" | "regions", value: number) => {
    setNoticeAddInfo(prev => {
      const currentValues = prev[field]
        ? prev[field].split(",").map(Number)
        : [];

      let updatedValues;

      if (currentValues.includes(value)) {
        updatedValues = currentValues.filter(v => v !== value);
      } else {
        updatedValues = [...currentValues, value];
      }

      return {
        ...prev,
        [field]: updatedValues.join(","),
      };
    });
  };
  const handleEditMultiCheckbox = (field: "messageTo" | "regions", value: number) => {
    setNoticeEditInfo(prev => {
      const currentValues = prev[field]
        ? prev[field].split(",").map(Number)
        : [];

      let updatedValues;

      if (currentValues.includes(value)) {
        updatedValues = currentValues.filter(v => v !== value);
      } else {
        updatedValues = [...currentValues, value];
      }

      return {
        ...prev,
        [field]: updatedValues.join(","),
      };
    });
  };
  const [saveloading, setSaveLoading] = useState(false)
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true)
    try {
      await dispatch(AddNotice(noticeAddInfo))
    } catch (error) {
      console.log(error);
    } finally {
      closeBtnRef.current?.click();
      setSaveLoading(false)
      setNoticeAddInfo({
        title: '',
        noticeDate: '',
        gradeId: null,
        campusId: null,
        publishedAt: '',
        message: '',
        messageTo: '',
        attachmentLink: '',
        regions: '',
        isEnabled: true,
        createdBy: 3,
        createdAt: new Date().toISOString()
      })
      //await GetNotifications()
    }
  }
  const handleUpdateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true)
    try {
      await dispatch(EditNotice(noticeEditInfo))
    } catch (error) {

    } finally {
      closeBtnRef.current?.click();
      setSaveLoading(false)
      setNoticeEditInfo({
        id: 0,
        title: '',
        noticeDate: '',
        gradeId: null,
        campusId: null,
        publishedAt: '',
        message: '',
        messageTo: '',
        attachmentLink: '',
        regions: '',
        isEnabled: true,
        modifiedBy: isLoginUser,
        modifiedAt: new Date().toISOString()
      })
      //await GetNotifications()
    }
  }

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(DeleteNotice(deleteId))
      .unwrap()
      .then(() => {
        setDeleteId(null); // reset after delete
        // CLOSE MODAL
        closeDeleteBtnRef.current?.click();
      })
      .catch((err) => {
        toast.error(err || "Failed to delete notice");
      });
  };

  //get functionality

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value, // increase pageSize by 25
    }));
  };
  const handleLoadMore = () => {
    setFilter(prev => ({
      ...prev,
      pageSize: prev.pageSize + 25, // increase pageSize by 25
    }));
  };

  const [notificationList, setNotificationList] = useState<Notice[]>([])

  const [loadingSingle, setLoadingSingle] = useState(false);



  const [singleNotification, setSingleNotification] = useState<Notice>()


  const GetSingleNotification = async (id: number) => {
    const response = await dispatch(GetNoticeById(id))
    if (response?.payload) {
      setSingleNotification(response?.payload as Notice)
    }
  }
  const handleCloseModal = async () => {
    await setSingleNotification({
      title: '',
      noticeDate: '',
      gradeId: null,
      campusId: null,
      publishedAt: '',
      message: '',
      messageTo: '',
      attachmentLink: '',
      regions: '',
      isEnabled: true,
      createdBy: 3,
      createdAt: new Date().toISOString()
    });
    await setNoticeEditInfo({
      id: 0,
      title: '',
      noticeDate: '',
      gradeId: null,
      campusId: null,
      publishedAt: '',
      message: '',
      messageTo: '',
      attachmentLink: '',
      regions: '',
      isEnabled: true,
      modifiedBy: isLoginUser,
      modifiedAt: new Date().toISOString()
    })
  };

  return (
    <>
      {" "}
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content content-two">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Notice Board</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">Announcement</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Notice Board
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              {/* <TooltipOption /> */}
              {(hasPermission && hasPermission?.addRight) && (
                <div className="mb-2">
                  <Link
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#add_message"
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add Message
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* /Page Header */}

          <div className="d-flex align-items-center justify-content-end flex-wrap mb-2">
            {/* <div className="form-check me-2 mb-3">
              <input className="form-check-input" type="checkbox" />
              <span className="checkmarks">Mark &amp; Delete All</span>
            </div> */}
            <div className="d-flex align-items-center flex-wrap">
              {/* <div className="input-icon-start mb-3 me-2 position-relative">
                <PredefinedDateRanges />
              </div> */}
              <div className="dropdown mb-3">
                <Link
                  to="#"
                  className="btn btn-outline-light bg-white dropdown-toggle"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                >
                  <i className="ti ti-filter me-2" />
                  Search
                </Link>
                <div className="dropdown-menu drop-width">
                  {/* <form> */}
                  {/* <div className="d-flex align-items-center border-bottom p-3">
                      <h4>Search</h4>
                    </div> */}
                  <div className="p-3 border-bottom pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Search</label>
                          <input type="text" className="form-control" value={filter?.search} name="search" placeholder="Search Notice Board" onChange={(e) => handleFilter(e)} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className="p-3 d-flex align-items-center justify-content-end">
                      <Link to="#" className="btn btn-light me-3">
                        Reset
                      </Link>
                      <button type="submit" className="btn btn-primary">
                        Apply
                      </button>
                    </div> */}
                  {/* </form> */}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-5 col-xxl-5 theiaStickySidebar">
              {/* Notice Board List */}
              {visibleNotices?.map(item => (
                <div className="card board-hover mb-3" key={item.id}>
                  <div className="card-body d-md-flex align-items-center justify-content-between pb-1">
                    <div className="d-flex align-items-center mb-3">
                      <span className="bg-soft-primary text-primary avatar avatar-md me-2 br-5 flex-shrink-0">
                        <i className="ti ti-notification fs-16" />
                      </span>
                      <div>
                        <h6 className="mb-1 fw-semibold">
                          <Link
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#view_details"
                            onClick={() => item.id !== undefined && GetSingleNotification(item.id)}
                          >
                            {item?.title}
                            {loadingSingle && <i className="spinner-border spinner-border-sm ms-2" />}
                          </Link>
                        </h6>
                        <p>
                          <i className="ti ti-calendar me-1" />
                          Published on : {dayjs(item.publishedAt).format("DD-MMM-YYYY")}
                        </p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center board-action mb-3">
                      {(hasPermission && hasPermission?.editRight) && (
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#edit_message"
                          onClick={() => item.id !== undefined && GetEditSingleNotification(item.id)}
                          className="text-primary border rounded p-1 badge me-1 primary-btn-hover"
                        >
                          <i className="ti ti-edit-circle fs-16" />
                        </Link>
                      )}
                      {(hasPermission && hasPermission?.deleteRight) && (
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#delete-modal"
                          className="text-danger border rounded p-1 badge danger-btn-hover"
                          onClick={() => setDeleteId(item.id ?? null)}
                        >
                          <i className="ti ti-trash-x fs-16" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100%",
              }}><Spin size="large" /></div>}



              {/* Notice Board List */}
              <div className="text-center">
                {totalCount > filter?.pageSize && (
                  <Link to="#" className="btn btn-primary" onClick={handleLoadMore}>
                    <i className="ti ti-loader-3 me-2" />
                    Load More
                  </Link>
                )}
              </div>
            </div>

            <div className="col-xl-7 col-xxl-7 theiaStickySidebar">
              {visibleNotices?.length > 0 && (
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
                          center: "dayGridMonth,dayGridWeek,dayGridDay"
                        }}
                        eventClick={(info) => {
                          handleEventClick(info)
                          openBtnRef.current?.click();
                        }}
                        ref={calendarRef}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Add Messase */}
      <div className="modal fade" id="add_message">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">New Message</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ref={closeBtnRef}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleSaveSubmit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input type="text" value={noticeAddInfo?.title} onChange={(e) => handleNoticeInfoChange('title', e.target.value)} className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Notice Date</label>
                      <div className="date-pic">
                        <DatePicker
                          className="form-control datetimepicker"
                          placeholder="Select Date"
                          onChange={(date, dateString) =>
                            handleNoticeInfoChange("noticeDate", dateString)
                          }
                        />
                        <span className="cal-icon">
                          <i className="ti ti-calendar" />
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Publish On</label>
                      <div className="date-pic">
                        <DatePicker
                          className="form-control datetimepicker"
                          placeholder="Select Date"
                          onChange={(date, dateString) =>
                            handleNoticeInfoChange("publishedAt", dateString)
                          }
                        />
                        <span className="cal-icon">
                          <i className="ti ti-calendar" />
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="bg-light p-3 pb-2 rounded">
                        <div className="mb-3">
                          <label className="form-label">Attachment</label>
                          {/* <p>Upload size of 4MB, Accepted Format PDF</p> */}
                        </div>
                        {/* <div className="d-flex align-items-center flex-wrap">
                          <div className="btn btn-primary drag-upload-btn mb-2 me-2">
                            <i className="ti ti-file-upload me-1" />
                            Upload
                            <input
                              type="file"
                              className="form-control image_sign"
                              multiple
                            />
                          </div>
                        </div> */}
                        <div className="d-flex align-items-center flex-wrap">
                          <div className="btn btn-primary mb-2 me-2">
                            <input
                              type="text"
                              onChange={(e) => handleNoticeInfoChange('attachmentLink', e.target.value)}
                              className="form-control"
                              placeholder="Attachment Link"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        onChange={(e) => handleNoticeInfoChange('message', e.target.value)}
                        defaultValue={noticeAddInfo?.message}
                      />
                    </div>
                    <div className="mb-0">
                      <label className="form-label">Message To</label>
                      <div className="row">
                        {filteredRoles?.map((item) => (
                          <div className="col-md-6">
                            <label className="checkboxs mb-1">
                              <input
                                type="checkbox"
                                value={item.value}
                                checked={noticeAddInfo.messageTo
                                  ?.split(",")
                                  .includes(String(item.value))}
                                onChange={() => handleMultiCheckbox("messageTo", item.value)}
                              />
                              <span className="checkmarks" />
                              {item?.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-0">
                      <label className="form-label">Regions To</label>
                      <div className="row">
                        {filtered?.map((item) => (
                          <div className="col-md-6">
                            <label className="checkboxs mb-1">
                              <input
                                type="checkbox"
                                value={item.value}
                                checked={noticeAddInfo.regions
                                  ?.split(",")
                                  .includes(String(item.value))}
                                onChange={() => handleMultiCheckbox("regions", item.value)}
                              />
                              <span className="checkmarks" />
                              {item?.label}
                            </label>
                          </div>
                        ))}

                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Link
                  to="#"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <button type="submit" disabled={saveloading || noticeAddInfo?.regions === '' || noticeAddInfo?.messageTo === ''} className="btn btn-primary">
                  {saveloading ? 'Loading...' : 'Add New Mesaage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* /Add Messase */}
      {/* Edit Messase */}
      <div className="modal fade" id="edit_message">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Message</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseModal}
                ref={closeBtnRef}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            {editLoading ?
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                width: "100%",
              }}><Spin size="small" /></div> :
              <form onSubmit={handleUpdateSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Title"
                          defaultValue="Fees Reminder"
                          value={noticeEditInfo?.title}
                          onChange={(e) => handleNoticeEditInfoChange('title', e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Notice Date</label>
                        <div className="date-pic">
                          <DatePicker
                            className="form-control datetimepicker"
                            placeholder="Select Date"
                            onChange={(date, dateString) =>
                              handleNoticeEditInfoChange("noticeDate", dateString)
                            }
                            value={noticeEditInfo?.noticeDate ? dayjs(noticeEditInfo?.noticeDate) : undefined}
                          />
                          <span className="cal-icon">
                            <i className="ti ti-calendar" />
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Publish On</label>
                        <div className="date-pic">
                          <DatePicker
                            className="form-control datetimepicker"
                            placeholder="Select Date"
                            onChange={(date, dateString) =>
                              handleNoticeEditInfoChange("publishedAt", dateString)
                            }
                            value={noticeEditInfo?.publishedAt ? dayjs(noticeEditInfo.publishedAt) : undefined}
                          />
                          <span className="cal-icon">
                            <i className="ti ti-calendar" />
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="bg-light p-3 pb-2 rounded">
                          <div className="mb-3">
                            <label className="form-label">Attachment Link</label>
                            {/* <p>Upload size of 4MB, Accepted Format PDF</p> */}
                          </div>
                          {/* <div className="d-flex align-items-center flex-wrap">
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
                        </div> */}
                          <div className="d-flex align-items-center flex-wrap">
                            <div className="mb-2 me-2 w-100">
                              <input
                                type="text"
                                onChange={(e) => handleNoticeEditInfoChange('attachmentLink', e.target.value)}
                                value={noticeEditInfo?.attachmentLink}
                                className="form-control w-100"
                                placeholder="Attachment Link"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Message</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          onChange={(e) => handleNoticeEditInfoChange('message', e.target.value)}
                          value={noticeEditInfo?.message}
                          placeholder="Add Comment"
                          defaultValue={
                            "Please clear the outstanding dues for the school fees on the urgent basis."
                          }
                        />
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Message To</label>
                        <div className="row">
                          {filteredRoles?.map((item) => (
                            <div className="col-md-6">
                              <label className="checkboxs mb-1">
                                <input
                                  type="checkbox"
                                  value={item.value}
                                  checked={noticeEditInfo?.messageTo
                                    ?.split(",")
                                    .includes(String(item.value))}
                                  onChange={() => handleEditMultiCheckbox("messageTo", item.value)}
                                />
                                <span className="checkmarks" />
                                {item?.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mb-0 mt-5">
                        <label className="form-label">Regions To</label>
                        <div className="row">
                          {filtered?.map((item) => (
                            <div className="col-md-6">
                              <label className="checkboxs mb-1">
                                <input
                                  type="checkbox"
                                  value={item.value}
                                  checked={noticeEditInfo?.regions
                                    ?.split(",")
                                    .includes(String(item.value))}
                                  onChange={() => handleEditMultiCheckbox("regions", item.value)}
                                />
                                <span className="checkmarks" />
                                {item?.label}
                              </label>
                            </div>
                          ))}

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Link
                    to="#"
                    className="btn btn-light me-2"
                    data-bs-dismiss="modal"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Link>
                  <button type="submit" disabled={saveloading} className="btn btn-primary">
                    {saveloading ? 'Updating...' : 'Update Changes'}
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
      {/* /Edit Messase */}
      {/* View Details */}
      <div className="modal fade" id="view_details">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Notification Board</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseModal}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            {!singleNotification?.title ? (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                width: "100%",
              }}><Spin size="small" /></div>
            ) : (
              <div className="modal-body pb-0">
                <div className="mb-3">
                  <h2 className="mb-1">{singleNotification?.title}</h2>
                  <p>
                    {singleNotification?.message}
                  </p>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Notice Date</label>
                      <p className="d-flex align-items-center">
                        <i className="ti ti-calendar me-1" />
                        {dayjs(singleNotification?.noticeDate).format("DD-MMM-YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Publish On</label>
                      <p className="d-flex align-items-center">
                        <i className="ti ti-calendar me-1" />
                        {dayjs(singleNotification?.publishedAt).format("DD-MMM-YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="bg-light p-3 pb-2 rounded">
                    <div className="mb-0">
                      <label className="form-label">Attachment</label>
                      {/* <p className="text-primary">Fees_Structure.pdf</p> */}
                      <p className="text-primary">
                        <a href={singleNotification?.attachmentLink} target="_blank">Open Attached File</a>
                      </p>
                    </div>
                  </div>
                </div>
                {/* <div className="mb-3">
                <label className="form-label d-block">Message To</label>
                <span className="badge badge-soft-primary me-2">Student</span>
                <span className="badge badge-soft-primary">Parent</span>
              </div> */}
                <div className="border-top pt-3">
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="d-flex align-items-center me-4 mb-3">
                      <span className="avatar avatar-sm bg-light me-1">
                        <i className="ti ti-calendar text-default fs-14" />
                      </span>
                      Added on: {dayjs(singleNotification?.createdAt).format("DD-MMM-YYYY")}
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <span className="avatar avatar-sm bg-light me-1">
                        <i className="ti ti-user-edit text-default fs-14" />
                      </span>
                      Added By : {singleNotification?.createdUser?.username}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* /View Details */}
      </div>
      {/* /Main Wrapper */}
      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form>
              <div className="modal-body text-center">
                <span className="delete-icon">
                  <i className="ti ti-trash-x" />
                </span>
                <h4>Confirm Deletion</h4>
                <p>
                  You want to delete all the marked items, this cant be undone
                  once you delete.
                </p>
                <div className="d-flex justify-content-center">
                  <Link
                    to="#"
                    className="btn btn-light me-3"
                    data-bs-dismiss="modal"
                    ref={closeDeleteBtnRef}
                  >
                    Cancel
                  </Link>
                  <Link to="#" onClick={handleDelete} className="btn btn-danger">
                    Yes, Delete
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <button
        data-bs-toggle="modal"
        data-bs-target="#view_details"
        ref={openBtnRef}
      ></button>

      {/* /Delete Modal */}
    </>
  );
};

export default NoticeBoard;
