import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PasswordInput } from "../../../components/ui/PasswordInput.jsx";
import Button from "../../../components/ui/Button.jsx";
import { resetSchema } from "../../../lib/schemas.js";
import { authService } from "../../../services/authService.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { getErrorMessage } from "../../../lib/axios.js";

// The backend email links to `${CLIENT_URL}/reset-password/:token`.
export default function ResetPasswordPage() {
  const { token } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ password }) => {
    try {
      const data = await authService.resetPassword(token, { password });
      toast.success(data.message);
      navigate("/signin", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="animate-fade-in">
      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600">Security Update</p>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
        Set a new password
      </h1>
      <p className="mt-1.5 text-sm text-navy-500">Choose a strong password with at least 6 characters.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          placeholder="Enter new password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-navy-500">
        Link expired?{" "}
        <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700">
          Request a new one
        </Link>
      </p>
    </div>
  );
}
