import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import "./modal.css";

interface Props {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal = ({ open, onClose, children }: Props) => {
    useEffect(() => {
        if (!open) {
            return;
        }

        // khóa scroll nền
        document.body.style.overflow = "hidden";

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEsc);

        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose, open]);

    // ❌ Không render khi đóng
    if (!open) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()} // ❗ chặn click xuyên
            >
                <div className="modal-inner">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
