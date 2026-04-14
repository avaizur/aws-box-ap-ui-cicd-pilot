import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import DefaultCellRenderer from './renderers/DefaultCellRenderer';
import DateCellRenderer from './renderers/DateCellRenderer';
import CurrencyCellRenderer from './renderers/CurrencyCellRenderer';
import BooleanCellRenderer from './renderers/BooleanCellRenderer';
import SecondaryTextCellRenderer from './renderers/SecondaryTextCellRenderer';
import styles from './Table.module.scss';

const cellRenderers = {
  default: DefaultCellRenderer,
  date: DateCellRenderer,
  currency: CurrencyCellRenderer,
  boolean: BooleanCellRenderer,
  secondary: SecondaryTextCellRenderer,
};

export default function Table({ tableDefinition, data, setData, onSelectedRowsChange }) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(() => {
    return tableDefinition.columns.map((colDef) => {
      const CellRenderer = cellRenderers[colDef.type] || cellRenderers.default;
      
      return {
        id: colDef.key,
        accessorKey: colDef.key,
        header: ({ column }) => {
          const canSort = colDef.sortable === true;
          const sortDirection = column.getIsSorted();
          
          return (
            <div
              className={styles.headerContent}
              onClick={canSort ? column.getToggleSortingHandler() : undefined}
              style={{ cursor: canSort ? 'pointer' : 'default' }}
            >
              <span>{colDef.label}</span>
              {canSort && (
                <span className={styles.sortIcon}>
                  {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '⇅'}
                </span>
              )}
            </div>
          );
        },
        cell: ({ row }) => {
          if (colDef.render) {
            return colDef.render(row.original);
          }
          const value = row.original[colDef.key];
          return <CellRenderer value={value} row={row.original} />;
        },
        enableSorting: colDef.sortable === true,
      };
    });
  }, [tableDefinition.columns]);

  // Add action column if actions are defined
  const columnsWithActions = useMemo(() => {
    if (!tableDefinition.actions) return columns;
    
    return [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className={styles.actions}>
            {tableDefinition.actions.map((action, index) => {
              // If action has a render function, use it
              if (action.render) {
                return (
                  <div key={index}>
                    {action.render(row.original)}
                  </div>
                );
              }
              const label = action.label ?? '';//todo prob being removed
              // Fallback to default button rendering for backward compatibility
              const isDelete = action.label?.toLowerCase() === 'delete';
              const isEdit = action.label?.toLowerCase() === 'edit';
              return (
                <button
                  key={index}
                  className={`${styles.actionButton} ${isEdit ? styles.edit : ''} ${isDelete ? styles.delete : ''}`}
                  onClick={() => action.onClick?.(row.original)}
                  title={action.label}
                >
                  {isEdit ? <i className="bi bi-pencil-fill" aria-hidden="true" /> : isDelete ? <i className="bi bi-trash-fill" aria-hidden="true" /> : '⋯'}
                </button>
              );
            })}
          </div>
        ),
        enableSorting: false,
      },
    ];
  }, [columns, tableDefinition.actions]);

  // Add selection column if selectable
  const finalColumns = useMemo(() => {
    if (!tableDefinition.selectable) return columnsWithActions;
    
    return [
      {
        id: 'select',
        header: ({ table }) => (
          <div className={styles.checkboxCell}>
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className={styles.checkbox}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className={styles.checkboxCell}>
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className={styles.checkbox}
            />
          </div>
        ),
        enableSorting: false,
      },
      ...columnsWithActions,
    ];
  }, [columnsWithActions, tableDefinition.selectable]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: tableDefinition.pageSize || 25,
      },
    },
  });

  // Notify parent of selected rows
  useMemo(() => {
    if (onSelectedRowsChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onSelectedRowsChange(selectedRows);
    }
  }, [rowSelection, onSelectedRowsChange, table]);

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className={styles.header}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={finalColumns.length} className={styles.emptyCell}>
                No data available
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={styles.row}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.cell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {tableDefinition.pagination !== false && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <div className={styles.rowsPerPage}>
              <span>Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
              >
                {[10, 25, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <span>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                data.length
              )}{' '}
              of {data.length}
            </span>
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={styles.pageButton}
              title="Previous page"
            >
              ←
            </button>
            <span className={styles.pageInfo}>
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={styles.pageButton}
              title="Next page"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
