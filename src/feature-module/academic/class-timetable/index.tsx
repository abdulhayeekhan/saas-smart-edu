import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { useCampusesList } from "../../../core/common/selectoption/master/useCampusesList";
import useRegions from "../../../core/common/selectoption/master/useRegions";
import { useAcademicGrades } from "../../../core/common/selectoption/academic/useAcademicGrades";
import { useSectionList } from "../../../core/common/selectoption/academic/useSections";
import { GetTimetableByClass, AddTimetable, UpdateTimetable, Timetable, TimetableEntry } from "../../../store/apps/class-timetable";
import { GetAllClassTeachers } from "../../../store/apps/class-teacher";
import { GetSubjects } from "../../../store/apps/subjects";
import CommonSelect3 from "../../../core/common/commonSelect3";
import { Spin, Select, TimePicker, Button } from "antd";
import dayjs from "dayjs";
import TooltipOption from "../../../core/common/tooltipOption";
import toast from "react-hot-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ClassTimetable = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data;

  // Filter State
  const [regionId, setRegionId] = useState<number>(loginInfo?.userLevel === 2 ? Number(loginInfo?.userLevelId) : 0);
  const [campusId, setCampusId] = useState<number>(loginInfo?.userLevel === 3 ? Number(loginInfo?.userLevelId) : 0);
  const [gradeId, setGradeId] = useState<number>(0);
  const [sectionId, setSectionId] = useState<number>(0);

  const regions = useRegions();
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
  const grades = useAcademicGrades();
  const sections = useSectionList(campusId);

  // Redux Data
  const { selectedTimetable, loading, isActionLoading } = useSelector((state: RootState) => state.classTimetable);
  const subjects = useSelector((state: RootState) => state.subjects.data).map(s => ({ value: s.id, label: s.name }));
  const allTeachers = useSelector((state: RootState) => state.classTeacher.data);
  const uniqueTeachersMap = new Map();
  allTeachers.forEach(ct => {
    if (ct.employeeId && ct.employeeName) {
      uniqueTeachersMap.set(ct.employeeId, ct.employeeName);
    }
  });
  const employees = Array.from(uniqueTeachersMap, ([value, label]) => ({ value, label }));

  // Modal State
  const [activeTab, setActiveTab] = useState(DAYS[0]);
  const [modalEntries, setModalEntries] = useState<Record<string, Partial<TimetableEntry>[]>>(
    DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );

  useEffect(() => {
    dispatch(GetSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (campusId) {
      dispatch(GetAllClassTeachers({
        pageNo: 1,
        pageSize: 1000,
        search: "",
        campusId: campusId,
        gradeId: null,
        sectionId: null,
        employeeId: null,
        isEnabled: true
      }));
    }
  }, [dispatch, campusId]);

  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
    if (campusId && gradeId && sectionId) {
      dispatch(GetTimetableByClass({ campusId, gradeId, sectionId }));
    }
  };

  const handleResetClick = () => {
    setCampusId(0);
    setGradeId(0);
    setSectionId(0);
  };

  // Open Add/Edit Modal
  const openModal = () => {
    if (selectedTimetable && selectedTimetable.entries) {
      const grouped = DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {} as Record<string, Partial<TimetableEntry>[]>);
      selectedTimetable.entries.forEach(entry => {
        if (grouped[entry.dayOfWeek]) {
          grouped[entry.dayOfWeek].push(entry);
        }
      });
      setModalEntries(grouped);
    } else {
      setModalEntries(DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {}));
    }
  };

  const addRow = (day: string) => {
    setModalEntries((prev) => {
      const rows = prev[day];
      let nextTimeFrom = "09:00";
      let nextTimeTo = "09:45";

      if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        if (lastRow.timeFrom && lastRow.timeTo) {
          nextTimeFrom = lastRow.timeTo;
          
          const from = dayjs(lastRow.timeFrom, "HH:mm");
          const to = dayjs(lastRow.timeTo, "HH:mm");
          
          if (from.isValid() && to.isValid()) {
            const durationMinutes = to.diff(from, 'minute');
            nextTimeTo = dayjs(nextTimeFrom, "HH:mm").add(durationMinutes, 'minute').format("HH:mm");
          } else {
             nextTimeTo = dayjs(nextTimeFrom, "HH:mm").add(45, 'minute').format("HH:mm");
          }
        }
      }

      return {
        ...prev,
        [day]: [...rows, { dayOfWeek: day, timeFrom: nextTimeFrom, timeTo: nextTimeTo }]
      };
    });
  };

  const removeRow = (day: string, index: number) => {
    setModalEntries((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const copyToAllDays = (sourceDay: string) => {
    const sourceRows = modalEntries[sourceDay];
    if (sourceRows.length === 0) {
      toast.error(`No periods added on ${sourceDay} to copy.`);
      return;
    }

    setModalEntries(prev => {
      const newEntries = { ...prev };
      DAYS.forEach(day => {
        if (day !== sourceDay) {
          newEntries[day] = sourceRows.map(row => ({
            ...row,
            dayOfWeek: day,
            id: 0
          }));
        }
      });
      return newEntries;
    });
    toast.success(`Copied ${sourceDay} timetable to all other days.`);
  };

  const updateRow = (day: string, index: number, field: string, value: any) => {
    setModalEntries(prev => {
      const newRows = [...prev[day]];
      newRows[index] = { ...newRows[index], [field]: value };
      return { ...prev, [day]: newRows };
    });
  };

  const handleSaveTimetable = () => {
    if (!campusId || !gradeId || !sectionId) {
      if (loginInfo?.userLevel === 3) {
        toast.error("Please select a Grade and Section.");
      } else {
        toast.error("Please select a Campus, Grade, and Section.");
      }
      return;
    }

    const allEntries: TimetableEntry[] = [];
    DAYS.forEach(day => {
      modalEntries[day].forEach(row => {
        if (row.subjectId && row.employeeId && row.timeFrom && row.timeTo) {
          allEntries.push({
            dayOfWeek: day,
            subjectId: row.subjectId,
            employeeId: row.employeeId,
            timeFrom: row.timeFrom,
            timeTo: row.timeTo,
            id: row.id || 0
          });
        }
      });
    });

    if (allEntries.length === 0) {
      toast.error("Please add at least one timetable entry.");
      return;
    }

    const payload: Timetable = {
      id: selectedTimetable?.id || 0,
      campusId,
      gradeId,
      sectionId,
      createdBy: loginInfo?.id || 0,
      subjectGroup: "Default",
      periodStartTime: allEntries[0].timeFrom,
      durationMinutes: 45,
      isEnabled: true,
      entries: allEntries
    };

    if (payload.id && payload.id !== 0) {
      dispatch(UpdateTimetable(payload)).then(() => handleApplyClick());
    } else {
      dispatch(AddTimetable(payload)).then(() => handleApplyClick());
    }

    // Close modal
    const closeBtn = document.getElementById("close_add_time_table_modal");
    if (closeBtn) {
      closeBtn.click();
    }
  };

  // Render Display
  const groupedEntries = DAYS.reduce((acc, day) => ({ ...acc, [day]: [] }), {} as Record<string, TimetableEntry[]>);
  if (selectedTimetable?.entries) {
    selectedTimetable.entries.forEach(e => {
      if (groupedEntries[e.dayOfWeek]) {
        groupedEntries[e.dayOfWeek].push(e);
      }
    });
  }

  // Define Colors for Periods dynamically
  const colors = ["danger", "primary", "success", "pending", "info", "warning"];

  return (
    <div className="page-wrapper">
      <div className="content content-two">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Time Table</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">Academic</li>
                <li className="breadcrumb-item active" aria-current="page">Time Table</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <TooltipOption />
            <div className="mb-2">
              <Link
                to="#"
                className="btn btn-primary d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#add_time_table"
                onClick={openModal}
              >
                <i className="ti ti-square-rounded-plus me-2" />
                {selectedTimetable ? "Edit Time Table" : "Add Time Table"}
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
            <h4 className="mb-3">
              {selectedTimetable ? `Time Table - ${selectedTimetable.campusName || ''} (${selectedTimetable.gradeName || ''} - ${selectedTimetable.sectionName || ''})` : 'Time Table'}
            </h4>
            <div className="d-flex align-items-center flex-wrap">
              <div className="dropdown mb-3 me-2">
                <Link
                  to="#"
                  className="btn btn-outline-light bg-white dropdown-toggle"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  aria-expanded="false"
                >
                  <i className="ti ti-filter me-2" /> Filter
                </Link>
                <div className="dropdown-menu drop-width" ref={dropdownMenuRef}>
                  <form>
                    <div className="d-flex align-items-center border-bottom p-3">
                      <h4>Filter</h4>
                    </div>
                    <div className="p-3 pb-0 border-bottom">
                      <div className="row">
                        {loginInfo?.userLevel === 1 && (
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Region</label>
                              <CommonSelect3
                                options={regions}
                                value={regions.find((r: any) => r.value === regionId) || null}
                                onChange={(opt: any) => setRegionId(opt?.value || 0)}
                              />
                            </div>
                          </div>
                        )}
                        {loginInfo?.userLevel !== 3 && (
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Campus</label>
                              <CommonSelect3
                                options={campuses}
                                value={campuses.find((c) => c.value === campusId) || null}
                                onChange={(opt: any) => setCampusId(opt?.value || 0)}
                              />
                            </div>
                          </div>
                        )}
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Grade</label>
                            <CommonSelect3
                              options={grades}
                              value={grades.find(g => g.value === gradeId) || null}
                              onChange={(opt: any) => setGradeId(opt?.value || 0)}
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">Section</label>
                            <CommonSelect3
                              options={sections}
                              value={sections.find(s => s.value === sectionId) || null}
                              onChange={(opt: any) => setSectionId(opt?.value || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 d-flex align-items-center justify-content-end">
                      <Link to="#" className="btn btn-light me-3" onClick={handleResetClick}>
                        Reset
                      </Link>
                      <Link to="#" className="btn btn-primary" onClick={handleApplyClick}>
                        Apply
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          <Spin spinning={loading}>
            <div className="card-body pb-0">
              {selectedTimetable ? (
                <div className="d-flex flex-nowrap overflow-auto pb-4">
                  {DAYS.map(day => (
                    <div key={day} className="d-flex flex-column me-4 flex-fill" style={{ minWidth: "250px" }}>
                      <div className="mb-3">
                        <h6 className="fw-bold">{day}</h6>
                      </div>
                      {groupedEntries[day].length > 0 ? (
                        groupedEntries[day].sort((a, b) => a.timeFrom.localeCompare(b.timeFrom)).map((entry, index) => (
                          <div key={entry.id || index} className={`bg-transparent-${colors[index % colors.length]} rounded p-3 mb-4`}>
                            <p className="d-flex align-items-center text-nowrap mb-1 fw-medium text-dark">
                              <i className="ti ti-clock me-1" /> {entry.timeFrom} - {entry.timeTo}
                            </p>
                            <p className="text-dark mb-2">Subject: {entry.subjectName}</p>
                            <div className="bg-white rounded p-2 mt-2 shadow-sm">
                              <div className="text-muted d-flex align-items-center">
                                <span className="avatar avatar-sm me-2 bg-light text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold">
                                  {entry.employeeName?.charAt(0) || 'T'}
                                </span>
                                {entry.employeeName}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted border rounded bg-light border-dashed">
                          <p className="mb-0 fs-13">No classes</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-5 text-muted">
                  <i className="ti ti-calendar-off fs-40 mb-2"></i>
                  <h5>No Timetable Found</h5>
                  <p>Please select a Campus, Grade, and Section and click Apply.</p>
                </div>
              )}
            </div>
          </Spin>
        </div>

        {/* Add/Edit Modal */}
        <div className="modal fade" id="add_time_table">
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">{selectedTimetable ? "Edit Time Table" : "Add Time Table"}</h4>
                <button type="button" id="close_add_time_table_modal" className="btn-close custom-btn-close" data-bs-dismiss="modal" aria-label="Close">
                  <i className="ti ti-x" />
                </button>
              </div>
              <div className="modal-body p-4">
                <div className="row mb-4 border-bottom pb-3">
                  {loginInfo?.userLevel === 1 && (
                    <div className="col-lg-3 mb-3">
                      <label className="form-label fs-13 fw-medium">Region</label>
                      <CommonSelect3
                        options={regions}
                        value={regions.find((r: any) => r.value === regionId) || null}
                        onChange={(opt: any) => setRegionId(opt?.value || 0)}
                      />
                    </div>
                  )}
                  {loginInfo?.userLevel !== 3 && (
                    <div className="col-lg-3 mb-3">
                      <label className="form-label fs-13 fw-medium">Campus</label>
                      <CommonSelect3
                        options={campuses}
                        value={campuses.find((c) => c.value === campusId) || null}
                        onChange={(opt: any) => setCampusId(opt?.value || 0)}
                      />
                    </div>
                  )}
                  <div className="col-lg-3 mb-3">
                    <label className="form-label fs-13 fw-medium">Grade</label>
                    <CommonSelect3
                      options={grades}
                      value={grades.find((g) => g.value === gradeId) || null}
                      onChange={(opt: any) => setGradeId(opt?.value || 0)}
                    />
                  </div>
                  <div className="col-lg-3 mb-3">
                    <label className="form-label fs-13 fw-medium">Section</label>
                    <CommonSelect3
                      options={sections}
                      value={sections.find((s) => s.value === sectionId) || null}
                      onChange={(opt: any) => setSectionId(opt?.value || 0)}
                    />
                  </div>
                </div>

                <ul className="nav nav-pills custom-pills mb-4" role="tablist">
                  {DAYS.map(day => (
                    <li className="nav-item" role="presentation" key={day}>
                      <button
                        className={`nav-link ${activeTab === day ? 'active' : ''}`}
                        onClick={() => setActiveTab(day)}
                        type="button"
                        role="tab"
                      >
                        {day}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="tab-content">
                  {DAYS.map(day => (
                    <div key={day} className={`tab-pane fade ${activeTab === day ? 'show active' : ''}`} role="tabpanel">
                      {modalEntries[day].map((row, index) => (
                        <div className="add-timetable-row mb-3 p-3 border rounded bg-light" key={index}>
                          <div className="row align-items-center">
                            <div className="col-lg-3 mb-2">
                              <label className="form-label fs-13 fw-medium">Subject</label>
                              <Select
                                className="w-100"
                                showSearch
                                placeholder="Select Subject"
                                value={row.subjectId}
                                options={subjects}
                                onChange={(val) => updateRow(day, index, "subjectId", val)}
                                filterOption={(input, option) =>
                                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                              />
                            </div>
                            <div className="col-lg-3 mb-2">
                              <label className="form-label fs-13 fw-medium">Teacher</label>
                              <Select
                                className="w-100"
                                showSearch
                                placeholder="Select Teacher"
                                value={row.employeeId}
                                options={employees}
                                onChange={(val) => updateRow(day, index, "employeeId", val)}
                                filterOption={(input, option) =>
                                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                              />
                            </div>
                            <div className="col-lg-2 mb-2">
                              <label className="form-label fs-13 fw-medium">Time From</label>
                              <TimePicker 
                                className="w-100" 
                                format="HH:mm" 
                                value={row.timeFrom ? dayjs(row.timeFrom, "HH:mm") : null} 
                                onChange={(time, timeString) => updateRow(day, index, "timeFrom", timeString)} 
                                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                              />
                            </div>
                            <div className="col-lg-3 mb-2">
                              <label className="form-label fs-13 fw-medium">Time To</label>
                              <TimePicker 
                                className="w-100" 
                                format="HH:mm" 
                                value={row.timeTo ? dayjs(row.timeTo, "HH:mm") : null} 
                                onChange={(time, timeString) => updateRow(day, index, "timeTo", timeString)} 
                                getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
                              />
                            </div>
                            <div className="col-lg-1 d-flex align-items-end mb-2">
                              <Button danger type="text" icon={<i className="ti ti-trash fs-18" />} onClick={() => removeRow(day, index)} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-2 d-flex gap-2">
                        <Button type="dashed" className="flex-grow-1" icon={<i className="ti ti-plus" />} onClick={() => addRow(day)}>
                          Add Period
                        </Button>
                        <Button type="dashed" danger icon={<i className="ti ti-copy" />} onClick={() => copyToAllDays(day)}>
                          Copy to All Days
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <Button type="primary" onClick={handleSaveTimetable} loading={isActionLoading}>
                  {selectedTimetable ? "Save Changes" : "Save Time Table"}
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClassTimetable;
