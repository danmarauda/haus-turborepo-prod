import Link from "next/link"

export function HausLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">H</span>
      </div>
      <span className="font-bold text-xl tracking-tight hidden sm:inline">HAUS</span>
    </div>
  )
}
