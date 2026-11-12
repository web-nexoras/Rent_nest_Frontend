import React, { useEffect, useState } from "react";
import {
  Download,
  FileCheck2,
  HeartHandshake,
  ImageUp,
  Printer,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { getTenantDashboard } from "@/features/tenants/api/dashboardApi.js";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useToast } from "@/components/feedback/ToastContext.jsx";
import { PageHeader, Card, Skeleton } from "@/components/common/Layout.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { Logo } from "@/components/layout/Logo.jsx";
import { formatCurrency, formatDate, formatFloor, getErrorMessage } from "@/utils/helpers.js";

// Official Tenancy Lease Agreement & Rules Dossier with 1-Click PDF Download
export default function TenantAgreement() {
  const { user } = useAuth();
  const toast = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState(true);
  const [signatureData, setSignatureData] = useState("");
  const [signatureFileName, setSignatureFileName] = useState("");
  const [signatureError, setSignatureError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getTenantDashboard();
        if (active) setDashboard(res);
      } catch (err) {
        if (active) {
          toast.error(getErrorMessage(err, "Failed to load tenancy dossier"));
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setSignatureError("Choose a PNG, JPG, or WEBP signature image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSignatureError("Signature image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSignatureData(String(reader.result || ""));
      setSignatureFileName(file.name);
      setSignatureError("");
    };
    reader.onerror = () => setSignatureError("Could not read that image. Please choose another file.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-[640px] w-full" />
      </div>
    );
  }

  const unit = dashboard?.unit || user?.assignedUnit || null;
  const agreementRef = `RN-LEASE-${(user?._id || "2026").slice(-6).toUpperCase()}`;

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="Tenancy Lease Agreement & Building Rules"
          description="Official residential lease covenant, damage liability policy, and downloadable PDF dossier."
          badge={<Badge tone="brand">Active Covenant</Badge>}
          actions={
            <>
              <button
                type="button"
                className="inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#E5DEC9] bg-white px-4 py-2 text-center text-sm font-semibold leading-snug text-[#141413] hover:bg-[#F6F2E9] sm:w-auto dark:border-[#252C3D] dark:bg-[#131722] dark:text-[#F5F0E6]"
                onClick={handleDownloadPdf}
              >
                <Printer className="h-4 w-4 shrink-0" />
                Print Agreement
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-center text-sm font-semibold leading-snug text-[#141413] hover:bg-[#C59B27] sm:w-auto"
                onClick={handleDownloadPdf}
              >
                <Download className="h-4 w-4 shrink-0" />
                Download Official PDF
              </button>
            </>
          }
        />
      </div>

      {/* Printable Official Legal Document Container */}
      <div
        id="agreement-print"
        className="surface-card mx-auto max-w-4xl overflow-hidden border border-[#E5DEC9] bg-white p-5 shadow-md dark:border-[#34302A] dark:bg-[#131722] sm:p-8 lg:p-10"
      >
        {/* Top Royal Crest Letterhead */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-[#D8CCB8] pb-5 dark:border-[#34302A] sm:flex-row">
          <Logo to="/tenant/dashboard" />
          <div className="text-center sm:text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F2E9] dark:bg-[#1C2230] px-3 py-1 text-xs font-bold text-[#9A7418] dark:text-[#D4AF37] border border-[#E5DEC9] dark:border-[#2A3246]">
              <FileCheck2 className="h-3.5 w-3.5" />
              Ref: {agreementRef}
            </span>
            <p className="mt-1.5 text-xs text-[#6E675F] dark:text-[#9A9488]">
              Issued Date: {formatDate(user?.createdAt || new Date())}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9A7418] dark:text-[#D4AF37]">
              Tower Vault · 12-Floor Luxury Residence
            </p>
          </div>
        </div>

        {/* Document Title Banner */}
        <div className="my-5 border-y border-[#E5DEC9] px-2 py-5 text-center dark:border-[#34302A] sm:my-6 sm:px-6 sm:py-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6]">
            RESIDENTIAL TENANCY AGREEMENT & HOUSE RULES
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6E675F] dark:text-[#9A9488]">
            Governing the occupancy, fixed rent schedule, maintenance coverage, and property care standards
          </p>
        </div>

        {/* Section 1: Parties & Assigned Suite Dossier */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
          <div className="rounded-2xl border border-[#EAE1D0] dark:border-[#242B3D] bg-[#FAF7F2]/50 dark:bg-[#0E1117]/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9A7418] dark:text-[#D4AF37]">
              1. Resident / Lessee Details
            </p>
            <dl className="mt-3 space-y-2.5 text-xs sm:text-[13px]">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                <dt className="text-[#7A7267]">Full Legal Name:</dt>
                <dd className="min-w-0 break-words font-bold text-[#141413] dark:text-[#F5F0E6] sm:max-w-[60%] sm:text-right">
                  {user?.fullName || "Registered Resident"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                <dt className="text-[#7A7267]">Email Address:</dt>
                <dd className="min-w-0 break-all font-medium text-[#141413] dark:text-[#F5F0E6] sm:max-w-[60%] sm:text-right">
                  {user?.email || "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                <dt className="text-[#7A7267]">Mobile Number:</dt>
                <dd className="min-w-0 break-words font-medium text-[#141413] dark:text-[#F5F0E6] sm:max-w-[60%] sm:text-right">
                  {user?.phone || "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                <dt className="text-[#7A7267]">National ID / Passport:</dt>
                <dd className="min-w-0 break-words font-medium text-[#141413] dark:text-[#F5F0E6] sm:max-w-[60%] sm:text-right">
                  {user?.nationalId || "Verified on File"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#EAE1D0] dark:border-[#242B3D] bg-[#FAF7F2]/50 dark:bg-[#0E1117]/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9A7418] dark:text-[#D4AF37]">
              2. Assigned Suite & Rent Schedule
            </p>
            <dl className="mt-3 space-y-2.5 text-xs sm:text-[13px]">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                <dt className="text-[#7A7267]">Suite / Flat Number:</dt>
                <dd className="min-w-0 break-words font-bold text-[#141413] dark:text-[#D4AF37] sm:max-w-[60%] sm:text-right">
                  {unit
                    ? `Suite ${unit.unitNumber} · ${formatFloor(unit.floor, unit.unitNumber)}`
                    : "Pending Assignment"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                <dt className="text-[#7A7267]">Configuration & Size:</dt>
                <dd className="min-w-0 break-words font-medium text-[#141413] dark:text-[#F5F0E6] sm:max-w-[60%] sm:text-right">
                  {unit
                    ? `${unit.bedrooms} Bed · ${unit.sizeSqft} Sq.Ft`
                    : "Standard 3BHK Residence"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                <dt className="text-[#7A7267]">Locked Monthly Rent:</dt>
                <dd className="min-w-0 break-words font-bold text-[#8F6B14] dark:text-[#D4AF37] sm:max-w-[60%] sm:text-right">
                  {unit ? `${formatCurrency(unit.rentAmount)} / Month` : "As per Suite Rate"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3">
                <dt className="text-[#7A7267]">Due Window & Overdue Cutoff:</dt>
                <dd className="min-w-0 break-words font-semibold text-[#141413] dark:text-[#F5F0E6] sm:max-w-[60%] sm:text-right">
                  1st–10th Due · Overdue after 10th
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Highlight Comparison: Natural Wear & Tear (FREE) vs Intentional Damage (FEE) */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#E5DEC9] bg-[#FCFAF5] p-4 dark:border-[#34302A] dark:bg-[#171B25] sm:p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F2ECE1] text-[#8F6B14] dark:bg-[#242B3D] dark:text-[#D4AF37]">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[#29251E] dark:text-[#F5F0E6]">
                  Natural Wear &amp; Tear — Zero Fee (0 BDT)
                </h3>
                <p className="text-[11px] font-medium text-[#7A7267] dark:text-[#9A9488]">
                  100% Covered by Building Management
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#5C5549] dark:text-[#C8C2B8]">
              If any fixture, internal water line, electrical switchboard, structural wall paint, or
              common utility experiences <strong>normal aging, natural wear and tear, or unintentional
              technical fault</strong>, the Resident shall <strong>NOT pay any extra repair fee</strong>.
              Simply submit a ticket under the <em>Maintenance</em> menu for complimentary servicing.
            </p>
          </div>

          <div className="rounded-xl border border-[#E5DEC9] bg-[#FCFAF5] p-4 dark:border-[#34302A] dark:bg-[#171B25] sm:p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F2ECE1] text-[#8F6B14] dark:bg-[#242B3D] dark:text-[#D4AF37]">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-[#29251E] dark:text-[#F5F0E6]">
                  Intentional or Negligent Damage — Fee Applies
                </h3>
                <p className="text-[11px] font-medium text-[#7A7267] dark:text-[#9A9488]">
                  Full Restoration / Compensation Liability
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#5C5549] dark:text-[#C8C2B8]">
              If the Resident, family member, domestic staff, or visitor <strong>intentionally,
              recklessly, or negligently damages</strong> any apartment property (glass windows, doors,
              locks, sanitary ware, marble/tiles, cabinetry, or elevator/lobby fixtures), the Resident
              must pay the <strong>full assessed repair or replacement fee</strong>.
            </p>
          </div>
        </div>

        {/* Detailed Legal Articles & Building Regulations */}
        <div className="space-y-4 text-[13px] leading-6 text-[#2C2925] dark:text-[#D5CFC4]">
          <h3 className="font-display text-lg font-bold text-[#141413] dark:text-[#F5F0E6] flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#C59B27]" />
            Terms, Rules &amp; Regulations of Tenancy
          </h3>

          <div className="space-y-3 rounded-2xl border border-[#EAE1D0] dark:border-[#242B3D] p-5">
            <div>
              <p className="font-bold text-[#141413] dark:text-[#D4AF37]">
                Article 1 — Fixed Monthly Rent &amp; 10th-of-Month Cutoff Policy
              </p>
              <p className="mt-1 text-[#5C5549] dark:text-[#B8B2A6]">
                The monthly rent is fixed according to the assigned suite rate and cannot be altered
                during checkout. Rent becomes payable on the <strong>1st day of each calendar month</strong>{" "}
                and must be settled on or before the <strong>10th day of the month</strong> via
                SSLCommerz online gateway or approved bank/mobile transfer. Unpaid balances after the
                10th are automatically flagged as <strong>Overdue</strong>.
              </p>
            </div>

            <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-3">
              <p className="font-bold text-[#141413] dark:text-[#D4AF37]">
                Article 2 — Property Care, Alterations &amp; Damage Assessment
              </p>
              <p className="mt-1 text-[#5C5549] dark:text-[#B8B2A6]">
                Residents shall keep the apartment interior clean and sanitary. Structural drilling,
                wall removal, or permanent electrical rewiring without prior written approval from Admin
                is strictly prohibited. While routine wear and tear carries <strong>zero fee</strong>,
                any deliberate breakage or misuse-induced damage inspected by the Building Engineer will
                be billed on the next monthly statement or deducted from the security deposit.
              </p>
            </div>

            <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-3">
              <p className="font-bold text-[#141413] dark:text-[#D4AF37]">
                Article 3 — Subletting &amp; Guest Security Protocol
              </p>
              <p className="mt-1 text-[#5C5549] dark:text-[#B8B2A6]">
                Subletting, commercial Airbnb/short-term leasing, or transferring occupancy to any
                unregistered third party is strictly forbidden. Overnight guests staying beyond 7
                consecutive days must be notified to the Tower Vault Security Desk.
              </p>
            </div>

            <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-3">
              <p className="font-bold text-[#141413] dark:text-[#D4AF37]">
                Article 4 — Quiet Hours, Common Areas &amp; Fire Safety
              </p>
              <p className="mt-1 text-[#5C5549] dark:text-[#B8B2A6]">
                Quiet hours are observed from <strong>10:30 PM to 7:00 AM</strong>. Corridors, fire
                stairwells, and lobbies must remain clear of personal footwear racks, bicycles, or
                hazardous materials at all times.
              </p>
            </div>

            <div className="border-t border-[#EFE9DC] dark:border-[#1E2433] pt-3">
              <p className="font-bold text-[#141413] dark:text-[#D4AF37]">
                Article 5 — Notice of Termination &amp; Move-Out Inspection
              </p>
              <p className="mt-1 text-[#5C5549] dark:text-[#B8B2A6]">
                Either party may terminate the tenancy by providing a minimum of{" "}
                <strong>60 (sixty) days prior written notice</strong>. Upon vacating, a joint unit
                inspection will be conducted to verify that all fixtures are intact (excluding natural
                wear and tear) before releasing the security deposit.
              </p>
            </div>
          </div>
        </div>

        {/* Resident signature upload and print-ready signature area */}
        <div className="no-print mt-8 rounded-xl border border-[#E5DEC9] bg-[#FCFAF5] p-4 dark:border-[#34302A] dark:bg-[#171B25] sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#29251E] dark:text-[#F5F0E6]">Add your signature</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#7A7267] dark:text-[#9A9488]">
              Upload a clear image of your handwritten signature. It will appear on the agreement when you print or save it as PDF. The image stays in this browser and is not sent to the server.
            </p>
            {signatureFileName && <p className="mt-1 truncate text-[11px] text-[#8F6B14] dark:text-[#D4AF37]">Selected: {signatureFileName}</p>}
            {signatureError && <p role="alert" className="mt-1 text-xs text-[#8F6B14] dark:text-[#D4AF37]">{signatureError}</p>}
          </div>
          <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2 sm:mt-0">
            <label htmlFor="tenant-signature-upload" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#141413] transition hover:bg-[#C59B27]">
              <ImageUp className="h-4 w-4" />
              {signatureData ? "Replace signature" : "Upload signature"}
            </label>
            <input
              id="tenant-signature-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleSignatureUpload}
              className="sr-only"
            />
            {signatureData && (
              <button type="button" onClick={() => { setSignatureData(""); setSignatureFileName(""); }} className="min-h-10 rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs font-medium text-[#5C5549] hover:bg-white dark:border-[#3A3427] dark:text-[#C8C2B8] dark:hover:bg-[#0E1117]">
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-7 border-t border-[#E5DEC9] pt-6 dark:border-[#34302A] sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C8479]">Resident signature</p>
            <div className="mt-2 flex h-16 items-end border-b border-[#BDB29E] pb-1">
              {signatureData && <img src={signatureData} alt="Uploaded tenant signature" className="max-h-14 max-w-full object-contain object-left-bottom" />}
            </div>
            <p className="mt-2 text-xs font-semibold text-[#29251E] dark:text-[#F5F0E6]">{user?.fullName || "Resident / Lessee"}</p>
            <p className="mt-1 text-[11px] text-[#7A7267] dark:text-[#9A9488]">Date: __________________</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C8479]">For Rent Nest Luxury Estates</p>
            <div className="mt-2 h-16 border-b border-[#BDB29E]" />
            <p className="mt-2 text-xs font-semibold text-[#29251E] dark:text-[#F5F0E6]">Authorized representative</p>
            <p className="mt-1 text-[11px] text-[#7A7267] dark:text-[#9A9488]">Date: __________________</p>
          </div>
        </div>

        {/* Digital Verification Seal Footer */}
        <div className="mt-8 border-t-2 border-[#E5DEC9] dark:border-[#252C3D] pt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C8479]">
                Lessor / Building Authority
              </p>
              <p className="mt-1 font-display text-lg font-bold text-[#141413] dark:text-[#D4AF37]">
                Rent Nest Luxury Estates
              </p>
              <p className="text-xs text-[#6E675F] dark:text-[#9A9488]">
                Digitally Sealed by Tower Vault Administration
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#C59B27]/50 bg-[#FBF7EA] dark:bg-[#1C2230] px-4 py-3">
              <ShieldCheck className="h-7 w-7 text-[#C59B27] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#141413] dark:text-[#F5F0E6]">
                  Verified Digital Lease Covenant
                </p>
                <p className="text-[11px] text-[#7A7267] dark:text-[#9A9488]">
                  Resident: {user?.fullName} · {agreementRef}
                </p>
              </div>
            </div>
          </div>

          <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-[#FAF7F2] dark:bg-[#0E1117] p-4 border border-[#EAE1D0] dark:border-[#1E2433]">
            <label className="flex items-center gap-2.5 text-xs font-medium text-[#141413] dark:text-[#F5F0E6] cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="h-4 w-4 rounded border-[#C59B27] text-[#141413] focus:ring-[#C59B27]"
              />
              <span>
                I have read and acknowledged the Rent Nest Tenancy Rules &amp; Damage Liability Policy.
              </span>
            </label>
            <button
              type="button"
              className="inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2 text-center text-sm font-semibold leading-snug text-[#141413] hover:bg-[#C59B27] sm:w-auto"
              onClick={handleDownloadPdf}
            >
              <Download className="h-4 w-4 shrink-0" />
              Download Agreement (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
