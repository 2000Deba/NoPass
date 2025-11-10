import { Suspense } from "react"
import ResetPasswordClient from "./reset-passwordClient"

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<p className="text-center p-10">Loading...</p>}>
      <ResetPasswordClient />
    </Suspense>
  )
}

export default ResetPasswordPage