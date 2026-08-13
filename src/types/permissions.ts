export interface ModulePermission {
  id: number;
  moduleId: number;
  moduleName: string;
  roleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
}