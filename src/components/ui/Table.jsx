// columns: [{ key, label, render?(row), className? }]
export default function Table({ columns, rows, rowKey = (r) => r._id, loading = false, emptyMessage = 'No records found.' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-800/70">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${c.className || ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading && rows.length === 0
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-5 py-4">
                      <div className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr key={rowKey(row)} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-5 py-4 align-middle text-slate-700 dark:text-slate-300 ${c.className || ''}`}>
                      {c.render ? c.render(row) : row[c.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
        {loading && rows.length === 0
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3 p-4" aria-hidden="true">
                <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))
          : rows.map((row) => (
              <article key={rowKey(row)} className="space-y-3 p-4">
                {columns.map((column, index) => (
                  <div key={column.key} className={`flex items-start justify-between gap-4 ${index === 0 ? 'border-b border-slate-100 pb-3 dark:border-slate-800' : ''}`}>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{column.label}</span>
                    <span className="min-w-0 text-right text-xs text-slate-800 dark:text-slate-200">{column.render ? column.render(row) : row[column.key] ?? '-'}</span>
                  </div>
                ))}
              </article>
            ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <span className="text-lg" aria-hidden="true">—</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Nothing to show yet</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
