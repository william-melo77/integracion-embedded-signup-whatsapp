export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-muted animate-spin border-t-primary" />
        <div
          className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-accent animate-spin"
          style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
        />
      </div>
    </div>
  )
}
