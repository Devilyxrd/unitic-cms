import Swal from "sweetalert2";

type ConfirmOptions = {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
};

export async function confirmDestructiveAction(options: ConfirmOptions) {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "Evet",
    cancelButtonText: options.cancelText ?? "Vazgec",
    reverseButtons: true,
    confirmButtonColor: "#dc2626",
    background: "#0f1420",
    color: "#e2e8f0",
  });

  return result.isConfirmed;
}
