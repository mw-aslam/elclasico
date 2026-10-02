'use client';

export default function ConfirmModal({
  isOpen,
  title = "Tasdiqlash",
  message = "Haqiqatan ham ushbu amalni bajarmoqchimisiz?",
  confirmText = "Ha",
  cancelText = "Yo'q",
  isDestructive = true,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0e121d] border border-white/10 p-6 shadow-2xl text-center space-y-4">
        
        {/* Icon */}
        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl font-bold ${
          isDestructive ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-amber-400/10 border border-amber-400/20 text-amber-300'
        }`}>
          {isDestructive ? '⚠️' : '❓'}
        </div>

        {/* Text */}
        <div className="space-y-1">
          <h3 className="text-base font-bold uppercase tracking-tight text-white">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons: Ha / Yo'q */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg active:scale-95 ${
              isDestructive
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                : 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
