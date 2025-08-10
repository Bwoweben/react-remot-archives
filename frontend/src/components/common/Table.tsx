import React from 'react';
import './Table.css';

// Define the shape of our columns
interface Column<T> {
  Header: string;
  accessor: (row: T) => React.ReactNode; // Can render strings, numbers, or JSX
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

function Table<T extends { id: any }>({ columns, data }: TableProps<T>) {
  return (
    <div className="table-wrapper">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.Header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={row.id}>
                {columns.map((column, index) => (
                  <td key={index}>{column.accessor(row)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-data-cell">
                No matching clients found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
