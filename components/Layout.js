export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#F4F4F4] pt-[70px]">
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}
