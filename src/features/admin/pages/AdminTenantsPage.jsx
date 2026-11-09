import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Ban, CheckCircle2, MoreHorizontal, Power, Trash2, UserCheck, Users, XCircle } from "lucide-react";
import { PageHeader, Avatar } from "../../../components/ui/Layout.jsx";
import Button from "../../../components/ui/Button.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import Dropdown, { DropdownItem } from "../../../components/ui/Dropdown.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import { FilterTabs, SearchInput } from "../../../components/ui/Filters.jsx";
import { Select } from "../../../components/ui/Input.jsx";
import { EmptyState } from "../../../components/ui/States.jsx";
import { adminService } from "../../../services/dashboardService.js";
import { unitService } from "../../../services/unitService.js";
import { useApiMutation } from "../../../hooks/useApiMutation.js";
import { useDebounce } from "../../../hooks/useDebounce.js";
import { formatDate } from "../../../lib/utils.js";

const LIMIT = 10;
const TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function ApproveModal({ tenant, onClose }) {
  const [unitId, setUnitId] = useState("");

  // Only vacant units can be assigned (backend returns 409 for occupied ones).
  const units = useQuery({
    queryKey: ["units", "vacant-picker"],
    queryFn: () => unitService.list({ status: "vacant", limit: 50 }),
    enabled: Boolean(tenant),
  });

  useEffect(() => setUnitId(""), [tenant]);

  const approve = useApiMutation(
    () => adminService.updateApproval(tenant._id, { approvalStatus: "approved", unitId: unitId || undefined }),
    { invalidate: [["admin"], ["units"]], onSuccess: onClose },
  );

  return (
    <Modal
      open={Boolean(tenant)}
      onClose={onClose}
      title="Approve tenant"
      description={tenant ? `${tenant.name} · ${tenant.email}` : ""}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" loading={approve.isPending} onClick={() => approve.mutate()}>
            <CheckCircle2 className="h-4 w-4" /> {unitId ? "Approve & assign unit" : "Approve"}
          </Button>
        </>
      }
    >
      <Select
        label="Assign a unit (optional)"
        value={unitId}
        onChange={(event) => setUnitId(event.target.value)}
        hint={
          units.isLoading
            ? "Loading vacant units…"
            : "You can also assign a unit later from the Units page."
        }
      >
        <option value="">Don't assign a unit yet</option>
        {units.data?.units.map((unit) => (
          <option key={unit._id} value={unit._id}>
            Unit {unit.unitNumber}{unit.floor ? ` · Floor ${unit.floor}` : ""} — ৳{unit.rentAmount}/mo
          </option>
        ))}
      </Select>
      {units.isError && <p className="mt-2 text-xs text-red-500">Couldn't load vacant units.</p>}
    </Modal>
  );
}

export default function AdminTenantsPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const [approving, setApproving] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'reject' | 'remove' | 'toggle', tenant }

  useEffect(() => setPage(1), [status, debounced]);

  const query = useQuery({
    queryKey: ["admin", "tenants", { page, status, search: debounced }],
    queryFn: () =>
      adminService.getTenants({ page, limit: LIMIT, status: status || undefined, search: debounced || undefined }),
    placeholderData: keepPreviousData,
  });

  const done = () => setConfirm(null);
  const invalidate = [["admin"], ["units"]];
  const reject = useApiMutation((id) => adminService.updateApproval(id, { approvalStatus: "rejected" }), { invalidate, onSuccess: done });
  const remove = useApiMutation((id) => adminService.removeTenant(id), { invalidate, onSuccess: done });
  const toggle = useApiMutation((id) => adminService.toggleTenantActive(id), { invalidate, onSuccess: done });

  const columns = [
    {
      key: "name",
      header: "Tenant",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy-900">{row.name}</p>
            <p className="truncate text-xs text-navy-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Phone", hideOn: "md" },
    {
      key: "unit",
      header: "Unit",
      hideOn: "md",
      render: (row) => (row.assignedUnit ? `Unit ${row.assignedUnit.unitNumber}` : <span className="text-navy-300">Not assigned</span>),
    },
    { key: "approvalStatus", header: "Approval", render: (row) => <Badge status={row.approvalStatus} /> },
    {
      key: "isActive",
      header: "Account",
      hideOn: "lg",
      render: (row) => <Badge status={row.isActive ? "active" : "inactive"} />,
    },
    { key: "createdAt", header: "Joined", hideOn: "lg", render: (row) => formatDate(row.createdAt) },
    {
      key: "actions",
      header: "",
      className: "w-12 text-right",
      render: (row) => (
        <Dropdown
          trigger={() => (
            <Button variant="ghost" size="icon" aria-label={`Actions for ${row.name}`}>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          )}
        >
          {row.approvalStatus === "pending" && (
            <>
              <DropdownItem icon={UserCheck} onClick={() => setApproving(row)}>Approve</DropdownItem>
              <DropdownItem icon={XCircle} onClick={() => setConfirm({ type: "reject", tenant: row })}>Reject</DropdownItem>
            </>
          )}
          <DropdownItem icon={row.isActive ? Ban : Power} onClick={() => setConfirm({ type: "toggle", tenant: row })}>
            {row.isActive ? "Deactivate" : "Activate"}
          </DropdownItem>
          <DropdownItem icon={Trash2} danger onClick={() => setConfirm({ type: "remove", tenant: row })}>
            Remove tenant
          </DropdownItem>
        </Dropdown>
      ),
    },
  ];

  const confirmConfig = {
    reject: {
      title: "Reject this tenant?",
      message: `${confirm?.tenant.name} will be marked as rejected and won't be able to use tenant features.`,
      label: "Reject",
      run: () => reject.mutate(confirm.tenant._id),
      loading: reject.isPending,
    },
    remove: {
      title: "Remove this tenant?",
      message: `${confirm?.tenant.name}'s account will be permanently deleted${
        confirm?.tenant.assignedUnit ? " and their unit will become vacant" : ""
      }. This cannot be undone.`,
      label: "Remove tenant",
      run: () => remove.mutate(confirm.tenant._id),
      loading: remove.isPending,
    },
    toggle: {
      title: confirm?.tenant.isActive ? "Deactivate this account?" : "Activate this account?",
      message: confirm?.tenant.isActive
        ? `${confirm?.tenant.name} will be locked out until you reactivate the account.`
        : `${confirm?.tenant.name} will regain access to Rent Nest.`,
      label: confirm?.tenant.isActive ? "Deactivate" : "Activate",
      run: () => toggle.mutate(confirm.tenant._id),
      loading: toggle.isPending,
    },
  }[confirm?.type] || {};

  return (
    <>
      <PageHeader title="Tenants" description="Review registrations, approve tenants and manage accounts." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterTabs
          value={status}
          onChange={(value) => setParams(value ? { status: value } : {})}
          options={TABS}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or phone…" />
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.tenants}
        loading={query.isLoading}
        error={query.isError ? query.error : null}
        onRetry={query.refetch}
        empty={
          <EmptyState
            icon={Users}
            title={debounced || status ? "No tenants match these filters" : "No tenants yet"}
            description="Tenants appear here after they sign up and verify their email."
          />
        }
        footer={
          <Pagination
            page={page}
            total={query.data?.total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        }
      />

      <ApproveModal tenant={approving} onClose={() => setApproving(null)} />
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={done}
        onConfirm={confirmConfig.run}
        loading={confirmConfig.loading}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.label}
        variant={confirm?.type === "toggle" && !confirm.tenant.isActive ? "secondary" : "danger"}
      />
    </>
  );
}
