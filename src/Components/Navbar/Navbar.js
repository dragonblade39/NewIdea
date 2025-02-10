import React, { useState, useEffect } from "react";
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
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchNode, setSelectedSearchNode] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/TreeViewContent.json")
      .then((response) => response.json())
      .then((data) => {
        setLoadedData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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

  const filterTreeItems = (items, searchTerm) => {
    if (!searchTerm || !Array.isArray(items)) return []; // Return empty if there is no search term or if items are not an array

    let filteredResults = [];

    items.forEach((item) => {
      // Check if the item itself is defined to prevent errors
      if (item && item.label && item.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        filteredResults.push(item); // If the item matches the search term
      }

      // Check if children exist and recursively filter
      if (item.children) {
        const filteredChildren = filterTreeItems(item.children, searchTerm);
        if (filteredChildren.length > 0) {
          filteredResults.push({
            ...item,
            children: filteredChildren, // Attach filtered children
          });
        }
      }
    });


    return filteredResults;
  };

  const filterItems = (items, searchTerm) => {
    if (!searchTerm) return items;

    return items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setElementSearch(value);
    handleSearch(value);
  };

  // Function to search through the loaded data
  const handleSearch = (term) => {
    const results = filterTreeItems(loadedData, term);
    setSearchResults(results);
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

  return (
    <div className="navbar_container">
    <input
      placeholder="Search for Name"
      className="navbarmain_page_input"
      value={elementSearch}
      onChange={handleInputChange}
    />
    {searchResults.length > 0 && (
      <div className="search-results">
        {searchResults.map((result) => (
          <div key={result.label} className="search-result-item">
            {result.label} {/* Customize how results are rendered */}
            {result.children && result.children.length > 0 && (
              <ul>
                {result.children.map((child) => (
                  <li key={child.label}>{child.label}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}
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
        searchTerm={elementSearch} // Pass the search term
        selectedSearchNode={selectedSearchNode} // Pass the selected search node
        setSelectedSearchNode={setSelectedSearchNode} // Pass function to set the selected search node
      />
      <StatusDisplay
        selectedNode={selectedNode}
        selectedChildren={selectedChildren}
      />
    </div>
  );
};

export default Navbar;
