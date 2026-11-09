import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { PageHeader, Card, Avatar, DetailRow } from "../../../components/ui/Layout.jsx";
import { Input, Textarea } from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import ImagePicker from "../../../components/ui/ImagePicker.jsx";
import { profileSchema } from "../../../lib/schemas.js";
import { authService } from "../../../services/authService.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useApiMutation } from "../../../hooks/useApiMutation.js";
import { toFormData } from "../../../lib/utils.js";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [image, setImage] = useState([]);
  const [pickerKey, setPickerKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
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
  }, [user, reset]);

  const mutation = useApiMutation(
    (values) => authService.updateProfile(toFormData(values, { profileImage: image })),
    {
      success: "Profile updated successfully",
      onSuccess: async () => {
        setImage([]);
        setPickerKey((key) => key + 1);
        await refreshProfile();
      },
    },
  );

  const onSubmit = (values) => mutation.mutate(values);

  return (
    <>
      <PageHeader
        eyebrow="Account Settings"
        title="Profile & Identity"
        description="Manage your personal details, identification, and profile photo."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user?.name} src={user?.profileImage} size="lg" />
            <h2 className="mt-4 font-display text-lg font-bold text-navy-900">{user?.name}</h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{user?.role}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge status={user?.approvalStatus} />
              <Badge tone={user?.isVerified ? "emerald" : "amber"}>
                {user?.isVerified ? "Email verified" : "Unverified"}
              </Badge>
            </div>
          </div>
          <dl className="mt-6 divide-y divide-navy-100/80 border-t border-navy-100/80">
            <DetailRow label="Email">
              <span className="inline-flex items-center gap-1.5 break-all">
                <Mail className="h-3.5 w-3.5 text-navy-400" /> {user?.email}
              </span>
            </DetailRow>
            <DetailRow label="Phone">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-navy-400" /> {user?.phone}
              </span>
            </DetailRow>
            {user?.role === "tenant" && (
              <DetailRow label="Assigned unit">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-navy-400" />
                  {user?.assignedUnit?.unitNumber
                    ? `Unit ${user.assignedUnit.unitNumber}`
                    : "Not assigned"}
                </span>
              </DetailRow>
            )}
            <DetailRow label="Account">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-navy-400" />
                {user?.isActive ? "Active" : "Inactive"}
              </span>
            </DetailRow>
          </dl>
        </Card>

        <Card title="Personal Information" subtitle="Keep your contact and identity records up to date" className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Full name" error={errors.name?.message} {...register("name")} />
              <Input label="Occupation" error={errors.occupation?.message} {...register("occupation")} />
              <Input label="NID number" error={errors.nidNumber?.message} {...register("nidNumber")} />
            </div>
            <Textarea
              label="Present address"
              rows={2}
              error={errors.presentAddress?.message}
              {...register("presentAddress")}
            />
            <Textarea
              label="Permanent address"
              rows={2}
              error={errors.permanentAddress?.message}
              {...register("permanentAddress")}
            />
            <div className="flex items-start gap-3">
              <Camera className="mt-6 h-5 w-5 text-navy-400" />
              <ImagePicker
                key={pickerKey}
                label="Profile photo"
                multiple={false}
                onChange={setImage}
              />
            </div>
            <p className="text-xs text-navy-400">
              Email and phone can't be changed here. Empty fields are left unchanged.
            </p>
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={mutation.isPending}
                disabled={!isDirty && image.length === 0}
              >
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
