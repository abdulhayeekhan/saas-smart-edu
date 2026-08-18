import React, { useEffect, useRef, useState } from "react";
import { all_routes } from "../../router/all_routes";
import { Link } from "react-router-dom";
import PredefinedDateRanges from "../../../core/common/datePicker";
import CommonSelect from "../../../core/common/commonSelect";
import CommonSelect2 from "../../../core/common/commonSelect2";
import {
  hostelName,
  hostelType,
  usePermission,
} from "../../../core/common/selectoption/selectoption";
import useRegionsList from "../../../core/common/selectoption/master/useRegions";
import { useCitiesList } from "../../../core/common/selectoption/address/useCitiesList";
import { TableData } from "../../../core/data/interface";
import Table from "../../../core/common/dataTable2/index";
import TooltipOption from "../../../core/common/tooltipOption";
import { hostelListData } from "../../../core/data/json/hostelListData";
import CampusModal from "./campusModel";
import { GetAllCampus } from '../../../store/apps/campus-management'
import type { AppDispatch } from "../../../store";
import { RootState } from '../../../store'
import { useDispatch, useSelector } from "react-redux";
import { Pagination } from "antd";

interface Campus {
  id: number;
  name: string;
  campusKey: string;
  shortName: string;
  regionName: string | null;
  contactNumber: string;
  email: string;
  cityId: number;
  cityName: string;
  address: string;
  latitude: string;
  lngitude: string;
  addedAt: string;
  addedBy: string;
  isEnabled: boolean;
  isDeleted: boolean;
  hasUploaded?: boolean;
  allowBulkImport?: boolean;
}

