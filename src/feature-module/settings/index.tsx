import React from "react";
import CategoryHub, { HubSection } from "../../core/common/categoryHub";
import { all_routes } from "../router/all_routes";

const routes = all_routes;

/**
 * Only the settings that are actually wired to the API are listed. The template settings
 * screens under feature-module/settings/{general,website,app,financial,other}Settings are
 * still routed but intentionally unlinked — add a section here as each one is built.
 */
const SECTIONS: HubSection[] = [
  {
    title: "Academic Settings",
    icon: "ti ti-school",
    description: "Sessions, classes, subjects and fee structure",
    accent: "academic",
    tiles: [
      {
        label: "Sessions",
        link: routes.classSession,
        icon: "ti ti-calendar-repeat",
        description: "Academic sessions and the current year",
      },
      {
        label: "Grades",
        link: routes.classGrade,
        icon: "ti ti-stairs-up",
        description: "Grade levels offered by the campus",
      },
      {
        label: "Section",
        link: routes.classSection,
        icon: "ti ti-square-rotated-forbid-2",
        description: "Sections a grade is split into",
      },
      {
        label: "Subjects",
        link: routes.classSubjects,
        icon: "ti ti-book-2",
        description: "Subjects taught and their class mapping",
      },
      {
        label: "Religion",
        link: routes.religion,
        icon: "ti ti-users-group",
        description: "Religion options on the admission form",
      },
      {
        label: "Fees Type",
        link: routes.feesType,
        icon: "ti ti-category",
        description: "Fee heads that make up an invoice",
      },
      {
        label: "Discount Type",
        link: routes.discountType,
        icon: "ti ti-tag",
        description: "Discounts that can be applied to a fee",
      },
      {
        label: "Discount Setting",
        link: routes.discountTransactionSetting,
        icon: "ti ti-adjustments-dollar",
        description: "How each discount posts against accounts",
      },
      {
        label: "Fees Structure",
        link: routes.feeStructure,
        icon: "ti ti-receipt",
        description: "Fee amounts per grade, session and type",
      },
    ],
  },
  {
    title: "HRM Settings",
    icon: "ti ti-users-group",
    description: "Departments, designations, employee types, allowances and deductions",
    accent: "hrm",
    tiles: [
      {
        label: "Departments",
        link: routes.departments,
        icon: "ti ti-layout-distribute-horizontal",
        description: "Department setup and overtime rules",
      },
      {
        label: "Designation",
        moduleName: "Designations",
        link: routes.designation,
        icon: "ti ti-user-exclamation",
        description: "Staff designations and roles",
      },
      {
        label: "Employee Type",
        moduleName: "EmployeeType",
        link: routes.employeeType,
        icon: "ti ti-users",
        description: "Permanent, contract and visiting types",
      },
      {
        label: "Allowance Type",
        moduleName: "Allowance Types",
        link: routes.allowanceTypes,
        icon: "ti ti-cash-banknote",
        description: "Employee allowance heads and types",
      },
      {
        label: "Deduction",
        moduleName: "Deductions",
        link: routes.deductions,
        icon: "ti ti-receipt-tax",
        description: "Employee deduction heads and types",
      },
    ],
  },
  {
    title: "System Settings",
    icon: "ti ti-settings-cog",
    description: "Notifications and system-wide behaviour",
    accent: "system",
    tiles: [
      {
        label: "Notification Config",
        moduleName: "Settings",
        link: routes.notificationSettings,
        icon: "ti ti-bell-cog",
        description: "Per-event push notification switches",
      },
    ],
  },
];

const Settings = () => (
  <CategoryHub title="Settings" itemNoun="setting" itemNounPlural="settings" sections={SECTIONS} />
);

export default Settings;
