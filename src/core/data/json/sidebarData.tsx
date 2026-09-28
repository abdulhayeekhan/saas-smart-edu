import { label } from "yet-another-react-lightbox/*";
import { all_routes } from "../../../feature-module/router/all_routes";
const routes = all_routes;

export const SidebarData = [
  {
    label: "MAIN",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Main",
    submenuItems: [
      {
        label: "Dashboard",
        icon: "ti ti-layout-dashboard",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "Admin Dashboard", link: routes.adminDashboard },
          { label: "Teacher Dashboard", link: routes.teacherDashboard },
          { label: "Student Dashboard", link: routes.studentDashboard },
          { label: "Parent Dashboard", link: routes.parentDashboard },
        ],
      },
      {
        label: "Application",
        icon: "ti ti-layout-list",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          {
            label: "Chat",
            link: routes.chat,
            showSubRoute: false,
          },
          {
            label: "Call",
            link: routes.audioCall,
            showSubRoute: false,
          },
          {
            label: "Calendar",
            link: routes.calendar,
            showSubRoute: false,
          },
          {
            label: "Email",
            link: routes.email,
            showSubRoute: false,
          },
          {
            label: "To Do",
            link: routes.todo,
            showSubRoute: false,
          },
          {
            label: "Notes",
            link: routes.notes,
            showSubRoute: false,
          },
          {
            label: "File Manager",
            link: routes.fileManager,
            showSubRoute: false,
          },
        ],
      },
      {
        label: "Dar-e-Arqam Publisher",
        icon: "ti ti-book",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          {
            label: "Books Order",
            link: routes.booksOrder,
            showSubRoute: false,
          },
        ],
      },
    ],
  },
  {
    label: "LAYOUT",
    submenuOpen: false,
    showSubRoute: false,
    submenuHdr: "LAYOUT",
    submenuItems: [
      {
        label: "Default",
        icon: "ti ti-layout-sidebar",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutDefault,
        themeSetting: true,
      },
      {
        label: "Mini",
        icon: "ti ti-layout-align-left",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutMini,
        themeSetting: true,
      },
      {
        label: "RTL",
        icon: "ti ti-text-direction-rtl",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutRtl,
        themeSetting: true,
      },
      {
        label: "Box",
        icon: "ti ti-layout-distribute-vertical",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutBox,
        themeSetting: true,
      },
      {
        label: "Dark",
        icon: "ti ti-moon",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutDark,
        themeSetting: true,
      },
    ],
  },
  {
    label: "Peoples",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Peoples",

    submenuItems: [
      {
        label: "Students",
        icon: "ti ti-school",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          {
            label: "Inquiries",
            link: routes.studentInquiry,
          },
          { label: "Admissions", link: routes.studentList },
          { label: "Bulk Students Import", link: routes.addBlukAdmission },
          // {
          //   label: "Students Details",
          //   link: routes.studentDetail,
          //   subLink1: routes.studentLibrary,
          //   subLink2: routes.studentResult,
          //   subLink3: routes.studentFees,
          //   subLink4: routes.studentLeaves,
          //   subLink5: routes.studentTimeTable,
          // },
          { label: "Student Promotion", link: routes.studentPromotion },
          { label: "Student Card", link: routes.studentCard, moduleName: "Student Card" },
        ],
      },
      {
        label: "Parents",
        icon: "ti ti-user-bolt",
        showSubRoute: false,
        submenu: true,
        submenuItems: [
          { label: "All Parents", link: routes.parentGrid },
          { label: "Parents List", link: routes.parentList },
        ],
      },
      {
        label: "Guardians",
        icon: "ti ti-user-shield",
        showSubRoute: false,
        submenu: true,
        submenuItems: [
          { label: "All Guardians", link: routes.guardiansGrid },
          { label: "Guardians List", link: routes.guardiansList },
        ],
      },
      {
        label: "Teachers",
        icon: "ti ti-users",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          {
            label: "All Teachers",
            link: routes.teacherGrid,
            subLink1: routes.addTeacher,
            subLink2: routes.editTeacher,
          },
          { label: "Teacher List", link: routes.teacherList },
          {
            label: "Teacher Details",
            link: routes.teacherDetails,
            subLink1: routes.teacherLibrary,
            subLink2: routes.teacherSalary,
            subLink3: routes.teacherLeaves,
          },
          { label: "Routine", link: routes.teachersRoutine },
        ],
      },
    ],
  },
  {
    label: "Fee Management System",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Peoples",

    submenuItems: [
      {
        label: "Generate Fees",
        icon: "ti ti-file-invoice",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          {
            label: "Bulk Invoices",
            link: routes.feeGenerate,
          },
          {
            label: "Single Invoice",
            link: routes.singleFeeGenerate,
          },
        ]
      },
      {
        label: "Fee Invoices",
        icon: "ti ti-file-invoice",
        submenu: false,
        showSubRoute: false,
        link: routes.feeInvoices
      },
      {
        label: "Fee Receipt",
        icon: "ti ti-file-invoice",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          {
            label: "Single Fee Receipt",
            link: routes.feeReceipt,
          },
          {
            label: "Multi Fee Receipt",
            link: routes.multiFeeReceipt,
          },
        ]
      },
      {
        label: "Fee Settlement",
        icon: "ti ti-calculator",
        submenu: false,
        showSubRoute: false,
        link: routes.feeSettlement,
        moduleNames: ["Fee Settlement", "Fee Receipt", "Fee Invoices"]
      },
      {
        label: "Security Account Setting",
        icon: "ti ti-settings",
        submenu: false,
        showSubRoute: false,
        link: routes.accountSetting
      },
    ],
  },
  {
    label: "Academic",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Academic",

    submenuItems: [
      {
        label: "Classes",
        icon: "ti ti-school-bell",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "All Classes", link: routes.classes },
          { label: "Schedule", link: routes.sheduleClasses },
        ],
      },
      {
        label: "Class Room",
        link: routes.classRoom,
        icon: "ti ti-building",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Class Routine",
        link: routes.classRoutine,
        icon: "ti ti-bell-school",
        showSubRoute: false,
        submenu: false,
      },

      // {
      //   label: "Subject",
      //   link: routes.classSubject,
      //   icon: "ti ti-book",
      //   showSubRoute: false,
      //   submenu: false,
      // },
      {
        label: "Syllabus",
        link: routes.classSyllabus,
        icon: "ti ti-book-upload",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Time Table",
        link: routes.classTimetable,
        icon: "ti ti-table",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Home Work",
        link: routes.classHomeWork,
        icon: "ti ti-license",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Examinations",
        icon: "ti ti-hexagonal-prism-plus",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "Exam", link: routes.exam },
          { label: "Exam Schedule", link: routes.examSchedule },
          { label: "Grade", link: routes.grade },
          { label: "Exam Attendance", link: routes.examAttendance },
          { label: "Exam Results", link: routes.examResult },
        ],
      },
      {
        label: "Student Attendance",
        link: routes.studentAttendance,
        icon: "ti ti-calendar-share",
        submenu: false,
        showSubRoute: false,
      },
      {
        label: "Reasons",
        link: routes.AcademicReason,
        icon: "ti ti-lifebuoy",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  // The Academic Settings items moved to the Settings page (feature-module/settings/index.tsx)
  // → Academic Settings section, alongside the other settings categories.
  {
    label: "MANAGEMENT",
    submenuOpen: true,
    submenuHdr: "Management",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Campus Management",
        icon: "ti ti-report-money",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "Regions", link: routes.regions },
          { label: "Campuses", link: routes.campusManagement },
        ],
      },
      {
        label: "Campus Bank",
        link: routes.campusBank,
        icon: "ti ti-building-bank",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Fees Collection",
        icon: "ti ti-report-money",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "Fees Group", link: routes.feesGroup },
          { label: "Fees Master", link: routes.feesMaster },
          { label: "Fees Assign", link: routes.feesAssign },
          { label: "Collect Fees", link: routes.collectFees },
        ],
      },
      {
        label: "Library",
        icon: "ti ti-notebook",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "Library Members", link: routes.libraryMembers },
          { label: "Books", link: routes.libraryBooks },
          { label: "Issue Book", link: routes.libraryIssueBook },
          { label: "Return", link: routes.libraryReturn },
        ],
      },
      {
        label: "Sports",
        link: routes.sportsList,
        icon: "ti ti-run",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Players",
        link: routes.playerList,
        icon: "ti ti-play-football",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Hostel",
        icon: "ti ti-building-fortress",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "Hostel List", link: routes.hostelList },
          { label: "Hostel Rooms", link: routes.hostelRoom },
          { label: "Room Type", link: routes.hostelType },
        ],
      },
      {
        label: "Transport",
        icon: "ti ti-bus",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "Routes", link: routes.transportRoutes },
          { label: "Pickup Points", link: routes.transportPickupPoints },
          { label: "Vehicle Drivers", link: routes.transportVehicleDrivers },
          { label: "Vehicle", link: routes.transportVehicle },
          { label: "Assign Vehicle", link: routes.transportAssignVehicle },
        ],
      },
    ],
  },
  {
    label: "HRM",
    submenuOpen: true,
    submenuHdr: "HRM",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Staffs",
        link: routes.staff,
        subLink1: routes.addStaff,
        subLink2: routes.editStaff,
        icon: "ti ti-users-group",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Campus Staff",
        link: routes.campusEmployee,
        icon: "ti ti-users",
        showSubRoute: false,
        submenu: false,
      },
      // Departments, Designation, Employee Type, Allowance Type, and Deduction moved to
      // the Settings page (feature-module/settings/index.tsx) under "HRM Settings".
      {
        label: "Class Teacher",
        link: routes.classTeacher,
        icon: "ti ti-user-check",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Attendance",
        icon: "ti ti-calendar-share",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "Student Attendance", link: routes.studentAttendance },
          { label: "Teacher Attendance", link: routes.teacherAttendance },
          { label: "Staff Attendance", link: routes.staffAttendance },
        ],
      },
      {
        label: "Leaves",
        icon: "ti ti-calendar-stats",
        submenu: true,
        showSubRoute: false,

        submenuItems: [
          { label: "List of leaves", link: routes.listLeaves },
          { label: "Approve Request", link: routes.approveRequest },
        ],
      },
      {
        label: "Holidays",
        link: routes.holidays,
        icon: "ti ti-briefcase",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Salary Payroll",
        link: routes.salaryPayroll,
        subLink1: routes.salaryPayrollProcess,
        icon: "ti ti-moneybag",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "HR Voucher",
        link: routes.hrVoucher,
        icon: "ti ti-receipt",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "Finance & Accounts",
    submenuOpen: true,
    submenuHdr: "Finance & Accounts",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Financial Settings",
        icon: "ti ti-settings",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Financial Year", link: routes.financialYear },
          { label: "Financial Year Rollover", link: routes.financialYearRollover },
        ],
      },
      {
        label: "Chart of Account Setting",
        icon: "ti ti-chart-pie",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Chart of Accounts", link: routes.chartofaccounts },
          { label: "Campus Chart of Accounts", link: routes.campusChartofaccounts },
        ],
      },
      {
        label: "Openning Balance",
        icon: "ti ti-credit-card",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Openning Balance", link: routes.openningBalance },
          { label: "Campus Openning Balance", link: routes.campusOpenningBalance },
        ],
      },
      {
        label: "Vouchers",
        icon: "ti ti-credit-card",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Bank Payment Voucher", link: routes.bpvoucher },
          { label: "Bank Receipt Voucher", link: routes.brvoucher },
          { label: "Cash Payment Voucher", link: routes.cpvoucher },
          { label: "Cash Receipt Voucher", link: routes.crvoucher },
          { label: "Journal Voucher", link: routes.journalvoucher },
          { label: "Campus Bank Payment Voucher", link: routes.campusbpvoucher },
          { label: "Campus Bank Receipt Voucher", link: routes.campusbrvoucher },
          { label: "Campus Cash Payment Voucher", link: routes.campuscpvoucher },
          { label: "Campus Cash Receipt Voucher", link: routes.campuscrvoucher },
          { label: "Campus Journal Voucher", link: routes.campusJournalVoucher },
        ],
      },

      {
        label: "Accounts",
        icon: "ti ti-swipe",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Expenses", link: routes.expense },

          { label: "Expense Category", link: routes.expenseCategory },
          { label: "Income", link: routes.accountsIncome },
          // {
          //   label: "Invoices",
          //   link: routes.accountsInvoices,
          //   subLink1: routes.addInvoice,
          //   subLink2: routes.editInvoice,
          // },
          // { label: "Invoice View", link: routes.invoice },
          { label: "Transactions", link: routes.accountsTransactions },
        ],
      },
      // Ledger Reports and Collection Report moved to the Reports page → Financial Reports.
    ],
  },
  {
    label: "Monitoring & Audit",
    submenuOpen: true,
    submenuHdr: "Monitoring & Audit",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Campus Financial Audit",
        link: routes.schoolFinancialAudit,
        icon: "ti ti-report-analytics",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "Announcements",
    submenuOpen: true,
    submenuHdr: "Announcements",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Notice Board",
        link: routes.noticeBoard,
        icon: "ti ti-clipboard-data",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Govt Notices",
        link: routes.govtNotices,
        icon: "ti ti-clipboard-data",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Events",
        link: routes.events,
        icon: "ti ti-calendar-question",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "Automation",
    submenuOpen: true,
    submenuHdr: "Automation",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Fee Creation Job",
        link: routes.feeCreationJob,
        icon: "ti ti-settings-automation",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Fee Creation Job Logs",
        link: routes.feeCreationJobLogs,
        icon: "ti ti-file-description",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "Reports",
    submenuOpen: true,
    submenuHdr: "Reports",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      // Every individual report now lives on the Reports page (feature-module/report/index.tsx),
      // grouped into Academic / Financial / HRM sections. Add new reports there, not here —
      // but do add the new module name to moduleNames below, or the entry can disappear for
      // a role whose only report right is that one.
      {
        label: "Reports",
        // The entry stands in for every report that used to have its own menu item, so it
        // stays visible if the role can view any one of them.
        moduleNames: [
          "Reports",
          "Attendance Report",
          "Salary Report",
          "Class Report",
          "Student Report",
          "Defaulter Report",
          "Campus Admission Status Report",
          "Contact List",
          "Branch Expense Report",
          "Grade Report",
          "Leave Report",
          "Fees Report",
          "Invoice Receipt Summary",
          "Student Strength Report",
          "Average Fee Report",
          "Ledger Reports",
          "Collection Report",
        ],
        link: routes.reports,
        icon: "ti ti-report-analytics",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "USER MANAGEMENT",
    submenuOpen: true,
    submenuHdr: "Sales",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Users",
        link: routes.manageusers,
        icon: "ti ti-users-minus",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Roles & Permission",
        link: routes.rolesPermissions,
        icon: "ti ti-shield-plus",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Delete Account Request",
        link: routes.deleteRequest,
        icon: "ti ti-user-question",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "MEMBERSHIP",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Finance & Accounts",
    submenuItems: [
      {
        label: "Membership Plans",
        link: routes.membershipplan,
        icon: "ti ti-user-plus",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Membership Addons",
        link: routes.membershipAddon,
        icon: "ti ti-cone-plus",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Transactions",
        link: routes.membershipTransaction,
        icon: "ti ti-file-power",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "CONTENT",
    icon: "ti ti-page-break",
    submenu: true,
    showSubRoute: false,
    submenuItems: [
      {
        label: "Pages",
        link: routes.pages,
        showSubRoute: false,
        icon: "ti ti-page-break",
      },
      {
        label: "Blog",
        icon: "ti ti-brand-blogger",
        submenu: true,
        submenuItems: [
          { label: "All Blogs", link: routes.allBlogs },
          {
            label: "Categories",
            link: routes.blogCategories,
            icon: "ti ti-quote",
          },
          {
            label: "Comments",
            link: routes.blogComments,
            icon: "ti ti-question-mark",
          },
          {
            label: "Tags",
            link: routes.blogTags,
            icon: "ti ti-question-mark",
          },
        ],
      },
      {
        label: "Location",
        icon: "ti ti-map-pin-search",
        submenu: true,
        submenuItems: [
          { label: "Countries", link: routes.countries },
          { label: "States", link: routes.states, icon: "ti ti-quote" },
          {
            label: "Cities",
            link: routes.cities,
            icon: "ti ti-question-mark",
          },
        ],
      },
      {
        label: "Testimonials",
        link: routes.testimonials,
        showSubRoute: false,
        icon: "ti ti-quote",
      },
      {
        label: "FAQ",
        link: routes.faq,
        showSubRoute: false,
        icon: "ti ti-question-mark",
      },
    ],
  },
  {
    label: "Support",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Finance & Accounts",
    submenuItems: [
      {
        label: "Contact Messages",
        link: routes.contactMessages,
        icon: "ti ti-message",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Tickets",
        link: routes.tickets,
        icon: "ti ti-ticket",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },
  {
    label: "Pages",
    submenu: true,
    showSubRoute: false,
    submenuHdr: "Authentication",
    submenuItems: [
      {
        label: "Profile",
        link: routes.profile,
        icon: "ti ti-user",
        showSubRoute: false,
        submenu: false,
      },

      {
        label: "Authentication",
        submenu: true,
        showSubRoute: false,
        icon: "ti ti-lock-square-rounded",
        submenuItems: [
          {
            label: "Login",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: routes.login },
              { label: "Illustration", link: routes.login },
              { label: "Basic", link: routes.login },
            ],
          },
          {
            label: "Register",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: routes.register },
              { label: "Illustration", link: routes.register },
              { label: "Basic", link: routes.register },
            ],
          },
          {
            label: "Forgot Password",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: routes.forgotPassword },
              { label: "Illustration", link: routes.forgotPassword },
              { label: "Basic", link: routes.forgotPassword },
            ],
          },
          {
            label: "Reset Password",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: routes.resetPassword },
              { label: "Illustration", link: routes.resetPassword },
              { label: "Basic", link: routes.resetPassword },
            ],
          },
          {
            label: "Email Verfication",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: routes.emailVerification },
              { label: "Illustration", link: routes.emailVerification },
              { label: "Basic", link: routes.emailVerification },
            ],
          },
          {
            label: "2 Step Verification",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Cover", link: routes.emailVerification },
              { label: "Illustration", link: routes.emailVerification },
              { label: "Basic", link: routes.emailVerification },
            ],
          },
          { label: "Lock Screen", link: routes.lockScreen },
        ],
      },
      {
        label: "Error Pages",
        submenu: true,
        showSubRoute: false,
        icon: "ti ti-error-404",
        submenuItems: [
          {
            label: "404 Error",
            link: routes.error404,
            showSubRoute: false,
          },
          { label: "500 Error", link: routes.error500, showSubRoute: false },
        ],
      },
      {
        label: "Blank Page",
        link: routes.blankPage,
        icon: "ti ti-brand-nuxt",
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Coming Soon",
        link: routes.comingSoon,
        icon: "ti ti-file",
        showSubRoute: false,
      },
      {
        label: "Under Maintenance",
        link: routes.underMaintenance,
        icon: "ti ti-moon-2",
        showSubRoute: false,
      },
    ],
  },
  {
    label: "Settings",
    submenu: true,
    showSubRoute: false,
    submenuHdr: "Settings",
    submenuItems: [
      // Every settings screen now lives on the Settings page (feature-module/settings/index.tsx),
      // grouped into categories. Add new settings there, not here — but do add the new module
      // name to moduleNames below, or the entry can disappear for a role whose only settings
      // right is that one. The template settings screens (General / Website / App / Financial /
      // Other) stay routed but unlinked until they are actually built.
      {
        label: "Settings",
        moduleNames: [
          "Settings",
          "Sessions",
          "Grades",
          "Section",
          "Subjects",
          "Religion",
          "Fees Type",
          "Discount Type",
          "Discount Setting",
          "Fees Structure",
          "Departments",
          "Designations",
          "Designation",
          "EmployeeType",
          "Employee Type",
          "Allowance Types",
          "Allowance Type",
          "Deductions",
          "Deduction",
          "Notification Config",
        ],
        link: routes.settings,
        icon: "ti ti-settings",
        showSubRoute: false,
        submenu: false,
      },
    ],
  },

  {
    label: "UI Interface",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "UI Interface",
    submenuItems: [
      {
        label: "Base UI",
        submenu: true,
        showSubRoute: false,
        icon: "ti ti-hierarchy-2",
        submenuItems: [
          { label: "Alerts", link: routes.alert, showSubRoute: false },
          { label: "Accordion", link: routes.accordion, showSubRoute: false },
          { label: "Avatar", link: routes.avatar, showSubRoute: false },
          { label: "Badges", link: routes.uiBadges, showSubRoute: false },
          { label: "Border", link: routes.border, showSubRoute: false },
          { label: "Buttons", link: routes.button, showSubRoute: false },
          {
            label: "Button Group",
            link: routes.buttonGroup,
            showSubRoute: false,
          },
          { label: "Breadcrumb", link: routes.breadcrums, showSubRoute: false },
          { label: "Card", link: routes.cards, showSubRoute: false, superAdminOnly: true },
          { label: "Carousel", link: routes.carousel, showSubRoute: false },
          { label: "Colors", link: routes.colors, showSubRoute: false },
          { label: "Dropdowns", link: routes.dropdowns, showSubRoute: false },
          { label: "Grid", link: routes.grid, showSubRoute: false },
          { label: "Images", link: routes.images, showSubRoute: false },
          { label: "Lightbox", link: routes.lightbox, showSubRoute: false },
          { label: "Media", link: routes.media, showSubRoute: false },
          { label: "Modals", link: routes.modals, showSubRoute: false },
          { label: "Offcanvas", link: routes.offcanvas, showSubRoute: false },
          { label: "Pagination", link: routes.pagination, showSubRoute: false },
          { label: "Popovers", link: routes.popover, showSubRoute: false },
          { label: "Progress", link: routes.progress, showSubRoute: false },
          {
            label: "Placeholders",
            link: routes.placeholder,
            showSubRoute: false,
          },
          {
            label: "Range Slider",
            link: routes.rangeSlider,
            showSubRoute: false,
          },
          { label: "Spinner", link: routes.spinner, showSubRoute: false },
          {
            label: "Sweet Alerts",
            link: routes.sweetalert,
            showSubRoute: false,
          },
          { label: "Tabs", link: routes.navTabs, showSubRoute: false },
          { label: "Toasts", link: routes.toasts, showSubRoute: false },
          { label: "Tooltips", link: routes.tooltip, showSubRoute: false },
          { label: "Typography", link: routes.typography, showSubRoute: false },
          { label: "Video", link: routes.video, showSubRoute: false },
        ],
      },
      {
        label: "Advanced UI",
        submenu: true,
        showSubRoute: false,
        icon: "ti ti-hierarchy-3",
        submenuItems: [
          { label: "Ribbon", link: routes.ribbon, showSubRoute: false },
          { label: "Clipboard", link: routes.clipboard, showSubRoute: false },
          {
            label: "Drag & Drop",
            link: routes.dragandDrop,
            showSubRoute: false,
          },
          {
            label: "Range Slider",
            link: routes.rangeSlider,
            showSubRoute: false,
          },
          { label: "Rating", link: routes.rating, showSubRoute: false },
          {
            label: "Text Editor",
            link: routes.textEditor,
            showSubRoute: false,
          },
          { label: "Counter", link: routes.counter, showSubRoute: false },
          { label: "Scrollbar", link: routes.scrollBar, showSubRoute: false },
          {
            label: "Sticky Note",
            link: routes.stickyNotes,
            showSubRoute: false,
          },
          { label: "Timeline", link: routes.timeLine, showSubRoute: false },
        ],
      },
      {
        label: "Charts",
        submenu: true,
        showSubRoute: false,
        icon: "ti ti-chart-line",
        submenuItems: [
          { label: "Apex Charts", link: routes.apexChat, showSubRoute: false },
          // { label: "Chart Js", link: routes.chart, showSubRoute: false },
        ],
      },
      {
        label: "Icons",
        submenu: true,
        showSubRoute: false,
        icon: "ti ti-icons",
        submenuItems: [
          {
            label: "Fontawesome Icons",
            link: routes.fantawesome,
            showSubRoute: false,
          },
          {
            label: "Feather Icons",
            link: routes.featherIcons,
            showSubRoute: false,
          },
          {
            label: "Ionic Icons",
            link: routes.iconicIcon,
            showSubRoute: false,
          },
          {
            label: "Material Icons",
            link: routes.materialIcon,
            showSubRoute: false,
          },
          { label: "Pe7 Icons", link: routes.pe7icon, showSubRoute: false },
          {
            label: "Simpleline Icons",
            link: routes.simpleLineIcon,
            showSubRoute: false,
          },
          {
            label: "Themify Icons",
            link: routes.themifyIcon,
            showSubRoute: false,
          },
          {
            label: "Weather Icons",
            link: routes.weatherIcon,
            showSubRoute: false,
          },
          {
            label: "Typicon Icons",
            link: routes.typicon,
            showSubRoute: false,
          },
          { label: "Flag Icons", link: routes.falgIcons, showSubRoute: false },
        ],
      },
      {
        label: "Forms",
        submenu: true,
        showSubRoute: false,
        icon: "ti ti-input-search",
        submenuItems: [
          {
            label: "Form Elements",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              {
                label: "Basic Inputs",
                link: routes.basicInput,
                showSubRoute: false,
              },
              {
                label: "Checkbox & Radios",
                link: routes.checkboxandRadion,
                showSubRoute: false,
              },
              {
                label: "Input Groups",
                link: routes.inputGroup,
                showSubRoute: false,
              },
              {
                label: "Grid & Gutters",
                link: routes.gridandGutters,
                showSubRoute: false,
              },
              {
                label: "Form Select",
                link: routes.formSelect,
                showSubRoute: false,
              },
              {
                label: "Input Masks",
                link: routes.formMask,
                showSubRoute: false,
              },
              {
                label: "File Uploads",
                link: routes.fileUpload,
                showSubRoute: false,
              },
            ],
          },
          {
            label: "Layouts",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Horizontal Form", link: routes.horizontalForm },
              { label: "Vertical Form", link: routes.verticalForm },
              { label: "Floating Labels", link: routes.floatingLable },
            ],
          },
          { label: "Form Validation", link: routes.formValidation },
          { label: "Select", link: routes.reactSelect },
          // { label: "Form Wizard", link: routes.formWizard },
        ],
      },
      {
        label: "Tables",
        submenu: true,
        showSubRoute: false,
        icon: "ti ti-table-plus",
        submenuItems: [
          { label: "Basic Tables", link: "/tables-basic" },
          { label: "Data Table", link: "/data-tables" },
        ],
      },
    ],
  },
  {
    label: "Help",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Help",
    submenuItems: [
      {
        label: "Documentation",
        link: "https://preschool.dreamstechnologies.com/documentation/index.html",
        icon: "ti ti-file-text",
        showSubRoute: false,
      },
      {
        label: "Changelog ",
        version: "v1.8.3",
        link: "https://preschool.dreamstechnologies.com/documentation/changelog.html",
        icon: "ti ti-exchange",
        showSubRoute: false,
      },
      {
        label: "Multi Level",
        showSubRoute: false,
        submenu: true,
        icon: "ti ti-menu-2",
        submenuItems: [
          { label: "Level 1.1", link: "#", showSubRoute: false },
          {
            label: "Level 1.2",
            submenu: true,
            showSubRoute: false,
            submenuItems: [
              { label: "Level 2.1", link: "#", showSubRoute: false },
              {
                label: "Level 2.2",
                submenu: true,
                showSubRoute: false,
                submenuItems: [
                  { label: "Level 3.1", link: "#", showSubRoute: false },
                  { label: "Level 3.2", link: "#", showSubRoute: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
