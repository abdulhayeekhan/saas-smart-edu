import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import { all_routes } from "../../router/all_routes";
import {
  usePermission
} from "../../../core/common/selectoption/selectoption";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { GetReligions, Religion, GetReligion, AddReligion, UpdateReligion, DeleteReligion } from '../../../store/apps/religions'
import toast from 'react-hot-toast'

const MotherTongue = () => {
  const route = all_routes;
  const hasPermission = usePermission("Mother Tongue");
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const addcloseBtnRef = useRef<HTMLButtonElement>(null);
  const { data, loading } = useSelector((state: RootState) => state.religion);
  const [religionAdd, setReligionAdd] = useState<Religion>({
    name: '',
    isActive: true
  })
  const [religionEdit, setReligionEdit] = useState<Religion>({
    id: 0,
    name: '',
    isActive: true
  })
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target
    console.log("name", name, value, ',type:', type, checked);
    setReligionAdd(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target
    setReligionEdit(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
  const [isSave, setIsSave] = useState(false)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSave(true);

    // ---- VALIDATION ----
    if (!religionAdd.name.trim()) {
      toast.error("Religion name is required");
      setIsSave(false);
      return;
    }
    // ---- CALL API ----
    await dispatch(AddReligion(religionAdd))
      .unwrap()
      .then(() => {
        // Reset input
        setReligionAdd({
          name: '',
          isActive: true
        })
      })
      .catch((err) => {
        toast.error(err || "Failed to add grade");
      })
      .finally(() => {
        setIsSave(false); // always reset loading
        addcloseBtnRef.current?.click();
      });
  };
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSave(true);

    // ---- VALIDATION ----
    if (!religionEdit.name.trim()) {
      toast.error("Religion name is required");
      setIsSave(false);
      return;
    }
    // ---- CALL API ----
    await dispatch(UpdateReligion(religionEdit))
      .unwrap()
      .then(() => {
        // Reset input
        setReligionEdit({
          id: 0,
          name: '',
          isActive: true
        })
        // Close modal AFTER success
        closeBtnRef.current?.click();
      })
      .catch((err) => {
        toast.error(err || "Failed to update religion");
      })
      .finally(() => {
        setIsSave(false); // always reset loading
      });
  };
  const [editLoad, setEditLoad] = useState(false)

  const handleEdit = async (id?: number) => {
    if (id === undefined) return;

    setEditLoad(true)
    try {
      const res = await dispatch(GetReligion(id)).unwrap();
      setReligionEdit({
        id: res.id,
        name: res.name,
        isActive: res.isActive,
      });
    } catch (err) {
      toast.error("Failed to load religion");
    } finally {
      setEditLoad(false)
    }
  };

  const dispatch = useDispatch<AppDispatch>();
  const handleClose = () => {
    setReligionAdd({
      name: '',
      isActive: true
    })
    setReligionEdit({
      id: 0,
      name: '',
      isActive: true
    })
  }
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(DeleteReligion(deleteId))
      .unwrap()
      .then(() => {
        setDeleteId(null);
        closeBtnRef.current?.click();
      })
      .catch((err) => {
        toast.error(err || "Failed to delete religion");
      });
  };
  useEffect(() => {
    dispatch(GetReligions() as any);
  }, [dispatch]);
  
  return (
    <div>
      <div className="page-wrapper">
        <div className="content bg-white">
          <div className="d-md-flex d-block align-items-center justify-content-between border-bottom pb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Academic Settings</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to="index">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">Settings</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Academic Settings
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
            </div>
          </div>
          <div className="row">
            <div className="col-xxl-2 col-xl-3">
              <div className="pt-3 d-flex flex-column list-group mb-4">
                <Link to={route.schoolSettings} className="d-block rounded p-2">
                  School Settings
                </Link>
                <Link
                  to={route.religion}
                  className="d-block rounded active p-2"
                >
                  Religion
                </Link>
              </div>
            </div>
            <div className="col-xxl-10 col-xl-9">
              <div className="border-start ps-3">
                <form>
                  <div className="d-flex align-items-center justify-content-between flex-wrap border-bottom pt-3 mb-3">
                    <div className="mb-3">
                      <h5 className="mb-1">Religion</h5>
                      <p>Religion Settings Configuration</p>
                    </div>
                    <div className="mb-3">
                      {/* <Link
                        to="#"
                        className="btn btn-outline-light bg-white btn-icon me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#add_religion"
                      >
                        <i className="ti ti-plus" /> 
                        Save
                      </Link> */}
                      {/* <button className="btn btn-light me-2" type="button">
                        Cancel
                      </button> */}

                      <Link to="#" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_religion">
                        Save
                      </Link>

                    </div>
                  </div>
                  <div className="d-md-flex">
                    <div className="row flex-fill">
                      {data?.map((religion: Religion) => (
                        <div className="col-xxl-4 col-md-6" key={religion.id}>
                          <div className="d-flex align-items-center justify-content-between bg-white p-3 border rounded mb-3">
                            <h5 className="fs-15 fw-normal">{religion.name}</h5>
                            <div className="d-flex align-items-center">
                              {hasPermission?.editRight && (
                                <div className="status-toggle modal-status">
                                  <input
                                    type="checkbox"
                                    id="user2"
                                    checked={religion.isActive}
                                    className="check"
                                  />
                                  <label htmlFor="user2" className="checktoggle">
                                    {" "}
                                  </label>
                                </div>
                              )}
                              <div className="d-flex align-items-center ms-3">
                                {hasPermission?.editRight && (
                                  <Link
                                    to="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#edit_religion"
                                    onClick={() => handleEdit(religion?.id)}
                                  >
                                    <i className="ti ti-edit me-2" />
                                  </Link>
                                )}
                                {hasPermission?.deleteRight && (
                                  <Link
                                    to="#"
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete-modal"
                                    onClick={() => {
                                      if (religion?.id !== undefined) {
                                        setDeleteId(religion.id)
                                      }
                                    }}
                                  >
                                    <i className="ti ti-trash" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {loading && <Spin size="small" />}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <>
        {/* Add Religion */}
        <div className="modal fade" id="add_religion">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Religion</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  ref={addcloseBtnRef}
                  onClick={handleClose}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Name"
                          name="name"
                          value={religionAdd.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="modal-satus-toggle d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>Status</h5>
                          <p>Change the Status by toggle </p>
                        </div>
                        <div className="status-toggle modal-status">
                          <input type="checkbox" name="isActive" checked={religionAdd.isActive} onChange={handleChange} id="user4" className="check" />
                          <label htmlFor="user4" className="checktoggle">
                            {" "}
                          </label>
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
                    onClick={handleClose}
                  >
                    Cancel
                  </Link>
                  <button type="submit" disabled={isSave} className="btn btn-primary">
                    {isSave ? 'Saving...' : 'Add Religion'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Religion */}
        {/* Edit Religion */}
        <div className="modal fade" id="edit_religion">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Religion</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={handleClose}
                  ref={closeBtnRef}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              {editLoad ?
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                  width: "100%",
                }}><Spin size="small" /></div> :
                <form onSubmit={handleSaveUpdate}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={religionEdit?.name}
                            onChange={handleEditChange}
                            className="form-control"
                            placeholder="Enter Name"
                          />
                        </div>
                        <div className="modal-satus-toggle d-flex align-items-center justify-content-between">
                          <div className="status-title">
                            <h5>Status</h5>
                            <p>Change the Status by toggle </p>
                          </div>
                          <div className="status-toggle modal-status">
                            <input
                              type="checkbox"
                              id="user5"
                              name="isActive"
                              checked={religionEdit?.isActive}
                              className="check"
                              onChange={handleEditChange}
                              defaultChecked
                            />
                            <label htmlFor="user5" className="checktoggle">
                              {" "}
                            </label>
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
                      onClick={handleClose}
                    >
                      Cancel
                    </Link>
                    <button type="submit" disabled={isSave} className="btn btn-primary">
                      {isSave ? 'Updating...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
        {/* /Edit Religion */}
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
                    >
                      Cancel
                    </Link>
                    <Link to="#" className="btn btn-danger" onClick={handleDelete} data-bs-dismiss="modal">
                      Yes, Delete
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Delete Modal */}
      </>
    </div>
  );
};

export default MotherTongue;
