export default function ModalInputWrapper({ icon, children }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 z-10">
        {icon}
      </div>
      {children}
    </div>
  );
}