const CampusList = () => {
  const routes = all_routes;
  const hasPermission = usePermission("Campuses");
  const regionsList = useRegionsList();
  const citiesList = useCitiesList();
  const [pageNo, setPageNo] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [totalCount, setTotalCount] = useState(0)
  const [campusName, setCampusName] = useState('')
  const [regionId, setRegionId] = useState(null)
  const [campusListInfo, setCampusListInfo] = useState<Campus[]>([])
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const handleEdit = (id: number) => {
    setSelectedId(null);
    setTimeout(() => {
      setSelectedId(id);
    }, 0);
  };
  const dispatch = useDispatch<AppDispatch>();
  const campusListInfonew = useSelector((state: RootState) => state.campus);

  const loginInfo = JSON.parse(localStorage.getItem("loginInfo") || "{}");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const userLevel = Number(loginInfo?.userLevel || userData?.data?.userLevel || 0);
  const userLevelId = Number(loginInfo?.userLevelId || userData?.data?.userLevelId || 0);

  const GetCampuses = React.useCallback(async () => {
    setLoading(true);
    try {
      const effectiveRegionId = userLevel === 2 ? userLevelId : regionId;

      const body = {
        pageNo,
        pageSize,
        campusName,
        ...(effectiveRegionId ? { regionId: effectiveRegionId } : {}),
      };
      const response = await dispatch(GetAllCampus(body));
      const countData = {
        pageNo: 1,
        pageSize: 10000,
        campusName,
        ...(effectiveRegionId ? { regionId: effectiveRegionId } : {}),
      };
      const count_res = await dispatch(GetAllCampus(countData));
      if (count_res.payload && Array.isArray(count_res.payload)) {
        let list = count_res.payload;
        if (userLevel === 2 && userLevelId) {
          list = list.filter((c: any) => Number(c.regionId) === Number(userLevelId));
        }
        setTotalCount(list.length);
      }
      if (response?.payload && Array.isArray(response.payload)) {
        let list = response.payload as Campus[];
        if (userLevel === 2 && userLevelId) {
          list = list.filter((c: any) => Number(c.regionId) === Number(userLevelId));
        }
        setCampusListInfo(list);
      }
    } catch (error) {
      console.error("Error fetching campuses:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, pageNo, pageSize, campusName, regionId, userLevel, userLevelId]);

  useEffect(() => {
    GetCampuses();
  }, [GetCampuses]);

  const handleRegionId = async (value: any) => {
    await setRegionId(value);
    await setPageNo(1);
  };
  const handleSearch = (field: string, value: any) => {
    setCampusName(value);
  };
  const handleTableChange = (page: number, pageSize?: number) => {
    setPageNo(page)
    setPageSize(pageSize ?? 25)
  };
  useEffect(() => {
    GetCampuses()
  }, [pageNo, pageSize, totalCount, regionId, campusName])
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
  const data = hostelListData;
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
      title: "Campus Name",
      dataIndex: "name",

      sorter: (a: TableData, b: TableData) =>
        a.name.length - b.name.length,
    },
    {
      title: "Campus Key",
      dataIndex: "campusKey",

      sorter: (a: TableData, b: TableData) =>
        a.campusKey.length - b.campusKey.length,
    },

    {
      title: "Region",
      dataIndex: "regionName",
      sorter: (a: TableData, b: TableData) =>
        a.regionName.length - b.regionName.length,
    },
    {
      title: "City",
      dataIndex: "cityName",
      sorter: (a: TableData, b: TableData) =>
        a.cityName.length - b.cityName.length,
    },
    {
      title: "Address",
      dataIndex: "address",

    },
    {
      title: "Status",
      dataIndex: "isEnabled",
      render: (text: boolean) => (
        <>
          {text === true ? (
            <span className="badge badge-soft-success d-inline-flex align-items-center">
              <i className="ti ti-circle-filled fs-5 me-1"></i>
              Active
            </span>
          ) : (
            <span className="badge badge-soft-danger d-inline-flex align-items-center">
              <i className="ti ti-circle-filled fs-5 me-1"></i>
              In-Active
            </span>
          )}
        </>
      ),
      sorter: (a: TableData, b: TableData) => a.status.length - b.status.length,
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
                    data-bs-target="#edit_hostel"
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
  ] : []),
  ];
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Campuses List</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">Management</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Campuses List
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
                  data-bs-target="#add_hostel"
                >
                  <i className="ti ti-square-rounded-plus me-2" />
                  Add Campus
                </Link>
              </div>
              )}
            </div>
          </div>
          {/* /Page Header */}
          {/* Students List */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Campuses List</h4>
              <div className="d-flex align-items-center flex-wrap">
                {/* <div className="input-icon-start mb-3 me-2 position-relative">
                  <PredefinedDateRanges />
                </div> */}
                <div className="dropdown mb-3 me-2">
                  <Link
                    to="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="outside"
                  >
                    <i className="ti ti-filter me-2" />
                    Filter
                  </Link>
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
                          {userLevel !== 2 && (
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Region</label>
                                <CommonSelect2
                                  className="select"
                                  options={regionsList}
                                  onChange={(selected) =>
                                    handleRegionId(selected?.value || null)
                                  }
                                  defaultValue={regionsList[0]}
                                />
                              </div>
                            </div>
                          )}
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">City</label>
                              <CommonSelect2
                                className="select"
                                options={citiesList}
                                onChange={(selected) =>
                                  handleRegionId(selected?.value || null)
                                }
                                defaultValue={citiesList[0]}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Campus Name</label>
                              <input className="form-control" value={campusName} onChange={(e) => handleSearch('campusName', e.target.value)} placeholder="Campus Search" />
                              {/* <CommonSelect
                                className="select"
                                options={hostelType}
                                defaultValue={hostelType[0]}
                              /> */}
                            </div>
                          </div>

                        </div>
                      </div>
                      {/* <div className="p-3 d-flex align-items-center justify-content-end">
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
                      </div> */}
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
              <Table dataSource={campusListInfo} columns={columns} Selection={true} loading={loading} />
              <div className="mt-5 d-flex justify-content-end">
                <Pagination
                  current={pageNo}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={handleTableChange}
                />
              </div>
              {/* /Student List */}
            </div>
          </div>
          {/* /Students List */}
        </div>
      </div>
      {/* /Page Wrapper */}
      <CampusModal selectedId={selectedId} onSuccess={GetCampuses} />
    </>
  );
};

export default CampusList;
