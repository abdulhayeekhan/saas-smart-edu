import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from "../../../core/common/dataTable2/index";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { usePermission } from '../../../core/common/selectoption/selectoption';
import { GetAllClassTeachers, AddClassTeacher, UpdateClassTeacher, DeleteClassTeacher, ClassTeacher } from '../../../store/apps/class-teacher';
import { GetAllCampus } from '../../../store/apps/campus-management';
import { GetGrades } from '../../../store/apps/grades';
import { GetAllEmployees } from '../../../store/apps/campus-employee';
import { GetSections } from '../../../store/apps/section';
import CommonSelect3 from '../../../core/common/commonSelect3';

const ClassTeacherManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasPermission = usePermission("Class Teacher");
  
  const { data, loading } = useSelector((state: RootState) => state.classTeacher);
  const { data: campuses } = useSelector((state: RootState) => state.campus);
  const { data: grades } = useSelector((state: RootState) => state.grades);
  const { data: sections } = useSelector((state: RootState) => state.section);
  const { data: employees } = useSelector((state: RootState) => state.campusEmployee);

  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data;
  const userLevel = loginInfo?.userLevel || 0;
  const userCampusId = userLevel === 3 ? loginInfo?.userLevelId : null;

  const [addForm, setAddForm] = useState({
    campusId: userCampusId as number | null,
    gradeId: null as number | null,
    sectionId: null as number | null,
    employeeId: null as number | null,
    isEnabled: true
  });

  const [editForm, setEditForm] = useState<ClassTeacher>({
    id: 0,
    campusId: 0,
    gradeId: 0,
    sectionId: 0,
    employeeId: 0,
    isEnabled: true
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(GetAllClassTeachers({ pageNo: 1, pageSize: 1000, search: "", isEnabled: true }));
    dispatch(GetAllCampus({ pageNo: 1, pageSize: 1000, search: "" }));
    dispatch(GetGrades());
    dispatch(GetSections());
    dispatch(GetAllEmployees({
      pageNo: 1,
      pageSize: 1000,
      search: "",
      campusId: null,
      departmentId: null,
      designationId: null,
      employeeTypeId: null,
      gender: null,
      isActive: true
    }));
  }, [dispatch]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.campusId && addForm.gradeId && addForm.sectionId && addForm.employeeId) {
      await dispatch(AddClassTeacher({
        campusId: addForm.campusId as number,
        gradeId: addForm.gradeId as number,
        sectionId: addForm.sectionId as number,
        employeeId: addForm.employeeId as number,
        isEnabled: addForm.isEnabled
      })).then((res: any) => {
        if (!res.error) {
          setAddForm({
            campusId: userCampusId,
            gradeId: null,
            sectionId: null,
            employeeId: null,
            isEnabled: true
          });
          document.getElementById('close-add-modal')?.click();
          dispatch(GetAllClassTeachers({ pageNo: 1, pageSize: 1000, search: "", isEnabled: true }));
        }
      });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(UpdateClassTeacher({
      id: editForm.id,
      campusId: editForm.campusId,
      gradeId: editForm.gradeId,
      sectionId: editForm.sectionId,
      employeeId: editForm.employeeId,
      isEnabled: editForm.isEnabled
    })).then((res: any) => {
      if (!res.error) {
        document.getElementById('close-edit-modal')?.click();
        dispatch(GetAllClassTeachers({ pageNo: 1, pageSize: 1000, search: "", isEnabled: true }));
      }
    });
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteId) {
      dispatch(DeleteClassTeacher(deleteId)).then((res: any) => {
        if (!res.error) {
          document.getElementById('close-delete-modal')?.click();
          dispatch(GetAllClassTeachers({ pageNo: 1, pageSize: 1000, search: "", isEnabled: true }));
        }
      });
    }
  };

  const campusOptions = campuses?.map((c: any) => ({ value: c.id, label: c.name })) || [];
  const gradeOptions = grades?.map((g: any) => ({ value: g.id, label: g.name })) || [];
  
  const addSectionOptions = sections
    ?.filter((s: any) => addForm.campusId ? s.campusId === addForm.campusId : true)
    .map((s: any) => ({ value: s.id, label: s.name })) || [];

  const editSectionOptions = sections
    ?.filter((s: any) => editForm.campusId ? s.campusId === editForm.campusId : true)
    .map((s: any) => ({ value: s.id, label: s.name })) || [];
  
  const addEmployeeOptions = employees
    ?.filter((e: any) => addForm.campusId ? e.campusId === addForm.campusId : true)
    .map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName || ''}` })) || [];

  const editEmployeeOptions = employees
    ?.filter((e: any) => editForm.campusId ? e.campusId === editForm.campusId : true)
    .map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName || ''}` })) || [];

  const columns = [
    {
      title: "Campus",
      dataIndex: "campusName",
      sorter: (a: any, b: any) => (a.campusName || '').localeCompare(b.campusName || ''),
    },
    {
      title: "Grade",
      dataIndex: "gradeName",
      sorter: (a: any, b: any) => (a.gradeName || '').localeCompare(b.gradeName || ''),
    },
    {
      title: "Section",
      dataIndex: "sectionName",
      sorter: (a: any, b: any) => (a.sectionName || '').localeCompare(b.sectionName || ''),
    },
    {
      title: "Class Teacher",
      dataIndex: "employeeName",
      sorter: (a: any, b: any) => (a.employeeName || '').localeCompare(b.employeeName || ''),
    },
    {
      title: "Status",
      dataIndex: "isEnabled",
      render: (text: boolean) => (
        <>
          {text ? (
            <span className="badge badge-soft-success d-inline-flex align-items-center">
              <i className='ti ti-circle-filled fs-5 me-1'></i>Active
            </span>
          ) : (
            <span className="badge badge-soft-danger d-inline-flex align-items-center">
              <i className='ti ti-circle-filled fs-5 me-1'></i>Inactive
            </span>
          )}
        </>
      ),
      sorter: (a: any, b: any) => Number(b.isEnabled) - Number(a.isEnabled),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => (
        <>
          <div className="d-flex align-items-center">
            <div className="dropdown">
              <Link
                to="#"
                className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="ti ti-dots-vertical fs-14" />
              </Link>
              <ul className="dropdown-menu dropdown-menu-right p-3">
                {hasPermission?.editRight && (
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_modal"
                      onClick={() => setEditForm(record)}
                    >
                      <i className="ti ti-edit-circle me-2" />
                      Edit
                    </Link>
                  </li>
                )}
                {hasPermission?.deleteRight && (
                  <li>
                    <Link
                      className="dropdown-item rounded-1"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#delete-modal"
                      onClick={() => setDeleteId(record.id)}
                    >
                      <i className="ti ti-trash-x me-2" />
                      Delete
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Class Teacher</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="#">HRM</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Class Teacher
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              {hasPermission?.addRight && (
                <Link
                  to="#"
                  data-bs-toggle="modal"
                  data-bs-target="#add_modal"
                  className="btn btn-primary d-flex align-items-center"
                >
                  <i className="ti ti-square-rounded-plus me-2" />
                  Add Class Teacher
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
            <h4 className="mb-3">Class Teachers</h4>
          </div>
          <div className="card-body p-0 py-3">
            <Table 
              dataSource={data} 
              columns={columns} 
              Selection={true} 
            />
          </div>
        </div>
      </div>
      </div>

      {/* Add Modal */}
      <div className="modal fade" id="add_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Class Teacher</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-add-modal"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="row">
                  {userLevel !== 3 && (
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Campus</label>
                      <CommonSelect3
                        className="select"
                        options={campusOptions}
                        defaultValue={campusOptions.find((opt: any) => opt.value === addForm.campusId)}
                        onChange={(e: any) => setAddForm({ ...addForm, campusId: e?.value || null })}
                      />
                    </div>
                  )}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Grade</label>
                    <CommonSelect3
                      className="select"
                      options={gradeOptions}
                      defaultValue={gradeOptions.find((opt: any) => opt.value === addForm.gradeId)}
                      onChange={(e: any) => setAddForm({ ...addForm, gradeId: e?.value || null })}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Section</label>
                    <CommonSelect3
                      className="select"
                      options={addSectionOptions}
                      defaultValue={addSectionOptions.find((opt: any) => opt.value === addForm.sectionId)}
                      onChange={(e: any) => setAddForm({ ...addForm, sectionId: e?.value || null })}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Employee</label>
                    <CommonSelect3
                      className="select"
                      options={addEmployeeOptions}
                      defaultValue={addEmployeeOptions.find((opt: any) => opt.value === addForm.employeeId)}
                      onChange={(e: any) => setAddForm({ ...addForm, employeeId: e?.value || null })}
                    />
                  </div>
                  <div className="col-md-12 d-flex align-items-center mb-3">
                    <div className="form-check form-switch me-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="addStatus"
                        checked={addForm.isEnabled}
                        onChange={(e) => setAddForm({ ...addForm, isEnabled: e.target.checked })}
                      />
                    </div>
                    <label className="form-label mb-0" htmlFor="addStatus">Active Status</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!addForm.campusId || !addForm.gradeId || !addForm.sectionId || !addForm.employeeId}>
                  Add Class Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <div className="modal fade" id="edit_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Class Teacher</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-edit-modal"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="row">
                  {userLevel !== 3 && (
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Campus</label>
                      <CommonSelect3
                        className="select"
                        options={campusOptions}
                        defaultValue={campusOptions.find((opt: any) => opt.value === editForm.campusId)}
                        onChange={(e: any) => setEditForm({ ...editForm, campusId: e?.value || 0 })}
                      />
                    </div>
                  )}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Grade</label>
                    <CommonSelect3
                      className="select"
                      options={gradeOptions}
                      defaultValue={gradeOptions.find((opt: any) => opt.value === editForm.gradeId)}
                      onChange={(e: any) => setEditForm({ ...editForm, gradeId: e?.value || 0 })}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Section</label>
                    <CommonSelect3
                      className="select"
                      options={editSectionOptions}
                      defaultValue={editSectionOptions.find((opt: any) => opt.value === editForm.sectionId)}
                      onChange={(e: any) => setEditForm({ ...editForm, sectionId: e?.value || 0 })}
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Employee</label>
                    <CommonSelect3
                      className="select"
                      options={editEmployeeOptions}
                      defaultValue={editEmployeeOptions.find((opt: any) => opt.value === editForm.employeeId)}
                      onChange={(e: any) => setEditForm({ ...editForm, employeeId: e?.value || 0 })}
                    />
                  </div>
                  <div className="col-md-12 d-flex align-items-center mb-3">
                    <div className="form-check form-switch me-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="editStatus"
                        checked={editForm.isEnabled}
                        onChange={(e) => setEditForm({ ...editForm, isEnabled: e.target.checked })}
                      />
                    </div>
                    <label className="form-label mb-0" htmlFor="editStatus">Active Status</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!editForm.campusId || !editForm.gradeId || !editForm.sectionId || !editForm.employeeId}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <span className="avatar avatar-xl bg-transparent-danger text-danger mb-3">
                <i className="ti ti-trash-x fs-36" />
              </span>
              <h4 className="mb-1">Confirm Delete</h4>
              <p className="mb-3">
                Are you sure you want to delete this class teacher mapping? This action cannot be undone.
              </p>
              <div className="d-flex justify-content-center">
                <Link
                  to="#"
                  className="btn btn-light me-3"
                  data-bs-dismiss="modal"
                  id="close-delete-modal"
                >
                  Cancel
                </Link>
                <Link to="#" onClick={handleDeleteSubmit} className="btn btn-danger">
                  Yes, Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassTeacherManagement;
