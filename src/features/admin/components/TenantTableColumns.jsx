import React from "react";
import { Building2, Check, Edit3, Mail, Phone, Power, Trash2, X } from "lucide-react";
import { Badge } from "@/components/common/Badge.jsx";
import { Button } from "@/components/common/Button.jsx";
import { formatCurrency, formatDate, formatFloor, getInitials } from "@/utils/helpers.js";

export function createTenantColumns({
  actionId,
  setApprovalTarget,
  setApprovalUnitId,
  handleReject,
  openEditModal,
  handleToggleActive,
  setDeleteTarget,
}) {
  return [
    {
      key: "resident",
      header: "Resident Dossier",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar?.url ? (
            <img
              src={row.avatar.url}
              alt={row.fullName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-[#C59B27]/40"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#141413] text-xs font-bold text-[#D4AF37]">
              {getInitials(row.fullName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#141413] dark:text-[#F5F0E6]">
              {row.fullName || "Unnamed resident"}
            </p>
            <p className="text-xs text-[#7A7267] dark:text-[#9A9488]">
              NID: {row.nationalId || "Not provided"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Credentials",
      render: (row) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-[#141413] dark:text-[#F5F0E6]">
            <Mail className="h-3.5 w-3.5 shrink-0 text-[#C59B27]" />
            <span className="truncate">{row.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#7A7267] dark:text-[#9A9488]">
            <Phone className="h-3.5 w-3.5 shrink-0 text-[#C59B27]" />
            <span>{row.phone || "No mobile"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "unit",
      header: "Assigned Suite",
      render: (row) =>
        row.assignedUnit ? (
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DEC9] bg-[#F6F2E9] px-3 py-1 text-xs font-bold text-[#141413] dark:border-[#2A3246] dark:bg-[#1C2230] dark:text-[#D4AF37]">
              <Building2 className="h-3.5 w-3.5 text-[#C59B27]" />
              {row.assignedUnit.unitNumber}
            </span>
            <p className="mt-1 text-xs text-[#7A7267]">
              {formatFloor(
                row.assignedUnit.floor,
                row.assignedUnit.unitNumber
              )}{" "}
              · {formatCurrency(row.assignedUnit.rentAmount)}/mo
            </p>
          </div>
        ) : (
          <Badge status="unverified">Unassigned</Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex flex-col items-start gap-1.5">
          <Badge status={row.approvalStatus || "pending"} />
          <Badge tone={row.isActive ? "emerald" : "danger"}>
            {row.isActive ? "Active" : "Suspended"}
          </Badge>
        </div>
      ),
    },
    {
      key: "joined",
      header: "Lease Start",
      render: (row) => (
        <span className="text-xs text-[#6E675F] dark:text-[#9A9488]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Manage",
      align: "right",
      render: (row) => (
        <div className="flex flex-wrap items-center justify-end gap-1">
          {row.approvalStatus === "pending" && (
            <>
              <Button
                variant="emerald"
                size="xs"
                leftIcon={Check}
                isLoading={actionId === row._id}
                onClick={() => {
                  setApprovalTarget(row);
                  setApprovalUnitId("");
                }}
              >
                Approve
              </Button>
              <Button
                variant="dangerOutline"
                size="xs"
                leftIcon={X}
                isLoading={actionId === row._id}
                onClick={() => handleReject(row)}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            size="xs"
            leftIcon={Edit3}
            onClick={() => openEditModal(row)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleToggleActive(row)}
            isLoading={actionId === row._id}
            title={row.isActive ? "Suspend resident" : "Activate resident"}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleteTarget(row)}
            title="Delete resident"
            className="text-rose-600 hover:text-rose-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
