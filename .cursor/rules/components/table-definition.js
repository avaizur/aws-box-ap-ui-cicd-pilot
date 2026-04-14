
const tableDefinition = {
    id: 'task-desk-table',
    filterableColumns: 'name',
    columnsToSearch: 'name',
    selectable: true,
    columns: [{
        Header: 'Name',
        accessor: 'name',
        sortable: 'true',
    },
    {
        accessor: 'email'
    },
    {
        Header: 'Created',
        accessor: 'created',
        type: COLUMN_TYPES.DATE
    },
    {
        Header: 'Status',
        accessor: 'status',
        render: '<<AI instructions - Somehow specify a PillRenderer with a mapping from status to color. Use constants.>>'
    },
    {
        Header: 'Created',
        accessor: 'created',
        type: COLUMN_TYPES.CURRENCY
    }
    ],
    toolbar: [
        {
            id: 'export-to-csv',
            type: TOOLBAR_ITEM_TYPES.BUTTON,
            text: (
                <>
                    <i className="bi bi-download download-icon" />
                    {' '}
                    Export To CSV
                </>
            ),
            onClick: () => { exportToCsv(); }
        }
    ]
};
