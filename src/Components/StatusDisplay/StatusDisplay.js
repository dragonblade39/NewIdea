import React, { useState } from "react";
import "./StatusDisplay.css";
import SelectedChildrenModal from "./SelectedChildrenModal";

const StatusDisplay = ({ selectedNode, selectedChildren }) => {
  const [showModal, setShowModal] = useState(false);

  if (!selectedNode) return null;

  return (
    <>
      <div className="status_box">
        <p>
          <strong>{selectedNode.label}</strong>:{" "}
          <span
            className={
              selectedNode.isActive ? "status_active" : "status_inactive"
            }
          >
            {selectedNode.isActive ? "Active" : "Inactive"}
          </span>
        </p>
        &nbsp;
        <i
          className="bi bi-info-circle-fill status_icon"
          onClick={() => setShowModal(true)}
          title="View Parent and Children's Status"
        ></i>
      </div>

      {showModal && (
        <SelectedChildrenModal
          selectedNode={selectedNode}
          selectedChildren={selectedChildren}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default StatusDisplay;
