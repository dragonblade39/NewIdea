import React, { useState, useEffect } from "react";
import "./Navbar.css";

const logAction = async (action, label) => {
  try {
    await fetch("http://localhost:5500/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, label }),
    });
  } catch (error) {
    console.error("Error sending log:", error);
  }
};

const NavbarItem = ({
  item,
  depth = 0,
  loadChildren,
  expandedItems,
  setExpandedItems,
  subscribedNodes,
  setSubscribedNodes,
  level,
  setSelectedNode,
  setSelectedChildren,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const [visibleChildren, setVisibleChildren] = useState([]);

  const fontSize = 18 - depth * 2;

  useEffect(() => {
    if (expandedItems[level] !== item.label && isExpanded) {
      setIsExpanded(false);
      setChildren([]);
      visibleChildren.forEach((child) =>
        logAction("Unsubscribed", child.label)
      );
    }
  }, [expandedItems]);

  const handleExpand = (event) => {
    event.stopPropagation();

    if (isExpanded) {
      setIsExpanded(false);
      setChildren([]);
      visibleChildren.forEach((child) =>
        logAction("Unsubscribed", child.label)
      );

      setSubscribedNodes((prev) => {
        const newSet = new Set(prev);
        visibleChildren.forEach((child) => newSet.delete(child.label));
        return newSet;
      });

      return;
    }

    setExpandedItems((prev) => ({
      ...prev,
      [level]: item.label,
    }));

    loadChildren(item.label, 1).then(({ items, totalPages }) => {
      setChildren(items);
      setTotalPages(totalPages);
      setCurrentPage(1);
      setIsExpanded(true);

      if (!subscribedNodes.has(item.label)) {
        logAction("Subscribed", item.label);
        setSubscribedNodes((prev) => new Set(prev).add(item.label));
      }

      setVisibleChildren(items);
      items.forEach((child) => {
        logAction("Subscribed", child.label);
        setSubscribedNodes((prev) => new Set(prev).add(child.label));
      });
    });
  };

  const handleNodeClick = async () => {
    if (typeof setSelectedNode === "function") {
      setSelectedNode({ label: item.label, isActive: item.isActive });
    }

    let childrenData = [];

    if (item.children && item.children.length > 0) {
      childrenData = item.children.map((child) => ({
        label: child.label,
        isActive: child.isActive,
      }));
    } else {
      const response = await loadChildren(item.label, 1);
      childrenData = response.items.map((child) => ({
        label: child.label,
        isActive: child.isActive,
      }));
    }

    setSelectedChildren([...childrenData]);
  };

  const loadPage = (page) => {
    if (page < 1 || page > totalPages) return;

    loadChildren(item.label, page).then(({ items }) => {
      setChildren(items);
      setCurrentPage(page);
      setPageInput("");

      setSelectedChildren((prev) => {
        const mergedChildren = [
          ...prev,
          ...items.filter(
            (child) => !prev.some((c) => c.label === child.label)
          ),
        ];
        return mergedChildren;
      });

      visibleChildren.forEach((child) =>
        logAction("Unsubscribed", child.label)
      );
      setVisibleChildren(items);
      items.forEach((child) => logAction("Subscribed", child.label));
    });
  };

  const handlePageInput = (event) => {
    if (event.key === "Enter") {
      loadPage(Number(pageInput));
    }
  };

  return (
    <div className="navbar_item">
      <div
        className={`navbar_label ${isExpanded ? "navbar_label_active" : ""}`}
        style={{
          fontSize: `${fontSize}px`,
          paddingLeft: `${depth * 10 + 10}px`,
        }}
      >
        {item.children && (
          <i
            className={`bi ${
              isExpanded ? "bi-arrow-down-square-fill" : "bi-arrow-right-square"
            } navbar_icon navbar_icon_bold`}
            onClick={handleExpand}
          ></i>
        )}
        <span className="navbar_text" onClick={handleNodeClick}>
          {item.label}
        </span>
      </div>

      {isExpanded && children.length > 0 && (
        <div className="navbar_children">
          {children.map((child, index) => (
            <NavbarItem
              key={index}
              item={child}
              depth={depth + 1}
              loadChildren={loadChildren}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              subscribedNodes={subscribedNodes}
              setSubscribedNodes={setSubscribedNodes}
              level={depth + 1}
              setSelectedNode={setSelectedNode}
              setSelectedChildren={setSelectedChildren}
            />
          ))}
          {totalPages > 1 && (
            <div className="navbar_pagination">
              <button
                className="navbar_pagination_btn"
                onClick={() => loadPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ◀
              </button>
              <input
                type="number"
                className="navbar_page_input"
                placeholder={`Page ${currentPage} of ${totalPages}`}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={handlePageInput}
                min="1"
                max={totalPages}
              />
              <button
                className="navbar_pagination_btn"
                onClick={() => loadPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarItem;
