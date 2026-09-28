import React from "react";
import CategoryHub, { HubSection } from "../../core/common/categoryHub";
import { all_routes } from "../router/all_routes";

const routes = all_routes;

const SECTIONS: HubSection[] = [
  {
    title: "Academic Reports",
    icon: "ti ti-school",
    description: "Students, classes, attendance and admissions",
    accent: "academic",
    tiles: [
      {
        label: "Attendance Report",
        link: routes.attendanceReport,
        icon: "ti ti-calendar-due",
        description: "Student attendance across a date range",
      },
      {
        label: "Students Attendance Type",
        // These used to hang off the "Attendance Report" menu entry as subLinks, so they
        // keep being gated by that same right rather than gaining one of their own.
        moduleName: "Attendance Report",
        link: routes.studentAttendanceType,
        icon: "ti ti-calendar-stats",
        description: "Present, absent and leave split by type",
      },
      {
        label: "Daily Attendance",
        moduleName: "Attendance Report",
        link: routes.dailyAttendance,
        icon: "ti ti-calendar-event",
        description: "One day's attendance for the whole campus",
      },
      {
        label: "Student Day Wise Report",
        moduleName: "Attendance Report",
        link: routes.studentDayWise,
        icon: "ti ti-calendar-time",
        description: "Day by day attendance for a single student",
      },
      {
        label: "Class Report",
        link: routes.classReport,
        icon: "ti ti-graph",
        description: "Class-level summary of students and sections",
      },
      {
        label: "Student Report",
        link: routes.studentReport,
        icon: "ti ti-chart-infographic",
        description: "Full student listing with filters",
      },
      {
        label: "Grade Report",
        link: routes.gradeReport,
        icon: "ti ti-award",
        description: "Students grouped by grade",
      },
      {
        label: "Student Strength Report",
        link: routes.studentStrengthReport,
        icon: "ti ti-users",
        description: "Enrolment strength by class and campus",
      },
      {
        label: "Campus Admission Status Report",
        moduleName: "Campus Admission Status Report",
        link: routes.campusAdmissionStatusReport,
        icon: "ti ti-chart-bar",
        description: "Admissions, withdrawals and net movement",
      },
      {
        label: "Contact List",
        moduleName: "Contact List",
        link: routes.contactList,
        icon: "ti ti-address-book",
        description: "Contact numbers for students and guardians",
      },
    ],
  },
  {
    title: "Financial Reports",
    icon: "ti ti-cash",
    description: "Fees, collections, expenses and ledgers",
    accent: "financial",
    tiles: [
      {
        label: "Fees Report",
        link: routes.feesReport,
        icon: "ti ti-receipt-2",
        description: "Fee invoices raised over a period",
      },
      {
        label: "Collection Report",
        link: routes.collectionReport,
        icon: "ti ti-coins",
        description: "What was actually collected, by day and head",
      },
      {
        label: "Defaulter Report",
        moduleName: "Defaulter Report",
        link: routes.defaulterReport,
        icon: "ti ti-user-x",
        description: "Students with outstanding fee balances",
      },
      {
        label: "Average Fee Report",
        link: routes.averageFeeReport,
        icon: "ti ti-chart-line",
        description: "Average fee per student by class and campus",
      },
      {
        label: "Invoice Receipt Summary",
        link: routes.invoiceReceiptSummaryReport,
        icon: "ti ti-file-analytics",
        description: "Invoiced against received, side by side",
      },
      {
        label: "Branch Expense Report",
        moduleName: "Branch Expense Report",
        link: routes.branchExpenseReport,
        icon: "ti ti-receipt",
        description: "Campus expenses by category and period",
      },
      {
        label: "Ledger Reports",
        link: routes.ledgerReports,
        icon: "ti ti-book",
        description: "Chart of accounts ledgers and balances",
      },
    ],
  },
  {
    title: "HRM Reports",
    icon: "ti ti-users-group",
    description: "Staff and teacher attendance and leaves",
    accent: "hrm",
    tiles: [
      {
        label: "Salary Report",
        moduleName: "Salary Report",
        link: routes.salaryReport,
        icon: "ti ti-report-money",
        description: "Campus monthly salary and payroll summary",
      },
      {
        label: "Employee Ledger Report",
        moduleName: "Salary Report",
        link: routes.employeeLedgerReport,
        icon: "ti ti-notebook",
        description: "All allowance and deduction transactions of one employee",
      },
      {
        label: "Staff Attendance Report",
        moduleName: "Attendance Report",
        link: routes.staffReport,
        icon: "ti ti-user-check",
        description: "Attendance summary for campus staff",
      },
      {
        label: "Staff Day Wise Report",
        moduleName: "Attendance Report",
        link: routes.staffDayWise,
        icon: "ti ti-calendar-time",
        description: "Day by day attendance for a staff member",
      },
      {
        label: "Teacher's Report",
        moduleName: "Attendance Report",
        link: routes.teacherReport,
        icon: "ti ti-chalkboard",
        description: "Attendance summary for teachers",
      },
      {
        label: "Teacher Day Wise Report",
        moduleName: "Attendance Report",
        link: routes.teacherDayWise,
        icon: "ti ti-calendar-time",
        description: "Day by day attendance for a teacher",
      },
      {
        label: "Leave Report",
        link: routes.leaveReport,
        icon: "ti ti-calendar-off",
        description: "Leaves applied, approved and rejected",
      },
    ],
  },
];

const Reports = () => (
  <CategoryHub title="Reports" itemNoun="report" itemNounPlural="reports" sections={SECTIONS} />
);

export default Reports;
