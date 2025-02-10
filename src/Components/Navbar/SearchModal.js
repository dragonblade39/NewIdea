import React, { useState, useEffect } from "react";
import "./SearchModal.css";

const SearchModal = ({ searchedElement = "", onClose }) => {
  const [searchQuery, setSearchQuery] = useState(searchedElement);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/TreeViewContent.json")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((fetchedData) => {
        setData(fetchedData);
        setFilteredData(fetchedData);
      })
      .catch((error) => console.error("Error fetching the data:", error));
  }, []);

  useEffect(() => {
    const results = searchAllNodes(data, searchQuery.trim().toLowerCase());
    setFilteredData(results);
    setCurrentPage(1);
  }, [searchQuery, data]);

  const searchAllNodes = (nodes, query) => {
    let result = [];
    nodes.forEach((node) => {
      if (node.label.toLowerCase().includes(query)) {
        result.push(node);
      }
      if (node.children) {
        result = result.concat(searchAllNodes(node.children, query));
      }
    });
    return result;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageSearch = (event) => {
    if (event.key === "Enter") {
      setSearchQuery(searchQuery);
    }
  };

  return (
    <div className="searchmodal_overlay">
      <div className="searchmodal_container">
        <input
          type="text"
          className="searchmodal_search"
          placeholder="Search children..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handlePageSearch}
        />

        <ul className="searchmodal_content">
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => {
              const itemIndex = startIndex + index + 1;
              const pageNumber = Math.ceil(itemIndex / itemsPerPage);
              return (
                <li key={itemIndex}>
                  {item.label} (Page {pageNumber})
                </li>
              );
            })
          ) : (
            <li>No matches found</li>
          )}
        </ul>
        <div className="searchmodal_footer">
          <button className="searchmodal_close_btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
