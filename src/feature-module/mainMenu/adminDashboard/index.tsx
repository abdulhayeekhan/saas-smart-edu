import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";
import "bootstrap-daterangepicker/daterangepicker.css";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AdminDashboardModal from "./adminDashboardModal";
import type { RootState, AppDispatch } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { InquiryFilter, GetInquiries, resetInquiryState } from '../../../store/apps/inquiry';
import { GetAdmissions, AdmissionFilter } from '../../../store/apps/admissions';
import { AddNotice, EditNotice, GetAllNotices, GetNoticeById, NoticeFilter, Notice } from '../../../store/apps/noticeBoard';
import axios from "axios";
import { GetInvoiceReceiptSummaryReport, GetAverageFeeReport } from "../../../store/apps/academic-reports";
import { useLastAcademicSession } from "../../../core/common/selectoption/academic/useLastAcademicSession";
dayjs.extend(relativeTime);

const baseURL = process.env.REACT_APP_API_BASE_URL

interface LoginInfo {
  roleId?: number;
  username?: string;
  [key: string]: any;
}

interface RoleRight {
  moduleName: string;
  canView?: boolean;
  canEdit?: boolean;
  [key: string]: any;
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

const AdminDashboard = () => {
  const routes = all_routes;
  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : {};
  const userLevel = userInfo?.data?.userLevel ?? userInfo?.userLevel;
  const userLevelId = userInfo?.data?.userLevelId ?? userInfo?.userLevelId;
  const rolesId = userInfo?.data?.roleId ?? userInfo?.roleId;

  const loginInfo = JSON.parse(localStorage?.getItem("loginInfo") || "{}");
  const roleId = loginInfo?.roleId;

  const dispatch = useDispatch<AppDispatch>();
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [campusOptions, setCampusOptions] = useState<any[]>([]);

  const effectiveCampusId = userLevel === 3 ? userLevelId : selectedCampusId;

  // Load campus list for Region Level (userLevel === 2) and Super Admin (userLevel === 1)
  useEffect(() => {
    if (userLevel === 2 || userLevel === 1) {
      const fetchCampuses = async () => {
        try {
          const body = {
            pageNo: 1,
            pageSize: 10000,
            isEnabled: true,
            ...(userLevel === 2 && userLevelId ? { regionId: userLevelId } : {})
          };
          const { data } = await axios.post(`${baseURL}/api/campus/getall`, body);
          if (data?.data && Array.isArray(data.data)) {
            let list = data.data;
            if (userLevel === 2 && userLevelId) {
              const regionNum = Number(userLevelId);
              const matches = list.filter(
                (c: any) =>
                  Number(c?.regionId) === regionNum ||
                  Number(c?.regionID) === regionNum ||
                  Number(c?.region_id) === regionNum ||
                  Number(c?.region?.id) === regionNum
              );
              if (matches.length > 0) {
                list = matches;
              }
            }
            setCampusOptions(list);
          }
        } catch (err) {
          console.error("Failed to load campus list for region", err);
        }
      };
      fetchCampuses();
    }
  }, [userLevel, userLevelId]);

  const [filter, setFilter] = useState<NoticeFilter>({
    pageNo: 1,
    pageSize: 5,
    search: '',
    isEnabled: true
  })
  const [inquiryFilter, setInquiryFilter] = useState<InquiryFilter>({
    pageNo: 1,
    pageSize: 100000,
    campusId: 0,
    regionId: 0
  });

  useEffect(() => {
    if (userLevel === 2 && (!selectedCampusId || Number(selectedCampusId) <= 0)) {
      dispatch(resetInquiryState());
      return;
    }

    let currentFilter: any = {
      ...inquiryFilter,
      pageNo: 1,
    };

    if (userLevel === 1) {
      if (selectedCampusId) {
        currentFilter.campusId = selectedCampusId;
        delete currentFilter.regionId;
      } else {
        delete currentFilter.regionId;
        delete currentFilter.campusId;
      }
    } else if (userLevel === 2) {
      currentFilter.campusId = selectedCampusId;
      delete currentFilter.regionId;
    } else if (userLevel === 3) {
      currentFilter.campusId = userLevelId;
      delete currentFilter.regionId;
    }

    setInquiryFilter(currentFilter);
    dispatch(GetInquiries(currentFilter));
  }, [userLevel, userLevelId, selectedCampusId, dispatch]);

  const [admissionFilter, setAdmissionFilter] = useState<AdmissionFilter>({
    pageNo: 1,
    pageSize: 100000,
    campusId: effectiveCampusId,
    isEnabled: true
  });
  const [totalAdmissions, setTotalAdmissions] = useState(0)

  useEffect(() => {
    if (userLevel === 2 && (!effectiveCampusId || Number(effectiveCampusId) <= 0)) {
      setTotalAdmissions(0);
      return;
    }

    const currentAdmissionFilter = {
      ...admissionFilter,
      pageNo: 1,
      campusId: effectiveCampusId,
    };

    setAdmissionFilter(currentAdmissionFilter);

    const GetAdmissionsList = async () => {
      try {
        setTotalAdmissions(0)
        const { data } = await axios.post(`${baseURL}/api/Admission/GetAll`, currentAdmissionFilter);
        setTotalAdmissions(data?.totalCount || 0)
      } catch (error) {
        console.error("Failed to fetch admissions list", error);
      }
    }
    GetAdmissionsList()
  }, [userLevel, userLevelId, effectiveCampusId]);

  const [totalTeachers, setTotalTeachers] = useState(0);
  useEffect(() => {
    if (userLevel === 2 && (!effectiveCampusId || Number(effectiveCampusId) <= 0)) {
      setTotalTeachers(0);
      return;
    }

    const GetTeachersList = async () => {
      try {
        setTotalTeachers(0);
        const payload = {
          pageNo: 1,
          pageSize: 1,
          search: "",
          campusId: effectiveCampusId,
          departmentId: null,
          designationId: null,
          employeeTypeId: null,
          gender: null,
          isActive: true
        };
        const { data } = await axios.post(`${baseURL}/api/HREmployee/GetAll`, payload);
        setTotalTeachers(data?.totalCount || 0);
      } catch (error) {
        console.error("Failed to fetch teachers list", error);
      }
    };
    GetTeachersList();
  }, [userLevel, userLevelId, effectiveCampusId]);

  const { lastSessionId } = useLastAcademicSession();

  useEffect(() => {
    if (effectiveCampusId && lastSessionId) {
      dispatch(GetAverageFeeReport({
        campusId: effectiveCampusId,
        sessionId: lastSessionId
      }));
    }
  }, [effectiveCampusId, lastSessionId, dispatch]);

  useEffect(() => {
    if (effectiveCampusId && (CheckRoleRight("Invoice Receipt Summary Report") || roleId === 1 || userLevel === 2 || userLevel === 1)) {
      dispatch(GetInvoiceReceiptSummaryReport({
        campusId: effectiveCampusId,
        fromDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        toDate: dayjs().format('YYYY-MM-DD'),
        gradeId: null
      }));
    }
  }, [effectiveCampusId, roleId, userLevel, dispatch]);

  const { data, totalCount, pageSize, currentPage, loading, error } = useSelector((state: RootState) => state.notice);
  const inquires = useSelector((state: RootState) => state.inquiry);
  const admissions = useSelector((state: RootState) => state.admissions);
  const { invoiceReceiptSummaryReport, averageFeeReport } = useSelector((state: RootState) => state.academicReport);
  const totalInquiries = inquires.totalCount;

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
  useEffect(() => {
    dispatch(GetAllNotices(filter))
  }, [dispatch])

  const CheckRoleRight = (moduleName: string) => {
    const savedRights: RoleRight[] = JSON.parse(localStorage.getItem("roleRights") || "[]");
    const found = savedRights.find((i) => i?.moduleName === moduleName);
    const viewRight = found?.viewRight ?? false;
    return viewRight;
  }
  const [date, setDate] = useState<Nullable<Date>>(null);
  function SampleNextArrow(props: any) {
    const { style, onClick } = props;
    return (
      <div
        className="slick-nav slick-nav-next"
        style={{ ...style, display: "flex", top: "30%", right: "30%" }}
        onClick={onClick}
      >
        <i className="fas fa-chevron-right" style={{ color: "#677788" }}></i>
      </div>
    );
  }

  function SamplePrevArrow(props: any) {
    const { style, onClick } = props;
    return (
      <div
        className="slick-nav slick-nav-prev"
        style={{ ...style, display: "flex", top: "30%", left: "30%" }}
        onClick={onClick}
      >
        <i className="fas fa-chevron-left" style={{ color: "#677788" }}></i>
      </div>
    );
  }
  const settings = {
    dots: false,
    autoplay: false,
    arrows: false,
    slidesToShow: 2,
    margin: 24,
    speed: 500,
    responsive: [
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 776,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 567,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  const student = {
    dots: false,
    autoplay: false,
    slidesToShow: 1,
    speed: 500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  const teacher = {
    dots: false,
    autoplay: false,
    slidesToShow: 1,
    speed: 500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };
  const [studentDonutChart] = useState<any>({
    chart: {
      height: 218,
      width: 218,
      type: "donut",
      toolbar: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    colors: ["#7C3AED", "#6FCCD8"],
    series: [3610, 44],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 180,
          },
        },
      },
    ],
  });
  const [teacherDonutChart] = useState<any>({
    chart: {
      height: 218,
      width: 218,
      type: "donut",
      toolbar: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    colors: ["#7C3AED", "#6FCCD8"],
    series: [346, 54],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 180,
          },
        },
      },
    ],
  });
  const [staffDonutChart] = useState<any>({
    chart: {
      height: 218,
      width: 218,
      type: "donut",
      toolbar: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    colors: ["#7C3AED", "#6FCCD8"],
    series: [620, 80],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 180,
          },
        },
      },
    ],
  });
  const [classDonutChart] = useState<any>({
    chart: {
      height: 218,
      width: 218,
      type: "donut",
      toolbar: {
        show: false,
      },
    },
    labels: ["Good", "Average", "Below Average"],
    legend: { show: false },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      tickAmount: 3,
      labels: {
        offsetX: -15,
      },
    },
    grid: {
      padding: {
        left: -8,
      },
    },
    colors: ["#7C3AED", "#EAB300", "#E82646"],
    series: [45, 11, 2],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 180,
          },
        },
      },
    ],
  });
  const globalFilterOptions = [
    { label: 'Last 30 Days', value: 0 },
    { label: 'Last 90 Days', value: 1 },
    { label: 'Last 6 Months', value: 2 },
    { label: 'Last 12 Months', value: 3 },
  ];
  const [selectedGlobalFilter, setSelectedGlobalFilter] = useState(globalFilterOptions[0]);
  const [earningExpenseStats, setEarningExpenseStats] = useState<any>(null);

  const [feeStats, setFeeStats] = useState<any>(null);
  const [feesBarOptions, setFeesBarOptions] = useState<any>({
    chart: {
      height: 275,
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      }
    },
    legend: {
      show: true,
      horizontalAlign: 'left',
      position: 'top',
      fontSize: '14px',
      labels: {
        colors: '#5D6369',
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        endingShape: 'rounded'
      },
    },
    colors: ['#7C3AED', '#E9EDF4'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    grid: {
      padding: {
        left: -8,
      },
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      tickAmount: 3,
      labels: {
        offsetX: -15
      },
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val: any) {
          return val + " thousands"
        }
      }
    }
  });
  const [feesBarSeries, setFeesBarSeries] = useState<any>([
    {
      name: 'Collected Fee',
      data: []
    },
    {
      name: 'Total Fee',
      data: []
    }
  ]);

  const fetchCampusFeeStats = async (filterValue: number) => {
    if (userLevel === 2 && (!effectiveCampusId || Number(effectiveCampusId) <= 0)) {
      setFeeStats(null);
      setFeesBarSeries([
        { name: 'Collected Fee', data: [] },
        { name: 'Total Fee', data: [] },
      ]);
      setFeesBarOptions((prev: any) => ({
        ...prev,
        xaxis: {
          ...prev.xaxis,
          categories: [],
        },
      }));
      return;
    }

    try {
      const body = {
        campusId: effectiveCampusId || null,
        filter: filterValue,
      };

      const response = await axios.post(`${baseURL}/api/Dashboard/GetCampusFeeStats`, body);

      const responseData = response?.data;
      if (responseData?.status) {
        const monthlyData = responseData.data?.monthlyData ?? [];
        setFeeStats(responseData.data);
        setFeesBarSeries([
          {
            name: 'Collected Fee',
            data: monthlyData.map((item: any) => item.totalCollection ?? 0),
          },
          {
            name: 'Total Fee',
            data: monthlyData.map((item: any) => item.totalFee ?? 0),
          },
        ]);
        setFeesBarOptions((prev: any) => ({
          ...prev,
          xaxis: {
            ...prev.xaxis,
            categories: monthlyData.map((item: any) => item.monthName ?? ''),
          },
        }));
      } else {
        setFeeStats(null);
        setFeesBarSeries([
          { name: 'Collected Fee', data: [] },
          { name: 'Total Fee', data: [] },
        ]);
        setFeesBarOptions((prev: any) => ({
          ...prev,
          xaxis: {
            ...prev.xaxis,
            categories: [],
          },
        }));
      }
    } catch (error) {
      console.error('Failed to load campus fee stats', error);
      setFeeStats(null);
    }
  };

  useEffect(() => {
    fetchCampusFeeStats(selectedGlobalFilter.value);
  }, [userLevel, userLevelId, effectiveCampusId, selectedGlobalFilter.value]);

  const fetchCampusEarningExpenseStats = async (filterValue: number) => {
    if (userLevel === 2 && (!effectiveCampusId || Number(effectiveCampusId) <= 0)) {
      setEarningExpenseStats(null);
      return;
    }

    try {
      const body = {
        campusId: effectiveCampusId || null,
        filter: filterValue,
      };

      const response = await axios.post(`${baseURL}/api/Dashboard/GetCampusEarningExpenseStats`, body);

      const responseData = response?.data;
      if (responseData?.status) {
        setEarningExpenseStats(responseData.data);
      } else {
        setEarningExpenseStats(null);
      }
    } catch (error) {
      console.error('Failed to load campus earning/expense stats', error);
      setEarningExpenseStats(null);
    }
  };

  useEffect(() => {
    fetchCampusEarningExpenseStats(selectedGlobalFilter.value);
  }, [userLevel, userLevelId, effectiveCampusId, selectedGlobalFilter.value]);

  const [totalEarningArea, setTotalEarningArea] = useState<any>({
    chart: {
      height: 90,
      type: 'area',
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: true
      }
    },
    colors: ['#7C3AED'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    series: [{
      name: 'Earnings',
      data: []
    }]
  })
  const [totalExpenseArea, setTotalExpenseArea] = useState<any>({
    chart: {
      height: 90,
      type: 'area',
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: true
      }
    },
    colors: ['#E82646'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    series: [{
      name: 'Expense',
      data: []
    }]
  })

  useEffect(() => {
    if (earningExpenseStats) {
      const monthlyData = earningExpenseStats.monthlyData ?? [];
      setTotalEarningArea((prev: any) => ({
        ...prev,
        series: [{
          name: 'Earnings',
          data: monthlyData.map((item: any) => item.totalEarning ?? 0)
        }]
      }));
      setTotalExpenseArea((prev: any) => ({
        ...prev,
        series: [{
          name: 'Expense',
          data: monthlyData.map((item: any) => item.totalExpense ?? 0)
        }]
      }));
    }
  }, [earningExpenseStats]);

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          <>
            {/* Page Header */}
            <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
              <div className="my-auto mb-2">
                <h3 className="page-title mb-1">Admin Dashboard</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>Dashboard</Link>
                    </li>
                    <li
                      className="breadcrumb-item active"
                      aria-current="page"
                    >
                      Admin Dashboard
                    </li>
                  </ol>
                </nav>
              </div>

              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                {(CheckRoleRight("Inquiries") || roleId === 1) && (
                  <div className="mb-2">
                    <Link
                      to={routes.addstudentInquiry}
                      className="btn btn-primary d-flex align-items-center me-3"
                    >
                      <i className="ti ti-square-rounded-plus me-2" />
                      Add New Inquiry
                    </Link>
                  </div>
                )}
                {(CheckRoleRight("Fee Receipt") || roleId === 1) && (
                  <div className="mb-2">
                    <Link
                      to={routes.feeReceipt}
                      className="btn btn-light d-flex align-items-center"
                    >
                      Fee Receipt
                    </Link>
                  </div>
                )}
                {(userLevel === 1 || userLevel === 2) && (
                  <div className="mb-2 ms-2" style={{ minWidth: "220px" }}>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-primary">
                        <i className="ti ti-building-community fs-16" />
                      </span>
                      <select
                        className="form-select border-start-0 ps-0 fw-semibold text-dark fs-13"
                        value={selectedCampusId ?? ""}
                        onChange={(e) => setSelectedCampusId(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">
                          {userLevel === 2 ? "All Region Campuses" : "All Campuses"}
                        </option>
                        {campusOptions.map((campus: any) => (
                          <option key={campus.id} value={campus.id}>
                            {campus.name} ({campus.cityName || campus.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {(userLevel === 1 || userLevel === 2 || userLevel === 3) && (
                  <div className="dropdown mb-2 ms-2">
                    <Link
                      to="#"
                      className="btn btn-white dropdown-toggle d-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-calendar me-2" />
                      {selectedGlobalFilter.label}
                    </Link>
                    <ul className="dropdown-menu mt-2 p-3">
                      {globalFilterOptions.map(option => (
                        <li key={option.value}>
                          <Link
                            to="#"
                            className={`dropdown-item rounded-1${option.value === selectedGlobalFilter.value ? ' active' : ''}`}
                            onClick={e => {
                              e.preventDefault();
                              setSelectedGlobalFilter(option);
                            }}
                          >
                            {option.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>


            </div>


            <div className="row">
              <div className="col-md-12">
                {/* Dashboard Content */}
                <div className="card border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #4c40ed 0%, #6c5ce7 50%, #854cde 100%)" }}>
                  <div className="overlay-img">
                    <ImageWithBasePath
                      src="assets/img/bg/shape-04.png"
                      alt="img"
                      className="img-fluid shape-01"
                    />
                    <ImageWithBasePath
                      src="assets/img/bg/shape-01.png"
                      alt="img"
                      className="img-fluid shape-02"
                    />
                    <ImageWithBasePath
                      src="assets/img/bg/shape-02.png"
                      alt="img"
                      className="img-fluid shape-03"
                    />
                    <ImageWithBasePath
                      src="assets/img/bg/shape-03.png"
                      alt="img"
                      className="img-fluid shape-04"
                    />
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-xl-center justify-content-xl-between flex-xl-row flex-column">
                      <div className="mb-3 mb-xl-0">
                        <div className="d-flex align-items-center flex-wrap mb-2">
                          <h1 className="text-white me-2">
                            Welcome Back, {userInfo?.data?.firstname + ' ' + userInfo?.data?.lastname}
                          </h1>
                          <Link
                            to={routes.profile}
                            className="avatar avatar-sm img-rounded bg-gray-800 dark-hover"
                          >
                            <i className="ti ti-edit text-white" />
                          </Link>
                        </div>
                        <p className="text-white">Have a Good day at work</p>
                      </div>
                      <p className="text-white custom-text-white">
                        @{userInfo?.data?.username}
                      </p>
                    </div>
                  </div>
                </div>
                {/* /Dashboard Content */}
              </div>
            </div>

            <div className="row">
              {/* Total Inquiries */}
              <div className="col-xxl-3 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-xl bg-danger-transparent me-2 p-1">
                        <ImageWithBasePath
                          src="assets/img/icons/smile-chat.svg"
                          alt="img"
                        />
                      </div>
                      <div className="overflow-hidden flex-fill">
                        <div className="d-flex align-items-center justify-content-between">
                          <h2 className="counter">
                            <CountUp end={totalInquiries} />
                          </h2>
                        </div>
                        <p>Total Inquiries</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Total Students */}
              {/* Total Students */}
              <div className="col-xxl-3 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-xl bg-danger-transparent me-2 p-1">
                        <ImageWithBasePath
                          src="assets/img/icons/student.svg"
                          alt="img"
                        />
                      </div>
                      <div className="overflow-hidden flex-fill">
                        <div className="d-flex align-items-center justify-content-between">
                          <h2 className="counter">
                            <CountUp end={totalAdmissions} />
                          </h2>
                        </div>
                        <p>Total Students</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Total Teachers */}
              <div className="col-xxl-3 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-xl bg-primary-transparent me-2 p-1">
                        <i className="ti ti-chalkboard-user text-primary fs-36" />
                      </div>
                      <div className="overflow-hidden flex-fill">
                        <div className="d-flex align-items-center justify-content-between">
                          <h2 className="counter">
                            <CountUp end={totalTeachers} />
                          </h2>
                        </div>
                        <p>Total Teachers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Workload */}
              <div className="col-xxl-3 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-xl bg-success-transparent me-2 p-1">
                        <i className="ti ti-chart-pie text-success fs-36" />
                      </div>
                      <div className="overflow-hidden flex-fill">
                        <div className="d-flex align-items-center justify-content-between">
                          <h2 className="counter">
                            <span>{totalTeachers > 0 ? (totalAdmissions / totalTeachers).toFixed(1) : 0}</span>
                          </h2>
                        </div>
                        <p>Admissions per Teacher</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Schedules */}

              {roleId === 1 && (
                <div className="col-xxl-4 col-xl-6 col-md-12 d-flex">
                  <div className="card flex-fill">
                    <div className="card-header d-flex align-items-center justify-content-between">
                      <div>
                        <h4 className="card-title">Schedules</h4>
                      </div>
                      <Link
                        to="#"
                        className="link-primary fw-medium me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#add_event"
                      >
                        <i className="ti ti-square-plus me-1" />
                        Add New
                      </Link>
                    </div>
                    <div className="card-body ">
                      <Calendar
                        className="datepickers mb-4"
                        value={date}
                        onChange={(e) => setDate(e.value)}
                        inline
                      />
                      <h5 className="mb-3">Upcoming Events</h5>
                      <div className="event-wrapper event-scroll">
                        {/* Event Item */}
                        <div className="border-start border-skyblue border-3 shadow-sm p-3 mb-3">
                          <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                            <span className="avatar p-1 me-2 bg-teal-transparent flex-shrink-0">
                              <i className="ti ti-user-edit text-info fs-20" />
                            </span>
                            <div className="flex-fill">
                              <h6 className="mb-1">Parents, Teacher Meet</h6>
                              <p className="d-flex align-items-center">
                                <i className="ti ti-calendar me-1" />
                                15 July 2024
                              </p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="mb-0">
                              <i className="ti ti-clock me-1" />
                              09:10AM - 10:50PM
                            </p>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar border-0">
                                <ImageWithBasePath
                                  src="assets/img/parents/parent-01.jpg"
                                  className="rounded-circle"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar border-0">
                                <ImageWithBasePath
                                  src="assets/img/parents/parent-07.jpg"
                                  className="rounded-circle"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar border-0">
                                <ImageWithBasePath
                                  src="assets/img/parents/parent-02.jpg"
                                  className="rounded-circle"
                                  alt="img"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* /Event Item */}
                        {/* Event Item */}
                        <div className="border-start border-info border-3 shadow-sm p-3 mb-3">
                          <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                            <span className="avatar p-1 me-2 bg-info-transparent flex-shrink-0">
                              <i className="ti ti-user-edit fs-20" />
                            </span>
                            <div className="flex-fill">
                              <h6 className="mb-1">Parents, Teacher Meet</h6>
                              <p className="d-flex align-items-center">
                                <i className="ti ti-calendar me-1" />
                                15 July 2024
                              </p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="mb-0">
                              <i className="ti ti-clock me-1" />
                              09:10AM - 10:50PM
                            </p>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar border-0">
                                <ImageWithBasePath
                                  src="assets/img/parents/parent-05.jpg"
                                  className="rounded-circle"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar border-0">
                                <ImageWithBasePath
                                  src="assets/img/parents/parent-06.jpg"
                                  className="rounded-circle"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar border-0">
                                <ImageWithBasePath
                                  src="assets/img/parents/parent-07.jpg"
                                  className="rounded-circle"
                                  alt="img"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* /Event Item */}
                        {/* Event Item */}
                        <div className="border-start border-danger border-3 shadow-sm p-3 mb-3">
                          <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                            <span className="avatar p-1 me-2 bg-danger-transparent flex-shrink-0">
                              <i className="ti ti-vacuum-cleaner fs-24" />
                            </span>
                            <div className="flex-fill">
                              <h6 className="mb-1">Vacation Meeting</h6>
                              <p className="d-flex align-items-center">
                                <i className="ti ti-calendar me-1" />
                                07 July 2024 - 07 July 2024
                              </p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="mb-0">
                              <i className="ti ti-clock me-1" />
                              09:10 AM - 10:50 PM
                            </p>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar border-0">
                                <ImageWithBasePath
                                  src="assets/img/parents/parent-11.jpg"
                                  className="rounded-circle"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar border-0">
                                <ImageWithBasePath
                                  src="assets/img/parents/parent-13.jpg"
                                  className="rounded-circle"
                                  alt="img"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* /Event Item */}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* /Schedules */}
              {/* Attendance */}

              {roleId === 1 && (
                <div className="col-xxl-4 col-xl-6 col-md-12 d-flex flex-column">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between">
                      <h4 className="card-title">Attendance</h4>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="bg-white dropdown-toggle"
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-calendar-due me-1" />
                          Today
                        </Link>
                        <ul className="dropdown-menu mt-2 p-3">
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              This Week
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Last Week
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Last Week
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="list-tab mb-4">
                        <ul className="nav">
                          <li>
                            <Link
                              to="#"
                              className="active"
                              data-bs-toggle="tab"
                              data-bs-target="#students"
                            >
                              Students
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="tab"
                              data-bs-target="#teachers"
                            >
                              Teachers
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="#"
                              data-bs-toggle="tab"
                              data-bs-target="#staff"
                            >
                              Staff
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="tab-content">
                        <div
                          className="tab-pane fade active show"
                          id="students"
                        >
                          <div className="row gx-3">
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>28</h5>
                                  <p className="fs-12">Emergency</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>01</h5>
                                  <p className="fs-12">Absent</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>01</h5>
                                  <p className="fs-12">Late</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <ReactApexChart
                              id="student-chart"
                              className="mb-4"
                              options={studentDonutChart}
                              series={studentDonutChart.series}
                              type="donut"
                              height={210}
                            />
                            <Link
                              to={routes.studentAttendance}
                              className="btn btn-light"
                            >
                              <i className="ti ti-calendar-share me-1" />
                              View All
                            </Link>
                          </div>
                        </div>
                        <div className="tab-pane fade" id="teachers">
                          <div className="row gx-3">
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>30</h5>
                                  <p className="fs-12">Emergency</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>03</h5>
                                  <p className="fs-12">Absent</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>03</h5>
                                  <p className="fs-12">Late</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <ReactApexChart
                              id="teacher-chart"
                              className="mb-4"
                              options={teacherDonutChart}
                              series={teacherDonutChart.series}
                              type="donut"
                              height={210}
                            />
                            <Link
                              to="teacher-attendance"
                              className="btn btn-light"
                            >
                              <i className="ti ti-calendar-share me-1" />
                              View All
                            </Link>
                          </div>
                        </div>
                        <div className="tab-pane fade" id="staff">
                          <div className="row gx-3">
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>45</h5>
                                  <p className="fs-12">Emergency</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>01</h5>
                                  <p className="fs-12">Absent</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="card bg-light-300 shadow-none border-0">
                                <div className="card-body p-3 text-center">
                                  <h5>10</h5>
                                  <p className="fs-12">Late</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div id="staff-chart" className="mb-4" />
                            <ReactApexChart
                              id="staff-chart"
                              className="mb-4"
                              options={staffDonutChart}
                              series={staffDonutChart.series}
                              type="donut"
                              height={210}
                            />
                            <Link
                              to={routes.studentAttendance}
                              className="btn btn-light"
                            >
                              <i className="ti ti-calendar-share me-1" />
                              View All
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row flex-fill">
                    {/* Best Performer */}
                    <div className="col-sm-6 d-flex flex-column">
                      <div className="bg-success-800 p-3 br-5 text-center flex-fill mb-4 pb-0  owl-height bg-01">
                        <Slider
                          {...student}
                          className="owl-carousel student-slider h-100"
                        >
                          <div className="item h-100">
                            <div className="d-flex justify-content-between flex-column h-100">
                              <div>
                                <h5 className="mb-3 text-white">
                                  Best Performer
                                </h5>
                                <h4 className="mb-1 text-white">Rubell</h4>
                                <p className="text-light">Physics Teacher</p>
                              </div>
                              <ImageWithBasePath
                                src="assets/img/performer/performer-01.png"
                                alt="img"
                              />
                            </div>
                          </div>
                          <div className="item h-100">
                            <div className="d-flex justify-content-between flex-column h-100">
                              <div>
                                <h5 className="mb-3 text-white">
                                  Best Performer
                                </h5>
                                <h4 className="mb-1 text-white">
                                  George Odell
                                </h4>
                                <p className="text-light">English Teacher</p>
                              </div>
                              <ImageWithBasePath
                                src="assets/img/performer/performer-02.png"
                                alt="img"
                              />
                            </div>
                          </div>
                        </Slider>
                      </div>
                    </div>
                    {/* /Best Performer */}
                    {/* Star Students */}
                    <div className="col-sm-6 d-flex flex-column">
                      <div className="bg-info p-3 br-5 text-center flex-fill mb-4 pb-0 owl-height bg-02">
                        <Slider
                          {...teacher}
                          className="owl-carousel teacher-slider h-100"
                        >
                          <div className="item h-100">
                            <div className="d-flex justify-content-between flex-column h-100">
                              <div>
                                <h5 className="mb-3 text-white">
                                  Star Students
                                </h5>
                                <h4 className="mb-1 text-white">Tenesa</h4>
                                <p className="text-light">XII, A</p>
                              </div>
                              <ImageWithBasePath
                                src="assets/img/performer/student-performer-01.png"
                                alt="img"
                              />
                            </div>
                          </div>
                          <div className="item h-100">
                            <div className="d-flex justify-content-between flex-column h-100">
                              <div>
                                <h5 className="mb-3 text-white">
                                  Star Students
                                </h5>
                                <h4 className="mb-1 text-white">Michael </h4>
                                <p>XII, B</p>
                              </div>
                              <ImageWithBasePath
                                src="assets/img/performer/student-performer-02.png"
                                alt="img"
                              />
                            </div>
                          </div>
                        </Slider>
                      </div>
                    </div>
                    {/* /Star Students */}
                  </div>
                </div>
              )}

              {/* /Attendance */}
              <div className="col-xxl-4 col-md-12 d-flex flex-column">
                {/* Quick Links */}
                <div className="card flex-fill">
                  <div className="card-header d-flex align-items-center justify-content-between">
                    <h4 className="card-title">Quick Links</h4>
                  </div>
                  <div className="card-body pb-1">
                    <Slider
                      {...settings}
                      className="owl-carousel link-slider"
                    >
                      <div className="item">
                        {(CheckRoleRight("Fees Structure") || roleId === 1) && (
                          <Link
                            to={routes.feeStructure}
                            className="d-block bg-success-transparent ronded p-2 text-center mb-3 class-hover"
                          >
                            <div className="avatar avatar-lg border p-1 border-success rounded-circle mb-2">
                              <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-success rounded-circle">
                                <i className="ti ti-calendar" />
                              </span>
                            </div>
                            <p className="text-dark">Fees Structure</p>
                          </Link>
                        )}
                        {(CheckRoleRight("Fee Invoices") || roleId === 1) && (
                          <Link
                            to={routes.feeInvoices}
                            className="d-block bg-secondary-transparent ronded p-2 text-center mb-3 class-hover"
                          >
                            <div className="avatar avatar-lg border p-1 border-secondary rounded-circle mb-2">
                              <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-secondary rounded-circle">
                                <i className="ti ti-license" />
                              </span>
                            </div>
                            <p className="text-dark">Fees</p>
                          </Link>
                        )}
                      </div>
                      <div className="item">
                        {(CheckRoleRight("Fee Invoices") || roleId === 1) && (
                          <Link
                            to={routes.expense}
                            className="d-block bg-primary-transparent ronded p-2 text-center mb-3 class-hover"
                          >
                            <div className="avatar avatar-lg border p-1 border-primary rounded-circle mb-2">
                              <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-primary rounded-circle">
                                <i className="ti ti-hexagonal-prism" />
                              </span>
                            </div>
                            <p className="text-dark">Expenses</p>
                          </Link>
                        )}

                        {(CheckRoleRight("Home Works") || roleId === 1) && (
                          <Link
                            to={routes.classHomeWork}
                            className="d-block bg-danger-transparent ronded p-2 text-center mb-3 class-hover"
                          >
                            <div className="avatar avatar-lg border p-1 border-danger rounded-circle mb-2">
                              <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-danger rounded-circle">
                                <i className="ti ti-report-money" />
                              </span>
                            </div>
                            <p className="text-dark">Home Works</p>
                          </Link>
                        )}
                      </div>
                      <div className="item">
                        <Link
                          to={routes.studentAttendance}
                          className="d-block bg-warning-transparent ronded p-2 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-warning rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-warning rounded-circle">
                              <i className="ti ti-calendar-share" />
                            </span>
                          </div>
                          <p className="text-dark">Attendance</p>
                        </Link>
                        <Link
                          to={routes.attendanceReport}
                          className="d-block bg-skyblue-transparent ronded p-2 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-skyblue rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-pending rounded-circle">
                              <i className="ti ti-file-pencil" />
                            </span>
                          </div>
                          <p className="text-dark">Reports</p>
                        </Link>
                      </div>
                    </Slider>
                  </div>
                </div>
                {/* /Quick Links */}

                {roleId === 1 && (
                  <>
                    {/* Class Routine */}
                    <div className="card flex-fill">
                      <div className="card-header d-flex align-items-center justify-content-between">
                        <h4 className="card-title">Class Routine</h4>
                        <Link
                          to="#"
                          className="link-primary fw-medium"
                          data-bs-toggle="modal"
                          data-bs-target="#add_class_routine"
                        >
                          <i className="ti ti-square-plus me-1" />
                          Add New
                        </Link>
                      </div>
                      <div className="card-body">
                        <div className="d-flex align-items-center rounded border p-3 mb-3">
                          <span className="avatar avatar-md flex-shrink-0 border rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/teachers/teacher-01.jpg"
                              className="rounded"
                              alt="Profile"
                            />
                          </span>
                          <div className="w-100">
                            <p className="mb-1">Oct 2024</p>
                            <div className="progress progress-xs  flex-grow-1 mb-1">
                              <div
                                className="progress-bar progress-bar-striped progress-bar-animated bg-primary rounded"
                                role="progressbar"
                                style={{ width: "80%" }}
                                aria-valuenow={80}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center rounded border p-3 mb-3">
                          <span className="avatar avatar-md flex-shrink-0 border rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/teachers/teacher-02.jpg"
                              className="rounded"
                              alt="Profile"
                            />
                          </span>
                          <div className="w-100">
                            <p className="mb-1">Nov 2024</p>
                            <div className="progress progress-xs  flex-grow-1 mb-1">
                              <div
                                className="progress-bar progress-bar-striped progress-bar-animated bg-warning rounded"
                                role="progressbar"
                                style={{ width: "80%" }}
                                aria-valuenow={80}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center rounded border p-3 mb-0">
                          <span className="avatar avatar-md flex-shrink-0 border rounded me-2">
                            <ImageWithBasePath
                              src="assets/img/teachers/teacher-03.jpg"
                              className="rounded"
                              alt="Profile"
                            />
                          </span>
                          <div className="w-100">
                            <p className="mb-1">Oct 2024</p>
                            <div className="progress progress-xs  flex-grow-1 mb-1">
                              <div
                                className="progress-bar progress-bar-striped progress-bar-animated bg-success rounded"
                                role="progressbar"
                                style={{ width: "80%" }}
                                aria-valuenow={80}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* /Class Routine */}
                    {/* Class Wise Performance */}
                    <div className="card flex-fill">
                      <div className="card-header d-flex align-items-center justify-content-between">
                        <h4 className="card-title">Performance</h4>
                        <div className="dropdown">
                          <Link
                            to="#"
                            className="bg-white dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            <i className="ti ti-school-bell  me-2" />
                            Class II
                          </Link>
                          <ul className="dropdown-menu mt-2 p-3">
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Class I
                              </Link>
                            </li>
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Class II
                              </Link>
                            </li>
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Class III
                              </Link>
                            </li>
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Class IV
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="d-md-flex align-items-center justify-content-between">
                          <div className="me-md-3 mb-3 mb-md-0 w-100">
                            <div className="border border-dashed p-3 rounded d-flex align-items-center justify-content-between mb-1">
                              <p className="mb-0 me-2">
                                <i className="ti ti-arrow-badge-down-filled me-2 text-primary" />
                                Top
                              </p>
                              <h5>45</h5>
                            </div>
                            <div className="border border-dashed p-3 rounde d-flex align-items-center justify-content-between mb-1">
                              <p className="mb-0 me-2">
                                <i className="ti ti-arrow-badge-down-filled me-2 text-warning" />
                                Average
                              </p>
                              <h5>11</h5>
                            </div>
                            <div className="border border-dashed p-3 rounded d-flex align-items-center justify-content-between mb-0">
                              <p className="mb-0 me-2">
                                <i className="ti ti-arrow-badge-down-filled me-2 text-danger" />
                                Below Avg
                              </p>
                              <h5>02</h5>
                            </div>
                          </div>
                          <ReactApexChart
                            id="class-chart"
                            className="text-center text-md-left"
                            options={classDonutChart}
                            series={classDonutChart.series}
                            type="donut"

                          />
                        </div>
                      </div>
                    </div>
                    {/* /Class Wise Performance */}
                  </>
                )}
              </div>

            </div>

            {userLevel === 3 && (
              <>
                {(CheckRoleRight("Invoice Receipt Summary Report") || roleId === 1) && invoiceReceiptSummaryReport && (
                  <div className="row mb-4">
                    {/* Total Invoice Amount */}
                    <div className="col-md-4 d-flex">
                      <div className="card flex-fill animate-card border-0 mb-0">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-xl bg-primary-transparent me-2 p-1">
                              <i className="ti ti-file-invoice text-primary fs-24" />
                            </div>
                            <div className="overflow-hidden flex-fill">
                              <h2 className="counter">
                                <CountUp end={invoiceReceiptSummaryReport.totalInvoiceAmount} separator="," />
                              </h2>
                              <p className="mb-0">Total Invoice Amount (Current Month)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Total Receipt Amount */}
                    <div className="col-md-4 d-flex">
                      <div className="card flex-fill animate-card border-0 mb-0">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-xl bg-success-transparent me-2 p-1">
                              <i className="ti ti-receipt text-success fs-24" />
                            </div>
                            <div className="overflow-hidden flex-fill">
                              <h2 className="counter">
                                <CountUp end={invoiceReceiptSummaryReport.totalReceiptAmount} separator="," />
                              </h2>
                              <p className="mb-0">Total Receipt Amount (Current Month)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Total Net Receivable */}
                    <div className="col-md-4 d-flex">
                      <div className="card flex-fill animate-card border-0 mb-0">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-xl bg-warning-transparent me-2 p-1">
                              <i className="ti ti-wallet text-warning fs-24" />
                            </div>
                            <div className="overflow-hidden flex-fill">
                              <h2 className="counter">
                                <CountUp end={invoiceReceiptSummaryReport.totalNetReceivable} separator="," />
                              </h2>
                              <p className="mb-0">Total Net Receivable (Current Month)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}



                <div className="row">
                  {/* Fees Collection */}
                  <div className="col-xxl-8 col-xl-6 d-flex">
                  <div className="card flex-fill">
                    <div className="card-header  d-flex align-items-center justify-content-between">
                      <h4 className="card-title">Fees Collection</h4>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="bg-white"
                        >
                          <i className="ti ti-calendar  me-2" />
                          {selectedGlobalFilter.label}
                        </Link>
                      </div>
                    </div>
                    <div className="card-body pb-0">
                      <ReactApexChart
                        id="fees-chart"
                        options={feesBarOptions}
                        series={feesBarSeries}
                        type="bar"
                        height={270}
                      />
                    </div>
                  </div>
                </div>
                {/* /Fees Collection */}

                {/* Leave Requests */}
                {roleId === 1 && (
                  <div className="col-xxl-4 col-xl-6 d-flex">
                    <div className="card flex-fill">
                      <div className="card-header  d-flex align-items-center justify-content-between">
                        <h4 className="card-title">Leave Requests</h4>
                        <div className="dropdown">
                          <Link
                            to="#"
                            className="bg-white dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            <i className="ti ti-calendar-due me-1" />
                            Today
                          </Link>
                          <ul className="dropdown-menu mt-2 p-3">
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                This Week
                              </Link>
                            </li>
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Last Week
                              </Link>
                            </li>
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Last Week
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="card mb-2">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div className="d-flex align-items-center overflow-hidden me-2">
                                <Link
                                  to="#"
                                  className="avatar avatar-lg flex-shrink-0 me-2"
                                >
                                  <ImageWithBasePath
                                    src="assets/img/profiles/avatar-14.jpg"
                                    alt="student"
                                  />
                                </Link>
                                <div className="overflow-hidden">
                                  <h6 className="mb-1 text-truncate">
                                    <Link to="#">James</Link>
                                    <span className="badge badge-soft-danger ms-1">
                                      Emergency
                                    </span>
                                  </h6>
                                  <p className="text-truncate">Physics Teacher</p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center">
                                <Link
                                  to="#"
                                  className="avatar avatar-xs p-0 btn btn-success me-1"
                                >
                                  <i className="ti ti-checks" />
                                </Link>
                                <Link
                                  to="#"
                                  className="avatar avatar-xs p-0 btn btn-danger"
                                >
                                  <i className="ti ti-x" />
                                </Link>
                              </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between border-top pt-3">
                              <p className="mb-0">
                                Leave :{" "}
                                <span className="fw-semibold">12 -13 May</span>
                              </p>
                              <p>
                                Apply on :{" "}
                                <span className="fw-semibold">12 May</span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="card mb-0">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <div className="d-flex align-items-center overflow-hidden me-2">
                                <Link
                                  to="#"
                                  className="avatar avatar-lg flex-shrink-0 me-2"
                                >
                                  <ImageWithBasePath
                                    src="assets/img/profiles/avatar-19.jpg"
                                    alt="student"
                                  />
                                </Link>
                                <div className="overflow-hidden">
                                  <h6 className="mb-1 text-truncate ">
                                    <Link to="#">Ramien</Link>
                                    <span className="badge badge-soft-warning ms-1">
                                      Casual
                                    </span>
                                  </h6>
                                  <p className="text-truncate">Accountant</p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center">
                                <Link
                                  to="#"
                                  className="avatar avatar-xs p-0 btn btn-success me-1"
                                >
                                  <i className="ti ti-checks" />
                                </Link>
                                <Link
                                  to="#"
                                  className="avatar avatar-xs p-0 btn btn-danger"
                                >
                                  <i className="ti ti-x" />
                                </Link>
                              </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between border-top pt-3">
                              <p className="mb-0">
                                Leave :{" "}
                                <span className="fw-semibold">12 -13 May</span>
                              </p>
                              <p>
                                Apply on :{" "}
                                <span className="fw-semibold">11 May</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* /Leave Requests */}
              </div>
            </>
          )}
            {roleId === 1 && (
              <div className="row">
                {/* Links */}
                <div className="col-xl-3 col-md-6 d-flex">
                  <Link
                    to={routes.studentAttendance}
                    className="card bg-warning-transparent border border-5 border-white animate-card flex-fill"
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg bg-warning rounded flex-shrink-0 me-2">
                            <i className="ti ti-calendar-share fs-24" />
                          </span>
                          <div className="overflow-hidden">
                            <h6 className="fw-semibold text-default">
                              View Attendance
                            </h6>
                          </div>
                        </div>
                        <span className="btn btn-white warning-btn-hover avatar avatar-sm p-0 flex-shrink-0 rounded-circle">
                          <i className="ti ti-chevron-right fs-14" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* /Links */}
                {/* Links */}
                <div className="col-xl-3 col-md-6 d-flex">
                  <Link
                    to={routes.events}
                    className="card bg-success-transparent border border-5 border-white animate-card flex-fill "
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg bg-success rounded flex-shrink-0 me-2">
                            <i className="ti ti-speakerphone fs-24" />
                          </span>
                          <div className="overflow-hidden">
                            <h6 className="fw-semibold text-default">
                              New Events
                            </h6>
                          </div>
                        </div>
                        <span className="btn btn-white success-btn-hover avatar avatar-sm p-0 flex-shrink-0 rounded-circle">
                          <i className="ti ti-chevron-right fs-14" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* /Links */}
                {/* Links */}
                <div className="col-xl-3 col-md-6 d-flex">
                  <Link
                    to={routes.membershipplan}
                    className="card bg-danger-transparent border border-5 border-white animate-card flex-fill"
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg bg-danger rounded flex-shrink-0 me-2">
                            <i className="ti ti-sphere fs-24" />
                          </span>
                          <div className="overflow-hidden">
                            <h6 className="fw-semibold text-default">
                              Membership Plans
                            </h6>
                          </div>
                        </div>
                        <span className="btn btn-white avatar avatar-sm p-0 flex-shrink-0 rounded-circle danger-btn-hover">
                          <i className="ti ti-chevron-right fs-14" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* /Links */}
                {/* Links */}
                <div className="col-xl-3 col-md-6 d-flex">
                  <Link
                    to={routes.studentAttendance}
                    className="card bg-secondary-transparent border border-5 border-white animate-card flex-fill"
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <span className="avatar avatar-lg bg-secondary rounded flex-shrink-0 me-2">
                            <i className="ti ti-moneybag fs-24" />
                          </span>
                          <div className="overflow-hidden">
                            <h6 className="fw-semibold text-default">
                              Finance &amp; Accounts
                            </h6>
                          </div>
                        </div>
                        <span className="btn btn-white secondary-btn-hover avatar avatar-sm p-0 flex-shrink-0 rounded-circle">
                          <i className="ti ti-chevron-right fs-14" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* /Links */}
              </div>
            )}
            <div className="row">
              {(roleId === 1 || userLevel === 3 || userLevel === 2) && (
                <div className="col-xxl-4 col-xl-6 d-flex flex-column">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1">Total Earnings</h6>
                          <h2>{earningExpenseStats?.totalEarning?.toLocaleString() || '0'}</h2>
                        </div>
                        <span className="avatar avatar-lg bg-primary">
                          <i className="ti ti-user-dollar" />
                        </span>
                      </div>
                    </div>
                    <ReactApexChart
                      id="total-earning"
                      options={totalEarningArea}
                      series={totalEarningArea.series}
                      type="area"
                      height={90}
                    />
                  </div>
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h6 className="mb-1">Total Expenses</h6>
                          <h2>{earningExpenseStats?.totalExpense?.toLocaleString() || '0'}</h2>
                        </div>
                        <span className="avatar avatar-lg bg-danger">
                          <i className="ti ti-user-dollar" />
                        </span>
                      </div>
                    </div>
                    <ReactApexChart
                      id="total-expenses"
                      options={totalExpenseArea}
                      series={totalExpenseArea.series}
                      type="area"
                      height={90}
                    />
                  </div>
                </div>
              )}
              {/* /Total Earnings */}



              {/* Notice Board */}
              {(CheckRoleRight("Notice Board") || roleId === 1) && (
                <div className="col-xxl-5 col-xl-12 order-3 order-xxl-2 d-flex">
                  <div className="card flex-fill">
                    <div className="card-header  d-flex align-items-center justify-content-between">
                      <h4 className="card-title">Notice Board</h4>
                      <Link to={routes.noticeBoard} className="fw-medium">
                        View All
                      </Link>
                    </div>
                    <div className="card-body">
                      <div className="notice-widget">
                        {visibleNotices?.map((item) => (
                          <div className="d-sm-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center overflow-hidden me-2 mb-2 mb-sm-0">
                              <span className="bg-primary-transparent avatar avatar-md me-2 rounded-circle flex-shrink-0">
                                <i className="ti ti-bell-check fs-16" />
                              </span>
                              <div className="overflow-hidden">
                                <h6 className="text-truncate mb-1">
                                  {item?.title}
                                </h6>
                                <p>
                                  <i className="ti ti-calendar me-2" />
                                  Added on : {dayjs(item.publishedAt).format("DD-MMM-YYYY")}
                                </p>
                              </div>
                            </div>
                            <span className="badge bg-light text-dark">
                              <i className="ti ti-clck me-1" />
                              {dayjs(item.publishedAt).fromNow()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* /Notice Board */}


              {/* Average Fee Report */}
              {(userLevel === 3 || userLevel === 2 || userLevel === 1) && (CheckRoleRight("Average Fee Report") || roleId === 1) && averageFeeReport && (
                <div className="col-xxl-3 col-xl-6 order-2 order-xxl-3 d-flex flex-column">
                  <div className="card flex-fill mb-2">
                    <div className="card-body">
                      <p className="mb-2">Total No. of Students</p>
                      <div className="d-flex align-items-end justify-content-between">
                        <h4 className="mb-0">
                          <CountUp end={averageFeeReport.totalNoOfStudents} separator="," />
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="card flex-fill mb-2">
                    <div className="card-body">
                      <p className="mb-2">Total Amount</p>
                      <div className="d-flex align-items-end justify-content-between">
                        <h4 className="mb-0">
                          <CountUp end={averageFeeReport.totalAmount} separator="," />
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="card flex-fill mb-4">
                    <div className="card-body">
                      <p className="mb-2">Average Fee</p>
                      <div className="d-flex align-items-end justify-content-between">
                        <h4 className="mb-0">
                          <CountUp end={averageFeeReport.averageFee} decimals={2} separator="," />
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* /Average Fee Report */}

              {/* Invoice Receipt Summary Report (Current Month) */}
              {(userLevel === 3 || userLevel === 2 || userLevel === 1) && (CheckRoleRight("Invoice Receipt Summary Report") || roleId === 1 || userLevel === 2 || userLevel === 1) && invoiceReceiptSummaryReport && (
                <div className="col-xxl-3 col-xl-6 order-3 order-xxl-4 d-flex flex-column">
                  <div className="card flex-fill mb-2">
                    <div className="card-body">
                      <p className="mb-2">Total Invoice Amount (Current Month)</p>
                      <div className="d-flex align-items-end justify-content-between">
                        <h4 className="mb-0 text-primary">
                          <CountUp end={invoiceReceiptSummaryReport.totalInvoiceAmount} separator="," />
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="card flex-fill mb-2">
                    <div className="card-body">
                      <p className="mb-2">Total Receipt Amount (Current Month)</p>
                      <div className="d-flex align-items-end justify-content-between">
                        <h4 className="mb-0 text-success">
                          <CountUp end={invoiceReceiptSummaryReport.totalReceiptAmount} separator="," />
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="card flex-fill mb-4">
                    <div className="card-body">
                      <p className="mb-2">Total Net Receivable (Current Month)</p>
                      <div className="d-flex align-items-end justify-content-between">
                        <h4 className="mb-0 text-danger">
                          <CountUp end={invoiceReceiptSummaryReport.totalNetReceivable} separator="," />
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* /Invoice Receipt Summary Report */}
            </div>
            {roleId === 1 && (
              <div className="row">
                {/* Top Subjects */}
                <div className="col-xxl-4 col-xl-6 d-flex">
                  <div className="card flex-fill">
                    <div className="card-header  d-flex align-items-center justify-content-between">
                      <h4 className="card-title">Top Subjects</h4>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="bg-white dropdown-toggle"
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-school-bell  me-2" />
                          Class II
                        </Link>
                        <ul className="dropdown-menu mt-2 p-3">
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Class I
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Class II
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Class III
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Class IV
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="card-body">
                      <div
                        className="alert alert-success d-flex align-items-center mb-24"
                        role="alert"
                      >
                        <i className="ti ti-info-square-rounded me-2 fs-14" />
                        <div className="fs-14">
                          These Result are obtained from the syllabus completion
                          on the respective Class
                        </div>
                      </div>
                      <ul className="list-group">
                        <li className="list-group-item">
                          <div className="row align-items-center">
                            <div className="col-sm-4">
                              <p className="text-dark">Maths</p>
                            </div>
                            <div className="col-sm-8">
                              <div className="progress progress-xs flex-grow-1">
                                <div
                                  className="progress-bar bg-primary rounded"
                                  role="progressbar"
                                  style={{ width: "20%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row align-items-center">
                            <div className="col-sm-4">
                              <p className="text-dark">Physics</p>
                            </div>
                            <div className="col-sm-8">
                              <div className="progress progress-xs flex-grow-1">
                                <div
                                  className="progress-bar bg-secondary rounded"
                                  role="progressbar"
                                  style={{ width: "30%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row align-items-center">
                            <div className="col-sm-4">
                              <p className="text-dark">Chemistry</p>
                            </div>
                            <div className="col-sm-8">
                              <div className="progress progress-xs flex-grow-1">
                                <div
                                  className="progress-bar bg-info rounded"
                                  role="progressbar"
                                  style={{ width: "40%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row align-items-center">
                            <div className="col-sm-4">
                              <p className="text-dark">Botany</p>
                            </div>
                            <div className="col-sm-8">
                              <div className="progress progress-xs flex-grow-1">
                                <div
                                  className="progress-bar bg-success rounded"
                                  role="progressbar"
                                  style={{ width: "50%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row align-items-center">
                            <div className="col-sm-4">
                              <p className="text-dark">English</p>
                            </div>
                            <div className="col-sm-8">
                              <div className="progress progress-xs flex-grow-1">
                                <div
                                  className="progress-bar bg-warning rounded"
                                  role="progressbar"
                                  style={{ width: "70%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row align-items-center">
                            <div className="col-sm-4">
                              <p className="text-dark">Spanish</p>
                            </div>
                            <div className="col-sm-8">
                              <div className="progress progress-xs flex-grow-1">
                                <div
                                  className="progress-bar bg-danger rounded"
                                  role="progressbar"
                                  style={{ width: "80%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item">
                          <div className="row align-items-center">
                            <div className="col-sm-4">
                              <p className="text-dark">Japanese</p>
                            </div>
                            <div className="col-sm-8">
                              <div className="progress progress-xs flex-grow-1">
                                <div
                                  className="progress-bar bg-primary rounded"
                                  role="progressbar"
                                  style={{ width: "85%" }}
                                  aria-valuenow={30}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* /Top Subjects */}
                {/* Student Activity */}
                <div className="col-xxl-4 col-xl-6 d-flex">
                  <div className="card flex-fill">
                    <div className="card-header  d-flex align-items-center justify-content-between">
                      <h4 className="card-title">Student Activity</h4>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="bg-white dropdown-toggle"
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-calendar me-2" />
                          This Month
                        </Link>
                        <ul className="dropdown-menu mt-2 p-3">
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              This Month
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              This Year
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Last Week
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center overflow-hidden p-3 mb-3 border rounded">
                        <span className="avatar avatar-lg flex-shrink-0 rounded me-2">
                          <ImageWithBasePath
                            src="assets/img/students/student-09.jpg"
                            alt="student"
                          />
                        </span>
                        <div className="overflow-hidden">
                          <h6 className="mb-1 text-truncate">
                            1st place in "Chess”
                          </h6>
                          <p>This event took place in Our School</p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center overflow-hidden p-3 mb-3 border rounded">
                        <span className="avatar avatar-lg flex-shrink-0 rounded me-2">
                          <ImageWithBasePath
                            src="assets/img/students/student-12.jpg"
                            alt="student"
                          />
                        </span>
                        <div className="overflow-hidden">
                          <h6 className="mb-1 text-truncate">
                            Participated in "Carrom"
                          </h6>
                          <p>Justin Lee participated in "Carrom"</p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center overflow-hidden p-3 mb-3 border rounded">
                        <span className="avatar avatar-lg flex-shrink-0 rounded me-2">
                          <ImageWithBasePath
                            src="assets/img/students/student-11.jpg"
                            alt="student"
                          />
                        </span>
                        <div className="overflow-hidden">
                          <h6 className="mb-1 text-truncate">
                            1st place in "100M”
                          </h6>
                          <p>This event took place in Our School</p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center overflow-hidden p-3 mb-0 border rounded">
                        <span className="avatar avatar-lg flex-shrink-0 rounded me-2">
                          <ImageWithBasePath
                            src="assets/img/students/student-10.jpg"
                            alt="student"
                          />
                        </span>
                        <div className="overflow-hidden">
                          <h6 className="mb-1 text-truncate">
                            International conference
                          </h6>
                          <p className="text-truncate">
                            We attended international conference
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Student Activity */}
                {/* Todo */}
                <div className="col-xxl-4 col-xl-12 d-flex">
                  <div className="card flex-fill">
                    <div className="card-header  d-flex align-items-center justify-content-between">
                      <h4 className="card-title">Todo</h4>
                      <div className="dropdown">
                        <Link
                          to="#"
                          className="bg-white dropdown-toggle"
                          data-bs-toggle="dropdown"
                        >
                          <i className="ti ti-calendar me-2" />
                          Today
                        </Link>
                        <ul className="dropdown-menu mt-2 p-3">
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              This Month
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              This Year
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item rounded-1">
                              Last Week
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="card-body">
                      <ul className="list-group list-group-flush todo-list">
                        <li className="list-group-item py-3 px-0 pt-0">
                          <div className="d-sm-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center overflow-hidden me-2 todo-strike-content">
                              <div className="form-check form-check-md me-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  defaultChecked
                                />
                              </div>
                              <div className="overflow-hidden">
                                <h6 className="mb-1 text-truncate">
                                  Send Reminder to Students
                                </h6>
                                <p>01:00 PM</p>
                              </div>
                            </div>
                            <span className="badge badge-soft-success mt-2 mt-sm-0">
                              Compeleted
                            </span>
                          </div>
                        </li>
                        <li className="list-group-item py-3 px-0">
                          <div className="d-sm-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center overflow-hidden me-2">
                              <div className="form-check form-check-md me-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                />
                              </div>
                              <div className="overflow-hidden">
                                <h6 className="mb-1 text-truncate">
                                  Create Routine to new staff
                                </h6>
                                <p>04:50 PM</p>
                              </div>
                            </div>
                            <span className="badge badge-soft-skyblue mt-2 mt-sm-0">
                              Inprogress
                            </span>
                          </div>
                        </li>
                        <li className="list-group-item py-3 px-0">
                          <div className="d-sm-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center overflow-hidden me-2">
                              <div className="form-check form-check-md me-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                />
                              </div>
                              <div className="overflow-hidden">
                                <h6 className="mb-1 text-truncate">
                                  Extra Class Info to Students
                                </h6>
                                <p>04:55 PM</p>
                              </div>
                            </div>
                            <span className="badge badge-soft-warning mt-2 mt-sm-0">
                              Yet to Start
                            </span>
                          </div>
                        </li>
                        <li className="list-group-item py-3 px-0">
                          <div className="d-sm-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center overflow-hidden me-2">
                              <div className="form-check form-check-md me-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                />
                              </div>
                              <div className="overflow-hidden">
                                <h6 className="mb-1 text-truncate">
                                  Fees for Upcoming Academics
                                </h6>
                                <p>04:55 PM</p>
                              </div>
                            </div>
                            <span className="badge badge-soft-warning mt-2 mt-sm-0">
                              Yet to Start
                            </span>
                          </div>
                        </li>
                        <li className="list-group-item py-3 px-0 pb-0">
                          <div className="d-sm-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center overflow-hidden me-2">
                              <div className="form-check form-check-md me-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                />
                              </div>
                              <div className="overflow-hidden">
                                <h6 className="mb-1 text-truncate">
                                  English - Essay on Visit
                                </h6>
                                <p>05:55 PM</p>
                              </div>
                            </div>
                            <span className="badge badge-soft-warning mt-2 mt-sm-0">
                              Yet to Start
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* /Todo */}
              </div>
            )}



          </>
        </div>
      </div>
      {/* /Page Wrapper */}
      <AdminDashboardModal />
    </>
  );
};

export default AdminDashboard;
