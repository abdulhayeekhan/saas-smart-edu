import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PredefinedDateRanges from "../../core/common/datePicker";
import { TableData } from "../../core/data/interface";
import Table from "../../core/common/dataTable2/index";
import { permission } from "../../core/data/json/permission";
import { all_routes } from "../router/all_routes";
import { getPermissionByRole } from '../../store/apps/permission'
import { getAllModules, createModule } from '../../store/apps/module'
import TooltipOption from "../../core/common/tooltipOption";
import { useDispatch } from "react-redux";
import { createPermissions, updatePermissions } from '../../store/apps/permission'
import { RootState } from '../../store'
import { Button } from "antd";
import toast from "react-hot-toast";
// Each module record from your backend
interface Module {
  id: number;
  moduleName: string;
  description?: string;
  ModuleType?: number | null;
  hasViewRight: boolean;
  hasAddRight: boolean;
  hasEditRight: boolean;
  hasDeleteRight: boolean;
  isEnabled: boolean;
}

// Each permission record
interface Permission {
  id: number;
  moduleId: number;
  roleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
  moduleName: string;
}

// Data for your table
interface TableRow {
  key: number;
  moduleName: string;
  moduleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
  allowAll: boolean;
}


export interface PermissionCreate {
  moduleId: number;
  roleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
}

export interface PermissionUpdate {
  id: number;
  moduleId: number;
  roleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
}

