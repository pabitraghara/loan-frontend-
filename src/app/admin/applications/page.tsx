"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { adminApi, AdminApiError, ApplicationList } from "@/lib/admin-api";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import {
  Card,
  ErrorNote,
  FlagPills,
  STATUS_LABELS,
  StatusBadge,
  fmtDate,
  fmtMoney,
} from "@/components/admin/ui";

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

function ApplicationsInner() {
  const { user } = useAdminAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [data, setData] = useState<ApplicationList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") ?? "");

  const status = params.get("status") ?? "";
  const flagged = params.get("flagged") ?? "";
  const page = Number(params.get("page") ?? 1);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .applications({
        status: status || undefined,
        flagged: flagged || undefined,
        search: params.get("search") ?? undefined,
        page,
        pageSize: 25,
      })
      .then(setData)
      .catch((e: AdminApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status, flagged, page, params]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.push(`/admin/applications?${next.toString()}`);
  };

  if (!user) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">
            Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${data.total} total` : "Loading..."}
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam("search", search.trim());
            }}
            className="flex flex-1 items-end gap-2"
          >
            <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
              <label
                htmlFor="search"
                className="text-xs font-medium text-slate-600"
              >
                Search
              </label>
              <input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Reference, email, last name, phone, or SSN last 4"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="status"
              className="text-xs font-medium text-slate-600"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setParam("status", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={flagged === "true"}
              onChange={(e) =>
                setParam("flagged", e.target.checked ? "true" : "")
              }
              className="h-4 w-4 accent-brand-600"
            />
            Flagged only
          </label>

          {(status || flagged || params.get("search")) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                router.push("/admin/applications");
              }}
              className="pb-2 text-sm text-slate-500 underline hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </Card>

      {error && <ErrorNote message={error} />}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <th scope="col" className="px-4 py-3 font-semibold">
                Reference
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Applicant
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                State
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              {/* <th scope="col" className="px-4 py-3 font-semibold">
                Step
              </th> */}
              {/* <th scope="col" className="px-4 py-3 font-semibold">Flags</th> */}
              <th scope="col" className="px-4 py-3 font-semibold">
                IP address
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  No applications match these filters.
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((a) => (
                <tr key={a.applicationId} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/applications/${a.applicationId}`}
                      className="font-mono text-xs font-semibold text-brand-700 hover:underline"
                    >
                      {a.applicationId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {a.name || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{a.email}</p>
                    {/* Last 4 only in the list. A full value needs a logged reveal. */}
                    <p className="text-xs text-slate-400">
                      SSN ****{a.ssnLast4 ?? "----"} &middot; Acct ****
                      {a.accountLast4 ?? "----"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{a.state}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                    {fmtMoney(a.loanAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  {/* <td className="px-4 py-3 text-xs text-slate-600">
                    {a.highestStepReached} of 3
                    {a.dripStage > 0 && (
                      <span className="ml-1 text-amber-700">
                        (drip d{a.dripStage})
                      </span>
                    )}
                  </td> */}
                  {/* <td className="px-4 py-3">
                    <FlagPills flags={a.reviewFlags} />
                  </td> */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {a.ipAddress ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {fmtDate(a.step1SubmittedAt ?? a.createdAt)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => setParam("page", String(data.page - 1))}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={data.page >= data.totalPages}
              onClick={() => setParam("page", String(data.page + 1))}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
      <ApplicationsInner />
    </Suspense>
  );
}
