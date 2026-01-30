import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

interface ShowToastProps {
  title: string; // vai virar text1
  message?: string; // vai virar text2
  type?: ToastType;
}

let toastQueue: ShowToastProps[] = [];
let isShowing = false;

const showNext = () => {
  if (toastQueue.length === 0) {
    isShowing = false;
    return;
  }

  isShowing = true;
  const nextToast = toastQueue.shift()!;

  Toast.show({
    type: nextToast.type || "success",
    text1: nextToast.title,
    text2: nextToast.message,
    position: "bottom",
    bottomOffset: 20,
    visibilityTime: 3000,
    onHide: showNext,
  });
};

const ToastService = {
  show: ({ title, message, type = "success" }: ShowToastProps) => {
    toastQueue.push({ title, message, type });
    if (!isShowing) showNext();
  },

  success: (title: string, message?: string) =>
    ToastService.show({ title, message, type: "success" }),

  error: (title: string, message?: string) =>
    ToastService.show({ title, message, type: "error" }),

  info: (title: string, message?: string) =>
    ToastService.show({ title, message, type: "info" }),
};

export default ToastService;
