import React, { useRef } from "react";
import { all_routes } from "../../router/all_routes";
import { Link } from "react-router-dom";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import {
  feeGroup,
  feesTypes,
  ids,
  names,
  status,
  usePermission
} from "../../../core/common/selectoption/selectoption";
import { TableData } from "../../../core/data/interface";
import Table from "../../../core/common/dataTable2/index";
import FeesModal from "./feesModal";
import { feesType } from "../../../core/data/json/feesType";
import TooltipOption from "../../../core/common/tooltipOption";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store";
import { GetFeeTypes, GetFeeType, AddFeeType, UpdateFeeType, DeleteFeeType, FeeType } from "../../../store/apps/feeTypes";

const FeesTypes = () => {
  const routes = all_routes;
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const hasPermission = usePermission("Fee Types");
  const { data, loading } = useSelector((state: RootState) => state.feeType);

  const [editData, setEditData] = React.useState<any>(null);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  React.useEffect(() => {
    dispatch(GetFeeTypes());
  }, [dispatch, hasPermission]);

  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: string) => (
        <Link to="#" className="link-primary">
          {text}
        </Link>
      ),
      sorter: (a: TableData, b: TableData) => a.id.length - b.id.length,
    },
    {
      title: "Fees Type",
      dataIndex: "name",
      sorter: (a: TableData, b: TableData) =>
        a.name.length - b.name.length,
    },
    {
      title: "Description",
      dataIndex: "description",
      sorter: (a: TableData, b: TableData) =>
        a.description.length - b.description.length,
    },
    {
      title: "InvoiceDebitAccountName",
      dataIndex: "invoiceDebitAccountName",
      sorter: (a: TableData, b: TableData) =>
        a.invoiceDebitAccountName.length - b.invoiceDebitAccountName.length,
    },
    {
      title: "InvoiceCreditAccountName",
      dataIndex: "invoiceCreditAccountName",
      sorter: (a: TableData, b: TableData) =>
        a.invoiceCreditAccountName.length - b.invoiceCreditAccountName.length,
    },
    {
      title: "ReceiptCreditAccountName",
      dataIndex: "receiptCreditAccountName",
      sorter: (a: TableData, b: TableData) =>
        a.receiptCreditAccountName.length - b.receiptCreditAccountName.length,
    },
    {
      title: "receiptDebitAccountName",
      dataIndex: "receiptDebitAccountName",
    },
    ...(hasPermission?.deleteRight || hasPermission?.editRight
    ? [
        {
          title: "Action",
          dataIndex: "action",
          render: (_: any, record: any) => (
            <div className="d-flex align-items-center">
              <div className="dropdown">
                <Link
                  to="#"
                  className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                  data-bs-toggle="dropdown"
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
                        data-bs-target="#edit_fees_Type"
                        onClick={() => setEditData(record)}
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
          ),
        },
      ]
    : []),
  ];
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Fees Types</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">Fees Collection</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Fees Type
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              {/* <TooltipOption /> */}
              <div className="mb-2">
                {(hasPermission && hasPermission?.addRight) && (
                  <Link
                    to="#"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_fees_Type"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add Fees Type
                  </Link>
                )}
              </div>
            </div>
          </div>
          {/* /Page Header */}
          {/* Students List */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Fees Types</h4>
              <div className="d-flex align-items-center flex-wrap">
                {/* <div className="input-icon-start mb-3 me-2 position-relative">
                  <PredefinedDateRanges />
                </div> */}
                <div className="dropdown mb-3 me-2">
                  {/* <Link
                    to="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                  >
                    <i className="ti ti-filter me-2" />
                    Filter
                  </Link> */}
                  <div
                    className="dropdown-menu drop-width"
                    ref={dropdownMenuRef}
                  >
                    <form>
                      <div className="d-flex align-items-center border-bottom p-3">
                        <h4>Filter</h4>
                      </div>
                      <div className="p-3 border-bottom">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">ID</label>
                              <CommonSelect
                                className="select"
                                options={ids}
                                defaultValue={ids[0]}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Name</label>
                              <CommonSelect
                                className="select"
                                options={names}
                                defaultValue={names[0]}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Fees Group</label>
                              <CommonSelect
                                className="select"
                                options={feeGroup}
                                defaultValue={feeGroup[0]}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Fees Type</label>
                              <CommonSelect
                                className="select"
                                options={feesTypes}
                                defaultValue={feesTypes[0]}
                              />
                            </div>
                          </div>
                          <div className="col-md-12">
                            <div className="mb-0">
                              <label className="form-label">Status</label>
                              <CommonSelect
                                className="select"
                                options={status}
                                defaultValue={status[0]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 d-flex align-items-center justify-content-end">
                        <Link to="#" className="btn btn-light me-3">
                          Reset
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-primary"
                          onClick={handleApplyClick}
                        >
                          Apply
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="dropdown mb-3">
                  <Link
                    to="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-sort-ascending-2 me-2" />
                    Sort by A-Z{" "}
                  </Link>
                  <ul className="dropdown-menu p-3">
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Ascending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Descending
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Recently Viewed
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="dropdown-item rounded-1">
                        Recently Added
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0 py-3">
              {/* Student List */}
              <Table dataSource={data} columns={columns} Selection={true} loading={loading} />
              {/* /Student List */}
            </div>
          </div>
          {/* /Students List */}
        </div>
      </div>
      {/* /Page Wrapper */}
      <FeesModal editData={editData} setEditData={setEditData} deleteId={deleteId} setDeleteId={setDeleteId} />
    </>
  );
};

export default FeesTypes;
