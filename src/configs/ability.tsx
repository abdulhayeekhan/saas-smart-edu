import { Ability, AbilityBuilder, AbilityClass } from "@casl/ability";
import { store } from "../store";
import { ModulePermission } from "../types/permissions";

// Actions & Subjects
export type Actions = "view" | "add" | "edit" | "delete";
export type Subjects = string;

export type AppAbility = Ability<[Actions, Subjects]>;
const AppAbility = Ability as AbilityClass<AppAbility>;

export const ability = new AppAbility();

// Permission check
export default function canUser(action: Actions, subject: Subjects): boolean {
  return ability.can(action, subject);
}

// Define rules
function defineRulesFor(getPermissions: ModulePermission[]) {
  const { can, build } = new AbilityBuilder<AppAbility>(AppAbility);
  const processedModuleIds = new Set<number>();
  getPermissions?.forEach(
    ({ addRight, editRight, deleteRight, viewRight, moduleId, moduleName }) => {
      if (!processedModuleIds.has(moduleId)) {
        const subjectById = `module-${moduleId}` as Subjects;
        const subjectByName = moduleName as Subjects;

        if (addRight) {
          can("add", subjectById);
          can("add", subjectByName);
        }
        if (editRight) {
          can("edit", subjectById);
          can("edit", subjectByName);
        }
        if (deleteRight) {
          can("delete", subjectById);
          can("delete", subjectByName);
        }
        if (viewRight) {
          can("view", subjectById);
          can("view", subjectByName);
        }

        processedModuleIds.add(moduleId);
      }
    }
  );

  return build();
}

store.subscribe(() => {
  const state = store.getState();
  const permissions = state.permission.permissions; // ✅ strongly typed
  const newAbility = defineRulesFor(permissions);
  ability.update(newAbility.rules);
});
