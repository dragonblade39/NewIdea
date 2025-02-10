import React, { useState } from "react";
import "./SelectedChildrenModal.css";

const SelectedChildrenModal = ({ selectedNode, selectedChildren, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  if (!selectedNode) return null;

  const filteredChildren = selectedChildren.filter((child) =>
    child.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="modal_overlay">
      <div className="modal_container">
        <input
          type="text"
          className="modal_search"
          placeholder="Search children..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="tree_node parent_node">
          <p>
            <strong>📂 {selectedNode.label} &nbsp;</strong>
            <span
              className={
                selectedNode.isActive ? "active_status" : "inactive_status"
              }
            >
              ({selectedNode.isActive ? "Active" : "Inactive"})
            </span>
          </p>
        </div>

        <div className="modal_content">
          {filteredChildren.length > 0 ? (
            <ul className="tree_list">
              {filteredChildren.map((child, index) => (
                <li key={index} className="tree_node">
                  <span
                    className={
                      child.isActive ? "active_status" : "inactive_status"
                    }
                  >
                    ├── {child.label} ({child.isActive ? "Active" : "Inactive"})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no_children_text"></p>
          )}
        </div>

        <div className="modal_footer">
          <button className="modal_close_btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedChildrenModal;
