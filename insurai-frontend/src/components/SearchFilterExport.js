import { useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SearchFilterExport({ data = [], columns = [], onExport }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Mock data if none provided
    const defaultData = [
        {
            id: 1,
            name: 'Arjun Patel',
            policyType: 'Health Insurance',
            premium: 5000,
            status: 'ACTIVE',
            riskLevel: 'LOW',
            date: '2026-01-15',
            agent: 'Agent Rahul'
        },
        {
            id: 2,
            name: 'Priya Sharma',
            policyType: 'Life Insurance',
            premium: 12000,
            status: 'PENDING',
            riskLevel: 'MEDIUM',
            date: '2026-01-20',
            agent: 'Agent Sneha'
        },
        {
            id: 3,
            name: 'Suresh Kumar',
            policyType: 'Vehicle Insurance',
            premium: 8000,
            status: 'ACTIVE',
            riskLevel: 'HIGH',
            date: '2026-02-01',
            agent: 'Agent Amit'
        },
        {
            id: 4,
            name: 'Anjali Mehta',
            policyType: 'Health Insurance',
            premium: 6500,
            status: 'EXPIRED',
            riskLevel: 'LOW',
            date: '2025-12-10',
            agent: 'Agent Priya'
        }
    ];

    const defaultColumns = [
        { key: 'name', label: 'Name', sortable: true, filterable: false },
        { key: 'policyType', label: 'Policy Type', sortable: true, filterable: true },
        { key: 'premium', label: 'Premium', sortable: true, filterable: false },
        { key: 'status', label: 'Status', sortable: true, filterable: true },
        { key: 'riskLevel', label: 'Risk Level', sortable: true, filterable: true },
        { key: 'date', label: 'Date', sortable: true, filterable: false },
        { key: 'agent', label: 'Agent', sortable: true, filterable: true }
    ];

    const dataToUse = data.length > 0 ? data : defaultData;
    const columnsToUse = columns.length > 0 ? columns : defaultColumns;

    // Get unique values for filterable columns
    const getFilterOptions = (columnKey) => {
        const values = dataToUse.map(item => item[columnKey]);
        return [...new Set(values)].filter(Boolean);
    };

    // Apply filters and search
    const getFilteredData = () => {
        let filtered = [...dataToUse];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Column filters
        Object.keys(filters).forEach(key => {
            if (filters[key] && filters[key] !== 'all') {
                filtered = filtered.filter(item => item[key] === filters[key]);
            }
        });

        // Date range filter
        if (dateRange.start) {
            filtered = filtered.filter(item =>
                new Date(item.date) >= new Date(dateRange.start)
            );
        }
        if (dateRange.end) {
            filtered = filtered.filter(item =>
                new Date(item.date) <= new Date(dateRange.end)
            );
        }

        // Sorting
        if (sortBy) {
            filtered.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];

                if (typeof aVal === 'number') {
                    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const comparison = String(aVal).localeCompare(String(bVal));
                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }

        return filtered;
    };

    const handleSort = (columnKey) => {
        if (sortBy === columnKey) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(columnKey);
            setSortOrder('asc');
        }
    };

    const handleExportCSV = () => {
        const filtered = getFilteredData();

        // Create CSV content
        const headers = columnsToUse.map(col => col.label).join(',');
        const rows = filtered.map(item =>
            columnsToUse.map(col => {
                const value = item[col.key];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        );

        const csv = [headers, ...rows].join('\n');

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        if (onExport) onExport('csv', filtered);
    };

    const handleExportPDF = () => {
        const filtered = getFilteredData();
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Data Export", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);

        // Prepare table data
        const tableColumn = columnsToUse.map(col => col.label);
        const tableRows = filtered.map(item => {
            return columnsToUse.map(col => {
                const val = item[col.key];
                if (col.key === 'premium') return `₹${val.toLocaleString()}`;
                return val;
            });
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [99, 102, 241] } // Matches #6366f1
        });

        doc.save(`export_${new Date().toISOString().split('T')[0]}.pdf`);

        if (onExport) onExport('pdf', filtered);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilters({});
        setDateRange({ start: '', end: '' });
        setSortBy('');
        setSortOrder('asc');
    };

    const filteredData = getFilteredData();

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return '#10b981';
            case 'PENDING': return '#f59e0b';
            case 'EXPIRED': return '#6b7280';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            case 'LOW': return '#10b981';
            default: return '#6b7280';
        }
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '25px 30px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>
                    🔍 Advanced Search & Export
                </h3>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
                    Filter, sort, and export your data
                </p>
            </div>

            <div style={{ padding: 30 }}>
                {/* Search Bar */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="🔍 Search across all fields..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '2px solid rgba(255,255,255,0.1)',
                                borderRadius: 12,
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#6366f1';
                                e.target.style.background = 'rgba(255,255,255,0.08)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.target.style.background = 'rgba(255,255,255,0.05)';
                            }}
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                    marginBottom: 20
                }}>
                    {/* Column Filters */}
                    {columnsToUse.filter(col => col.filterable).map(column => (
                        <div key={column.key}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginBottom: 6,
                                textTransform: 'uppercase',
                                fontWeight: 600
                            }}>
                                {column.label}
                            </label>
                            <select
                                value={filters[column.key] || 'all'}
                                onChange={(e) => setFilters({ ...filters, [column.key]: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8,
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All</option>
                                {getFilterOptions(column.key).map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    ))}

                    {/* Date Range */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginBottom: 6,
                            textTransform: 'uppercase',
                            fontWeight: 600
                        }}>
                            Date From
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                color: 'var(--text-main)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginBottom: 6,
                            textTransform: 'uppercase',
                            fontWeight: 600
                        }}>
                            Date To
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                color: 'var(--text-main)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    paddingBottom: 20,
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={handleExportCSV}
                            className="primary-btn"
                            style={{ background: '#10b981' }}
                        >
                            📊 Export CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="primary-btn"
                            style={{ background: '#ef4444' }}
                        >
                            📄 Export PDF
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {filteredData.length} of {dataToUse.length} results
                        </span>
                        <button
                            onClick={clearFilters}
                            className="primary-btn"
                            style={{ background: '#6b7280' }}
                        >
                            🔄 Clear Filters
                        </button>
                    </div>
                </div>

                {/* Results Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                {columnsToUse.map(column => (
                                    <th
                                        key={column.key}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                        style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase',
                                            cursor: column.sortable ? 'pointer' : 'default',
                                            userSelect: 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {column.label}
                                            {column.sortable && sortBy === column.key && (
                                                <span style={{ fontSize: '0.9rem' }}>
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columnsToUse.length}
                                        style={{
                                            padding: 60,
                                            textAlign: 'center',
                                            color: 'var(--text-muted)'
                                        }}
                                    >
                                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
                                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                                            No results found
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                            Try adjusting your filters or search query
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, idx) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {columnsToUse.map(column => (
                                            <td
                                                key={column.key}
                                                style={{
                                                    padding: '16px',
                                                    fontSize: '0.9rem',
                                                    color: 'var(--text-main)'
                                                }}
                                            >
                                                {column.key === 'status' ? (
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        background: `${getStatusColor(item[column.key])}20`,
                                                        border: `1px solid ${getStatusColor(item[column.key])}40`,
                                                        borderRadius: 12,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: getStatusColor(item[column.key])
                                                    }}>
                                                        {item[column.key]}
                                                    </span>
                                                ) : column.key === 'riskLevel' ? (
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        background: `${getRiskColor(item[column.key])}20`,
                                                        border: `1px solid ${getRiskColor(item[column.key])}40`,
                                                        borderRadius: 12,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: getRiskColor(item[column.key])
                                                    }}>
                                                        {item[column.key]}
                                                    </span>
                                                ) : column.key === 'premium' ? (
                                                    <span style={{ fontWeight: 600, color: '#8b5cf6' }}>
                                                        ₹{item[column.key].toLocaleString()}
                                                    </span>
                                                ) : (
                                                    item[column.key]
                                                )}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
