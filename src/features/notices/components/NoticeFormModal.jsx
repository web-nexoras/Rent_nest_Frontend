import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal.jsx";
import Button from "@/components/common/Button.jsx";
import { Input, Textarea } from "@/components/common/Input.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { createNotice, updateNotice } from "@/features/notices/api/noticeApi.js";

export function NoticeFormModal({ open, onClose, notice }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setTitle(notice?.title || "");
      setDescription(notice?.description || "");
      setErrors({});
    }
  }, [open, notice]);

  const mutation = useApiMutation(
    (values) => (notice ? updateNotice(notice._id, values) : createNotice(values)),
    { invalidate: [["notices"], ["notice"]], onSuccess: onClose }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    else if (title.length > 120) newErrors.title = "Title is too long (max 120 characters)";

    if (!description.trim()) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({ title: title.trim(), description: description.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={notice ? "Edit Notice" : "Publish an Announcement"}
      description="Notices are broadcast to every resident in the building."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button form="notice-form" type="submit" loading={mutation.isPending}>
            {notice ? "Save changes" : "Publish Notice"}
          </Button>
        </>
      }
    >
      <form id="notice-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Notice Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
          placeholder="e.g. Scheduled Generator Maintenance"
          error={errors.title}
        />
        <Textarea
          label="Detailed Description"
          rows={6}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
          }}
          placeholder="Provide complete details, date/time window, and instructions for residents..."
          error={errors.description}
        />
      </form>
    </Modal>
  );
}

export default NoticeFormModal;
