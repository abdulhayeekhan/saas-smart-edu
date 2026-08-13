import { DatePicker, Spin } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { classSection } from "../../../core/data/json/class-section";
import Table from "../../../core/common/dataTable2/index";
import {
  activeList,
  usePermission
} from "../../../core/common/selectoption/selectoption";
import dayjs from "dayjs";
import Select from "react-select";
import { TableData } from "../../../core/data/interface";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../router/all_routes";
import type { RootState, AppDispatch } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import toast from 'react-hot-toast'
import { GetDiscountTypes, DiscountType, GetDiscountType, AddDiscountType, UpdateDiscountType } from '../../../store/apps/discount-type'

const DiscountTypes = () => {
  const routes = all_routes;
  const { data, loading } = useSelector((state: RootState) => state.discountType);
  const hasPermission = usePermission("Discount Type");
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [discountType, setDiscountType] = useState<DiscountType>({
    name: "",
    description: "",
    isEnabled: true,
    isDeleted: false,
    isPercentage: false,
    amount: 0
  })

  const handleChange = (field: keyof DiscountType, value: any) => {
    // setDiscountType((prev) => ({
    //   ...prev,
    //   [field]: value,
    // }));
    setDiscountType(prev => {
      let updatedValue: any = value
      if (field === 'amount' && prev.isPercentage) {
        updatedValue = Math.min(Number(value), 100)
        if (updatedValue < 0) updatedValue = 0
      }

      return {
        ...prev,
        [field]: updatedValue,
      }
    })

  }
  const [isSave, setIsSave] = useState(false)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSave(true);
    // ---- VALIDATION ----
    if (!discountType.name.trim()) {
      toast.error("Discount Type name is required");
      setIsSave(false);
      return;
    }

    if (discountType.amount === 0) {
      toast.error("Discount Type Amount is required");
      setIsSave(false);
      return;
    }

    // ---- CALL API ----
    await dispatch(AddDiscountType(discountType))
      .unwrap()
      .then(() => {
        // Reset input
        setDiscountType({
          name: "",
          description: "",
          isPercentage: true,
          isEnabled: true,
          amount: 0
        })

        // Close modal AFTER success
        closeBtnRef.current?.click();

        toast.success("Discount Type added successfully");
      })
      .catch((err) => {
        toast.error(err || "Failed to add grade");
      })
      .finally(() => {
        setIsSave(false); // always reset loading
      });
  };
  const [editDiscountType, setEditDiscountType] = useState<DiscountType>({
    id: 0,
    name: "",
    description: "",
    isEnabled: true,
    isDeleted: false,
    isPercentage: true,
    amount: 0
  });
  const handleClose = () => {
    setDiscountType({
      name: "",
      description: "",
      isEnabled: true,
      isDeleted: false,
      isPercentage: true,
      amount: 0
    })
    setEditDiscountType({
      id: 0,
      name: "",
      description: "",
      isEnabled: true,
      isDeleted: false,
      isPercentage: true,
      amount: 0
    });
  }
  const handleEditChange = (field: keyof DiscountType, value: any) => {
    setEditDiscountType(prev => {
      let updatedValue: any = value
      if (field === 'amount' && prev.isPercentage) {
        updatedValue = Math.min(Number(value), 100)
        if (updatedValue < 0) updatedValue = 0
      }

      return {
        ...prev,
        [field]: updatedValue,
      }
    })
  }
  const [editLoad, setEditLoad] = useState(false)
  const handleEdit = async (id: number) => {
    setEditLoad(true)
    try {
      const res = await dispatch(GetDiscountType(id)).unwrap();
      setEditDiscountType({
        id: res.id,
        name: res.name,
        description: res.description,
        isEnabled: res.isEnabled,
        isDeleted: res.isDeleted,
        isPercentage: res.isPercentage,
        amount: res.amount,
      });
    } catch (err) {
      toast.error("Failed to load discount type");
    } finally {
      setEditLoad(false)
    }
  };
  const [isUpdating, setIsUpdating] = useState(false)
  const handleUpdateSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true);
    // ---- VALIDATION ----
    if (!editDiscountType.name.trim()) {
      toast.error("Dicount Type name is required");
      setIsUpdating(false);
      return;
    }

    if (editDiscountType.amount === 0) {
      toast.error("amount is required");
      setIsUpdating(false);
      return;
    }

    // ---- CALL API ----
    await dispatch(UpdateDiscountType(editDiscountType))
      .unwrap()
      .then(() => {
        // Reset input
        setEditDiscountType({
          id: 0,
          name: "",
          description: "",
          isEnabled: true,
          isDeleted: false,
          isPercentage: true,
          amount: 0
        });

        // Close modal AFTER success
        closeBtnRef.current?.click();

        toast.success("discount type Update successfully");
      })
      .catch((err) => {
        toast.error(err || "Failed to update discount type");
      })
      .finally(() => {
        setIsUpdating(false); // always reset loading
      });
  };
  useEffect(() => {
    dispatch(GetDiscountTypes())
  }, [dispatch])
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };
  const route = all_routes
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: string, record: any, index: number) => (
        <>
          <Link to="#" className="link-primary">{record.id}</Link>
        </>
      ),
      sorter: (a: TableData, b: TableData) => a.id.length - b.id.length,
    },

    {
      title: "Name",
      dataIndex: "name",
      sorter: (a: TableData, b: TableData) => a.name.length - b.name.length,
    },
    {
      title: "Description",
      dataIndex: "description",
      sorter: (a: TableData, b: TableData) => a.description.length - b.description.length,
    },
    {
      title: "Is Percentage",
      dataIndex: "isPercentage",
      render: (isPercentage: boolean) => (
        isPercentage ? (
          <span className="badge badge-soft-success d-inline-flex align-items-center">
            <i className="ti ti-circle-filled fs-5 me-1"></i>
            Yes
          </span>
        ) : (
          <span className="badge badge-soft-danger d-inline-flex align-items-center">
            <i className="ti ti-circle-filled fs-5 me-1"></i>
            No
          </span>
        )
      )
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a: TableData, b: TableData) => a.amount - b.amount,
      render: (amount: number, record: TableData) => (
        record.isPercentage ? `${amount}%` : amount.toLocaleString()
      )
    },
    {
      title: "isEnabled",
      dataIndex: "isEnabled",
      render: () => (
        <>
          <span className="badge badge-soft-success d-inline-flex align-items-center"><i
            className="ti ti-circle-filled fs-5 me-1"></i>Active</span>
        </>
      )
    },
    ...(hasPermission?.deleteRight || hasPermission?.editRight
      ? [
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
                          data-bs-target="#edit_class_section"
                          onClick={() => handleEdit(record.id)}
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
        }]
      : []),
  ];
  return (
    <div>
      <>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content">
            {/* Page Header */}
            <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
              <div className="my-auto mb-2">
                <h3 className="page-title mb-1">Discount Type's</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="#">Academic </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Discount Type's
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                {(hasPermission && hasPermission?.addRight) && (
                  <div className="mb-2">
                    <Link
                      to="#"
                      className="btn btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#add_class_section"
                    >
                      <i className="ti ti-square-rounded-plus-filled me-2" />
                      Add Discount Type
                    </Link>
                  </div>
                )}
              </div>
            </div>
            {/* /Page Header */}
            {/* Guardians List */}
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                <h4 className="mb-3">Discount Type's</h4>
                <div className="d-flex align-items-center flex-wrap">

                </div>
              </div>
              <div className="card-body p-0 py-3">
                {/* Guardians List */}
                <Table columns={columns} dataSource={data} Selection={true} loading={loading} />
                {/* /Guardians List */}
              </div>
            </div>
            {/* /Guardians List */}
          </div>
        </div>
        {/* /Page Wrapper */}
      </>
      <div>
        {/* Add Class Section */}
        <div className="modal fade" id="add_class_section">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Discount Type</h4>
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
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Session Name</label>
                        <input type="text" name="name" value={discountType?.name} onChange={(e) => handleChange('name', e.target.value)} className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <input type="text" name="description" value={discountType?.description} onChange={(e) => handleChange('description', e.target.value)} className="form-control" />
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>IsPercentage</h5>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={discountType?.isPercentage}
                            onChange={(e) => handleChange('isPercentage', e.target.checked)}
                            id="switch-sm"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Amount</label>
                        <input
                          type="number"
                          name="amount"
                          value={discountType?.amount}
                          onChange={(e) => handleChange('amount', e.target.value)}
                          className="form-control"
                          min={0}
                          max={discountType?.isPercentage ? 100 : undefined}
                        />
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="status-title">
                          <h5>isEnabled</h5>
                          <p>Change the Status by toggle </p>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={discountType?.isEnabled}
                            onChange={(e) => handleChange('isEnabled', e.target.checked)}
                            id="switch-sm"
                          />
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
                  <button type="submit" disabled={isSave} className="btn btn-primary" data-bs-dismiss="modal">
                    {isSave ? 'Loading...' : 'Add Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Class Section */}
        {/* Edit Class Section */}
        <div className="modal fade" id="edit_class_section">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit DiscountType</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  ref={closeBtnRef}
                  onClick={handleClose}
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
                <form onSubmit={handleUpdateSave}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">DiscountType Name</label>
                          <input type="text" name="name" value={editDiscountType?.name} onChange={(e) => handleEditChange('name', e.target.value)} className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Description</label>
                          <input type="text" name="description" value={editDiscountType?.description} onChange={(e) => handleEditChange('description', e.target.value)} className="form-control" />
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="status-title">
                            <h5>IsPercentage</h5>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={editDiscountType?.isPercentage}
                              onChange={(e) => handleEditChange('isPercentage', e.target.checked)}
                              id="switch-sm"
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Amount</label>
                          <input
                            type="number"
                            name="amount"
                            value={editDiscountType?.amount}
                            onChange={(e) => handleEditChange('amount', e.target.value)}
                            className="form-control"
                            min={0}
                            max={editDiscountType?.isPercentage ? 100 : undefined}
                          />
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="status-title">
                            <h5>isEnabled</h5>
                            <p>Change the Status by toggle </p>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={editDiscountType?.isEnabled}
                              onChange={(e) => handleEditChange('isEnabled', e.target.checked)}
                              id="switch-sm"
                            />
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
                    <button type="submit" className="btn btn-primary" data-bs-dismiss="modal"
                    >
                      {editLoad ? 'Loading...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
        {/* /Edit Class Section */}

      </div>
    </div>
  );
};

export default DiscountTypes;