const Permission = () => {
  const data = permission;
  const routes = all_routes;
  const { roleId, roleName } = useParams<{ roleId: string, roleName: string }>();
  const dispatch = useDispatch<any>()
  const [modules, setModules] = useState<Module[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<TableRow[]>([])
  const [isSave, setIsSave] = useState(false)

  const handleSavePermissions = async (e: any) => {
    e.preventDefault();
    setIsSave(true);

    const createPayload: PermissionCreate[] = [];
    const updatePayload: PermissionUpdate[] = [];

    const numericRoleId = Number(roleId);
    tableData.forEach((module) => {
      const existingPerm = permissions.find((p) => p.moduleId === module.moduleId);

      // Prepare permission data (booleans)
      const permData = {
        moduleId: module.moduleId,
        roleId: numericRoleId,
        viewRight: !!module.viewRight,
        addRight: !!module.addRight,
        editRight: !!module.editRight,
        deleteRight: !!module.deleteRight,
      };

      if (existingPerm) {
        // Existing permission → update
        updatePayload.push({
          id: existingPerm.id,
          moduleId: permData.moduleId,
          roleId: permData.roleId,
          viewRight: Boolean(permData.viewRight),
          addRight: Boolean(permData.addRight),
          editRight: Boolean(permData.editRight),
          deleteRight: Boolean(permData.deleteRight),
        });
      } else {
        // New module → create
        createPayload.push({
          moduleId: permData.moduleId,
          roleId: permData.roleId,
          viewRight: Boolean(permData.viewRight),
          addRight: Boolean(permData.addRight),
          editRight: Boolean(permData.editRight),
          deleteRight: Boolean(permData.deleteRight),
        });
      }
    });

    try {
      if (updatePayload.length > 0) {
        await dispatch(updatePermissions(updatePayload)).unwrap();
      }
      if (createPayload.length > 0) {
        await dispatch(createPermissions(createPayload)).unwrap();
      }
    } catch (error) {
      toast.error(""+error);
    }

    setIsSave(false);
  };



  const GetRoleModulesAndPermissions = async () => {
    if (!roleId) return;
    setLoading(true)

    const numericRoleId = Number(roleId);

    try {
      // Fetch both modules & permissions in parallel
      const [modulesRes, permissionsRes] = await Promise.all([
        dispatch(getAllModules()),
        dispatch(getPermissionByRole(numericRoleId)),
      ]);

      let modulesData = modulesRes.payload || [];
      const permissionsData = permissionsRes.payload || [];

      // Auto-create missing modules
      const missingModules = [];
      if (!modulesData.find((m: any) => m.moduleName === "Contact List")) {
         missingModules.push({ name: "Contact List", moduleName: "Contact List", hasViewRight: true, hasAddRight: true, hasEditRight: true, hasDeleteRight: true, isEnabled: true });
      }
      if (!modulesData.find((m: any) => m.moduleName === "Branch Expense Report")) {
         missingModules.push({ name: "Branch Expense Report", moduleName: "Branch Expense Report", hasViewRight: true, hasAddRight: true, hasEditRight: true, hasDeleteRight: true, isEnabled: true });
      }
      if (!modulesData.find((m: any) => m.moduleName === "Campus Admission Status Report")) {
         missingModules.push({ name: "Campus Admission Status Report", moduleName: "Campus Admission Status Report", hasViewRight: true, hasAddRight: true, hasEditRight: true, hasDeleteRight: true, isEnabled: true });
      }
      if (!modulesData.find((m: any) => m.moduleName === "Defaulter Report")) {
         missingModules.push({ name: "Defaulter Report", moduleName: "Defaulter Report", hasViewRight: true, hasAddRight: true, hasEditRight: true, hasDeleteRight: true, isEnabled: true });
      }

      if (missingModules.length > 0) {
         for (const mod of missingModules) {
            await dispatch(createModule(mod));
         }
         // re-fetch modules
         const newModulesRes = await dispatch(getAllModules());
         modulesData = newModulesRes.payload || [];
      }

      setModules(modulesData);
      setPermissions(permissionsData);

      // Build tableData by combining both results
      const combinedTable: TableRow[] = modulesData.map((module: any) => {
        const perm = permissionsData.find(
          (p: any) => p?.moduleId === module?.id
        );
        return {
          key: module?.id,
          moduleName: module?.moduleName,
          moduleId: module?.id,
          viewRight: perm ? perm?.viewRight : false,
          addRight: perm ? perm?.addRight : false,
          editRight: perm ? perm?.editRight : false,
          deleteRight: perm ? perm?.deleteRight : false,
          allowAll:
            perm?.viewRight &&
              perm?.addRight &&
              perm?.editRight &&
              perm?.deleteRight
              ? true
              : false,
        };
      });

      // Save final table data
      setTableData(combinedTable);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      setLoading(false)
    }
  };
  useEffect(() => {
    GetRoleModulesAndPermissions()
  }, [roleId])




  const handleCheckboxChange = (
    key: number,
    field: keyof TableRow,
    value: boolean
  ) => {
    setTableData((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          // If user toggles "allowAll"
          if (field === "allowAll") {
            return {
              ...item,
              allowAll: value,
              viewRight: value,
              addRight: value,
              editRight: value,
              deleteRight: value,
            };
          }
          // Otherwise update single field
          const updated = {
            ...item,
            [field]: value,
          };

          // Automatically update "allowAll" when all four rights are true
          const allTrue =
            updated.viewRight &&
            updated.addRight &&
            updated.editRight &&
            updated.deleteRight;

          updated.allowAll = allTrue;
          return updated;
        }
        return item;
      })
    );
  };


  const isAllChecked = (field: keyof TableRow) => {
    if (tableData.length === 0) return false;
    return tableData.every((item) => !!item[field]);
  };

  const handleSelectAllField = (field: keyof TableRow, checked: boolean) => {
    setTableData((prev) =>
      prev.map((item) => {
        const updated = {
          ...item,
          [field]: checked,
        };
        const allTrue =
          updated.viewRight &&
          updated.addRight &&
          updated.editRight &&
          updated.deleteRight;
        updated.allowAll = allTrue;
        return updated;
      })
    );
  };

  const columns = [
    {
      title: "Modules",
      dataIndex: "moduleName",
      sorter: (a: TableData, b: TableData) =>
        a.moduleName.length - b.moduleName.length,
    },
    {
      title: (
        <div className="d-flex align-items-center gap-2">
          <label className="checkboxs mb-0">
            <input
              type="checkbox"
              checked={isAllChecked("addRight")}
              onChange={(e) => handleSelectAllField("addRight", e.target.checked)}
            />
            <span className="checkmarks" />
          </label>
          <span>Create</span>
        </div>
      ),
      dataIndex: "addRight",
      render: (_: any, record: TableRow) => (
        <>
          <label className="checkboxs">
            <input
              type="checkbox"
              checked={record.addRight}
              onChange={(e) =>
                handleCheckboxChange(record.key, "addRight", e.target.checked)
              }
            />
            <span className="checkmarks" />
          </label>
        </>
      )
    },
    {
      title: (
        <div className="d-flex align-items-center gap-2">
          <label className="checkboxs mb-0">
            <input
              type="checkbox"
              checked={isAllChecked("viewRight")}
              onChange={(e) => handleSelectAllField("viewRight", e.target.checked)}
            />
            <span className="checkmarks" />
          </label>
          <span>View</span>
        </div>
      ),
      dataIndex: "viewRight",
      render: (_: any, record: TableRow) => (
        <>
          <label className="checkboxs">
            <input
              type="checkbox"
              checked={record.viewRight}
              onChange={(e) =>
                handleCheckboxChange(record.key, "viewRight", e.target.checked)
              }
            />
            <span className="checkmarks" />
          </label>
        </>
      )
    },
    {
      title: (
        <div className="d-flex align-items-center gap-2">
          <label className="checkboxs mb-0">
            <input
              type="checkbox"
              checked={isAllChecked("editRight")}
              onChange={(e) => handleSelectAllField("editRight", e.target.checked)}
            />
            <span className="checkmarks" />
          </label>
          <span>Edit</span>
        </div>
      ),
      dataIndex: "editRight",
      render: (_: any, record: TableRow) => (
        <>
          <label className="checkboxs">
            <input
              type="checkbox"
              checked={record.editRight}
              onChange={(e) =>
                handleCheckboxChange(record.key, "editRight", e.target.checked)
              }
            />
            <span className="checkmarks" />
          </label>
        </>
      )
    },
    {
      title: (
        <div className="d-flex align-items-center gap-2">
          <label className="checkboxs mb-0">
            <input
              type="checkbox"
              checked={isAllChecked("deleteRight")}
              onChange={(e) => handleSelectAllField("deleteRight", e.target.checked)}
            />
            <span className="checkmarks" />
          </label>
          <span>Delete</span>
        </div>
      ),
      dataIndex: "deleteRight",
      render: (_: any, record: TableRow) => (
        <>
          <label className="checkboxs">
            <input
              type="checkbox"
              checked={record.deleteRight}
              onChange={(e) =>
                handleCheckboxChange(record.key, "deleteRight", e.target.checked)
              }
            />
            <span className="checkmarks" />
          </label>
        </>
      )
    }
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
                <h3 className="page-title mb-1">Permissions for {roleName}</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to={routes.rolesPermissions}>Roles</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Permissions for {roleName}
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">

                <div className="mb-2">
                  <button
                    className="btn btn-success"
                    disabled={isSave}
                    onClick={e => handleSavePermissions(e)}
                  >
                    {isSave ? "Loading..." : "Save Permissions"}
                  </button>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            {/* Filter Section */}
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                <h4 className="mb-3">Permissions for <span className="text-success">{roleName}</span></h4>
                <div className="d-flex align-items-center flex-wrap">

                  <div className="dropdown mb-3">
                    <Link
                      to="#"
                      className="btn btn-outline-light bg-white dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-sort-ascending-2 me-2" />
                      Sort by A-Z
                    </Link>
                    <ul className="dropdown-menu p-3">
                      <li>
                        <Link to="#" className="dropdown-item rounded-1 active">
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
                <Table columns={columns} dataSource={tableData} Selection={true} loading={loading} />
                {/* /Student List */}
              </div>
            </div>
            {/* /Filter Section */}
          </div>
        </div>
        {/* /Page Wrapper */}
        {/* Add Role */}
        <div className="modal fade" id="add_role">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Add Role</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <form>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-0">
                        <label className="form-label">Role Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter State Name"
                        />
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
                  <Link
                    to="#"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                  >
                    Add Role
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* /Add Role */}
      </>
    </div>
  );
};

export default Permission;
