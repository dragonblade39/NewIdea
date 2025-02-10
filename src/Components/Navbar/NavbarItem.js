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
  selectedSearchNode,
  expandParents,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fontSize = 18 - depth * 2;

  useEffect(() => {
    // Check if this node is the selected search node
    if (selectedSearchNode && selectedSearchNode.label === item.label) {
      setIsExpanded(true); // Expand this node
      if (Array.isArray(selectedSearchNode.children)) {
        setSelectedChildren(selectedSearchNode.children.map(child => child.label));
      } else {
        setSelectedChildren([]);
      }
      // Ensure parents are expanded
      expandParents(item.label);
      setExpandedItems((prev) => ({ ...prev, [depth]: item.label }));
    }
  }, [selectedSearchNode, item.label, depth, expandParents, setSelectedChildren]);

  useEffect(() => {
    if (expandedItems[level] !== item.label && isExpanded) {
      setIsExpanded(false);
      setChildren([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [expandedItems, isExpanded, item.label, level]);

  const handleExpand = (event) => {
    event.stopPropagation();
    setIsExpanded((prev) => !prev);

    if (!isExpanded) {
      setExpandedItems((prev) => ({
        ...prev,
        [level]: item.label,
      }));

      loadChildren(item.label, 1).then(({ items, totalPages }) => {
        setChildren(items);
        setTotalPages(totalPages);

        // Log subscription actions
        if (!subscribedNodes.has(item.label)) {
          logAction("Subscribed", item.label);
          setSubscribedNodes((prev) => new Set(prev).add(item.label));
        }

        items.forEach((child) => {
          if (!subscribedNodes.has(child.label)) {
            logAction("Subscribed", child.label);
            setSubscribedNodes((prev) => new Set(prev).add(child.label));
          }
        });
      });
    }
  };

  const handleNodeClick = async () => {
    setSelectedNode({ label: item.label, isActive: item.isActive });

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

    setSelectedChildren(childrenData);
  };

  const loadPage = (page) => {
    if (page < 1 || page > totalPages) return;

    loadChildren(item.label, page).then(({ items }) => {
      setChildren(items);
      setCurrentPage(page);
      setSelectedChildren((prev) => [
        ...prev,
        ...items.filter((child) => !prev.some((c) => c.label === child.label)),
      ]);

      items.forEach((child) => logAction("Subscribed", child.label));
    });
  };

  const handlePageInput = (event) => {
    if (event.key === "Enter") {
      loadPage(Number(event.target.value));
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
        onClick={handleExpand}
      >
        {item.children && (
          <i
            className={`bi ${
              isExpanded ? "bi-arrow-down-square-fill" : "bi-arrow-right-square"
            } navbar_icon navbar_icon_bold`}
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
              selectedSearchNode={selectedSearchNode}
              expandParents={expandParents}
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
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
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