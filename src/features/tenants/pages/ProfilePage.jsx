import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  CreditCard,
  FileBadge2,
  Home,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import { PageHeader, Card } from "@/components/common/Layout.jsx";
import { Input, Textarea } from "@/components/common/Input.jsx";
import { Button } from "@/components/common/Button.jsx";
import { Badge } from "@/components/common/Badge.jsx";
import { profileSchema } from "@/utils/validation.js";
import { authApi } from "@/features/auth/authApi.js";
import { useAuth } from "@/hooks/useAuth.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatCurrency, formatDate, formatFloor, getInitials, toFormData } from "@/utils/index.js";

// Luxury Dossier Profile & Identity Hub with Interactive Click-to-Upload Avatar and Clean Input Design
export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      presentAddress: "",
      permanentAddress: "",
      nidNumber: "",
      occupation: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name || "",
      presentAddress: user.presentAddress || "",
      permanentAddress: user.permanentAddress || "",
      nidNumber: user.nidNumber || "",
      occupation: user.occupation || "",
    });
    setPreviewImage(user.profileImage || null);
    setSelectedFile(null);
  }, [user, reset]);

  const mutation = useApiMutation(
    (values) =>
      authApi.updateProfile(
        toFormData(values, { profileImage: selectedFile ? [selectedFile] : [] })
      ),
    {
      success: "Profile dossier updated successfully!",
      onSuccess: async () => {
        setSelectedFile(null);
        await refreshProfile();
      },
    }
  );

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size should be within 5MB");
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleRemoveSelectedFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewImage(user?.profileImage || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (values) => mutation.mutate(values);

  const nameValue = watch("name") || user?.name || "Member";
  const unit = user?.assignedUnit;

  return (
    <div className="space-y-6 sm:space-y-7 max-w-6xl mx-auto w-full min-w-0">
      {/* Header */}
      <PageHeader
        eyebrow="Tower Resident Dossier"
        title="My Profile"
        description="Manage your details and tap your photo to change it."
        badge={
          <Badge tone={user?.isVerified ? "emerald" : "amber"}>
            {user?.isVerified ? "Verified Identity" : "Pending Verification"}
          </Badge>
        }
      />

      {/* Profile card: gold cover banner, overlapping avatar, details below */}
      <div className="surface-card overflow-hidden">
        <div className="relative h-24 sm:h-32 bg-gradient-to-r from-[#121212] via-[#2A2418] to-[#C59B27]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D4AF37]/30 blur-3xl" />
        </div>

        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
            <div className="relative group shrink-0 -mt-12 sm:-mt-14">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={handleImageClick}
                title="Change photo"
                className="relative h-24 w-24 sm:h-28 sm:w-28 cursor-pointer overflow-hidden rounded-full border-4 border-white dark:border-[#131722] bg-[#F6F2E9] shadow-lg ring-2 ring-[#C59B27]"
              >
                {previewImage ? (
                  <img src={previewImage} alt={nameValue} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#121212] font-display text-3xl font-bold text-[#D4AF37]">
                    {getInitials(nameValue)}
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-[#D4AF37]" />
                </div>
              </div>

              {selectedFile ? (
                <button
                  type="button"
                  onClick={handleRemoveSelectedFile}
                  className="absolute -right-1 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                  title="Discard"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#121212] text-[#D4AF37] shadow-md ring-2 ring-white dark:ring-[#131722] transition-transform hover:scale-110"
                  title="Upload photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1 sm:pt-4">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#141413] dark:text-[#F5F0E6] break-words">
                {nameValue}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#121212] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                  <Sparkles className="h-3 w-3" />
                  {user?.role === "admin" ? "Admin" : "Resident"}
                </span>
                <Badge status={user?.approvalStatus || "approved"} />
                <Badge tone={user?.isActive ? "emerald" : "rose"}>
                  {user?.isActive ? "Active" : "Suspended"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick facts */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#EAE1D0] dark:border-[#242B3D] bg-[#FAF7F2] dark:bg-[#0E1117] p-3.5">
              <Mail className="h-5 w-5 shrink-0 text-[#C59B27]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8479]">Email</p>
                <p className="truncate text-sm font-semibold text-[#141413] dark:text-[#F5F0E6]">{user?.email || "—"}</p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#EAE1D0] dark:border-[#242B3D] bg-[#FAF7F2] dark:bg-[#0E1117] p-3.5">
              <Phone className="h-5 w-5 shrink-0 text-[#C59B27]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8479]">Phone</p>
                <p className="truncate text-sm font-semibold text-[#141413] dark:text-[#F5F0E6]">{user?.phone || "—"}</p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#EAE1D0] dark:border-[#242B3D] bg-[#FAF7F2] dark:bg-[#0E1117] p-3.5 sm:col-span-2 lg:col-span-1">
              <Building2 className="h-5 w-5 shrink-0 text-[#C59B27]" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8479]">
                  {unit ? "Suite" : "Member since"}
                </p>
                <p className="truncate text-sm font-semibold text-[#141413] dark:text-[#F5F0E6]">
                  {unit
                    ? `${unit.unitNumber} · ${formatFloor(unit.floor, unit.unitNumber)} · ${formatCurrency(unit.rentAmount)}/mo`
                    : formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {selectedFile && (
            <p className="mt-4 text-center text-xs font-medium text-[#9A7418] dark:text-[#D4AF37] sm:text-left">
              New photo selected. Press Save to apply.
            </p>
          )}
        </div>
      </div>
      {/* BOTTOM: Clean, Pristine Personal Information & Legal Records */}
      <Card
        title="Personal Information"
        subtitle="Identification, occupation and addresses"
        className="p-5 sm:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Row 1: Name, Occupation, NID */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Full Legal Name"
              leftIcon={User}
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Occupation / Profession"
              leftIcon={Briefcase}
              error={errors.occupation?.message}
              {...register("occupation")}
            />

            <Input
              label="National ID / Passport"
              leftIcon={FileBadge2}
              error={errors.nidNumber?.message}
              {...register("nidNumber")}
            />
          </div>

          {/* Row 2: Addresses */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Textarea
              label="Present Residential Address"
              rows={3}
              error={errors.presentAddress?.message}
              {...register("presentAddress")}
            />

            <Textarea
              label="Permanent Home Address"
              rows={3}
              error={errors.permanentAddress?.message}
              {...register("permanentAddress")}
            />
          </div>

          {/* Clean Security & Immutability Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#0E1117] border border-[#E8DFD1] dark:border-[#242B3D] p-4 text-xs text-[#6E675F] dark:text-[#9A9488]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C59B27] shrink-0" />
              <span>
                Registered email and primary mobile number cannot be altered directly for account safety.
              </span>
            </div>
            <span className="font-semibold text-[#141413] dark:text-[#F5F0E6]">
              Tower Vault Identity Protection
            </span>
          </div>

          {/* Clean Responsive Action Bar */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EFE9DC] dark:border-[#1E2433] sm:flex sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => {
                reset();
                setSelectedFile(null);
                setPreviewImage(user?.profileImage || null);
              }}
              disabled={!isDirty && !selectedFile}
              className="w-full whitespace-nowrap sm:w-auto"
            >
              Reset Form
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={Save}
              isLoading={mutation.isPending}
              disabled={!isDirty && !selectedFile}
              className="w-full whitespace-nowrap sm:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
