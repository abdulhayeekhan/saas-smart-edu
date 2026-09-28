import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../feature-module/router/all_routes";

/**
 * A landing page that fronts many screens with one sidebar entry — used by Reports and
 * Settings. Sections are tinted so the groups read apart; see `.hub-section--*` in
 * index.scss for the accents.
 */
export type HubAccent = "academic" | "financial" | "hrm" | "system";

export interface HubTile {
  label: string;
  link: string;
  icon: string;
  description: string;
  /**
   * Module the role rights are checked against. Defaults to `label`, mirroring how the
   * sidebar resolves an entry that carries no explicit module name.
   */
  moduleName?: string;
}

export interface HubSection {
  title: string;
  icon: string;
  description: string;
  accent: HubAccent;
  tiles: HubTile[];
}

interface CategoryHubProps {
  title: string;
  /** Word used in the search placeholder and empty state, e.g. "reports". */
  itemNoun: string;
  itemNounPlural: string;
  sections: HubSection[];
}

/**
 * The same loose match the sidebar uses, so a screen is visible here exactly when it was
 * visible in the menu before it moved onto a hub page.
 */
const hasViewRight = (roleRights: any[], key: string) => {
  const needle = (key || "").trim().toLowerCase();
  return roleRights.some((right) => {
    if (!right?.moduleName) return false;
    const name = right.moduleName.trim().toLowerCase();
    return (name === needle || name.includes(needle) || needle.includes(name)) && right.viewRight;
  });
};

const CategoryHub: React.FC<CategoryHubProps> = ({
  title,
  itemNoun,
  itemNounPlural,
  sections: allSections,
}) => {
  const routes = all_routes;
  const [searchText, setSearchText] = useState("");

  // Written at login by AuthContext, refreshed by the sidebar.
  const roleRights: any[] = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("roleRights") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }, []);

  const roleId = useMemo(() => {
    try {
      const loginInfo = JSON.parse(localStorage.getItem("loginInfo") || "{}");
      return loginInfo?.roleId;
    } catch {
      return null;
    }
  }, []);

  const sections = useMemo(() => {
    const needle = searchText.trim().toLowerCase();

    return allSections
      .map((section) => ({
        ...section,
        tiles: section.tiles.filter((tile) => {
          // No rights loaded at all → show everything rather than an empty page.
          // Superadmin (roleId === 1) also bypasses this check.
          const permitted = roleId === 1 ||
            roleRights.length === 0 || hasViewRight(roleRights, tile.moduleName ?? tile.label);
          if (!permitted) return false;
          if (!needle) return true;
          return (
            tile.label.toLowerCase().includes(needle) ||
            tile.description.toLowerCase().includes(needle) ||
            section.title.toLowerCase().includes(needle)
          );
        }),
      }))
      .filter((section) => section.tiles.length > 0);
  }, [allSections, roleRights, searchText, roleId]);

  const totalVisible = sections.reduce((total, section) => total + section.tiles.length, 0);

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">{title}</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {title}
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="search-input mb-2" style={{ minWidth: "260px" }}>
              <input
                type="text"
                className="form-control"
                placeholder={`Search ${itemNounPlural}...`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>

        {sections.map((section) => (
          <div className={`card hub-section hub-section--${section.accent}`} key={section.title}>
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap">
              <div className="d-flex align-items-center">
                <span className="avatar avatar-md rounded me-2 hub-section-icon">
                  <i className={`${section.icon} fs-20`} />
                </span>
                <div>
                  <h4 className="mb-0">{section.title}</h4>
                  <small className="text-muted">{section.description}</small>
                </div>
              </div>
              <span className="badge hub-section-badge">
                {section.tiles.length} {section.tiles.length === 1 ? itemNoun : itemNounPlural}
              </span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {section.tiles.map((tile) => (
                  <div className="col-xxl-3 col-lg-4 col-md-6" key={tile.link + tile.label}>
                    <Link to={tile.link} className="text-decoration-none">
                      <div className="card mb-0 h-100 hub-tile border">
                        <div className="card-body d-flex align-items-start p-3">
                          <span className="avatar avatar-md rounded me-3 flex-shrink-0 hub-tile-icon">
                            <i className={`${tile.icon} fs-18`} />
                          </span>
                          <div>
                            <h6 className="mb-1 text-dark">{tile.label}</h6>
                            <p className="mb-0 fs-12 text-muted">{tile.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {totalVisible === 0 && (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="ti ti-file-off fs-32 text-muted d-block mb-2" />
              <h5 className="mb-1">No {itemNounPlural} found</h5>
              <p className="text-muted mb-0">
                {searchText
                  ? "Nothing matches that search."
                  : `Your role does not have view rights on any ${itemNoun}.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryHub;
