import React, { useState } from "react";
import NavbarItem from "./NavbarItem";
import StatusDisplay from "../StatusDisplay/StatusDisplay";
import "./Navbar.css";
import SearchModal from "./SearchModal";

const Navbar = () => {
  const [loadedData, setLoadedData] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [subscribedNodes, setSubscribedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [elementSearch, setElementSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleNodeSelection = async (node) => {
    let children = [];

    if (node.children && node.children.length > 0) {
      children = node.children.map((child) => ({
        label: child.label,
        isActive: child.isActive,
      }));
    } else {
      const response = await loadChildren(node.label, 1);
      children = response.items.map((child) => ({
        label: child.label,
        isActive: child.isActive,
      }));
    }

    setSelectedNode(node);
    setSelectedChildren([...children]);
  };

  const loadChildren = async (parentLabel, page) => {
    if (loadedData[parentLabel]?.[page]) {
      return loadedData[parentLabel][page];
    }

    return new Promise((resolve) => {
      fetch("/TreeViewContent.json")
        .then((response) => response.json())
        .then((data) => {
          const parentNode = findNodeByLabel(data, parentLabel);
          if (!parentNode || !parentNode.children) {
            resolve({ items: [], totalPages: 1 });
            return;
          }

          const PAGE_SIZE = 20;
          const totalChildren = parentNode.children.length;
          const totalPages = Math.ceil(totalChildren / PAGE_SIZE);
          const startIdx = (page - 1) * PAGE_SIZE;
          const endIdx = startIdx + PAGE_SIZE;
          const paginatedChildren = parentNode.children.slice(startIdx, endIdx);

          setLoadedData((prev) => ({
            ...prev,
            [parentLabel]: {
              ...prev[parentLabel],
              [page]: { items: paginatedChildren, totalPages },
            },
          }));

          resolve({ items: paginatedChildren, totalPages });
        })
        .catch((error) => {
          resolve({ items: [], totalPages: 1 });
        });
    });
  };

  const findNodeByLabel = (data, label) => {
    for (let node of data) {
      if (node.label === label) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const foundNode = findNodeByLabel(node.children, label);
        if (foundNode) return foundNode;
      }
    }
    return null;
  };

  return (
    <div className="navbar_container">
      <input
        placeholder="Search for Name"
        className="navbarmain_page_input"
        value={elementSearch}
        onChange={(e) => setElementSearch(e.target.value)}
        onKeyDown={(event) => event.key === "Enter" && setShowModal(true)}
      />
      <hr className="navbar_hr" />
      
      <NavbarItem 
        item={{ label: "Root", children: [] }} 
        loadChildren={loadChildren} 
        expandedItems={expandedItems} 
        setExpandedItems={setExpandedItems} 
        subscribedNodes={subscribedNodes} 
        setSubscribedNodes={setSubscribedNodes} 
        level={0} 
        setSelectedNode={handleNodeSelection} 
        setSelectedChildren={setSelectedChildren} 
        searchTerm={elementSearch}
      />
      
      <StatusDisplay 
        selectedNode={selectedNode} 
        selectedChildren={selectedChildren} 
      />
      {showModal && (
        <SearchModal
          searchedElement={elementSearch}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Navbar;