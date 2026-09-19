import React from "react";

const SearchFilterBar = ({
  searchValue = "",
  onSearchChange,
  filterValue = "",
  onFilterChange,
  searchPlaceholder = "Search...",
  filterOptions = [],
}) => {
  return (
    <div className="search-filter-bar">
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
      />

      <select
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
      >
        <option value="">All</option>

        {filterOptions.map((option) => {
          const value =
            typeof option === "string"
              ? option
              : option.value;

          const label =
            typeof option === "string"
              ? option
              : option.label;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SearchFilterBar;