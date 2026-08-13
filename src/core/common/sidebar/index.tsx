import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Scrollbars from "react-custom-scrollbars-2";
import { SidebarData } from "../../data/json/sidebarData";
import ImageWithBasePath from "../imageWithBasePath";
import "../../../style/icon/tabler-icons/webfont/tabler-icons.css";
import { setExpandMenu } from "../../data/redux/sidebarSlice";
import { useDispatch } from "react-redux";
import {
  resetAllMode,
  setDataLayout,
} from "../../data/redux/themeSettingSlice";
import { Companylogo, CompnayIcon, Copyright, CompanyName, CoverPhoto } from '../../../environment'
import usePreviousRoute from "./usePreviousRoute";
import axios from "axios";
const baseURL = process.env.REACT_APP_API_BASE_URL;

interface SidebarItem {
  label: string;
  link?: string;
  icon?: string;
  submenu?: boolean;
  submenuItems?: SidebarItem[];
  moduleName?: string;   // this is needed for role-based filtering
  [key: string]: any;    // keep it flexible for other props you already have
}

interface RoleRight {
  id: number;
  moduleId: number;
  moduleName: string;
  roleId: number;
  viewRight: boolean;
  addRight: boolean;
  editRight: boolean;
  deleteRight: boolean;
}

const Sidebar = () => {
  const Location = useLocation();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [filteredSidebar, setFilteredSidebar] = useState<any[]>([]);
  const [roleRights, setRoleRights] = useState<any[]>([]);


  const filterSidebarData = (
    sidebarData: SidebarItem[],
    roleRights: RoleRight[]
  ): SidebarItem[] => {
    return sidebarData
      .map((item): SidebarItem | null => {

        const filteredSubmenu = item.submenuItems
          ? filterSidebarData(item.submenuItems, roleRights)
          : [];

        // Case 1: If children survive → keep parent
        if (filteredSubmenu.length > 0) {
          return { ...item, submenuItems: filteredSubmenu };
        }

        // 🔑 Use moduleName OR label for matching
        const key = (item.moduleName ?? item.label ?? "")
          .trim()
          .toLowerCase();

        const hasViewRight = roleRights.some((r) => {
          if (!r.moduleName) return false;
          const rName = r.moduleName.trim().toLowerCase();
          return (rName === key || rName.includes(key) || key.includes(rName)) && r.viewRight;
        });

        if (hasViewRight) {
          return { ...item, submenuItems: [] };
        }

        return null;
      })
      .filter((item): item is SidebarItem => item !== null);
  };


  const loginInfo = JSON.parse(localStorage?.getItem("loginInfo") || "{}");
  let roleId = loginInfo?.roleId;

  useEffect(() => {
    if (!roleId) return;

    const getPermissionFunction = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/api/permission/getallpermissionbyrole?roleId=${roleId}`
        );
        const fetchedRights = response?.data?.data || [];
        localStorage.setItem("roleRights", JSON.stringify(fetchedRights));
        
        setRoleRights(fetchedRights);
        const filtered = await filterSidebarData(SidebarData, fetchedRights);

        setFilteredSidebar(filtered);
      } catch (err) {
        console.error("Error fetching permissions", err);
        setPermissions([]);
      }
    };

    getPermissionFunction();
  }, []);


  const [subOpen, setSubopen] = useState<any>("");
  const [subsidebar, setSubsidebar] = useState("");

  const toggleSidebar = (title: any) => {
    localStorage.setItem("menuOpened", title);
    if (title === subOpen) {
      setSubopen("");
    } else {
      setSubopen(title);
    }
  };

  const toggleSubsidebar = (subitem: any) => {
    if (subitem === subsidebar) {
      setSubsidebar("");
    } else {
      setSubsidebar(subitem);
    }
  };

  const handleLayoutChange = (layout: string) => {
    dispatch(setDataLayout(layout));
  };

  const handleClick = (label: any, themeSetting: any, layout: any) => {
    toggleSidebar(label);
    if (themeSetting) {
      handleLayoutChange(layout);
    }
  };

  const getLayoutClass = (label: any) => {
    switch (label) {
      case "Default":
        return "default_layout";
      case "Mini":
        return "mini_layout";
      case "Box":
        return "boxed_layout";
      case "Dark":
        return "dark_data_theme";
      case "RTL":
        return "rtl";
      default:
        return "";
    }
  };
  const location = useLocation();
  const dispatch = useDispatch();
  const previousLocation = usePreviousRoute();

  useEffect(() => {
    const layoutPages = [
      "/layout-dark",
      "/layout-rtl",
      "/layout-mini",
      "/layout-box",
      "/layout-default",
    ];

    const isCurrentLayoutPage = layoutPages.some((path) =>
      location.pathname.includes(path)
    );
    const isPreviousLayoutPage =
      previousLocation &&
      layoutPages.some((path) => previousLocation.pathname.includes(path));

    if (isPreviousLayoutPage && !isCurrentLayoutPage) {
      dispatch(resetAllMode());
    }
  }, [location, previousLocation, dispatch]);

  useEffect(() => {
    setSubopen(localStorage.getItem("menuOpened"));
    // Select all 'submenu' elements
    const submenus = document.querySelectorAll(".submenu");
    // Loop through each 'submenu'
    submenus.forEach((submenu) => {
      // Find all 'li' elements within the 'submenu'
      const listItems = submenu.querySelectorAll("li");
      submenu.classList.remove("active");
      // Check if any 'li' has the 'active' class
      listItems.forEach((item) => {
        if (item.classList.contains("active")) {
          // Add 'active' class to the 'submenu'
          submenu.classList.add("active");
          return;
        }
      });
    });
  }, [Location.pathname]);

  const onMouseEnter = () => {
    dispatch(setExpandMenu(true));
  };
  const onMouseLeave = () => {
    dispatch(setExpandMenu(false));
  };
  return (
    <>
      <div
        className="sidebar"
        id="sidebar"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Scrollbars>
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                <li>
                  <Link
                    to="#"
                    className="d-flex align-items-center border bg-white rounded p-2 mb-4"
                  >
                    <ImageWithBasePath
                      src={CompnayIcon}
                      className="avatar avatar-md img-fluid rounded"
                      alt="Profile"
                    />
                    <span className="text-dark ms-2 fw-normal">
                      {CompanyName}
                    </span>
                  </Link>
                </li>
              </ul>

              <ul>
                {roleId !== 1 ? (
                  filteredSidebar?.map((mainLabel, index) => (
                    <li key={index}>
                      <h6 className="submenu-hdr">
                        <span>{mainLabel?.label}</span>
                      </h6>

                      <ul>
                        {mainLabel?.submenuItems?.map((title: any, i: number) => (
                          <li className={title.submenu ? "submenu" : ""} key={title.label}>
                            <Link
                              to={title.submenu ? "#" : title?.link}
                              onClick={() =>
                                handleClick(
                                  title?.label,
                                  title?.themeSetting,
                                  getLayoutClass(title?.label)
                                )
                              }
                              className={`
                ${subOpen === title?.label ? "subdrop" : ""}
                ${title?.links?.includes(Location.pathname) ? "active" : ""}
                ${title?.link === Location.pathname ? "active" : ""}
              `}
                            >
                              <i className={title.icon}></i>
                              <span>{title?.label}</span>
                              {title?.version && (
                                <span className="badge badge-primary badge-xs text-white fs-10 ms-auto">
                                  {title?.version}
                                </span>
                              )}
                              {title?.submenu && <span className="menu-arrow" />}
                            </Link>

                            {/* Nested submenu */}
                            {title?.submenu && subOpen === title?.label && (
                              <ul
                                style={{
                                  display: subOpen === title?.label ? "block" : "none",
                                }}
                              >
                                {title?.submenuItems?.map((item: any) => (
                                  <li
                                    key={item.label}
                                    className={item?.submenuItems?.length ? "submenu submenu-two" : ""}
                                  >
                                    <Link
                                      to={item?.link}
                                      className={`
                        ${item?.link === Location.pathname ? "active" : ""}
                        ${subsidebar === item?.label ? "subdrop" : ""}
                      `}
                                      onClick={() => toggleSubsidebar(item?.label)}
                                    >
                                      {item?.label}
                                      {item?.submenuItems?.length > 0 && (
                                        <span className="menu-arrow" />
                                      )}
                                    </Link>

                                    {/* Third-level submenu */}
                                    {item?.submenuItems?.length > 0 && subsidebar === item?.label && (
                                      <ul
                                        style={{
                                          display: subsidebar === item?.label ? "block" : "none",
                                        }}
                                      >
                                        {item?.submenuItems?.map((items: any) => (
                                          <li key={items.label}>
                                            <Link
                                              to={items?.link}
                                              className={`
                                ${items?.link === Location.pathname ? "active" : ""}
                              `}
                                            >
                                              {items?.label}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))
                ) : (
                  SidebarData?.map((mainLabel, index) => (
                    <li key={index}>
                      <h6 className="submenu-hdr">
                        <span>{mainLabel?.label}</span>
                      </h6>
                      <ul>
                        {mainLabel?.submenuItems?.map((title: any, i) => {
                          let link_array: any = [];
                          if ("submenuItems" in title) {
                            title.submenuItems?.forEach((link: any) => {
                              link_array.push(link?.link);
                              if (link?.submenu && "submenuItems" in link) {
                                link.submenuItems?.forEach((item: any) => {
                                  link_array.push(item?.link);
                                });
                              }
                            });
                          }
                          title.links = link_array;

                          return (
                            <li className="submenu" key={title.label}>
                              <Link
                                to={title?.submenu ? "#" : title?.link}
                                onClick={() =>
                                  handleClick(
                                    title?.label,
                                    title?.themeSetting,
                                    getLayoutClass(title?.label)
                                  )
                                }
                                className={`${subOpen === title?.label ? "subdrop" : ""
                                  } ${title?.links?.includes(Location.pathname)
                                    ? "active"
                                    : ""
                                  } ${title?.submenuItems
                                    ?.map((link: any) => link?.link)
                                    .includes(Location.pathname) ||
                                    title?.link === Location.pathname
                                    ? "active"
                                    : "" || title?.subLink1 === Location.pathname
                                      ? "active"
                                      : "" || title?.subLink2 === Location.pathname
                                        ? "active"
                                        : "" || title?.subLink3 === Location.pathname
                                          ? "active"
                                          : "" || title?.subLink4 === Location.pathname
                                            ? "active"
                                            : "" || title?.subLink5 === Location.pathname
                                              ? "active"
                                              : "" || title?.subLink6 === Location.pathname
                                                ? "active"
                                                : "" || title?.subLink7 === Location.pathname
                                                  ? "active"
                                                  : ""
                                  }`}
                              >
                                <i className={title.icon}></i>
                                <span>{title?.label}</span>
                                <span className="badge badge-primary badge-xs text-white fs-10 ms-auto">
                                  {title?.version}
                                </span>
                                <span
                                  className={title?.submenu ? "menu-arrow" : ""}
                                />
                              </Link>
                              {title?.submenu !== false &&
                                subOpen === title?.label && (
                                  <ul
                                    style={{
                                      display:
                                        subOpen === title?.label
                                          ? "block"
                                          : "none",
                                    }}
                                  >
                                    {title?.submenuItems?.map((item: any) => (
                                      <li
                                        className={
                                          item?.submenuItems
                                            ? "submenu submenu-two "
                                            : ""
                                        }
                                        key={item.label}
                                      >
                                        <Link
                                          to={item?.link}
                                          className={`${item?.submenuItems
                                            ?.map((link: any) => link?.link)
                                            .includes(Location.pathname) ||
                                            item?.link === Location.pathname
                                            ? "active"
                                            : "" ||
                                              item?.subLink1 ===
                                              Location.pathname
                                              ? "active"
                                              : "" ||
                                                item?.subLink2 ===
                                                Location.pathname
                                                ? "active"
                                                : "" ||
                                                  item?.subLink3 ===
                                                  Location.pathname
                                                  ? "active"
                                                  : "" ||
                                                    item?.subLink4 ===
                                                    Location.pathname
                                                    ? "active"
                                                    : "" ||
                                                      item?.subLink5 ===
                                                      Location.pathname
                                                      ? "active"
                                                      : "" ||
                                                        item?.subLink6 ===
                                                        Location.pathname
                                                        ? "active"
                                                        : ""
                                            } ${subsidebar === item?.label
                                              ? "subdrop"
                                              : ""
                                            }  `}
                                          onClick={() => {
                                            toggleSubsidebar(item?.label);
                                          }}
                                        >
                                          {item?.label}
                                          <span
                                            className={
                                              item?.submenu ? "menu-arrow" : ""
                                            }
                                          />
                                        </Link>
                                        {item?.submenuItems ? (
                                          <ul
                                            style={{
                                              display:
                                                subsidebar === item?.label
                                                  ? "block"
                                                  : "none",
                                            }}
                                          >
                                            {item?.submenuItems?.map(
                                              (items: any) => (
                                                <li key={items.label}>
                                                  <Link
                                                    to={items?.link}
                                                    className={`${subsidebar === items?.label
                                                      ? "submenu-two subdrop"
                                                      : "submenu-two"
                                                      } ${items?.submenuItems
                                                        ?.map(
                                                          (link: any) => link.link
                                                        )
                                                        .includes(
                                                          Location.pathname
                                                        ) ||
                                                        items?.link ===
                                                        Location.pathname
                                                        ? "active"
                                                        : ""
                                                      }`}
                                                  >
                                                    {items?.label}
                                                  </Link>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        ) : (
                                          <></>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </Scrollbars>
      </div>
    </>
  );
};

// const filterSidebarByPermissions = (sidebarData: any[], permissions: any[]) => {
//   // normalize allowed paths/modules from API
//   const allowedLinks = permissions.map((p: any) => p?.path || p?.moduleName);

//   const filterItems = (items: any[]) =>
//     items
//       .filter((item) => {
//         // if it's a submenu group, keep it if any child matches
//         if (item?.submenuItems) {
//           const filteredChildren = filterItems(item.submenuItems);
//           item.submenuItems = filteredChildren;
//           return filteredChildren.length > 0;
//         }
//         // if it has direct link, check permission
//         return allowedLinks.includes(item?.link);
//       })
//       .map((item) => ({ ...item }));

//   return filterItems(sidebarData);
// };

export default Sidebar;